/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 *@NAmdConfig ../ConfigPaths/customDataConfigPaths.json
 */
define([
  "N/record",
  "N/render",
  "N/url",
  "N/redirect",
  "N/file",
  "N/https",
  "N/runtime",
  "N/ui/message",
  "N/encode",
  "N/xml",
  "customData",
  "funcionesLoc",
], (
  record,
  render,
  url,
  redirect,
  file,
  https,
  runtime,
  message,
  encode,
  xml,
  customData,
  funcionesLoc
) => {
  const handlePostRequest = (body, permisosValidex, prodMod) => {
    const validexResponse = https.post({
      body,
      ...(prodMod
        ? { url: "https://api.validex.mx/api/timbrar" }
        : { url: "https://qa-api.validex.mx/api/timbrar-xml" }),
      headers: {
        Authorization: "Basic " + permisosValidex,
        "Content-Type": "application/json",
      },
    });
    return validexResponse;
  };
  const handleXmlResponse = (
    validexB64,
    nombreDocumento,
    idGuardaDocumentosCarpeta
  ) => {
    //Create new XML file
    xmlString = encode.convert({
      string: validexB64,
      inputEncoding: encode.Encoding.BASE_64,
      outputEncoding: encode.Encoding.UTF_8,
    });
    xmlFileObj = file.create({
      name: nombreDocumento + ".xml",
      fileType: file.Type.XMLDOC,
      contents: xmlString,
      description: "Documento electrónico certificado",
      encoding: file.Encoding.UTF8,
      folder: idGuardaDocumentosCarpeta,
    });
    idXmlFile = xmlFileObj.save();
    return idXmlFile;
  };
  const renderizaString = (
    currentRecord,
    customerRecord,
    subsidiaryRecord,
    currentTemplate,
    extraData,
    globalData
  ) => {
    let renderedTemplate = null;
    const renderXml = render.create();
    const customFullData = {
      globalData,
      extraData,
    };
    //Add custom data source
    renderXml.addCustomDataSource({
      format: render.DataSource.OBJECT,
      alias: "customData",
      data: customFullData,
    });
    //Add current record
    renderXml.addRecord("record", currentRecord);
    //Add subsidiary record
    renderXml.addRecord("subsidiary", subsidiaryRecord);
    //Add customer record
    renderXml.addRecord("customer", customerRecord);
    //Add template
    renderXml.templateContent = currentTemplate;
    //Try to render
    try {
      renderedTemplate = renderXml.renderAsString();
      return {
        error: false,
        renderedTemplate,
      };
    } catch (error) {
      return {
        error: true,
        details: error,
      };
    }
  };
  const handleTwoStepsCert = (
    currentRecord,
    subsidiaryRecord,
    customerRecord,
    nombreDocumento,
    recordType,
    recordId,
    generatedXml,
    permisosValidex,
    prodMod,
    subsidiaryRfc,
    subsidiaryId,
    idGuardaDocumentosCarpeta,
    plantillaPdfPublica
  ) => {
    //Let's certificate!
    //Extra custom data
    const extraData = funcionesLoc.getExtraCustomData(currentRecord);
    //Global custom data
    const globalData = customData.getDataForInvoice();
    const xmlObj = file.load({
      id: generatedXml,
    });
    const xmlText = xmlObj.getContents();
    const body = JSON.stringify({
      xml: xmlText,
    });
    const validexResponse = handlePostRequest(body, permisosValidex, prodMod);
    const validexBodyResponse = JSON.parse(validexResponse.body);
    if (validexResponse.code === 200) {
      const validexXmlResponse = validexBodyResponse.base64.replace(
        "data:text/xml;base64,",
        ""
      );
      const validexQr = validexBodyResponse.qr;
      const validexUUID = validexBodyResponse.UUID;
      const validexCadenaOriginal = validexBodyResponse.cadenaOriginal;
      const validexJson = validexBodyResponse.data;
      //Build CERT DATA
      //SAVING JSON FOR TESTING
      if (!prodMod) {
        const fileJsonTest = file.create({
          name: "json_validex.json",
          fileType: file.Type.JSON,
          contents: JSON.stringify(validexJson),
          folder: idGuardaDocumentosCarpeta,
        });
        fileJsonTest.save();
      }

      const extraCertData = funcionesLoc.getCertExtraData(validexJson);
      const {
        fechaTimbrado,
        noSerieCSD,
        noSerieSAT,
        firmaCFDI,
        firmaSAT,
        tipoComprobante,
      } = extraCertData;

      //Get folder id Based on custom path
      const folderForXml = funcionesLoc.getFolderId(
        subsidiaryId,
        subsidiaryRfc,
        fechaTimbrado,
        idGuardaDocumentosCarpeta,
        tipoComprobante,
        "xml"
      );
      const folderForPdf = funcionesLoc.getFolderId(
        subsidiaryId,
        subsidiaryRfc,
        fechaTimbrado,
        idGuardaDocumentosCarpeta,
        tipoComprobante,
        "pdf"
      );
      const xmlIdToSave = handleXmlResponse(
        validexXmlResponse,
        nombreDocumento,
        !folderForXml.error
          ? folderForXml.tipoArchFolderId
          : idGuardaDocumentosCarpeta
      );

      //DELETE PREVIEW XML
      file.delete({
        id: generatedXml,
      });
      const customFullData = {
        globalData,
        extraData,
        certData: {
          validexQr,
          validexUUID,
          validexCadenaOriginal,
          extraCertData,
        },
      };
      //Create PDF
      const idPdfToSave = funcionesLoc.getPdfRendered(
        currentRecord,
        subsidiaryRecord,
        customerRecord,
        customFullData,
        plantillaPdfPublica,
        !folderForPdf.error
          ? folderForPdf.tipoArchFolderId
          : idGuardaDocumentosCarpeta,
        nombreDocumento
      );
      //OK
      record.submitFields({
        type: recordType,
        id: recordId,
        values: {
          custbody_ent_entloc_estado_certifica: "",
          custbody_ent_entloc_estado_gen_xml: "",
          custbody_ent_entloc_doc_prev: xmlIdToSave,
          custbody_ent_entloc_uuid: validexUUID,
          custbody_ent_entloc_cadena_qr: validexQr,
          custbody_ent_entloc_cadena_original: validexCadenaOriginal,
          custbody_ent_entloc_pdf_timbrado: idPdfToSave,
          custbody_ent_entloc_serie_csd: noSerieCSD,
          custbody_ent_entloc_fecha_cert: fechaTimbrado,
          custbody_ent_entloc_serie_sat: noSerieSAT,
          custbody_ent_entloc_firma_cfdi: firmaCFDI,
          custbody_ent_entloc_firma_sat: firmaSAT,
        },
      });
      //Redirección a la transacción
      redirect.toRecord({
        type: recordType,
        id: recordId,
        parameters: {
          showCertMessage: true,
        },
      });
    } else {
      //error
      record.submitFields({
        type: recordType,
        id: recordId,
        values: {
          custbody_ent_entloc_estado_certifica:
            validexBodyResponse.errorDescription[2] +
            validexBodyResponse.errorDescription[8],
        },
      });
      //Redirección a la transacción
      redirect.toRecord({
        type: recordType,
        id: recordId,
        parameters: {
          errorCertMessage: true,
        },
      });
    }
  };
  const handleOneStepsCert = (
    currentRecord,
    customerRecord,
    subsidiaryRecord,
    nombreDocumento,
    permisosValidex,
    prodMod,
    subsidiaryRfc,
    subsidiaryId,
    idGuardaDocumentosCarpeta,
    userConfig
  ) => {
    //Extra custom data
    const extraData = funcionesLoc.getExtraCustomData(currentRecord);
    //Global custom data
    const globalData = customData.getDataForInvoice();
    const xmlRenderedObj = renderizaString(
      currentRecord,
      customerRecord,
      subsidiaryRecord,
      userConfig.plantillaEdocument,
      extraData,
      globalData
    );
    const recordType = currentRecord.type;
    const recordId = currentRecord.id;
    if (!xmlRenderedObj.error) {
      let xmlDocument = null;
      try {
        //Render XML
        xmlDocument = xml.Parser.fromString({
          text: xmlRenderedObj.renderedTemplate,
        });
        //Back to String
        const backToStringXml = xml.Parser.toString({
          document: xmlDocument,
        });
        const body = JSON.stringify({
          xml: backToStringXml,
        });
        const validexResponse = handlePostRequest(
          body,
          permisosValidex,
          prodMod
        );
        const validexBodyResponse = JSON.parse(validexResponse.body);
        if (validexResponse.code === 200) {
          const validexXmlResponse = validexBodyResponse.base64.replace(
            "data:text/xml;base64,",
            ""
          );
          const validexQr = validexBodyResponse.qr;
          const validexUUID = validexBodyResponse.UUID;
          const validexCadenaOriginal = validexBodyResponse.cadenaOriginal;
          const validexJson = validexBodyResponse.data;
          //Build CERT DATA
          //SAVING JSON FOR TESTING
          if (!prodMod) {
            const fileJsonTest = file.create({
              name: "json_validex.json",
              fileType: file.Type.JSON,
              contents: JSON.stringify(validexJson),
              folder: idGuardaDocumentosCarpeta,
            });
            fileJsonTest.save();
          }
          const extraCertData = funcionesLoc.getCertExtraData(validexJson);
          const {
            fechaTimbrado,
            noSerieCSD,
            noSerieSAT,
            firmaCFDI,
            firmaSAT,
            tipoComprobante,
          } = extraCertData;
          //Get folder id Based on custom path
          const folderForXml = funcionesLoc.getFolderId(
            subsidiaryId,
            subsidiaryRfc,
            fechaTimbrado,
            idGuardaDocumentosCarpeta,
            tipoComprobante,
            "xml"
          );
          const folderForPdf = funcionesLoc.getFolderId(
            subsidiaryId,
            subsidiaryRfc,
            fechaTimbrado,
            idGuardaDocumentosCarpeta,
            tipoComprobante,
            "pdf"
          );
          const xmlIdToSave = handleXmlResponse(
            validexXmlResponse,
            nombreDocumento,
            !folderForXml.error
              ? folderForXml.tipoArchFolderId
              : idGuardaDocumentosCarpeta
          );
          const customFullData = {
            globalData,
            extraData,
            certData: {
              validexQr,
              validexUUID,
              validexCadenaOriginal,
              extraCertData,
            },
          };

          //Get json to string Tax and Related CFDI
          /* const stringRelatedCfdi = funcionesLoc.getStringRelated(
            customFullData.extraData
          );
          const stringTaxesItem = funcionesLoc.getStringTax(
            customFullData.extraData
          ); */

          //Create PDF
          const idPdfToSave = funcionesLoc.getPdfRendered(
            currentRecord,
            subsidiaryRecord,
            customerRecord,
            customFullData,
            userConfig,
            !folderForPdf.error
              ? folderForPdf.tipoArchFolderId
              : idGuardaDocumentosCarpeta,
            nombreDocumento
          );
          //OK
          record.submitFields({
            type: recordType,
            id: recordId,
            values: {
              custbody_ent_entloc_estado_certifica: "",
              custbody_ent_entloc_estado_gen_xml: "",
              custbody_ent_entloc_doc_prev: xmlIdToSave,
              custbody_ent_entloc_uuid: validexUUID,
              custbody_ent_entloc_cadena_qr: validexQr,
              custbody_ent_entloc_cadena_original: validexCadenaOriginal,
              custbody_ent_entloc_pdf_timbrado: idPdfToSave,
              custbody_ent_entloc_serie_csd: noSerieCSD,
              custbody_ent_entloc_fecha_cert: fechaTimbrado,
              custbody_ent_entloc_serie_sat: noSerieSAT,
              custbody_ent_entloc_firma_cfdi: firmaCFDI,
              custbody_ent_entloc_firma_sat: firmaSAT,
              custbody_ent_entloc_impuestos_items: "",
              custbody_ent_entloc_cfdis_relacionados: "",
            },
          });
          //Redirección a la transacción
          redirect.toRecord({
            type: recordType,
            id: recordId,
            parameters: {
              showCertMessage: true,
            },
          });
        } else {
          //error
          record.submitFields({
            type: recordType,
            id: recordId,
            values: {
              custbody_ent_entloc_estado_certifica:
                "Certification error: " +
                validexBodyResponse.errorDescription[2] +
                validexBodyResponse.errorDescription[8],
            },
          });
          //Redirección a la transacción
          redirect.toRecord({
            type: recordType,
            id: recordId,
            parameters: {
              errorCertMessage: true,
            },
          });
        }
      } catch (error) {
        log.debug("ERROR", error);
        record.submitFields({
          type: recordType,
          id: recordId,
          values: {
            custbody_ent_entloc_estado_gen_xml:
              "Generation error: " + error.message,
            custbody_ent_entloc_doc_prev: "",
          },
        });
        redirect.toRecord({
          type: recordType,
          id: recordId,
          parameters: { errorGenMessage: true },
        });
      }
    } else {
      record.submitFields({
        type: recordType,
        id: recordId,
        values: {
          custbody_ent_entloc_estado_gen_xml:
            "Generation error: " + xmlRenderedObj.details,
          custbody_ent_entloc_doc_prev: "",
        },
      });
      redirect.toRecord({
        type: recordType,
        id: recordId,
        parameters: { errorGenMessage: true },
      });
    }
  };
  const onRequest = (context) => {
    const start = Date.now();
    const recordId = context.request.parameters.id;
    const recordType = context.request.parameters.type;
    const genCert = context.request.parameters.genCert;
    const currentRecord = record.load({
      type: recordType,
      id: recordId,
    });
    const customerId = currentRecord.getValue({
      fieldId: recordType === "customerpayment" ? "customer" : "entity",
    });
    const customerRecord = record.load({
      type: "customer",
      id: customerId,
    });
    const subsidiaryId = currentRecord.getValue({
      fieldId: "subsidiary",
    });
    const subsidiaryRecord = record.load({
      type: "subsidiary",
      id: subsidiaryId,
    });
    const subsidiaryRfc = subsidiaryRecord.getValue({
      fieldId: "federalidnumber",
    });
    const generatedXml = currentRecord.getValue({
      fieldId: "custbody_ent_entloc_doc_prev",
    });
    const tranid = currentRecord.getValue({
      fieldId: "tranid",
    });
    const nombreDocumento = `${tranid} - ${subsidiaryRfc}`;
    //Global config
    const globalConfig = funcionesLoc.getGlobalConfig(subsidiaryId);
    //User config
    const userConfig = funcionesLoc.getUserConfig(
      globalConfig.internalIdRegMaestro,
      recordType,
      globalConfig.access
    );
    if (genCert === 0) {
      handleTwoStepsCert(
        currentRecord,
        subsidiaryRecord,
        customerRecord,
        nombreDocumento,
        recordType,
        recordId,
        generatedXml,
        globalConfig.permisosValidex,
        globalConfig.prodMod,
        subsidiaryRfc,
        subsidiaryId,
        globalConfig.idGuardaDocumentosCarpeta,
        userConfig.plantillaPdfPublica
      );
    } else {
      //One step certification
      handleOneStepsCert(
        currentRecord,
        customerRecord,
        subsidiaryRecord,
        nombreDocumento,
        globalConfig.permisosValidex,
        globalConfig.prodMod,
        subsidiaryRfc,
        subsidiaryId,
        globalConfig.idGuardaDocumentosCarpeta,
        userConfig
      );
    }
    const scriptObj = runtime.getCurrentScript();
    const duration = Date.now() - start;
    log.debug(
      "Execution summary: ",
      `Transaction: ${recordType} TranID: ${tranid} Subsidiary: ${subsidiaryId} Duration: ${(
        Number(duration) / 1000
      ).toFixed(
        2
      )} Seconds Remaining governance: ${scriptObj.getRemainingUsage()}`
    );
  };
  return {
    onRequest,
  };
});
//Nuevo nuevo comentario - Eduardo
