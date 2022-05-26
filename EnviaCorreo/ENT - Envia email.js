/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define([], () => {
  onRequest = (context) => {
    context.response.write("HELLO");
  };
  return {
    onRequest,
  };
});
