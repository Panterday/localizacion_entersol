/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 *@NAmdConfig ../ConfigPaths/customDataConfigPaths.json
 */
define(["N/render", "N/record", "funcionesLoc"], (
  render,
  record,
  funcionesLoc
) => {
  const printFormat = (
    currentRecord,
    subsidiaryRecord,
    customerRecord,
    userConfig,
    customPdfCustomerTemplate,
    longitudSerie,
    longitudFolio,
    prodMod,
    suiteTax
  ) => {
    try {
      const extraData = funcionesLoc.getExtraCustomData(
        currentRecord,
        subsidiaryRecord,
        longitudSerie,
        longitudFolio,
        prodMod,
        suiteTax
      );
      log.debug("EXTRA DATA", extraData);
      const renderer = render.create();
      renderer.addRecord("record", currentRecord);
      renderer.addRecord("subsidiary", subsidiaryRecord);
      renderer.addRecord("customer", customerRecord);
      renderer.addCustomDataSource({
        format: render.DataSource.OBJECT,
        alias: "customSource",
        data: extraData,
      });
      renderer.addCustomDataSource({
        format: render.DataSource.OBJECT,
        alias: "customColors",
        data: {
          ...(userConfig.printColor && { mainColor: userConfig.printColor }),
          ...(userConfig.font && { font: userConfig.font }),
          ...(userConfig.fontSize && { fontSize: userConfig.fontSize }),
        },
      });
      renderer.setTemplateById(
        customPdfCustomerTemplate
          ? customPdfCustomerTemplate
          : userConfig.plantillaPdfPublica
      );
      // render PDF
      const newfile = renderer.renderAsPdf();
      return {
        error: false,
        newfile,
      };
    } catch (error) {
      return {
        error: true,
        details: error,
      };
    }
  };
  const regenerateFormat = (
    newfile,
    nombreDocumento,
    idGuardaDocumentosCarpeta
  ) => {
    newfile.folder = idGuardaDocumentosCarpeta; // ID of folder where file created
    newfile.name = nombreDocumento + ".pdf";
    const fileId = newfile.save();
    return fileId;
  };
  const onRequest = (context) => {
    const recordId = context.request.parameters.id;
    const recordType = context.request.parameters.type;
    const currentRecord = record.load({
      type: recordType,
      id: recordId,
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
    const customerId = currentRecord.getValue({
      fieldId: recordType === "customerpayment" ? "customer" : "entity",
    });
    const customerRecord = record.load({
      type: "customer",
      id: customerId,
    });
    const pdfTimbrado = currentRecord.getValue({
      fieldId: "custbody_ent_entloc_pdf_timbrado",
    });
    const tranid = currentRecord.getValue({
      fieldId: "tranid",
    });
    const nombreDocumento = `${tranid} - ${subsidiaryRfc}`;
    const certDate = currentRecord.getValue({
      fieldId: "custbody_ent_entloc_fecha_cert",
    });
    const cfdiType = currentRecord.getValue({
      fieldId: "custbody_ent_entloc_tipo_cfdi",
    });
    //Global config
    const globalConfig = funcionesLoc.getGlobalConfig(subsidiaryId);
    //User config
    const userConfig = funcionesLoc.getUserConfig(
      globalConfig.internalIdRegMaestro,
      recordType,
      globalConfig.access
    );
    //Get folder
    const folderForPdf = funcionesLoc.getFolderId(
      subsidiaryId,
      subsidiaryRfc,
      certDate,
      globalConfig.idGuardaDocumentosCarpeta,
      cfdiType,
      "pdf"
    );
    //Custom templates
    const customPdfCustomerTemplate = funcionesLoc.getPdfCustomerTemplate(
      customerRecord,
      recordType
    );
    //Printing
    const currentFormat = printFormat(
      currentRecord,
      subsidiaryRecord,
      customerRecord,
      userConfig,
      customPdfCustomerTemplate,
      userConfig.longitudSerie,
      userConfig.longitudFolio,
      globalConfig.prodMod,
      globalConfig.suiteTax
    );
    const errorCase = `
    <?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
    <pdf>
      <body size="Letter">
        <p>
          !ERROR en la impresión ${currentFormat.details}
        </p>
      </body>
    </pdf>`;
    if (currentFormat.error) {
      context.response.write({ output: errorCase });
    } else {
      context.response.writeFile(currentFormat.newfile, true);
      if (!pdfTimbrado) {
        //Regenerate pdf
        const newPdfId = regenerateFormat(
          currentFormat.newfile,
          nombreDocumento,
          !folderForPdf.error
            ? folderForPdf.tipoArchFolderId
            : globalConfig.idGuardaDocumentosCarpeta
        );
        record.submitFields({
          type: recordType,
          id: recordId,
          values: {
            custbody_ent_entloc_pdf_timbrado: newPdfId,
          },
        });
      }
    }
  };
  return {
    onRequest,
  };
});
