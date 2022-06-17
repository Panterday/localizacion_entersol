/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(["N/ui/message"], (message) => {
  const saveRecord = (context) => {
    log.debug("SAVE RECORD", "SAVE RECORD");
    const currentRecord = context.currentRecord;
    const datoNoPermitido = message.create({
      title: "Valor incorrecto",
      message: `El valor 01 - Operador, para el campo CLAVE FIGURA AUTOTRANSPORTE, no debe seleccionarse en este registro.
              `,
      type: message.Type.WARNING,
    });
    const figAutoTrans = currentRecord.getText({
      fieldId: "custrecord_ent_cp_clave_fig_auto_trans",
    });
    log.debug("FIGAUTO", figAutoTrans);
    if (figAutoTrans === "01 - Operador") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      datoNoPermitido.show({
        duration: 10000,
      });
      return false;
    }
    return true;
  };
  return {
    saveRecord,
  };
});
