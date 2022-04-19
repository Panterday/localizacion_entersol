/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
/*The mode in which the record is being accessed. The mode can be set
to one of the following values:
copy, create, edit*/
define(["N/record"], (record) => {
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
  return {
    pageInit,
  };
});
