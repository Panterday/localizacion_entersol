/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 *@NAmdConfig ../ConfigPaths/customDataConfigPaths.json
 */
define([
  "N/record",
  "N/render",
  "N/xml",
  "N/file",
  "N/url",
  "N/redirect",
  "N/runtime",
  "N/ui/message",
  "customData",
  "funcionesLoc",
], (
  record,
  render,
  xml,
  file,
  url,
  redirect,
  runtime,
  message,
  customData,
  funcionesLoc
) => {
  const renderizaString = (
    currentRecord,
    customerRecord,
    subsidiaryRecord,
    currentTemplate
  ) => {
    let renderedTemplate = null;
    const renderXml = render.create();
    //Extra custom data
    const extraData = funcionesLoc.getExtraCustomDataTraslado(
      currentRecord,
      subsidiaryRecord
    );
    log.debug("EXTRADATA", extraData);
    //Global custom data
    const globalData = customData.getDataForInvoice();
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
  const onRequest = (context) => {
    const start = Date.now();
    const recordId = context.request.parameters.id;
    const recordType = context.request.parameters.type;
    const currentRecord = record.load({
      type: recordType,
      id: recordId,
    });
    const subsidiaryId = currentRecord.getValue({
      fieldId: "subsidiary",
    });
    const tranid = currentRecord.getValue({
      fieldId: "tranid",
    });
    const subsidiaryRecord = record.load({
      type: "subsidiary",
      id: subsidiaryId,
    });
    const customerId = currentRecord.getValue({
      fieldId: recordType === "customerpayment" ? "customer" : "entity",
    });
    let customerRecord = null;
    if (customerId) {
      customerRecord = record.load({
        type: "customer",
        id: customerId,
      });
    }
    //Global config
    const globalConfig = funcionesLoc.getGlobalConfig(subsidiaryId, recordType);
    //User config
    const userConfig = funcionesLoc.getUserConfigTras(
      globalConfig.internalIdRegMaestro,
      recordType,
      globalConfig.access
    );
    //Get record template based on recordtype
    const currentTemplate = userConfig.plantillaEdocument;
    const customCustomerTemplate = funcionesLoc.getXmlCustomerTemplate(
      customerRecord,
      recordType
    );
    //Render template as string
    const xmlRenderedObj = renderizaString(
      currentRecord,
      customerRecord,
      subsidiaryRecord,
      customCustomerTemplate ? customCustomerTemplate : currentTemplate
    );
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
        //Create xml file
        const fileXmlObj = file.create({
          name: "Documento electrónico previo " + " - " + tranid,
          fileType: file.Type.XMLDOC,
          contents: backToStringXml,
          description: "Documento electrónico 4.0",
          encoding: file.Encoding.UTF8,
          folder: globalConfig.idGuardaDocumentosCarpeta,
        });

        const fileXmlId = fileXmlObj.save();

        record.submitFields({
          type: recordType,
          id: recordId,
          values: {
            custbody_ent_entloc_edoc_traslado: fileXmlId,
            custbody_ent_entloc_estado_gen_xml: "",
            custbody_ent_entloc_estado_certifica: "",
          },
        });
        //Redirección a la transacción
        redirect.toRecord({
          type: recordType,
          id: recordId,
          parameters: { showGenMessage: true },
        });
      } catch (error) {
        record.submitFields({
          type: recordType,
          id: recordId,
          values: {
            custbody_ent_entloc_estado_gen_xml:
              "Generation error: " + error.message,
            custbody_ent_entloc_edoc_traslado: "",
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
          custbody_ent_entloc_edoc_traslado: "",
        },
      });
      redirect.toRecord({
        type: recordType,
        id: recordId,
        parameters: { errorGenMessage: true },
      });
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