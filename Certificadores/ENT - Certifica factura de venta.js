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
    currentTemplate
  ) => {
    let renderedTemplate = null;
    const renderXml = render.create();
    //Extra custom data
    const extraData = funcionesLoc.getExtraCustomData(currentRecord);
    //Global custom data
    const globalData = customData.getDataForInvoice();
    const customFullData = {
      globalData,
      extraData,
    };
    log.debug("RENDER", customFullData);
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
    log.debug("CUSTOMER RECORD", customerRecord);
    //Add template
    renderXml.templateContent = currentTemplate;
    //Try to render
    try {
      renderedTemplate = renderXml.renderAsString();
      log.debug("RENDERED TEMPLATE FUNC", renderedTemplate);
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
    idGuardaDocumentosCarpeta,
    plantillaPdfPublica
  ) => {
    //Let's certificate!
    const xmlObj = file.load({
      id: generatedXml,
    });
    const xmlText = xmlObj.getContents();
    log.debug("XMLTEXTCERT2", xmlText);
    const body = JSON.stringify({
      xml: xmlText,
    });
    const validexResponse = handlePostRequest(body, permisosValidex, prodMod);
    const validexBodyResponse = JSON.parse(validexResponse.body);
    log.debug("VALIDEX", validexBodyResponse);
    if (validexResponse.code === 200) {
      log.debug("VALIDEX", validexResponse);
      const validexXmlResponse = validexBodyResponse.base64.replace(
        "data:text/xml;base64,",
        ""
      );
      const validexQr = validexBodyResponse.qr;
      const validexUUID = validexBodyResponse.UUID;
      const validexCadenaOriginal = validexBodyResponse.cadenaOriginal;
      const validexJson = validexBodyResponse.data;

      log.debug("JSON", validexJson);
      //Build CERT DATA
      //SAVING JSON FOR TESTING
      const fileJsonTest = file.create({
        name: "json_validex.json",
        fileType: file.Type.JSON,
        contents: JSON.stringify(validexJson),
        folder: idGuardaDocumentosCarpeta,
      });
      fileJsonTest.save();

      const extraCertData = funcionesLoc.getCertExtraData(validexJson);
      const { fechaTimbrado, noSerieCSD, noSerieSAT, firmaCFDI, firmaSAT } =
        extraCertData;
      log.debug("extraCertData", extraCertData);
      const xmlIdToSave = handleXmlResponse(
        validexXmlResponse,
        nombreDocumento,
        idGuardaDocumentosCarpeta
      );
      //DELETE PREVIEW XML
      file.delete({
        id: generatedXml,
      });
      //Extra custom data
      const extraData = funcionesLoc.getExtraCustomData(currentRecord);
      //Global custom data
      const globalData = customData.getDataForInvoice();
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
      log.debug("CUSTOM FULL DATA", customFullData.extraData);
      //Create PDF
      const idPdfToSave = funcionesLoc.getPdfRendered(
        currentRecord,
        subsidiaryRecord,
        customerRecord,
        customFullData,
        plantillaPdfPublica,
        idGuardaDocumentosCarpeta,
        nombreDocumento
      );
      log.debug("PDF", idPdfToSave);
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
    idGuardaDocumentosCarpeta,
    currentTemplate,
    plantillaPdfPublica
  ) => {
    const xmlRenderedObj = renderizaString(
      currentRecord,
      customerRecord,
      subsidiaryRecord,
      currentTemplate
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
          log.debug("VALIDEX", validexResponse);
          const validexXmlResponse = validexBodyResponse.base64.replace(
            "data:text/xml;base64,",
            ""
          );
          const validexQr = validexBodyResponse.qr;
          const validexUUID = validexBodyResponse.UUID;
          const validexCadenaOriginal = validexBodyResponse.cadenaOriginal;
          const validexJson = validexBodyResponse.data;

          log.debug("JSON", validexJson);
          //Build CERT DATA
          //SAVING JSON FOR TESTING
          const fileJsonTest = file.create({
            name: "json_validex.json",
            fileType: file.Type.JSON,
            contents: JSON.stringify(validexJson),
            folder: idGuardaDocumentosCarpeta,
          });
          fileJsonTest.save();

          const extraCertData = funcionesLoc.getCertExtraData(validexJson);
          const { fechaTimbrado, noSerieCSD, noSerieSAT, firmaCFDI, firmaSAT } =
            extraCertData;
          log.debug("extraCertData", extraCertData);
          const xmlIdToSave = handleXmlResponse(
            validexXmlResponse,
            nombreDocumento,
            idGuardaDocumentosCarpeta
          );
          //Extra custom data
          const extraData = funcionesLoc.getExtraCustomData(currentRecord);
          //Global custom data
          const globalData = customData.getDataForInvoice();
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
          log.debug("CUSTOM FULL DATA", customFullData.extraData);
          //Create PDF
          const idPdfToSave = funcionesLoc.getPdfRendered(
            currentRecord,
            subsidiaryRecord,
            customerRecord,
            customFullData,
            plantillaPdfPublica,
            idGuardaDocumentosCarpeta,
            nombreDocumento
          );
          log.debug("PDF", idPdfToSave);
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
      } catch (error) {
        log.debug("ERROR", error);
        record.submitFields({
          type: recordType,
          id: recordId,
          values: {
            custbody_ent_entloc_estado_gen_xml: error.message,
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
          custbody_ent_entloc_estado_gen_xml: xmlRenderedObj.details,
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
    const recordId = context.request.parameters.id;
    const recordType = context.request.parameters.type;
    const currentRecord = record.load({
      type: recordType,
      id: recordId,
    });
    const customerId = currentRecord.getValue({
      fieldId: "entity",
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
    if (generatedXml) {
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
        globalConfig.idGuardaDocumentosCarpeta,
        userConfig.plantillaEdocument,
        userConfig.plantillaPdfPublica
      );
    }
  };
  return {
    onRequest,
  };
});
//Nuevo comentario
