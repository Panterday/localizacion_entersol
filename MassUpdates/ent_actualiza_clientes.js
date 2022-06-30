/**
 *@NApiVersion 2.1
 *@NScriptType MassUpdateScript
 */
define(["N/record", "N/search"], (record, search) => {
  const getMigracionRecord = () => {
    const migracionRecord = record.load({
      type: "customrecord_ent_entloc_migracion_campos",
      id: 1,
    });
    const idRfcOrigen = migracionRecord.getValue({
      fieldId: "custrecord_ent_entloc_id_rfc_origen",
    });
    const idUsoCfdiOrigen = migracionRecord.getValue({
      fieldId: "custrecord_ent_entloc_uso_cfdi_origen",
    });
    const idFormaPagoOrigen = migracionRecord.getValue({
      fieldId: "custrecord_ent_entloc_forma_pago_origen",
    });
    const idMetodoPagoOrigen = migracionRecord.getValue({
      fieldId: "custrecord_ent_entloc_met_pago_origen",
    });
    const idSatCodeOrigen = migracionRecord.getValue({
      fieldId: "custrecord_ent_sat_clave_prod_serv_orige",
    });
    return {
      idRfcOrigen,
      idUsoCfdiOrigen,
      idFormaPagoOrigen,
      idMetodoPagoOrigen,
      idSatCodeOrigen,
    };
  };
  const keepBefore = (str, element) => {
    if (str) {
      const index = str.indexOf(element);
      if (index === -1) {
        return null;
      } else {
        const newStr = str.slice(0, index);
        return newStr;
      }
    } else {
      return null;
    }
  };
  const handleUsoCfdiSearch = () => {
    const usoCfdiDataBase = [];
    const usoCfdiSearch = search.create({
      type: "customrecord_ent_entloc_uso_cfdi",
      filters: [],
      columns: [
        "internalid",
        search.createColumn({
          name: "name",
          sort: search.Sort.ASC,
        }),
      ],
    });
    usoCfdiSearch.run().each((result) => {
      usoCfdiDataBase.push({
        internalId: result.getValue({
          name: "internalid",
        }),
        name: result.getValue({
          name: "name",
        }),
      });
      return true;
    });
    return usoCfdiDataBase;
  };
  const handleFormaPago = () => {
    const formaPagoDataBase = [];
    var customrecord_ent_entloc_forma_pagoSearchObj = search.create({
      type: "customrecord_ent_entloc_forma_pago",
      filters: [],
      columns: [
        "internalid",
        search.createColumn({
          name: "name",
          sort: search.Sort.ASC,
        }),
      ],
    });
    customrecord_ent_entloc_forma_pagoSearchObj.run().each(function (result) {
      formaPagoDataBase.push({
        internalId: result.getValue({
          name: "internalid",
        }),
        name: result.getValue({
          name: "name",
        }),
      });
      return true;
    });
    return formaPagoDataBase;
  };
  const handleMetodoPago = () => {
    const formaPagoDataBase = [];
    var customrecord_ent_entloc_sat_metodo_pagoSearchObj = search.create({
      type: "customrecord_ent_entloc_sat_metodo_pago",
      filters: [],
      columns: [
        "internalid",
        search.createColumn({
          name: "name",
          sort: search.Sort.ASC,
        }),
      ],
    });
    customrecord_ent_entloc_sat_metodo_pagoSearchObj
      .run()
      .each(function (result) {
        formaPagoDataBase.push({
          internalId: result.getValue({
            name: "internalid",
          }),
          name: result.getValue({
            name: "name",
          }),
        });
        return true;
      });
    return formaPagoDataBase;
  };
  const each = (params) => {
    log.debug("EXECUTING MASS UPDATE", "EXECUTING MASS UPDATE");
    const customerRecord = record.load({
      type: params.type,
      id: params.id,
      isDynamic: true,
    });
    try {
      //Config migración record
      const {
        idRfcOrigen,
        idUsoCfdiOrigen,
        idFormaPagoOrigen,
        idMetodoPagoOrigen,
        idSatCodeOrigen,
      } = getMigracionRecord();
      //VALUES FROM CUSTOMER
      const currentCustomerRfc = customerRecord.getValue({
        fieldId: idRfcOrigen,
      });
      let currentCustomerUsoCfdi = keepBefore(
        customerRecord.getText({
          fieldId: idUsoCfdiOrigen,
        }),
        " -"
      );
      let currentCustomerFormaPago = keepBefore(
        customerRecord.getText({
          fieldId: idFormaPagoOrigen,
        }),
        " -"
      );
      let currentCustomerMetodoPago = keepBefore(
        customerRecord.getText({
          fieldId: idMetodoPagoOrigen,
        }),
        " -"
      );
      //DATABASES
      const usoCfdiDataBase = handleUsoCfdiSearch();
      const formaPagoDataBase = handleFormaPago();
      const metodoPagoDataBase = handleMetodoPago();
      //COMPARE
      log.debug(
        "CUSTOMER DATA",
        `CUSTOMER: ${params.id} USOCFDI: ${currentCustomerUsoCfdi} FORMAPAGO: ${currentCustomerFormaPago} METODOPAGO: ${currentCustomerMetodoPago}`
      );
      //Search uso CFDI
      let foundUsoCfdi = null;
      for (let i = 0; i < usoCfdiDataBase.length; i++) {
        const included = usoCfdiDataBase[i].name.includes(
          currentCustomerUsoCfdi
        );
        if (included) {
          foundUsoCfdi = usoCfdiDataBase[i].internalId;
          break;
        }
      }
      //Search forma pago
      let foundFormaPago = null;
      for (let i = 0; i < formaPagoDataBase.length; i++) {
        const included = formaPagoDataBase[i].name.includes(
          currentCustomerFormaPago
        );
        if (included) {
          foundFormaPago = formaPagoDataBase[i].internalId;
          break;
        }
      }
      //Search metodo pago
      let foundMetodoPago = null;
      for (let i = 0; i < metodoPagoDataBase.length; i++) {
        const included = metodoPagoDataBase[i].name.includes(
          currentCustomerMetodoPago
        );
        if (included) {
          foundMetodoPago = metodoPagoDataBase[i].internalId;
          break;
        }
      }
      //Response
      if (foundUsoCfdi) {
        //UpdateField
        log.debug("FOUNDUSOCFDI", foundUsoCfdi);
        customerRecord.setValue({
          fieldId: "custentity_ent_entloc_uso_cfdi",
          value: foundUsoCfdi,
        });
      }
      if (foundFormaPago) {
        //UpdateField
        log.debug("FOUNDFORMAPAGO", foundFormaPago);
        customerRecord.setValue({
          fieldId: "custentity_ent_entloc_forma_pago",
          value: foundFormaPago,
        });
      }
      if (foundMetodoPago) {
        //UpdateField
        log.debug("foundMetodoPago", foundMetodoPago);
        customerRecord.setValue({
          fieldId: "custentity_ent_entloc_metodo_pago",
          value: foundMetodoPago,
        });
      }
      log.debug("UPDATING RFC", currentCustomerRfc);
      customerRecord.setValue({
        fieldId: "custentity_ent_entloc_rfc",
        value: currentCustomerRfc,
      });
      customerRecord.save({
        ignoreMandatoryFields: true,
      });
    } catch (error) {
      log.debug("ERROR", error);
    }
  };
  return {
    each,
  };
});
