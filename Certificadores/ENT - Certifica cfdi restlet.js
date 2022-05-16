/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
define([], () => {
  function _get(context) {
    log.debug("GET", "GET");
    return JSON.stringify({
      test: "HOLA MUNDO",
    });
  }

  function _post(context) {}

  function _put(context) {}

  function _delete(context) {}

  return {
    get: _get,
    post: _post,
    put: _put,
    delete: _delete,
  };
});
