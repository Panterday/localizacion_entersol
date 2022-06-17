/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(["N/ui/message"], (message) => {
  const pageInit = (context) => {
    const currentRecord = context.currentRecord;
    const arrenProp = currentRecord.getValue({
      fieldId: "custrecord_ent_cp_arrendatario",
    });
    const reqRemolque = currentRecord.getText({
      fieldId: "custrecord_ent_cp_cat_vehiculos_req_remo",
    });
    const remolque = currentRecord.getField({
      fieldId: "custrecord_ent_cat_vehiculo_nombre_remol",
    });
    if (!arrenProp) {
      const parteTrans = currentRecord.getField({
        fieldId: "custrecord_ent_cp_parte_transporte",
      });
      parteTrans.isDisabled = true;
    }
    if (reqRemolque === "0") {
      remolque.isDisabled = true;
    }
  };
  const saveRecord = (context) => {
    const currentRecord = context.currentRecord;
    const faltaInfoMsg = message.create({
      title: "Se requiere información",
      message: `Si se selecciona un valor en el campo ARRENDADOR/PROPIETARIO, debe elegir un valor para el campo PARTE TRANSPORTE.
            `,
      type: message.Type.WARNING,
    });
    const faltaInfoRemolqueMsg = message.create({
      title: "Se requiere información",
      message: `Esta configuración vehicular requiere un remolque, por favor elija un valor para el campo REMOLQUE.
              `,
      type: message.Type.WARNING,
    });
    const arrendador = currentRecord.getValue({
      fieldId: "custrecord_ent_cp_arrendatario",
    });
    const parteTransporte = currentRecord.getValue({
      fieldId: "custrecord_ent_cp_parte_transporte",
    });
    const requiereRemolque = currentRecord.getValue({
      fieldId: "custrecord_ent_cp_cat_vehiculos_req_remo",
    });
    const remolque = currentRecord.getValue({
      fieldId: "custrecord_ent_cat_vehiculo_nombre_remol",
    });
    if (arrendador && !parteTransporte) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      faltaInfoMsg.show({
        duration: 10000,
      });
      return false;
    }
    if (requiereRemolque === "1" && !remolque) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      faltaInfoRemolqueMsg.show({
        duration: 10000,
      });
      return false;
    }
    return true;
  };
  const fieldChanged = (context) => {
    const currentRecord = context.currentRecord;
    if (context.fieldId === "custrecord_ent_cp_arrendatario") {
      const arrendaProp = currentRecord.getValue({
        fieldId: context.fieldId,
      });
      const parteTrans = currentRecord.getField({
        fieldId: "custrecord_ent_cp_parte_transporte",
      });
      if (arrendaProp) {
        parteTrans.isDisabled = false;
      } else {
        parteTrans.isDisabled = true;
        currentRecord.setValue({
          fieldId: "custrecord_ent_cp_parte_transporte",
          value: "",
        });
      }
    }
    if (context.fieldId === "custrecord_ent_cp_cat_vehiculos_req_remo") {
      const reqRemolque = currentRecord.getText({
        fieldId: "custrecord_ent_cp_cat_vehiculos_req_remo",
      });
      const remolque = currentRecord.getField({
        fieldId: "custrecord_ent_cat_vehiculo_nombre_remol",
      });
      if (!(reqRemolque === "0")) {
        remolque.isDisabled = false;
      } else {
        remolque.isDisabled = true;
      }
    }
  };
  return {
    pageInit,
    saveRecord,
    fieldChanged,
  };
});
