/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(["N/record"], (record) => {
  const onRequest = (context) => {
    const recordId = context.request.parameters.id;
    const recordType = context.request.parameters.type;
    const currentRecord = record.load({
      type: recordType,
      id: recordId,
    });
    context.response.write({
      output: "Certifica pago",
    });
    /* context.response.renderPdf(data); */
    //TESTING COMMENT
    //DAVID
    //OTRO
  };
  return {
    onRequest,
  };
});
