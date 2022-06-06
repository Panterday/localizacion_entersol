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
  const handleSatClaveProdServ = () => {
    const satCodeDataBase = [];
    var customrecord_ent_entloc_sat_clave_prod_sSearchObj = search.create({
      type: "customrecord_ent_entloc_sat_clave_prod_s",
      filters: [],
      columns: [
        "internalid",
        search.createColumn({
          name: "name",
          sort: search.Sort.ASC,
        }),
      ],
    });
    customrecord_ent_entloc_sat_clave_prod_sSearchObj
      .run()
      .each(function (result) {
        satCodeDataBase.push({
          internalId: result.getValue({
            name: "internalid",
          }),
          name: result.getValue({
            name: "name",
          }),
        });
        return true;
      });
    return satCodeDataBase;
  };
  const each = (params) => {
    const currentItem = record.load({
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
      let currentSatCode = keepBefore(
        currentItem.getText({
          fieldId: idSatCodeOrigen,
        }),
        " -"
      );
      //DATABASES
      const satCodeDataBase = handleSatClaveProdServ();
      //Search uso CFDI
      let foundSatCode = null;
      for (let i = 0; i < satCodeDataBase.length; i++) {
        const included = satCodeDataBase[i].name.includes(currentSatCode);
        if (included) {
          foundSatCode = satCodeDataBase[i].internalId;
          break;
        }
      }
      //Response
      if (foundSatCode) {
        //UpdateField
        log.debug("FOUNDSATCODE", foundSatCode);
        currentItem.setValue({
          fieldId: "custitem_ent_entloc_sat_clave_prod_ser",
          value: foundSatCode,
        });
      }
      currentItem.save({
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
