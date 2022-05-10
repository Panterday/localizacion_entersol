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
    userConfig
  ) => {
    try {
      const extraData = funcionesLoc.getExtraCustomData(currentRecord);
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
      renderer.setTemplateById(userConfig.plantillaPdfPublica);
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
    const customerId = currentRecord.getValue({
      fieldId: recordType === "customerpayment" ? "customer" : "entity",
    });
    const customerRecord = record.load({
      type: "customer",
      id: customerId,
    });
    //Global config
    const globalConfig = funcionesLoc.getGlobalConfig(subsidiaryId);
    log.debug("GLOBALCONFIG", globalConfig);
    //User config
    const userConfig = funcionesLoc.getUserConfig(
      globalConfig.internalIdRegMaestro,
      recordType,
      globalConfig.access
    );
    log.debug("USER CONFI TEST", userConfig);
    //Printing
    const currentFormat = printFormat(
      currentRecord,
      subsidiaryRecord,
      customerRecord,
      userConfig
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
    }
  };
  return {
    onRequest,
  };
});
