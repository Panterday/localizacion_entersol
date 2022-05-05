/**
 *@NModuleScope Public
 *@NApiVersion 2.1
 */

define(["N/record", "N/search", "N/runtime", "N/render"], (
  record,
  search,
  runtime,
  render
) => {
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
  const keepAfter = (str, element) => {
    if (str) {
      const index = str.indexOf(element);
      if (index === -1) {
        return null;
      } else {
        const newStr = str.slice(index + 1);
        return newStr;
      }
    } else {
      return null;
    }
  };
  const handleAccess = (subsidiary, currentRole, globalConfig) => {
    //Get credentials
    if (globalConfig.exist) {
      try {
        const impRol = globalConfig.roles.split(",");
        const implementedSubsidiary = globalConfig.subsidiaryId;
        //Validating implementation
        const isRole = impRol.find(
          (element) => Number(element) === currentRole
        );
        if (subsidiary === implementedSubsidiary && isRole) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        log.debug("GLOBAL FUNCTIONS ERROR", error);
        return false;
      }
    } else {
      return false;
    }
  };
  const handlePerms = (subsidiary, currentRole) => {
    //==================================Credentials====================================//
    let internalIdRegMaestro = null;
    let subsidiaryId = null;
    let permisosValidex = "";
    let prodMod = false;
    let idGuardaDocumentosCarpeta = null;
    let roles = null;
    let errorInterDescription = "";
    try {
      const buscaGlobalConfig = search.create({
        type: "customrecord_ent_entloc_config_registro",
        filters: [["custrecord_ent_entloc_subsidiaria", "anyof", subsidiary]],
        columns: [
          "internalId",
          "custrecord_ent_entloc_subsidiaria",
          "custrecord_ent_entloc_usuario_validex",
          "custrecord_ent_entloc_entorno_prod",
          "custrecord_ent_entloc_carpeta_archivos",
          "custrecord_ent_entloc_roles",
        ],
      });
      buscaGlobalConfig.run().each((result) => {
        internalIdRegMaestro = result.getValue({
          name: "internalId",
        });
        subsidiaryId = result.getValue({
          name: "custrecord_ent_entloc_subsidiaria",
        });
        permisosValidex = result.getValue({
          name: "custrecord_ent_entloc_usuario_validex",
        });
        prodMod = result.getValue({
          name: "custrecord_ent_entloc_entorno_prod",
        });
        idGuardaDocumentosCarpeta = result.getValue({
          name: "custrecord_ent_entloc_carpeta_archivos",
        });
        roles = result.getValue({
          name: "custrecord_ent_entloc_roles",
        });
      });
    } catch (error) {
      errorInterDescription += "<br /> " + error;
    }
    if (!idGuardaDocumentosCarpeta && subsidiaryId) {
      //==================================Buscando carpeta en gabinete==============================//
      const parentFolder = handleFolderId("Entersol localización", -20);
      const cfdiFolder = handleFolderId("CFDI", parentFolder);
      idGuardaDocumentosCarpeta = cfdiFolder;
      //Set global folder ID
      record.submitFields({
        type: "customrecord_ent_entloc_config_registro",
        id: internalIdRegMaestro,
        values: {
          custrecord_ent_entloc_carpeta_archivos: idGuardaDocumentosCarpeta,
        },
      });
    }
    //Access flag
    const access = handleAccess(subsidiary, currentRole, {
      roles,
      subsidiaryId,
      ...(internalIdRegMaestro ? { exist: true } : { exist: false }),
    });
    return {
      ...(internalIdRegMaestro ? { exist: true } : { exist: false }),
      internalIdRegMaestro,
      idGuardaDocumentosCarpeta,
      permisosValidex,
      subsidiaryId,
      roles,
      access,
      prodMod,
    };
  };
  const getGlobalConfig = (subsidiaryId) => {
    //Info for access
    const currentUser = runtime.getCurrentUser();
    const currentRole = currentUser.role;
    //Config record info
    const globalConfig = handlePerms(subsidiaryId, currentRole);
    return globalConfig;
  };
  const getUserConfig = (globalConfigRecordId, recordType, access) => {
    if (access) {
      const globalConfigRecord = record.load({
        type: "customrecord_ent_entloc_config_registro",
        id: globalConfigRecordId,
      });
      switch (recordType) {
        case "invoice":
          return {
            aplica: globalConfigRecord.getValue({
              fieldId: "custrecord_ent_entloc_se_aplica_fv",
            }),
            habilitaCertDosPasos: globalConfigRecord.getValue({
              fieldId: "custrecord_ent_entloc_hab_cert_2_fv",
            }),
            plantillaPdfPublica: globalConfigRecord.getValue({
              fieldId: "custrecord_ent_entloc_plantilla_imp_fv",
            }),
            plantillaEdocument: globalConfigRecord.getValue({
              fieldId: "custrecord_ent_entloc_plan_gen_xml_fv",
            }),
          };
        case "creditmemo":
          return {
            aplica: globalConfigRecord.getValue({
              fieldId: "custrecord_ent_entloc_se_aplica_nc",
            }),
            habilitaCertDosPasos: globalConfigRecord.getValue({
              fieldId: "custrecord_ent_entloc_hab_cert_2_nc",
            }),
            plantillaPdfPublica: globalConfigRecord.getValue({
              fieldId: "custrecord_ent_entloc_plantilla_imp_nc",
            }),
            plantillaEdocument: globalConfigRecord.getValue({
              fieldId: "custrecord_ent_entloc_plan_gen_xml_nc",
            }),
          };
        case "customerpayment":
          return {
            aplica: globalConfigRecord.getValue({
              fieldId: "custrecord_ent_entloc_se_aplica_pc",
            }),
            habilitaCertDosPasos: globalConfigRecord.getValue({
              fieldId: "custrecord_ent_entloc_hab_cert_2_pc",
            }),
            plantillaPdfPublica: globalConfigRecord.getValue({
              fieldId: "custrecord_ent_entloc_plantilla_imp_pc",
            }),
            plantillaEdocument: globalConfigRecord.getValue({
              fieldId: "custrecord_ent_entloc_plan_gen_xml_pc",
            }),
          };
        default:
          break;
      }
    } else {
      return false;
    }
  };
  const handleFolioSerie = (tranid) => {
    const serie = tranid.replace(/[^a-z]/gi, "");
    const folio = tranid.replace(/[^0-9]/g, "");
    return {
      serie,
      folio,
    };
  };
  const handleTaxCorrection = (
    importeIvaLinea,
    importeIepsLinea,
    taxAmount
  ) => {
    //Ajuste impuesto
    let impuestoCalculado = importeIvaLinea + importeIepsLinea;
    let diferenciaImpuesto = Number((taxAmount - impuestoCalculado).toFixed(2));
    if (diferenciaImpuesto < 0) {
      diferenciaImpuesto = Math.abs(diferenciaImpuesto);
      //Restar diferencia a un impuesto
      importeIvaLinea > 0 && importeIvaLinea > importeIepsLinea
        ? (importeIvaLinea = importeIvaLinea - diferenciaImpuesto)
        : importeIepsLinea > 0
        ? importeIepsLinea - diferenciaImpuesto
        : null;
    } else {
      //Sumar diferencia a un impuesto
      importeIvaLinea > 0 && importeIvaLinea > importeIepsLinea
        ? (importeIvaLinea = importeIvaLinea + diferenciaImpuesto)
        : importeIepsLinea > 0
        ? importeIepsLinea + diferenciaImpuesto
        : null;
    }
    return {
      nuevoImporteIvaLinea: Number(importeIvaLinea.toFixed(2)),
      nuevoImporteIepsLinea: Number(importeIepsLinea.toFixed(2)),
    };
  };
  const handleTaxesCalc = (taxList, amount, taxAmount) => {
    const itemTaxGroupDetails = {
      taxRetDetails: [],
      taxTrasDetails: [],
    };
    const isRet = taxList.find(
      (element) => Number(element.rate.replace("%", "")) < 0
    );

    if (isRet) {
      //Retención
      let tempTotalImporte = 0;
      const taxTempList = [];
      const taxRetTempList = [];
      const taxTrasTempList = [];
      taxList.forEach((element) => {
        const tempRate = Number(element.rate.replace("%", ""));
        const tempCode = keepBefore(
          element.custrecord_ent_entloc_codigo_impuesto[0].text,
          " -"
        );
        taxTempList.push({
          base: amount,
          impuesto: tempCode,
          tipoFactor: "Tasa",
          tasaOcuota: tempRate,
          importe: Number(Number(amount * (tempRate / 100)).toFixed(2)),
        });
      });
      taxTempList.forEach((element) => {
        tempTotalImporte += element.importe;
      });

      if (Number(tempTotalImporte.toFixed(2)) !== taxAmount) {
        const diferencia = Math.abs(
          Number(tempTotalImporte.toFixed(2)) - taxAmount
        );
        if (diferencia < 0) {
          taxTempList[0].importe = taxTempList[0].importe + diferencia;
        } else {
          taxTempList[0].importe = taxTempList[0].importe - diferencia;
        }
      }
      taxTempList.forEach((element) => {
        if (element.tasaOcuota < 0) {
          itemTaxGroupDetails.taxRetDetails.push({
            base: element.base,
            impuesto: element.impuesto,
            tipoFactor: element.tipoFactor,
            tasaOcuota: element.tasaOcuota * -1,
            importe: element.importe * -1,
          });
        } else {
          itemTaxGroupDetails.taxTrasDetails.push({
            base: element.base,
            impuesto: element.impuesto,
            tipoFactor: element.tipoFactor,
            tasaOcuota: element.tasaOcuota,
            importe: element.importe,
          });
        }
      });
      return itemTaxGroupDetails;
    } else {
      //Traslado
      const iepsFound = taxList.find(
        (element) =>
          element.custrecord_ent_entloc_codigo_impuesto[0].text === "003 - IEPS"
      );
      let nuevaBaseCalculada = null;
      if (iepsFound) {
        //IEPS EXISTS!
        let {
          rate: iepsRate,
          custrecord_ent_entloc_codigo_impuesto: iepsTaxCode,
        } = iepsFound;
        iepsRate = Number(iepsRate.replace("%", ""));
        const iepsSatTaxCode = keepBefore(iepsTaxCode[0].text, " -");
        //Let's calculate IEPS
        let importeIepsLinea = amount * (iepsRate / 100);
        importeIepsLinea = Number(importeIepsLinea.toFixed(2));
        nuevaBaseCalculada = Number((amount + importeIepsLinea).toFixed(2));
        //IVA
        const ivaFound = taxList.find(
          (element) =>
            element.custrecord_ent_entloc_codigo_impuesto[0].text ===
            "002 - IVA"
        );
        if (ivaFound) {
          //IVA EXISTS!
          let {
            rate: ivaRate,
            custrecord_ent_entloc_codigo_impuesto: ivaTaxCode,
          } = ivaFound;
          ivaRate = Number(ivaRate.replace("%", ""));
          const ivaSatTaxCode = keepBefore(ivaTaxCode[0].text, " -");
          let importeIvaLinea = nuevaBaseCalculada * (ivaRate / 100);
          importeIvaLinea = Number(importeIvaLinea.toFixed(2));
          //Correct tax
          const { nuevoImporteIvaLinea, nuevoImporteIepsLinea } =
            handleTaxCorrection(importeIvaLinea, importeIepsLinea, taxAmount);
          //==============================================================================//
          //Save IEPS
          itemTaxGroupDetails.taxTrasDetails.push({
            base: amount,
            impuesto: iepsSatTaxCode,
            tipoFactor: "Tasa",
            tasaOcuota: iepsRate,
            importe: nuevoImporteIepsLinea,
          });
          //Save IVA
          itemTaxGroupDetails.taxTrasDetails.push({
            base: nuevaBaseCalculada,
            impuesto: ivaSatTaxCode,
            tipoFactor: "Tasa",
            tasaOcuota: ivaRate,
            importe: nuevoImporteIvaLinea,
          });
        }
        return itemTaxGroupDetails;
      }
    }
  };
  const handleTaxCodeDetails = (taxRecord) => {
    const taxcode = taxRecord.getText({
      fieldId: "custrecord_ent_entloc_codigo_impuesto",
    });
    const rate = taxRecord.getValue({
      fieldId: "rate",
    });
    const exempt = taxRecord.getValue({
      fieldId: "exempt",
    });
    return {
      taxcode,
      rate,
      exempt,
    };
  };
  const handleTaxGroupDetails = (taxRecord, amount, taxAmount) => {
    const taxList = [];
    const totalItemLines = taxRecord.getLineCount({
      sublistId: "taxitem",
    });
    if (totalItemLines === 1) {
      //One tax only
      const taxItemKey = taxRecord.getSublistValue({
        sublistId: "taxitem",
        fieldId: "taxitemnkey",
        line: 0,
      });
      const taxDetails = search.lookupFields({
        type: search.Type.SALES_TAX_ITEM,
        id: taxItemKey,
        columns: ["exempt", "rate", "custrecord_ent_entloc_codigo_impuesto"],
      });
      const currentRate = Number(taxDetails.rate.replace("%", ""));
      return {
        isRet: currentRate < 0 ? true : false,
        isGroup: false,
        taxesPerItem: {
          isGroup: 0,
          exempt: taxDetails.exempt,
          base: amount,
          impuesto: keepBefore(
            taxDetails.custrecord_ent_entloc_codigo_impuesto[0].text,
            " -"
          ),
          tipoFactor: "Tasa",
          tasaOcuota: currentRate < 0 ? currentRate * -1 : currentRate,
          importe: currentRate < 0 ? taxAmount * -1 : taxAmount,
        },
      };
    } else {
      for (let i = 0; i < totalItemLines; i++) {
        const taxItemKey = taxRecord.getSublistValue({
          sublistId: "taxitem",
          fieldId: "taxitemnkey",
          line: i,
        });
        const taxDetails = search.lookupFields({
          type: search.Type.SALES_TAX_ITEM,
          id: taxItemKey,
          columns: ["rate", "custrecord_ent_entloc_codigo_impuesto"],
        });
        taxList.push(taxDetails);
      }
      //Handle tax calc
      const taxesPerItem = handleTaxesCalc(taxList, amount, taxAmount);
      log.debug("TAXESPERITEM", taxesPerItem);
      return {
        isGroup: 1,
        taxesPerItem,
      };
    }
  };
  const handleTaxTotal = (taxSummary) => {
    let totalTraslados = 0;
    let totalRetenciones = 0;
    taxSummary.summaryTras.forEach((element) => {
      totalTraslados += Number(element.importe);
    });
    taxSummary.summaryRet.forEach((element) => {
      totalRetenciones += Number(element.importe);
    });
    return {
      totalTraslados: Number(totalTraslados.toFixed(2)),
      totalRetenciones: Number(totalRetenciones.toFixed(2)),
    };
  };
  const handleSatCode = (unit) => {
    let unitList = null;
    const unitsObj = search.create({
      type: "customrecord_ent_entloc_mapeo_unidades",
      filters: [["custrecord_ent_entloc_clave_unidad_local", "anyof", unit]],
      columns: ["custrecord_ent_entloc_clave_sat"],
    });
    const searchResultCount = unitsObj.runPaged().count;
    if (searchResultCount > 0) {
      unitsObj.run().each((result) => {
        unitList = result.getText({
          name: "custrecord_ent_entloc_clave_sat",
        });
        return true;
      });
    }
    return unitList;
  };
  const handleCustomItem = (currentRecord) => {
    const taxTrasDetails = [];
    const taxRetDetails = [];
    const taxSummary = { summaryRet: [], summaryTras: [] };
    const satUnitCodes = [];
    const totalItemLines = currentRecord.getLineCount({ sublistId: "item" });
    for (let i = 0; i < totalItemLines; i++) {
      const taxcodeId = currentRecord.getSublistValue({
        sublistId: "item",
        fieldId: "taxcode",
        line: i,
      });
      const taxAmount = currentRecord.getSublistValue({
        sublistId: "item",
        fieldId: "tax1amt",
        line: i,
      });
      const amount = currentRecord.getSublistValue({
        sublistId: "item",
        fieldId: "amount",
        line: i,
      });
      const unit = currentRecord.getSublistValue({
        sublistId: "item",
        fieldId: "units",
        line: i,
      });
      //Units
      satUnitCodes.push(handleSatCode(unit));
      //Taxgroup or taxcode
      let taxRecord = null;
      try {
        //Try to load taxcode
        taxRecord = record.load({
          type: "salestaxitem",
          id: taxcodeId,
        });
        if (taxRecord) {
          const { taxcode, rate, exempt } = handleTaxCodeDetails(taxRecord);
          let newRate = rate < 0 ? rate * -1 : rate;
          let newTaxAmount = taxAmount < 0 ? taxAmount * -1 : taxAmount;
          if (rate < 0) {
            //Es retención
            taxRetDetails.push({
              isGroup: 0,
              exempt,
              base: amount,
              impuesto: keepBefore(taxcode, " -"),
              tipoFactor: "Tasa",
              tasaOcuota: newRate,
              importe: newTaxAmount,
            });
            //Push summary
            const exist = taxSummary.summaryRet.find(
              (element) =>
                element.impuesto === keepBefore(taxcode, " -") &&
                element.tasaOcuota === newRate
            );
            if (!exist) {
              taxSummary.summaryRet.push({
                base: Number(amount),
                impuesto: keepBefore(taxcode, " -"),
                tipoFactor: "Tasa",
                tasaOcuota: newRate,
                importe: Number(newTaxAmount),
              });
            } else {
              exist.importe = (
                Number(exist.importe) + Number(newTaxAmount)
              ).toFixed(2);
              exist.base = (Number(exist.base) + Number(amount)).toFixed(2);
            }
          } else {
            //Es traslado
            taxTrasDetails.push({
              isGroup: 0,
              exempt,
              base: amount,
              impuesto: keepBefore(taxcode, " -"),
              tipoFactor: "Tasa",
              tasaOcuota: newRate,
              importe: newTaxAmount,
            });
            //Push summary
            const exist = taxSummary.summaryTras.find(
              (element) =>
                element.impuesto === keepBefore(taxcode, " -") &&
                element.tasaOcuota === newRate
            );
            if (!exist) {
              taxSummary.summaryTras.push({
                base: Number(amount),
                impuesto: keepBefore(taxcode, " -"),
                tipoFactor: "Tasa",
                tasaOcuota: newRate,
                importe: Number(newTaxAmount),
              });
            } else {
              exist.importe = (
                Number(exist.importe) + Number(newTaxAmount)
              ).toFixed(2);
              exist.base = (Number(exist.base) + Number(amount)).toFixed(2);
            }
          }
        }
      } catch (error) {
        /* log.debug(
          "No fue posible cargar un código de impuesto, se procede a cargar un grupo de impuesto",
          error
        ); */
        //Try to load taxgroup
        taxRecord = record.load({
          type: "taxgroup",
          id: taxcodeId,
        });

        if (taxRecord) {
          const taxListDetails = handleTaxGroupDetails(
            taxRecord,
            amount,
            taxAmount
          );
          log.debug("TAXLISTDETAILS", taxListDetails);
          if (taxListDetails.isGroup) {
            if (taxListDetails.taxesPerItem.taxRetDetails.length > 0) {
              taxRetDetails.push({
                isGroup: taxListDetails.isGroup,
                details: taxListDetails.taxesPerItem.taxRetDetails,
              });
              //Push summary
              taxListDetails.taxesPerItem.taxRetDetails.forEach((tax) => {
                const exist = taxSummary.summaryRet.find(
                  (element) =>
                    element.impuesto === tax.impuesto &&
                    element.tasaOcuota === tax.tasaOcuota
                );
                if (!exist) {
                  taxSummary.summaryRet.push({
                    base: Number(tax.base),
                    impuesto: tax.impuesto,
                    tipoFactor: tax.tipoFactor,
                    tasaOcuota: tax.tasaOcuota,
                    importe: Number(tax.importe),
                  });
                } else {
                  exist.importe = (
                    Number(exist.importe) + Number(tax.importe)
                  ).toFixed(2);
                  exist.base = (Number(exist.base) + Number(tax.base)).toFixed(
                    2
                  );
                }
              });
            }
            if (taxListDetails.taxesPerItem.taxTrasDetails.length > 0) {
              taxTrasDetails.push({
                isGroup: taxListDetails.isGroup,
                details: taxListDetails.taxesPerItem.taxTrasDetails,
              });
              //Push summary
              taxListDetails.taxesPerItem.taxTrasDetails.forEach((tax) => {
                const exist = taxSummary.summaryTras.find(
                  (element) =>
                    element.impuesto === tax.impuesto &&
                    element.tasaOcuota === tax.tasaOcuota
                );
                if (!exist) {
                  taxSummary.summaryTras.push({
                    base: Number(tax.base),
                    impuesto: tax.impuesto,
                    tipoFactor: tax.tipoFactor,
                    tasaOcuota: tax.tasaOcuota,
                    importe: Number(tax.importe),
                  });
                } else {
                  exist.importe = (
                    Number(exist.importe) + Number(tax.importe)
                  ).toFixed(2);
                  exist.base = (Number(exist.base) + Number(tax.base)).toFixed(
                    2
                  );
                }
              });
            }
          } else {
            if (taxListDetails.isRet) {
              taxRetDetails.push(taxListDetails.taxesPerItem);
              //Push summary
              const exist = taxSummary.summaryRet.find(
                (element) =>
                  element.impuesto === taxListDetails.taxesPerItem.impuesto &&
                  element.tasaOcuota === taxListDetails.taxesPerItem.tasaOcuota
              );
              if (!exist) {
                taxSummary.summaryRet.push({
                  base: Number(taxListDetails.taxesPerItem.base),
                  impuesto: taxListDetails.taxesPerItem.impuesto,
                  tipoFactor: taxListDetails.taxesPerItem.tipoFactor,
                  tasaOcuota: taxListDetails.taxesPerItem.tasaOcuota,
                  importe: Number(taxListDetails.taxesPerItem.importe),
                });
              } else {
                exist.importe = Number(
                  (
                    Number(exist.importe) +
                    Number(taxListDetails.taxesPerItem.importe)
                  ).toFixed(2)
                );
                exist.base = Number(
                  (
                    Number(exist.base) +
                    Number(taxListDetails.taxesPerItem.base)
                  ).toFixed(2)
                );
              }
            } else {
              taxTrasDetails.push(taxListDetails.taxesPerItem);
              //Push summary
              const exist = taxSummary.summaryTras.find(
                (element) =>
                  element.impuesto === taxListDetails.taxesPerItem.impuesto &&
                  element.tasaOcuota === taxListDetails.taxesPerItem.tasaOcuota
              );
              if (!exist) {
                taxSummary.summaryTras.push({
                  base: Number(taxListDetails.taxesPerItem.base),
                  impuesto: taxListDetails.taxesPerItem.impuesto,
                  tipoFactor: taxListDetails.taxesPerItem.tipoFactor,
                  tasaOcuota: taxListDetails.taxesPerItem.tasaOcuota,
                  importe: Number(taxListDetails.taxesPerItem.importe),
                });
              } else {
                exist.importe = Number(
                  (
                    Number(exist.importe) +
                    Number(taxListDetails.taxesPerItem.importe)
                  ).toFixed(2)
                );
                exist.base = Number(
                  (
                    Number(exist.base) +
                    Number(taxListDetails.taxesPerItem.base)
                  ).toFixed(2)
                );
              }
            }
          }
        }
      }
    }
    const taxTotal = handleTaxTotal(taxSummary);
    return {
      taxTrasDetails,
      taxRetDetails,
      taxTotal,
      taxSummary,
      satUnitCodes,
    };
  };
  const handleRelatedCfdis = (currentRecord) => {
    const relatedCfdis = [];
    const totalLines = currentRecord.getLineCount({
      sublistId: "recmachcustrecord_ent_entloc_registro_padre",
    });
    for (let i = 0; i < totalLines; i++) {
      const tipoRelacion = currentRecord.getSublistText({
        sublistId: "recmachcustrecord_ent_entloc_registro_padre",
        fieldId: "custrecord_ent_entloc_tipo_relacion",
        line: i,
      });
      const transaccion = currentRecord.getSublistText({
        sublistId: "recmachcustrecord_ent_entloc_registro_padre",
        fieldId: "custrecord_ent_entloc_transaccion",
        line: i,
      });
      const uuid = currentRecord.getSublistValue({
        sublistId: "recmachcustrecord_ent_entloc_registro_padre",
        fieldId: "custrecord_ent_entloc_uuid",
        line: i,
      });
      const related = relatedCfdis.find(
        (element) => element.tipoRelacion === tipoRelacion
      );
      if (!related) {
        relatedCfdis.push({
          tipoRelacion,
          transacciones: [
            {
              transaccion,
              uuid,
            },
          ],
        });
      } else {
        related.transacciones.push({
          transaccion,
          uuid,
        });
      }
    }
    return relatedCfdis;
  };
  const handleTaxesCalcPayment = (taxList, amount) => {
    const itemTaxGroupDetails = [];
    const iepsFound = taxList.find(
      (element) =>
        element.custrecord_ent_entloc_codigo_impuesto[0].text === "003 - IEPS"
    );
    let nuevaBaseCalculada = null;
    if (iepsFound) {
      //IEPS EXISTS!
      let {
        rate: iepsRate,
        custrecord_ent_entloc_codigo_impuesto: iepsTaxCode,
      } = iepsFound;
      iepsRate = Number(iepsRate.replace("%", ""));
      const iepsSatTaxCode = keepBefore(iepsTaxCode[0].text, " -");
      //Let's calculate IEPS
      let importeIepsLinea = amount * (iepsRate / 100);
      importeIepsLinea = Number(importeIepsLinea.toFixed(2));
      nuevaBaseCalculada = Number((amount + importeIepsLinea).toFixed(2));
      //IVA
      const ivaFound = taxList.find(
        (element) =>
          element.custrecord_ent_entloc_codigo_impuesto[0].text === "002 - IVA"
      );
      if (ivaFound) {
        //IVA EXISTS!
        let {
          rate: ivaRate,
          custrecord_ent_entloc_codigo_impuesto: ivaTaxCode,
        } = ivaFound;
        ivaRate = Number(ivaRate.replace("%", ""));
        const ivaSatTaxCode = keepBefore(ivaTaxCode[0].text, " -");
        let importeIvaLinea = nuevaBaseCalculada * (ivaRate / 100);
        importeIvaLinea = Number(importeIvaLinea.toFixed(2));
        //==============================================================================//
        //Save IEPS
        itemTaxGroupDetails.push({
          base: amount,
          impuesto: iepsSatTaxCode,
          tipoFactor: "Tasa",
          tasaOcuota: iepsRate,
          importe: importeIepsLinea,
        });
        //Save IVA
        itemTaxGroupDetails.push({
          base: nuevaBaseCalculada,
          impuesto: ivaSatTaxCode,
          tipoFactor: "Tasa",
          tasaOcuota: ivaRate,
          importe: importeIvaLinea,
        });
      }
      return itemTaxGroupDetails;
    }
  };
  const handleTaxGroupDetailsPayment = (taxRecord, amount, porcentajePago) => {
    const taxList = [];
    const totalItemLines = taxRecord.getLineCount({
      sublistId: "taxitem",
    });
    const calcAmount = Number(
      (Number(amount) * (porcentajePago / 100)).toFixed(2)
    );
    if (totalItemLines === 1) {
      //One tax only
      const taxItemKey = taxRecord.getSublistValue({
        sublistId: "taxitem",
        fieldId: "taxitemnkey",
        line: 0,
      });
      const taxDetails = search.lookupFields({
        type: search.Type.SALES_TAX_ITEM,
        id: taxItemKey,
        columns: ["exempt", "rate", "custrecord_ent_entloc_codigo_impuesto"],
      });
      const rate = Number(taxDetails.rate.replace("%", ""));
      const newImporte = Number((calcAmount * (rate / 100)).toFixed(2));
      return {
        isGroup: false,
        taxesPerItem: {
          isGroup: 0,
          exempt: taxDetails.exempt,
          base: calcAmount,
          impuesto: keepBefore(
            taxDetails.custrecord_ent_entloc_codigo_impuesto[0].text,
            " -"
          ),
          tipoFactor: "Tasa",
          tasaOcuota: rate,
          importe: newImporte,
        },
      };
    } else {
      for (let i = 0; i < totalItemLines; i++) {
        const taxItemKey = taxRecord.getSublistValue({
          sublistId: "taxitem",
          fieldId: "taxitemnkey",
          line: i,
        });
        const taxDetails = search.lookupFields({
          type: search.Type.SALES_TAX_ITEM,
          id: taxItemKey,
          columns: ["rate", "custrecord_ent_entloc_codigo_impuesto"],
        });
        taxList.push(taxDetails);
      }
      //Handle tax calc
      const taxesPerItem = handleTaxesCalcPayment(taxList, calcAmount);
      return {
        isGroup: 1,
        taxesPerItem,
      };
    }
  };
  const handleTaxesForPayment = (invoiceRecord, paymentAmount) => {
    const currentRecord = invoiceRecord;
    const invoiceAmount = invoiceRecord.getValue({
      fieldId: "total",
    });
    const porcentajePago =
      (Number(paymentAmount) * 100) / Number(invoiceAmount);
    //CALCULATE
    const taxItemDetails = [];
    const taxSummary = [];
    const totalItemLines = currentRecord.getLineCount({ sublistId: "item" });
    for (let i = 0; i < totalItemLines; i++) {
      const taxcodeId = currentRecord.getSublistValue({
        sublistId: "item",
        fieldId: "taxcode",
        line: i,
      });
      const amount = currentRecord.getSublistValue({
        sublistId: "item",
        fieldId: "amount",
        line: i,
      });
      const calcAmount = Number(
        ((Number(amount) * porcentajePago) / 100).toFixed(2)
      );
      //Taxgroup or taxcode
      let taxRecord = null;
      try {
        //Try to load taxcode
        taxRecord = record.load({
          type: "salestaxitem",
          id: taxcodeId,
        });
        if (taxRecord) {
          const { taxcode, rate, exempt } = handleTaxCodeDetails(taxRecord);
          const newImporte = Number((calcAmount * (rate / 100)).toFixed(2));
          taxItemDetails.push({
            isGroup: 0,
            exempt,
            base: calcAmount,
            impuesto: keepBefore(taxcode, " -"),
            tipoFactor: "Tasa",
            tasaOcuota: rate,
            importe: newImporte,
          });
          //Push summary
          const exist = taxSummary.find(
            (element) =>
              element.impuesto === keepBefore(taxcode, " -") &&
              element.tasaOcuota === rate
          );
          if (!exist) {
            taxSummary.push({
              base: calcAmount,
              impuesto: keepBefore(taxcode, " -"),
              tipoFactor: "Tasa",
              tasaOcuota: rate,
              importe: newImporte,
            });
          } else {
            exist.importe = (
              Number(exist.importe) + Number(newImporte)
            ).toFixed(2);
            exist.base = (Number(exist.base) + Number(calcAmount)).toFixed(2);
          }
        }
      } catch (error) {
        log.debug(
          "No fue posible cargar un código de impuesto, se procede a cargar un grupo de impuesto",
          error
        );
        //Try to load taxgroup
        taxRecord = record.load({
          type: "taxgroup",
          id: taxcodeId,
        });

        if (taxRecord) {
          const taxListDetails = handleTaxGroupDetailsPayment(
            taxRecord,
            amount,
            porcentajePago
          );
          if (taxListDetails.isGroup) {
            taxItemDetails.push(taxListDetails);
            //Push summary
            taxListDetails.taxesPerItem.forEach((tax) => {
              const exist = taxSummary.find(
                (element) =>
                  element.impuesto === tax.impuesto &&
                  element.tasaOcuota === tax.tasaOcuota
              );
              if (!exist) {
                taxSummary.push({
                  base: Number(tax.base),
                  impuesto: tax.impuesto,
                  tipoFactor: tax.tipoFactor,
                  tasaOcuota: tax.tasaOcuota,
                  importe: Number(tax.importe),
                });
              } else {
                exist.importe = (
                  Number(exist.importe) + Number(tax.importe)
                ).toFixed(2);
                exist.base = (Number(exist.base) + Number(tax.base)).toFixed(2);
              }
            });
          } else {
            taxItemDetails.push(taxListDetails.taxesPerItem);
            //Push summary
            const exist = taxSummary.find(
              (element) =>
                element.impuesto === taxListDetails.taxesPerItem.impuesto &&
                element.tasaOcuota === taxListDetails.taxesPerItem.tasaOcuota
            );
            if (!exist) {
              taxSummary.push({
                base: Number(taxListDetails.taxesPerItem.base),
                impuesto: taxListDetails.taxesPerItem.impuesto,
                tipoFactor: taxListDetails.taxesPerItem.tipoFactor,
                tasaOcuota: taxListDetails.taxesPerItem.tasaOcuota,
                importe: Number(taxListDetails.taxesPerItem.importe),
              });
            } else {
              exist.importe = Number(
                (
                  Number(exist.importe) +
                  Number(taxListDetails.taxesPerItem.importe)
                ).toFixed(2)
              );
              exist.base = Number(
                (
                  Number(exist.base) + Number(taxListDetails.taxesPerItem.base)
                ).toFixed(2)
              );
            }
          }
        }
      }
    }
    const taxTotal = handleTaxTotal(taxSummary);
    return { taxItemDetails, taxTotal, taxSummary };
  };
  const handleDocRelData = (invoiceRelated, paymentId) => {
    const totalLinkLines = invoiceRelated.getLineCount({ sublistId: "links" });
    let numParcialidad = 1;
    let internalCounter = 0;
    const invoiceUuid = invoiceRelated.getValue({
      fieldId: "custbody_ent_entloc_uuid",
    });
    const invoiceCurrency = invoiceRelated.getValue({
      fieldId: "currencysymbol",
    });
    for (let i = 0; i < totalLinkLines - 1; i++) {
      const currentPaymentId = invoiceRelated.getSublistValue({
        sublistId: "links",
        fieldId: "id",
        line: i,
      });
      const currentPaymentType = invoiceRelated.getSublistValue({
        sublistId: "links",
        fieldId: "type",
        line: i,
      });
      if (
        Number(currentPaymentId) === Number(paymentId) &&
        currentPaymentType == "Pago"
      ) {
        numParcialidad = internalCounter + 1;
        internalCounter++;
        break;
      }
    }
    return {
      numParcialidad,
      invoiceUuid,
      invoiceCurrency,
    };
  };
  const handleTotalTaxesForPayment = (resultTaxes) => {
    let resultTaxesList = [];
    let paymentTaxesTotals = [];
    for (let i = 0; i < resultTaxes.length; i++) {
      resultTaxesList = [...resultTaxesList, ...resultTaxes[i]];
    }
    for (let i = 0; i < resultTaxesList.length; i++) {
      if (paymentTaxesTotals.length === 0) {
        paymentTaxesTotals.push({
          base: Number(resultTaxesList[i].base),
          impuesto: resultTaxesList[i].impuesto,
          tasaOcuota: resultTaxesList[i].tasaOcuota,
          importe: Number(resultTaxesList[i].importe),
        });
      } else {
        const found = paymentTaxesTotals.find(
          (e) =>
            e.impuesto === resultTaxesList[i].impuesto &&
            e.tasaOcuota === resultTaxesList[i].tasaOcuota
        );
        if (found) {
          const tempImporte =
            Number(found.importe) + Number(resultTaxesList[i].importe);
          const tempBase = Number(found.base) + Number(resultTaxesList[i].base);
          found.importe = Number(tempImporte.toFixed(2));
          found.base = Number(tempBase.toFixed(2));
        } else {
          paymentTaxesTotals.push({
            base: Number(resultTaxesList[i].base),
            impuesto: resultTaxesList[i].impuesto,
            tasaOcuota: resultTaxesList[i].tasaOcuota,
            importe: Number(resultTaxesList[i].importe),
          });
        }
      }
    }
    return paymentTaxesTotals;
  };
  const handleDataForPayment = (currentRecord) => {
    let taxesForPayment = [];
    let totalPaymentTaxesList = [];
    let totalPaymentAmount = 0;
    const totalApplyLines = currentRecord.getLineCount({ sublistId: "apply" });
    const paymentId = currentRecord.id;
    const paymentDate = currentRecord.getValue({
      fieldId: "createddate",
    });
    const paymentForm = currentRecord.getText({
      fieldId: "custbody_ent_entloc_forma_pago",
    });
    const currency = currentRecord.getText({
      fieldId: "currencysymbol",
    });
    const exchangeRate = currentRecord.getValue({
      fieldId: "exchangerate",
    });
    for (let i = 0; i < totalApplyLines; i++) {
      const apply = currentRecord.getSublistValue({
        sublistId: "apply",
        fieldId: "apply",
        line: i,
      });
      if (apply) {
        const amount = currentRecord.getSublistValue({
          sublistId: "apply",
          fieldId: "amount",
          line: i,
        });
        const total = currentRecord.getSublistValue({
          sublistId: "apply",
          fieldId: "total",
          line: i,
        });
        const internalInvoiceId = currentRecord.getSublistValue({
          sublistId: "apply",
          fieldId: "internalid",
          line: i,
        });
        const invoiceRelated = record.load({
          type: "invoice",
          id: internalInvoiceId,
        });
        //Taxes summary for payment
        const resultTaxes = handleTaxesForPayment(invoiceRelated, amount);
        totalPaymentAmount += Number(amount);
        totalPaymentTaxesList.push(resultTaxes.taxSummary);
        taxesForPayment.push({
          taxes: resultTaxes,
          docToRel: handleDocRelData(invoiceRelated, paymentId),
          paymentData: {
            pago: amount,
            aPagar: total,
            paymentDate,
            paymentForm,
            currency,
            exchangeRate,
          },
        });
      }
    }
    const totalPaymentTaxes = handleTotalTaxesForPayment(totalPaymentTaxesList);
    return {
      taxesForPayment,
      totalPaymentTaxes,
      totalPaymentAmount,
    };
  };
  const getExtraCustomData = (currentRecord) => {
    let total = currentRecord.getValue({
      fieldId: "total",
    });
    let subtotal = currentRecord.getValue({
      fieldId: "subtotal",
    });
    const subsidiaryId = currentRecord.getValue({
      fieldId: "subsidiary",
    });
    const tranid = currentRecord.getValue({
      fieldId: "tranid",
    });
    const recordType = currentRecord.type;
    let customItem = null;
    let totalTaxesForPayment = null;
    let totalPaymentAmount = 0;

    //Custom transaction
    const { serie, folio } = handleFolioSerie(tranid);
    //Summary
    total = Number(total).toFixed(2);
    subtotal = Number(subtotal).toFixed(2);
    //Custom subsidiary
    let currentSubsidiaryAddress = null;
    const subsidiaryAddressObj = {};
    const currentSubsidiary = record.load({
      type: "subsidiary",
      id: subsidiaryId,
    });
    const SubsidiaryMainAddressId = currentSubsidiary.getValue({
      fieldId: "mainaddress",
    });
    if (SubsidiaryMainAddressId) {
      currentSubsidiaryAddress = record.load({
        type: "address",
        id: SubsidiaryMainAddressId,
      });
      if (currentSubsidiaryAddress) {
        const cpSubsidiaria = currentSubsidiaryAddress.getValue({
          fieldId: "zip",
        });
        subsidiaryAddressObj.zip = cpSubsidiaria;
      }
    }
    //Custom item
    if (recordType === "customerpayment") {
      const dataForPayment = handleDataForPayment(currentRecord);
      customItem = dataForPayment.taxesForPayment;
      totalTaxesForPayment = dataForPayment.totalPaymentTaxes;
      totalPaymentAmount = dataForPayment.totalPaymentAmount;
    } else {
      customItem = handleCustomItem(currentRecord);
      log.debug("CUSTOMFINALEITEMDETAILS", customItem);
    }
    //Related CFDIS
    const relatedCfdis = handleRelatedCfdis(currentRecord);
    return {
      customRecordData: {
        serie,
        folio,
        relatedCfdis,
      },
      summary: {
        total,
        subtotal,
      },
      customSubsidiaryData: {
        address: subsidiaryAddressObj,
      },
      customItem,
      ...(recordType === "customerpayment" && {
        totalTaxesForPayment,
        totalPaymentAmount,
      }),
    };
  };
  const getPdfRendered = (
    currentRecord,
    subsidiaryRecord,
    customerRecord,
    customData,
    templateId,
    folderId,
    pdfName
  ) => {
    const renderer = render.create();
    renderer.addCustomDataSource({
      format: render.DataSource.OBJECT,
      alias: "customData",
      data: customData,
    });
    renderer.addRecord("record", currentRecord);
    renderer.addRecord("subsidiary", subsidiaryRecord);
    renderer.addRecord("customer", customerRecord);

    renderer.setTemplateById(templateId);
    // render PDF
    const newfile = renderer.renderAsPdf();
    newfile.folder = folderId; // ID of folder where file created
    newfile.name = pdfName + ".pdf";
    const fileId = newfile.save();
    return fileId;
    /* context.response.writeFile(newfile, true); */
  };
  const getCertExtraData = (jsonString) => {
    //Convertir JSON
    const usoCFDI = jsonString["cfdi:Comprobante"]["cfdi:Receptor"].$.UsoCFDI;
    const metodoPago = jsonString["cfdi:Comprobante"].$.MetodoPago;
    const formaPago = jsonString["cfdi:Comprobante"].$.FormaPago;
    const fechaTimbrado =
      jsonString["cfdi:Comprobante"]["cfdi:Complemento"][
        "tfd:TimbreFiscalDigital"
      ].$.FechaTimbrado;

    const noSerieCSD = jsonString["cfdi:Comprobante"].$.NoCertificado;
    const noSerieSAT =
      jsonString["cfdi:Comprobante"]["cfdi:Complemento"][
        "tfd:TimbreFiscalDigital"
      ].$.NoCertificadoSAT;
    const firmaCFDI =
      jsonString["cfdi:Comprobante"]["cfdi:Complemento"][
        "tfd:TimbreFiscalDigital"
      ].$.SelloCFD;
    const firmaSAT =
      jsonString["cfdi:Comprobante"]["cfdi:Complemento"][
        "tfd:TimbreFiscalDigital"
      ].$.SelloSAT;

    const tipoComprobante = jsonString["cfdi:Comprobante"].$.TipoDeComprobante;
    return {
      fechaTimbrado,
      noSerieCSD,
      noSerieSAT,
      firmaCFDI,
      firmaSAT,
      usoCFDI,
      metodoPago,
      formaPago,
      tipoComprobante,
    };
  };
  const handleFolderId = (folderName, parentFolder, subsidiaryId) => {
    //==================================Buscando carpeta en gabinete==============================//
    let folderId = null;
    //Busca carpeta
    const folderSearchObj = search.create({
      type: "folder",
      filters: [
        ["name", "is", folderName],
        "AND",
        ["istoplevel", "is", "F"],
        "AND",
        ["predecessor", "anyof", parentFolder],
      ],
      columns: ["internalid"],
    });
    const searchResultCount = folderSearchObj.runPaged().count;
    if (searchResultCount > 0) {
      folderSearchObj.run().each((result) => {
        folderId = result.getValue({
          name: "internalid",
        });
      });
    } else {
      try {
        const folderRecord = record.create({
          type: record.Type.FOLDER,
        });
        folderRecord.setValue({
          fieldId: "name",
          value: folderName,
        });
        folderRecord.setValue({
          fieldId: "parent",
          value: parentFolder,
        });
        if (subsidiaryId) {
          folderRecord.setValue({
            fieldId: "subsidiary",
            value: subsidiaryId,
          });
        }
        folderId = folderRecord.save({
          enableSourcing: true,
          ignoreMandatoryFields: true,
        });
      } catch (error) {
        log.debug("FOLDER", error);
      }
    }
    return folderId;
  };
  const handleTipoCompText = (tipoComprobante) => {
    let tipoText = "";
    switch (tipoComprobante) {
      case "I":
        tipoText = "Ingreso";
        break;
      case "E":
        tipoText = "Egreso";
        break;
      case "P":
        tipoText = "Pago";
        break;
      case "T":
        tipoText = "Traslado";
        break;
    }
    return tipoText;
  };
  const getFolderId = (
    subsidiaryId,
    subsidiaryRfc,
    fechaTimbrado,
    parent,
    tipoComprobante,
    tipoArchivo
  ) => {
    try {
      const fechaTimbradoObj = new Date(fechaTimbrado);
      const año = fechaTimbradoObj.getFullYear();
      const mes = fechaTimbradoObj.getMonth();
      let mesText = mes + "";
      if (mesText.length === 1) {
        mesText = "0" + mes;
      }
      const tipoText = handleTipoCompText(tipoComprobante);

      const subsidiaryFolderId = handleFolderId(
        subsidiaryRfc,
        parent,
        subsidiaryId
      );
      const yearFolderId = handleFolderId(año + "", subsidiaryFolderId, null);
      const monthFolderId = handleFolderId(mesText, yearFolderId, null);
      const tipoComFolderId = handleFolderId(tipoText, monthFolderId, null);
      const tipoArchFolderId = handleFolderId(
        tipoArchivo,
        tipoComFolderId,
        null
      );
      return {
        error: false,
        tipoArchFolderId,
      };
    } catch (error) {
      return {
        error: true,
        details: error,
      };
    }
  };
  const getStringRelated = (jsonString) => {
    let relacionCfdi = "";
    let tipoRelacion = "";
    let transaccion = "";
    let uuid = "";
    const relatedCfdis = jsonString.customRecordData.relatedCfdis;
    if (relatedCfdis) {
      for (let i = 0; i < relatedCfdis.length; i++) {
        tipoRelacion = relatedCfdis[i].tipoRelacion;
        if (relatedCfdis.length > 1) {
          if (i === relatedCfdis.length - 1) {
            relacionCfdi += `|||${tipoRelacion}///`;
          } else {
            relacionCfdi += `${tipoRelacion}///`;
          }
        } else {
          relacionCfdi += `${tipoRelacion}///`;
        }

        const transaccionesCfdis =
          jsonString.customRecordData.relatedCfdis[i].transacciones;
        for (let j = 0; j < transaccionesCfdis.length; j++) {
          transaccion = transaccionesCfdis[j].transaccion;
          uuid = transaccionesCfdis[j].uuid;
          if (j === transaccionesCfdis.length - 1) {
            relacionCfdi += `${transaccion}///${uuid}`;
          }
        }
      }
    }
    return relacionCfdi;
  };
  const getStringTax = (jsonString) => {
    ///////Totales Impuestos//////////
    let totalTax = "";
    let impuestosField = "";

    if (jsonString.customItem) {
      const taxItem = jsonString.customItem.taxItemDetails;
      const taxTotal = jsonString.customItem.taxTotal;
      const taxSum = jsonString.customItem.taxSummary;

      for (let i = 0; i < taxSum.length; i++) {
        let impuesto = taxSum[i].impuesto;
        let impuestoTasa = taxSum[i].tasaOcuota;

        if (impuesto === "002") {
          impuesto = "IVA";
        } else if (impuesto === "003") {
          impuesto = "IEPS";
        }
        if (i == taxSum.length - 1) {
          totalTax += `${impuesto} ${impuestoTasa}%://$${taxSum[i].importe}`;
        } else {
          totalTax += `${impuesto} ${impuestoTasa}%://$${taxSum[i].importe}//`;
        }
      }

      ///////Impuestos Items//////////
      for (let i = 0; i < taxItem.length; i++) {
        let impuesto = taxItem[i].impuesto;
        if (taxItem[i].isGroup === 0) {
          let importe = taxItem[i].importe;
          let tasa = taxItem[i].tasaOcuota;

          if (impuesto === "002") {
            impuesto = "IVA";

            if (i === taxItem.length - 1) {
              impuestosField += `///${impuesto}  ${tasa}% $${importe}`;
            } else {
              impuestosField += `${impuesto}  ${tasa}% $${importe}///`;
            }
          } else if (impuesto === "003") {
            impuesto = "IEPS";

            if (i === taxItem.length - 1) {
              impuestosField += `///${impuesto} ${tasa}% $${importe}`;
            } else {
              impuestosField += `${impuesto} ${tasa}% $${importe}///`;
            }
          }
        } else if (taxItem[i].isGroup === 1) {
          const groupItem = taxItem[i].taxesPerItem;
          for (let j = 0; j < groupItem.length; j++) {
            let importeGroup = groupItem[j].importe;
            let impuestoGroup = groupItem[j].impuesto;
            let tasaGroup = groupItem[j].tasaOcuota;

            if (impuestoGroup === "002") {
              impuestoGroup = "IVA";
              if (j === groupItem.length - 1) {
                impuestosField += ` ${impuestoGroup} ${tasaGroup}% $${importeGroup} ##${totalTax}//$${taxTotal}`;
              } else {
                impuestosField += `${impuestoGroup} ${tasaGroup}% $${importeGroup} -`;
              }
            } else if (impuestoGroup === "003") {
              impuestoGroup = "IEPS";
              if (j === groupItem.length - 1) {
                impuestosField += ` ${impuestoGroup} ${tasaGroup}% $${importeGroup} ##${totalTax}//$${taxTotal}`;
              } else {
                impuestosField += `${impuestoGroup} ${tasaGroup}% $${importeGroup} -`;
              }
            }
          }
        }
      }
    }
    return impuestosField;
  };
  return {
    getGlobalConfig,
    getUserConfig,
    getPdfRendered,
    getExtraCustomData,
    getCertExtraData,
    getFolderId,
    getStringRelated,
    getStringTax,
  };
});
