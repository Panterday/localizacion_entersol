/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(["N/record", "N/search"], (record, search) => {
  const localFunctions = () => {
    const handler = {};
    handler.getSatStateCode = (code) => {
      let stateRecordId = "";
      const customrecord_ent_cp_lista_estados_satSearchObj = search.create({
        type: "customrecord_ent_cp_lista_estados_sat",
        filters: [["custrecord_ent_cp_cat_estados_nombre_cor", "is", code]],
        columns: ["internalid"],
      });
      const searchResultCount =
        customrecord_ent_cp_lista_estados_satSearchObj.runPaged().count;
      if (searchResultCount > 0) {
        customrecord_ent_cp_lista_estados_satSearchObj.run().each((result) => {
          stateRecordId = result.getValue({
            name: "internalid",
          });
        });
      }
      return stateRecordId;
    };
    handler.createdFromOv = (currentRecord) => {
      let comesFromOv = false;
      const createdFrom = currentRecord.getValue({
        fieldId: "createdfrom",
      });
      if (createdFrom) {
        const tipoRegistroBusqueda = search.create({
          type: "transaction",
          filters: [
            ["mainline", "is", "T"],
            "AND",
            ["internalid", "anyof", createdFrom],
          ],
          columns: ["recordtype"],
        });
        tipoRegistroBusqueda.run().each(function (result) {
          const currentType = result.getValue({
            name: "recordtype",
          });
          if (currentType === "salesorder") {
            comesFromOv = true;
          }
        });
      }
      return comesFromOv;
    };
    return handler;
  };
  const setLocationValues = (currentRecord) => {
    const uuid = currentRecord.getValue({
      fieldId: "custbody_ent_entloc_tras_uuid",
    });
    if (/* !uuid */ true) {
      //Working with location address
      let locationRecord = null;
      let locationState = "";
      let locationCountry = "";
      let locationStreet = "";
      let locationZipCode = "";
      let locationId = null;

      if (currentRecord.type === "itemfulfillment") {
        locationId = currentRecord.getValue({
          fieldId: "custbody_ent_entloc_ubicacion_origen",
        });
      } else {
        locationId = currentRecord.getValue({
          fieldId: "location",
        });
      }
      log.debug("LOCATION ID", locationId);
      if (locationId) {
        let locationAddressRecord = null;
        locationRecord = record.load({
          type: "location",
          id: locationId,
        });
        const idLocationAddress = locationRecord.getValue({
          fieldId: "mainaddress",
        });
        if (idLocationAddress) {
          locationAddressRecord = record.load({
            type: "address",
            id: idLocationAddress,
          });
          locationZipCode = locationAddressRecord.getValue({
            fieldId: "zip",
          });
          locationState = locationAddressRecord.getValue({
            fieldId: "state",
          });
          locationState = localFunctions().getSatStateCode(locationState);
        }
      }
      //Set values
      currentRecord.setValue({
        fieldId: "custbody_ent_entloc_cp_origen",
        value: locationZipCode,
      });
      currentRecord.setValue({
        fieldId: "custbody_ent_entloc_estado_origen",
        value: locationState,
      });
    }
  };
  const setTransferLocationsValues = (currentRecord) => {
    let state = "";
    let zipCode = "";
    //Validating itemfulfillment
    let comesFromOv = false;
    if (currentRecord.type === "itemfulfillment") {
      comesFromOv = localFunctions().createdFromOv(currentRecord);
    }
    if (
      currentRecord.type === "salesorder" ||
      (currentRecord.type === "itemfulfillment" && comesFromOv)
    ) {
      const addressKey = currentRecord.getValue({
        fieldId: "shippingaddress_key",
      });
      let currentAddress = null;
      if (addressKey) {
        currentAddress = record.load({
          type: "address",
          id: addressKey,
        });
      }
      if (currentAddress) {
        state = currentAddress.getValue({
          fieldId: "state",
        });
        zipCode = currentAddress.getValue({
          fieldId: "zip",
        });
        state = localFunctions().getSatStateCode(state);
      }
    } else if (
      currentRecord.type === "transferorder" ||
      (currentRecord.type === "itemfulfillment" && !comesFromOv)
    ) {
      let currentTransferLocationRecord = null;
      const currentTransferLocationRecordId = currentRecord.getValue({
        fieldId: "transferlocation",
      });
      if (currentTransferLocationRecordId) {
        currentTransferLocationRecord = record.load({
          type: "location",
          id: currentTransferLocationRecordId,
        });
      }
      if (currentTransferLocationRecord) {
        const transferLocationAddressRecordId =
          currentTransferLocationRecord.getValue({
            fieldId: "mainaddress",
          });
        if (transferLocationAddressRecordId) {
          const currentTransferLocationAddressRecord = record.load({
            type: "address",
            id: transferLocationAddressRecordId,
          });
          state = currentTransferLocationAddressRecord.getValue({
            fieldId: "state",
          });
          zipCode = currentTransferLocationAddressRecord.getValue({
            fieldId: "zip",
          });
          state = localFunctions().getSatStateCode(state);
        }
      }
    }
    //Set values
    currentRecord.setValue({
      fieldId: "custbody_ent_entloc_estado_destino",
      value: state,
    });
    currentRecord.setValue({
      fieldId: "custbody_ent_entloc_cp_destino",
      value: zipCode,
    });
  };
  const beforeSubmit = (context) => {
    if (
      context.type === context.UserEventType.CREATE ||
      context.type === context.UserEventType.EDIT
    ) {
      currentRecord = context.newRecord;
      try {
        const isCartaPorte = currentRecord.getValue({
          fieldId: "custbody_ent_entloc_comp_carta_porte",
        });
        if (isCartaPorte) {
          const customOrigen = currentRecord.getValue({
            fieldId: "custbody_ent_entloc_dir_per_origen",
          });
          const customDestino = currentRecord.getValue({
            fieldId: "custbody_ent_entloc_dir_per_destino",
          });
          log.debug("CUSTOM ORIGEN", customOrigen);
          if (!customOrigen) {
            setLocationValues(currentRecord);
          }
          if (!customDestino) {
            setTransferLocationsValues(currentRecord);
          }
        }
      } catch (error) {
        log.debug("ERROR al cargar campos de carta porte", error);
      }
    }
  };
  return {
    beforeSubmit,
  };
});
