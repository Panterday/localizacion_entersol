/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
/*The mode in which the record is being accessed. The mode can be set
to one of the following values:
copy, create, edit*/
define(["N/record", "N/search", "N/ui/message"], (record, search, message) => {
  const pageInit = (context) => {
    const currentRecord = context.currentRecord;
    const isCustomOrigen = currentRecord.getValue({
      fieldId: "custbody_ent_entloc_dir_per_origen",
    });
    const fieldZipOrigen = currentRecord.getField({
      fieldId: "custbody_ent_entloc_cp_origen",
    });
    const fieldStateOrigen = currentRecord.getField({
      fieldId: "custbody_ent_entloc_estado_origen",
    });
    if (isCustomOrigen) {
      fieldZipOrigen.isDisabled = false;
      fieldStateOrigen.isDisabled = false;
    } else {
      fieldZipOrigen.isDisabled = true;
      fieldStateOrigen.isDisabled = true;
    }
    const isCustomDestino = currentRecord.getValue({
      fieldId: "custbody_ent_entloc_dir_per_destino",
    });
    const fieldZipDestino = currentRecord.getField({
      fieldId: "custbody_ent_entloc_cp_destino",
    });
    const fieldStateDestino = currentRecord.getField({
      fieldId: "custbody_ent_entloc_estado_destino",
    });
    if (isCustomDestino) {
      fieldZipDestino.isDisabled = false;
      fieldStateDestino.isDisabled = false;
    } else {
      fieldZipDestino.isDisabled = true;
      fieldStateDestino.isDisabled = true;
    }
  };
  const fieldChanged = (context) => {
    const currentRecord = context.currentRecord;
    if (context.fieldId === "custbody_ent_entloc_dir_per_origen") {
      const isCustom = currentRecord.getValue({
        fieldId: "custbody_ent_entloc_dir_per_origen",
      });
      const fieldZip = currentRecord.getField({
        fieldId: "custbody_ent_entloc_cp_origen",
      });
      const fieldState = currentRecord.getField({
        fieldId: "custbody_ent_entloc_estado_origen",
      });
      if (isCustom) {
        fieldZip.isDisabled = false;
        fieldState.isDisabled = false;
      } else {
        fieldZip.isDisabled = true;
        fieldState.isDisabled = true;
      }
    }
    if (context.fieldId === "custbody_ent_entloc_dir_per_destino") {
      const isCustom = currentRecord.getValue({
        fieldId: "custbody_ent_entloc_dir_per_destino",
      });
      const fieldZip = currentRecord.getField({
        fieldId: "custbody_ent_entloc_cp_destino",
      });
      const fieldState = currentRecord.getField({
        fieldId: "custbody_ent_entloc_estado_destino",
      });
      if (isCustom) {
        fieldZip.isDisabled = false;
        fieldState.isDisabled = false;
      } else {
        fieldZip.isDisabled = true;
        fieldState.isDisabled = true;
      }
    }
  };
  const saveRecordHandler = () => {
    const handlerMsgs = {};
    handlerMsgs.aseguradoraMsg = message.create({
      title: "Se requiere información",
      message: `Debido a que se están transportando materiales peligrosos, ingrese un valor para el campo 
        ASEGURADORA MEDIOAMBIENTAL dentro del registro del vehículo.
        `,
      type: message.Type.WARNING,
    });
    handlerMsgs.fechaSalidaMsg = message.create({
      title: "Se requiere información",
      message: `Para poder realizar correctamente la certificación del complemento + carta porte, por favor, 
      llene el campo FECHA HORA DE SALIDA, en la subficha Carta porte 2.0. 
      `,
      type: message.Type.WARNING,
    });
    handlerMsgs.fechaLlegadaMsg = message.create({
      title: "Se requiere información",
      message: `Para poder realizar correctamente la certificación del complemento + carta porte, por favor, 
      llene el campo FECHA Y HORA PROGRAMADA DE LLEGADA, en la subficha Carta porte 2.0. 
      `,
      type: message.Type.WARNING,
    });
    handlerMsgs.distanciaRecorridaMsg = message.create({
      title: "Se requiere información",
      message: `Para poder realizar correctamente la certificación del complemento + carta porte, por favor, 
      llene el campo DISTANCIA RECORRIDA, en la subficha Carta porte 2.0. 
      `,
      type: message.Type.WARNING,
    });
    handlerMsgs.placaMsg = message.create({
      title: "Se requiere información",
      message: `Para poder realizar correctamente la certificación del complemento + carta porte, por favor, 
      seleccione un valor para el campo Vehículo, en la subficha Carta porte 2.0. 
      `,
      type: message.Type.WARNING,
    });
    handlerMsgs.operadorMsg = message.create({
      title: "Se requiere información",
      message: `Para poder realizar correctamente la certificación del complemento + carta porte, por favor, 
      seleccione un valor para el campo NOMBRE OPERADOR, en la subficha Carta porte 2.0. 
      `,
      type: message.Type.WARNING,
    });
    handlerMsgs.direccionIncorrecta = message.create({
      title: "Dirección incorrecta",
      message: `Para poder realizar correctamente la certificación del complemento + carta porte, por favor, 
      ingrese una dirección válida en el registro UBICACIÓN. 
      `,
      type: message.Type.WARNING,
    });
    handlerMsgs.sinDireccionUbicacion = message.create({
      title: "No existe dirección en el registro UBICACIÓN",
      message: `Para poder realizar correctamente la certificación del complemento + carta porte, por favor, 
      ingrese una dirección válida en el registro UBICACIÓN. 
      `,
      type: message.Type.WARNING,
    });
    handlerMsgs.sinDireccionEnvio = message.create({
      title: "No existe dirección de envío",
      message: `Para poder realizar correctamente la certificación del complemento + carta porte, por favor, 
      ingrese o seleccione una dirección válida en el campo ENVÍO A. 
      `,
      type: message.Type.WARNING,
    });
    handlerMsgs.direccionDestinoIncorrecta = message.create({
      title: "Dirección incorrecta",
      message: `Para poder realizar correctamente la certificación del complemento + carta porte, por favor, 
      ingrese una dirección válida en el registro UBICACIÓN DESTINO. 
      `,
      type: message.Type.WARNING,
    });
    handlerMsgs.sinDireccionDestino = message.create({
      title: "No existe dirección en el registro UBICACIÓN DESTINO",
      message: `Para poder realizar correctamente la certificación del complemento + carta porte, por favor, 
      ingrese una dirección válida en el registro UBICACIÓN DESTINO. 
      `,
      type: message.Type.WARNING,
    });
    handlerMsgs.showMessage = (msg) => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      msg.show({
        duration: 10000,
      });
    };
    return handlerMsgs;
  };
  const saveRecordFunctions = () => {
    const functions = {};
    functions.manageMessages = (currentRecord) => {
      let saveFlag = true;
      const fechaSalida = currentRecord.getValue({
        fieldId: "custbody_ent_entloc_fecha_hora_prog_sa",
      });
      const fechaLlegada = currentRecord.getValue({
        fieldId: "custbody_ent_entloc_fecha_hor_pro_lleg",
      });
      const distanciaRecorrida = currentRecord.getValue({
        fieldId: "custbody_ent_entloc_distancia_recorrid",
      });
      const placaVm = currentRecord.getValue({
        fieldId: "custbody_ent_entloc_vehiculo",
      });
      const operador = currentRecord.getValue({
        fieldId: "custbody_ent_entloc_operador",
      });
      if (!placaVm) {
        saveRecordHandler().showMessage(saveRecordHandler().placaMsg);
        saveFlag = false;
      }
      if (!fechaSalida) {
        saveRecordHandler().showMessage(saveRecordHandler().fechaSalidaMsg);
        saveFlag = false;
      }
      if (!fechaLlegada) {
        saveRecordHandler().showMessage(saveRecordHandler().fechaLlegadaMsg);
        saveFlag = false;
      }
      if (!distanciaRecorrida) {
        saveRecordHandler().showMessage(
          saveRecordHandler().distanciaRecorridaMsg
        );
        saveFlag = false;
      }
      if (!operador) {
        saveRecordHandler().showMessage(saveRecordHandler().operadorMsg);
        saveFlag = false;
      }
      return saveFlag;
    };
    functions.manageLineMsgs = (currentRecord) => {
      let saveFlag = true;
      const totalLines = currentRecord.getLineCount({
        sublistId: "item",
      });
      const valueAsegMedAmb = currentRecord.getValue({
        fieldId: "custbody_ent_entloc_aseg_medio_amb",
      });
      for (let i = 0; i < totalLines; i++) {
        let isDangerous = currentRecord.getSublistValue({
          sublistId: "item",
          fieldId: "custcol_ent_entloc_material_peligroso",
          line: i,
        });
        if (isDangerous && !valueAsegMedAmb) {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
          saveRecordHandler().aseguradoraMsg.show({
            duration: 10000,
          });
          saveFlag = false;
          break;
        }
      }
      return saveFlag;
    };
    return functions;
  };
  const saveRecord = (context) => {
    const currentRecord = context.currentRecord;
    const uuid = currentRecord.getValue({
      fieldId: "custbody_ent_entloc_tras_uuid",
    });
    if (/* !uuid */ true) {
      const esCartaPorte = currentRecord.getValue({
        fieldId: "custbody_ent_entloc_comp_carta_porte",
      });
      if (esCartaPorte) {
        const responseMsgs =
          saveRecordFunctions().manageMessages(currentRecord);
        if (!responseMsgs) {
          return false;
        }
        const responseLineMsgs =
          saveRecordFunctions().manageLineMsgs(currentRecord);
        if (!responseLineMsgs) {
          return false;
        }
        //=====================Validating location address=============================//
        let currentLocationId = null;
        if (currentRecord.type === "itemfulfillment") {
          currentLocationId = currentRecord.getValue({
            fieldId: "custbody_ent_entloc_ubicacion_origen",
          });
        } else {
          currentLocationId = currentRecord.getValue({
            fieldId: "location",
          });
        }
        if (currentLocationId) {
          const currentLocationRecord = record.load({
            type: "location",
            id: currentLocationId,
          });
          const currentAddressRecord = currentLocationRecord.getSubrecord({
            fieldId: "mainaddress",
          });
          const currentAddressRecordId = currentAddressRecord.getValue({
            fieldId: "id",
          });
          if (currentAddressRecordId) {
            //Validar que la ubicación tenga una dirección completa.
            const country = currentAddressRecord.getValue({
              fieldId: "country",
            });
            const state = currentAddressRecord.getValue({
              fieldId: "state",
            });
            const zip = currentAddressRecord.getValue({
              fieldId: "zip",
            });
            if (!country || !state || !zip) {
              //Mostrar mensaje de que falta información.
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
              saveRecordHandler().direccionIncorrecta.show({
                duration: 10000,
              });
              return false;
            }
          } else {
            //Mostrar mensaje para ingresar una dirección.
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
            saveRecordHandler().sinDireccionUbicacion.show({
              duration: 10000,
            });
            return false;
          }
        }
        //=============================Validating transferlocation address==========================//
        let comesFromOv = false;
        if (currentRecord.type === "itemfulfillment") {
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
        }
        if (
          currentRecord.type === "salesorder" ||
          (currentRecord.type === "itemfulfillment" && comesFromOv)
        ) {
          //Validar campo shipaddress
          const shipAddress = currentRecord.getValue({
            fieldId: "shipaddress",
          });
          if (!shipAddress) {
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
            saveRecordHandler().sinDireccionEnvio.show({
              duration: 10000,
            });
            return false;
          }
        } else if (
          currentRecord.type === "transferorder" ||
          (currentRecord.type === "itemfulfillment" && !comesFromOv)
        ) {
          //Validar transferlocation
          const transferLocationId = currentRecord.getValue({
            fieldId: "transferlocation",
          });
          if (transferLocationId) {
            const transferLocationRecord = record.load({
              type: "location",
              id: transferLocationId,
            });
            const currentTransferLocationAddressRecord =
              transferLocationRecord.getSubrecord({
                fieldId: "mainaddress",
              });
            const currentTransferLocationAddressRecordId =
              currentTransferLocationAddressRecord.getValue({
                fieldId: "id",
              });
            if (currentTransferLocationAddressRecordId) {
              const country = currentTransferLocationAddressRecord.getValue({
                fieldId: "country",
              });
              const state = currentTransferLocationAddressRecord.getValue({
                fieldId: "state",
              });
              const zip = currentTransferLocationAddressRecord.getValue({
                fieldId: "zip",
              });
              if (!country || !state || !zip) {
                //Mostrar mensaje de que falta información.
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
                saveRecordHandler().direccionDestinoIncorrecta.show({
                  duration: 10000,
                });
                return false;
              }
            } else {
              //Mostrar mensaje para ingresar una dirección.
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
              saveRecordHandler().sinDireccionDestino.show({
                duration: 10000,
              });
              return false;
            }
          }
        }
        return true;
      }
      return true;
    } else {
      return true;
    }
  };
  return {
    pageInit,
    fieldChanged,
    saveRecord,
  };
});
