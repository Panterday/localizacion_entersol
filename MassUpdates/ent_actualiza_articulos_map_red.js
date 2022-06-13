/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */
define(["N/search", "N/record"], (search, record) => {
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
  const getInputData = () => {
    const migracionRecord = record.load({
      type: "customrecord_ent_entloc_migracion_campos",
      id: 1,
    });
    const idSatClaveOrigen = migracionRecord.getValue({
      fieldId: "custrecord_ent_sat_clave_prod_serv_orige",
    });
    var itemSearchObj = search.create({
      type: "item",
      filters: [],
      columns: [
        search.createColumn({
          name: "itemid",
          sort: search.Sort.ASC,
        }),
        "internalid",
        idSatClaveOrigen,
      ],
    });
    return itemSearchObj;
  };

  const map = (context) => {
    try {
      const migracionRecord = record.load({
        type: "customrecord_ent_entloc_migracion_campos",
        id: 1,
      });
      const idSatClaveOrigen = migracionRecord.getValue({
        fieldId: "custrecord_ent_sat_clave_prod_serv_orige",
      });
      const searchResult = JSON.parse(context.value);
      if (searchResult.values[idSatClaveOrigen]) {
        log.debug(
          "UPDATING ITEM",
          `ITEM TYPE: ${searchResult.recordType} ITEM ID: ${searchResult.id} SAT CODE: ${searchResult[idSatClaveOrigen]}`
        );
        let currentSatCode = keepBefore(
          searchResult.values[idSatClaveOrigen].text,
          " -"
        );
        //DATABASES
        const satCodeDataBase = handleSatClaveProdServ();
        //FIND ELEMENT
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
          record.submitFields({
            type: searchResult.recordType,
            id: searchResult.id,
            values: {
              custitem_ent_entloc_sat_clave_prod_ser: foundSatCode,
            },
            options: {
              ignoreMandatoryFields: true,
            },
          });
        }
      } else {
        log.debug(
          "SAT CODE DOES NOT EXIST!",
          `ITEM TYPE: ${searchResult.recordType} ITEM ID: ${searchResult.id} SAT CODE: ${searchResult[idSatClaveOrigen]}`
        );
      }
    } catch (error) {
      log.debug("MAP ERROR", error);
    }
  };

  const reduce = (context) => {};

  const summarize = (summary) => {
    log.debug("SUMMARY", summary);
  };

  return {
    getInputData,
    map,
    reduce,
    summarize,
  };
});
