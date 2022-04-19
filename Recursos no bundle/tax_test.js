/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
/*This event can be used with the following context.UserEventType:
CREATE, EDIT, VIEW, COPY, PRINT, EMAIL, QUICKVIEW*/
define(["N/record"], (record) => {
  const beforeLoad = (context) => {
    if (context.type === context.UserEventType.VIEW) {
      const newRecord = context.newRecord;
      const lineCount = newRecord.getLineCount({
        sublistId: "taxdetails",
      });
      log.debug("TAXDETAILS", lineCount);
    }
  };
  return {
    beforeLoad,
  };
});
