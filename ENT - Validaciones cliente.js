/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
/*The mode in which the record is being accessed. The mode can be set
to one of the following values:
copy, create, edit*/
define(["N/record", "N/search"], (record, search) => {
  const handleUuid = (invoiceId) => {
    let uuid = null;
    const invoiceSearchObj = search.create({
      type: "transaction",
      filters: [
        ["mainline", "is", "T"],
        "AND",
        ["custbody_ent_entloc_uuid", "isnotempty", ""],
        "AND",
        ["internalid", "anyof", invoiceId],
      ],
      columns: ["custbody_ent_entloc_uuid"],
    });
    const searchResultCount = invoiceSearchObj.runPaged().count;
    if (searchResultCount > 0) {
      invoiceSearchObj.run().each((result) => {
        uuid = result.getValue({
          name: "custbody_ent_entloc_uuid",
        });
        return true;
      });
    }
    return uuid;
  };
  const pageInit = (context) => {
    if (context.mode == "edit" || context.mode == "create") {
      try {
        const currentRecord = context.currentRecord;
        const customerId = currentRecord.getValue({
          fieldId: "entity",
        });
        const customerRecord = record.load({
          type: "customer",
          id: customerId,
        });
        const usoCfdiFac = customerRecord.getValue({
          fieldId: "custbody_ent_entloc_uso_cfdi",
        });
        const metodoPagoFac = customerRecord.getValue({
          fieldId: "custbody_ent_entloc_ent_metodo_pago",
        });

        const formaPagoFac = customerRecord.getValue({
          fieldId: "custbody_ent_entloc_forma_pago",
        });

        const regimenFiscalFac = customerRecord.getValue({
          fieldId: "custbody_ent_entloc_reg_fis_receptor",
        });

        if (!usoCfdiFac) {
          const usoCfdiCliente = customerRecord.getValue({
            fieldId: "custentity_ent_uso_de_cfdi",
          });

          currentRecord.setValue({
            fieldId: "custbody_ent_entloc_uso_cfdi",
            value: usoCfdiCliente,
          });
        }
        if (!metodoPagoFac) {
          const metodoPagoCliente = customerRecord.getValue({
            fieldId: "custentity_ent_metodo_de_pago",
          });

          currentRecord.setValue({
            fieldId: "custbody_ent_entloc_ent_metodo_pago",
            value: metodoPagoCliente,
          });
        }
        if (!formaPagoFac) {
          const formaPagoCliente = customerRecord.getValue({
            fieldId: "custentity_ent_uso_de_cfdi",
          });

          currentRecord.setValue({
            fieldId: "custbody_ent_entloc_forma_pago",
            value: formaPagoCliente,
          });
        }
        if (!regimenFiscalFac) {
          const regimenFiscalCliente = customerRecord.getValue({
            fieldId: "custentity_ent_entloc_regimen_fiscal",
          });
          currentRecord.setValue({
            fieldId: "custbody_ent_entloc_reg_fis_receptor",
            value: regimenFiscalCliente,
          });
        }
      } catch (error) {
        log.debug("ERROR", error);
      }
    }
  };
  const fieldChanged = (context) => {
    //if(context.mode === 'edit'){
    const currentRecord = context.currentRecord;
    const sublistId = context.sublistId;
    const fieldId = context.fieldId;
    if (
      sublistId === "recmachcustrecord_ent_entloc_registro_padre" &&
      fieldId === "custrecord_ent_entloc_transaccion"
    ) {
      log.debug("CHANGING", "CHANGING");
      const refId = currentRecord.getCurrentSublistValue({
        sublistId: "recmachcustrecord_ent_entloc_registro_padre",
        fieldId: fieldId,
      });
      log.debug("REFID", refId);
      const uuid = handleUuid(refId);
      log.debug("UUID", uuid);
      currentRecord.setCurrentSublistValue({
        sublistId: "recmachcustrecord_ent_entloc_registro_padre",
        fieldId: "custrecord_ent_entloc_uuid",
        value: uuid,
      });
    }
    //};
  };
  return {
    pageInit,
    fieldChanged,
  };
});
