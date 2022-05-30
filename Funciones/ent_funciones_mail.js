/**
 *@NModuleScope Public
 *@NApiVersion 2.1
 */

define(["N/https", "N/url", "N/record"], (https, url, record) => {
  const enviaCfdiMail = (
    currentRecord,
    subsidiaryRecord,
    customerRecord,
    idPdf,
    idXml,
    envioAutomatico
  ) => {
    log.debug("TESTING MAIL", "TESTING MAIL");
  };
  return {
    enviaCfdiMail,
  };
});
