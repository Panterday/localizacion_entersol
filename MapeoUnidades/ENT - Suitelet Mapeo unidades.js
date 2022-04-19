/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(["N/record", "N/ui/serverWidget", "N/search", "N/url", "N/redirect"], (
  record,
  serverWidget,
  search,
  url,
  redirect
) => {
  const getUnitsList = (groupId) => {
    const unitsList = [];
    const unitsTypeRecord = record.load({
      type: "unitstype",
      id: groupId,
    });
    const totalLinesUnit = unitsTypeRecord.getLineCount({
      sublistId: "uom",
    });
    for (let i = 0; i < totalLinesUnit; i++) {
      const unitName = unitsTypeRecord.getSublistValue({
        sublistId: "uom",
        fieldId: "unitname",
        line: i,
      });
      const abbreviation = unitsTypeRecord.getSublistValue({
        sublistId: "uom",
        fieldId: "abbreviation",
        line: i,
      });
      const internalid = unitsTypeRecord.getSublistValue({
        sublistId: "uom",
        fieldId: "internalid",
        line: i,
      });
      unitsList.push({
        unitName,
        abbreviation,
        internalid,
      });
    }
    return unitsList;
  };
  const getMapRecord = (groupId) => {
    log.debug("GROUPID FUNC", groupId);
    const mapList = [];
    const mapObjSearch = search.create({
      type: "customrecord_ent_entloc_mapeo_unidades",
      filters: [
        [
          "custrecord_ent_entloc_grupo_unidades.internalidnumber",
          "equalto",
          groupId,
        ],
      ],
      columns: [
        "custrecord_ent_entloc_clave_unidad_local",
        "custrecord_ent_entloc_clave_sat",
        "internalid",
      ],
    });
    const searchResultCount = mapObjSearch.runPaged().count;
    if (searchResultCount > 0) {
      mapObjSearch.run().each((result) => {
        mapList.push({
          local: result.getValue({
            name: "custrecord_ent_entloc_clave_unidad_local",
          }),
          sat: result.getValue({
            name: "custrecord_ent_entloc_clave_sat",
          }),
          id: result.getValue({
            name: "internalid",
          }),
        });
        return true;
      });
    }
    return mapList;
  };
  const onRequest = (context) => {
    if (context.request.method === "GET") {
      const unitGroupId = context.request.parameters.unitGroupId;
      const form = serverWidget.createForm({
        title: "Mapeo de unidades Entersol Localización",
      });
      const unitsType = form.addField({
        id: "custpage_local_units",
        type: serverWidget.FieldType.SELECT,
        label: "Tipo de unidades",
        source: "unitstype",
      });
      unitsType.defaultValue = unitGroupId ? unitGroupId : "";
      const sublist = form.addSublist({
        id: "custpage_sublist",
        type: serverWidget.SublistType.LIST,
        label: "Unidades",
      });
      const unitField = sublist.addField({
        id: "custpage_local_units_sublist",
        type: serverWidget.FieldType.SELECT,
        label: "Unidad local",
        source: "-221",
      });
      const unitSat = sublist.addField({
        id: "custpage_sat_units_sublist",
        type: serverWidget.FieldType.SELECT,
        label: "Seleccione unidad SAT",
        source: "customrecord_ent_entloc_sat_clave_unidad",
      });
      const idParentRecord = sublist.addField({
        id: "custpage_parent_record",
        type: serverWidget.FieldType.SELECT,
        label: " ",
        source: "customrecord_ent_entloc_mapeo_unidades",
      });
      form.clientScriptModulePath = "./ent_validaciones_mapeo_unidades.js";
      unitField.updateDisplayType({
        displayType: serverWidget.FieldDisplayType.INLINE,
      });
      unitSat.updateDisplayType({
        displayType: serverWidget.FieldDisplayType.ENTRY,
      });
      idParentRecord.updateDisplayType({
        displayType: serverWidget.FieldDisplayType.HIDDEN,
      });
      //SUBMIT BUTTONS
      form.addSubmitButton({
        label: "Guardar",
      });

      form.addButton({
        id: "custpage_ent_entloc_cancel_button",
        label: "Cancelar",
        functionName: "goHome()",
      });

      if (unitGroupId) {
        const mapUnitList = getMapRecord(unitGroupId);
        if (mapUnitList.length > 0) {
          for (let i = 0; i < mapUnitList.length; i++) {
            sublist.setSublistValue({
              id: "custpage_local_units_sublist",
              line: i,
              value: mapUnitList[i].local ? mapUnitList[i].local : null,
              ignoreFieldChange: true,
            });

            sublist.setSublistValue({
              id: "custpage_sat_units_sublist",
              line: i,
              value: mapUnitList[i].sat ? mapUnitList[i].sat : null,
              ignoreFieldChange: true,
            });

            sublist.setSublistValue({
              id: "custpage_parent_record",
              line: i,
              value: mapUnitList[i].id,
              ignoreFieldChange: true,
            });
          }
        } else {
          const unitsOptions = getUnitsList(unitGroupId);
          for (let i = 0; i < unitsOptions.length; i++) {
            sublist.setSublistValue({
              id: "custpage_local_units_sublist",
              line: i,
              value: unitsOptions[i].internalid,
              ignoreFieldChange: true,
            });
          }
        }
      }
      context.response.writePage(form);
    } else {
      //POST
      const idGroupUnit = context.request.parameters.custpage_local_units;
      const totalLines = context.request.getLineCount({
        group: "custpage_sublist",
      });
      //Consultar si existen registros para ese grupo
      const mapRecordList = getMapRecord(idGroupUnit);
      if (mapRecordList.length > 0) {
        //Update records
        for (let i = 0; i < totalLines; i++) {
          const mapRecordId = context.request.getSublistValue({
            group: "custpage_sublist",
            name: "custpage_parent_record",
            line: i,
          });
          const mapRecordLocal = context.request.getSublistValue({
            group: "custpage_sublist",
            name: "custpage_local_units_sublist",
            line: i,
          });
          const mapRecordSat = context.request.getSublistValue({
            group: "custpage_sublist",
            name: "custpage_sat_units_sublist",
            line: i,
          });
          log.debug("MAPRECORDSAT", mapRecordLocal);
          record.submitFields({
            type: "customrecord_ent_entloc_mapeo_unidades",
            id: mapRecordId,
            values: {
              custrecord_ent_entloc_clave_sat: mapRecordSat,
              custrecord_ent_entloc_clave_unidad_local: mapRecordLocal,
            },
          });
        }
        redirect.toSuitelet({
          scriptId: "customscript_ent_entloc_mapeo_unidades",
          deploymentId: "customdeploy_ent_entloc_mapeo_unidades",
          parameters: {
            unitGroupId: idGroupUnit,
            edit: true,
          },
        });
      } else {
        //Create record
        log.debug("TOTALLINES", totalLines);
        for (let i = 0; i < totalLines; i++) {
          const mapRecordLocal = context.request.getSublistValue({
            group: "custpage_sublist",
            name: "custpage_local_units_sublist",
            line: i,
          });
          const mapRecordSat = context.request.getSublistValue({
            group: "custpage_sublist",
            name: "custpage_sat_units_sublist",
            line: i,
          });
          log.debug("LOCALUNIT", mapRecordLocal);
          const newMapRecord = record.create({
            type: "customrecord_ent_entloc_mapeo_unidades",
          });
          newMapRecord.setValue({
            fieldId: "custrecord_ent_entloc_grupo_unidades",
            value: idGroupUnit,
          });
          newMapRecord.setValue({
            fieldId: "custrecord_ent_entloc_clave_unidad_local",
            value: mapRecordLocal,
          });
          newMapRecord.setValue({
            fieldId: "custrecord_ent_entloc_clave_sat",
            value: mapRecordSat,
          });
          newMapRecord.save({
            ignoreMandatoryFields: true,
            enableSourcing: true,
          });
        }

        redirect.toSuitelet({
          scriptId: "customscript_ent_entloc_mapeo_unidades",
          deploymentId: "customdeploy_ent_entloc_mapeo_unidades",
          parameters: {
            unitGroupId: idGroupUnit,
            edit: true,
          },
        });
      }
    }
  };
  return {
    onRequest,
  };
});
