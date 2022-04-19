/**
 *@NModuleScope Public
 *@NApiVersion 2.1
 */

define([], () => {
  const getDataForInvoice = () => {
    const customInfo = {
      name: "DAVID",
      edad: 19,
    };
    return customInfo;
  };
  return {
    getDataForInvoice,
  };
});
