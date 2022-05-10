/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(["N/search", "N/ui/message"], (search, message) => {
  const saveRecord = (context) => {
    log.debug("CONFIG", "CONFIG");
    currentRecord = context.currentRecord;
    const excesoRegistrosMsg = message.create({
      title: "Ya existe registro",
      message: `Ya existe un registro conector para esta subsidiaria, sólo se permite un registro por subsidiaria.
              `,
      type: message.Type.WARNING,
    });
    const subsidiary = currentRecord.getValue({
      fieldId: "custrecord_ent_entloc_subsidiaria",
    });
    const buscaRegMaestroPerValidex = search.create({
      type: "customrecord_ent_entloc_config_registro",
      filters: [["custrecord_ent_entloc_subsidiaria", "anyof", subsidiary]],
      columns: ["internalId"],
    });
    const searchResultCount = buscaRegMaestroPerValidex.runPaged().count;
    if (searchResultCount === 1) {
      let searchId = null;
      buscaRegMaestroPerValidex.run().each((result) => {
        const internalId = result.getValue({
          name: "internalId",
        });
        searchId = internalId;
      });
      const currentId = currentRecord.getValue({
        fieldId: "id",
      });
      if (searchId === currentId) {
        return true;
      }
    }
    if (searchResultCount > 0) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      excesoRegistrosMsg.show({
        duration: 10000,
      });
      return false;
    }
    return true;
  };
  const fieldChanged = (context) => {
    const currentRecord = context.currentRecord;
    const advertenciaDeProduccion = message.create({
      title: "Advertencia",
      message: `Al activar el campo ENTORNO DE PRODUCCIÓN se realizarán cancelaciones reales.
              `,
      type: message.Type.WARNING,
    });
    if (context.fieldId === "custrecord_ent_entloc_entorno_prod") {
      const currentCheckValue = currentRecord.getValue({
        fieldId: context.fieldId,
      });
      if (currentCheckValue) {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        advertenciaDeProduccion.show({
          duration: 10000,
        });
      }
    }
  };
  return {
    saveRecord,
    fieldChanged,
  };
});
