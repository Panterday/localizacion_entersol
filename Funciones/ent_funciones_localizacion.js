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
  const handleTaxGroupData = () => {
    const taxGroupData = [];
    const taxCodeData = [];
    //Tax group
    const taxGroupDetailsSearch = search.create({
      type: "salestaxitem",
      filters: [],
      columns: [
        "internalid",
        "itemid",
        "rate",
        "taxgroup",
        "custrecord_ent_entloc_codigo_impuesto",
        "exempt",
      ],
    });
    //Tax code
    const taxCodeDetailsSearch = search.create({
      type: "salestaxitem",
      filters: [],
      columns: [
        "internalid",
        "rate",
        "exempt",
        "custrecord_ent_entloc_codigo_impuesto",
      ],
    });
    taxGroupDetailsSearch.run().each((result) => {
      const taxGroupElementAux = {
        taxGroupId: null,
        codes: [],
      };
      const taxGroupId = Number(
        result.getValue({
          name: "taxgroup",
        })
      );
      const taxCodeId = Number(
        result.getValue({
          name: "internalid",
        })
      );
      const rate = result.getValue({
        name: "rate",
      });
      const exempt = result.getValue({
        name: "exempt",
      });
      const customCode = result.getText({
        name: "custrecord_ent_entloc_codigo_impuesto",
      });
      if (taxGroupData.length === 0) {
        taxGroupElementAux.taxGroupId = taxGroupId;
        taxGroupElementAux.codes.push({
          taxCodeId,
          rate,
          exempt,
          customCode,
        });
        taxGroupData.push(taxGroupElementAux);
      } else {
        const found = taxGroupData.find(
          (element) => element.taxGroupId === taxGroupId
        );
        if (found) {
          found.codes.push({
            taxCodeId,
            rate,
            exempt,
            customCode,
          });
        } else {
          taxGroupElementAux.taxGroupId = taxGroupId;
          taxGroupElementAux.codes.push({
            taxCodeId,
            rate,
            exempt,
            customCode,
          });
          taxGroupData.push(taxGroupElementAux);
        }
      }
      return true;
    });
    taxCodeDetailsSearch.run().each((result) => {
      const taxCodeId = Number(
        result.getValue({
          name: "internalid",
        })
      );
      const rate = result.getValue({
        name: "rate",
      });
      const exempt = result.getValue({
        name: "exempt",
      });
      const customCode = result.getText({
        name: "custrecord_ent_entloc_codigo_impuesto",
      });
      taxCodeData.push({
        taxCodeId,
        rate,
        exempt,
        customCode,
      });
      return true;
    });
    return {
      taxGroupData,
      taxCodeData,
    };
  };
  const handleSatMappingUnits = () => {
    const satUnitData = [];
    const satMapSearch = search.create({
      type: "customrecord_ent_entloc_mapeo_unidades",
      filters: [],
      columns: [
        "custrecord_ent_entloc_clave_unidad_local",
        "custrecord_ent_entloc_clave_sat",
      ],
    });
    satMapSearch.run().each((result) => {
      const netsuiteCode = result.getValue({
        name: "custrecord_ent_entloc_clave_unidad_local",
      });
      const satCode = result.getText({
        name: "custrecord_ent_entloc_clave_sat",
      });
      satUnitData.push({
        netsuiteCode,
        satCode,
      });
      return true;
    });
    return satUnitData;
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
            printColor: globalConfigRecord.getValue({
              fieldId: "custrecord_ent_entloc_color_format_fv",
            }),
            font: globalConfigRecord.getText({
              fieldId: "custrecord_ent_entloc_fuente_fv",
            }),
            fontSize: globalConfigRecord.getText({
              fieldId: "custrecord_ent_entloc_tam_fuente_fv",
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
            printColor: globalConfigRecord.getValue({
              fieldId: "custrecord_ent_entloc_color_format_nc",
            }),
            font: globalConfigRecord.getText({
              fieldId: "custrecord_ent_entloc_fuente_nc",
            }),
            fontSize: globalConfigRecord.getText({
              fieldId: "custrecord_ent_entloc_tam_fuente_nc",
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
            printColor: globalConfigRecord.getValue({
              fieldId: "custrecord_ent_entloc_color_format_pc",
            }),
            font: globalConfigRecord.getText({
              fieldId: "custrecord_ent_entloc_fuente_pc",
            }),
            fontSize: globalConfigRecord.getText({
              fieldId: "custrecord_ent_entloc_tam_fuente_pc",
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
    const isRet = taxList.codes.find(
      (element) => Number(element.rate.replace("%", "")) < 0
    );
    if (isRet) {
      //Retención
      let tempTotalImporte = 0;
      const taxTempList = [];
      const taxRetTempList = [];
      const taxTrasTempList = [];
      taxList.codes.forEach((element) => {
        const tempRate = Number(element.rate.replace("%", ""));
        const tempCode = keepBefore(element.customCode, " -");
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
        let diferencia = Number(tempTotalImporte.toFixed(2)) - taxAmount;
        if (diferencia < 0) {
          diferencia = Math.abs(diferencia);
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
            importe: Number((element.importe * -1).toFixed(2)),
          });
        } else {
          itemTaxGroupDetails.taxTrasDetails.push({
            base: element.base,
            impuesto: element.impuesto,
            tipoFactor: element.tipoFactor,
            tasaOcuota: element.tasaOcuota,
            importe: Number(element.importe.toFixed(2)),
          });
        }
      });
      return itemTaxGroupDetails;
    } else {
      //Traslado
      const iepsFound = taxList.codes.find(
        (element) => element.customCode === "003 - IEPS"
      );
      let nuevaBaseCalculada = null;
      if (iepsFound) {
        //IEPS EXISTS!
        let { rate: iepsRate, customCode: iepsTaxCode } = iepsFound;
        iepsRate = Number(iepsRate.replace("%", ""));
        const iepsSatTaxCode = keepBefore(iepsTaxCode, " -");
        //Let's calculate IEPS
        let importeIepsLinea = Number(amount) * (iepsRate / 100);
        importeIepsLinea = Number(importeIepsLinea.toFixed(2));
        nuevaBaseCalculada = Number(
          (Number(amount) + importeIepsLinea).toFixed(2)
        );
        //IVA
        const ivaFound = taxList.codes.find(
          (element) => element.customCode === "002 - IVA"
        );
        if (ivaFound) {
          //IVA EXISTS!
          let { rate: ivaRate, customCode: ivaTaxCode } = ivaFound;
          ivaRate = Number(ivaRate.replace("%", ""));
          const ivaSatTaxCode = keepBefore(ivaTaxCode, " -");
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
    const totalItemLines = taxRecord.codes.length;
    if (totalItemLines === 1) {
      //One tax only
      const currentRate = Number(taxRecord.codes[0].rate.replace("%", ""));
      return {
        isRet: currentRate < 0 ? true : false,
        isGroup: false,
        taxesPerItem: {
          isGroup: 0,
          exempt: taxRecord.codes[0].exempt,
          base: amount,
          impuesto: keepBefore(taxRecord.codes[0].customCode, " -"),
          tipoFactor: "Tasa",
          tasaOcuota: currentRate < 0 ? currentRate * -1 : currentRate,
          importe: currentRate < 0 ? taxAmount * -1 : taxAmount,
        },
      };
    } else {
      //Handle tax calc
      const taxesPerItem = handleTaxesCalc(taxRecord, amount, taxAmount);
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
  const handleNewTaxSummary = (taxSummary) => {
    const newTaxSummaryRet = [];
    const newTaxSummaryTras = [];
    for (let i = 0; i < taxSummary.summaryRet.length; i++) {
      if (i === 0) {
        newTaxSummaryRet.push({
          importe: taxSummary.summaryRet[i].importe,
          impuesto: taxSummary.summaryRet[i].impuesto,
          tasaOcuota: taxSummary.summaryRet[i].tasaOcuota,
        });
      } else {
        const found = newTaxSummaryRet.find(
          (element) => element.impuesto === taxSummary.summaryRet[i].impuesto
        );
        if (found) {
          found.importe =
            Number(found.importe) + Number(taxSummary.summaryRet[i].importe);
        } else {
          newTaxSummaryRet.push({
            importe: taxSummary.summaryRet[i].importe,
            impuesto: taxSummary.summaryRet[i].impuesto,
            tasaOcuota: taxSummary.summaryRet[i].tasaOcuota,
          });
        }
      }
    }
    taxSummary.summaryTras.forEach((element) => {
      newTaxSummaryTras.push({
        ...(element.exempt && { exempt: element.exempt }),
        base: element.base,
        impuesto: element.impuesto,
        tipoFactor: element.tipoFactor,
        tasaOcuota: element.tasaOcuota,
        importe: element.importe,
      });
    });
    return {
      summaryRet: newTaxSummaryRet,
      summaryTras: newTaxSummaryTras,
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
  const handleSplitDiscountItems = (currentRecord) => {
    const fullItems = [];
    const items = [];
    const discounts = [];
    let totalDiscount = 0;
    const totalItemLines = currentRecord.getLineCount({ sublistId: "item" });
    for (let i = 0; i < totalItemLines; i++) {
      const itemType = currentRecord.getSublistValue({
        sublistId: "item",
        fieldId: "itemtype",
        line: i,
      });
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
      if (itemType === "Discount") {
        const discline = currentRecord.getSublistValue({
          sublistId: "item",
          fieldId: "discline",
          line: i,
        });
        discounts.push({ line: discline, amount, taxAmount });
      } else {
        const line = currentRecord.getSublistValue({
          sublistId: "item",
          fieldId: "line",
          line: i,
        });
        items.push({
          line,
          unit,
          taxcodeId,
          amount,
          taxAmount,
        });
      }
    }
    items.forEach((item) => {
      const discountFound = discounts.find(
        (element) => element.line === item.line
      );
      if (discountFound) {
        const newAmount = (
          Number(item.amount) + Number(discountFound.amount)
        ).toFixed(2);
        const newTaxAmount = (
          Number(item.taxAmount) + Number(discountFound.taxAmount)
        ).toFixed(2);
        fullItems.push({
          discount: Math.abs(Number(discountFound.amount)),
          unit: item.unit,
          taxcodeId: item.taxcodeId,
          amount: newAmount,
          taxAmount: newTaxAmount,
        });
      } else {
        fullItems.push({
          unit: item.unit,
          taxcodeId: item.taxcodeId,
          amount: item.amount,
          taxAmount: item.taxAmount,
        });
      }
    });
    discounts.forEach((discount) => {
      totalDiscount += Math.abs(Number(discount.amount));
    });
    return {
      fullItems,
      totalDiscount: Number(totalDiscount.toFixed(2)),
    };
  };
  const handleCustomItem = (
    newItems,
    totalDiscount,
    taxDataBase,
    mapUnitsDataBase
  ) => {
    const scriptObj = runtime.getCurrentScript();
    log.debug("REMAIN START", scriptObj.getRemainingUsage());
    let retExist = false;
    let trasExist = false;
    const taxItemDetails = [];
    const taxSummary = { summaryRet: [], summaryTras: [] };
    const satUnitCodes = [];
    const discounts = [];
    log.debug("REMAIN BEFORE FOR", scriptObj.getRemainingUsage());
    for (let i = 0; i < newItems.length; i++) {
      const discount = newItems[i].discount;
      const taxcodeId = newItems[i].taxcodeId;
      const taxAmount = newItems[i].taxAmount;
      const amount = newItems[i].amount;
      const unit = newItems[i].unit;
      //Units
      log.debug(
        "REMAIN BEFORE SATUNITSEARCH " + unit,
        scriptObj.getRemainingUsage()
      );
      const tempSatCode = mapUnitsDataBase.find(
        (element) => element.netsuiteCode === unit
      );
      satUnitCodes.push(tempSatCode.satCode);
      //Discounts
      discounts.push({
        item: i,
        discount,
      });
      //Taxgroup or taxcode
      let taxRecord = null;
      try {
        //Try to load taxcode
        taxRecord = taxDataBase.taxCodeData.find(
          (taxCodeElement) => taxCodeElement.taxCodeId === Number(taxcodeId)
        );
        if (taxRecord) {
          let taxTrasDetails = null;
          let taxRetDetails = null;
          const { customCode: taxcode, rate, exempt } = taxRecord;
          let newRate = Number(rate.replace("%", ""));
          newRate = newRate < 0 ? newRate * -1 : newRate;
          let newTaxAmount = taxAmount < 0 ? taxAmount * -1 : taxAmount;
          if (rate < 0) {
            retExist = true;
            //Es retención
            taxRetDetails = {
              isGroup: 0,
              exempt,
              base: amount,
              impuesto: keepBefore(taxcode, " -"),
              tipoFactor: "Tasa",
              tasaOcuota: newRate,
              importe: Number(Number(newTaxAmount).toFixed(2)),
            };
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
                importe: Number(Number(newTaxAmount).toFixed(2)),
              });
            } else {
              exist.importe = (
                Number(exist.importe) + Number(newTaxAmount)
              ).toFixed(2);
              exist.base = (Number(exist.base) + Number(amount)).toFixed(2);
            }
          } else {
            trasExist = true;
            //Es traslado
            taxTrasDetails = {
              isGroup: 0,
              exempt,
              base: amount,
              impuesto: keepBefore(taxcode, " -"),
              tipoFactor: "Tasa",
              tasaOcuota: newRate,
              importe: Number(Number(newTaxAmount).toFixed(2)),
            };
            //Push summary
            const exist = taxSummary.summaryTras.find(
              (element) =>
                element.impuesto === keepBefore(taxcode, " -") &&
                element.tasaOcuota === newRate
            );
            if (!exist) {
              taxSummary.summaryTras.push({
                exempt,
                base: Number(amount),
                impuesto: keepBefore(taxcode, " -"),
                tipoFactor: "Tasa",
                tasaOcuota: newRate,
                importe: Number(Number(newTaxAmount).toFixed(2)),
              });
            } else {
              exist.importe = (
                Number(exist.importe) + Number(newTaxAmount)
              ).toFixed(2);
              exist.base = (Number(exist.base) + Number(amount)).toFixed(2);
            }
          }
          taxItemDetails.push({
            item: i,
            ...(taxRetDetails && { taxRetDetails }),
            ...(taxTrasDetails && { taxTrasDetails }),
          });
        } else {
          //Try to load taxgroup
          taxRecord = taxDataBase.taxGroupData.find(
            (taxCodeElement) => taxCodeElement.taxGroupId === Number(taxcodeId)
          );
          if (taxRecord) {
            const taxListDetails = handleTaxGroupDetails(
              taxRecord,
              amount,
              taxAmount
            );
            if (taxListDetails.isGroup) {
              let taxRetAuxTemp = null;
              let taxTrasAuxTemp = null;
              if (taxListDetails.taxesPerItem.taxRetDetails.length > 0) {
                retExist = true;
                taxRetAuxTemp = {
                  isGroup: taxListDetails.isGroup,
                  details: taxListDetails.taxesPerItem.taxRetDetails,
                };
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
                      importe: Number(Number(tax.importe).toFixed(2)),
                    });
                  } else {
                    exist.importe = (
                      Number(exist.importe) + Number(tax.importe)
                    ).toFixed(2);
                    exist.base = (
                      Number(exist.base) + Number(tax.base)
                    ).toFixed(2);
                  }
                });
              }
              if (taxListDetails.taxesPerItem.taxTrasDetails.length > 0) {
                trasExist = true;
                taxTrasAuxTemp = {
                  isGroup: taxListDetails.isGroup,
                  details: taxListDetails.taxesPerItem.taxTrasDetails,
                };
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
                      importe: Number(Number(tax.importe).toFixed(2)),
                    });
                  } else {
                    exist.importe = (
                      Number(exist.importe) + Number(tax.importe)
                    ).toFixed(2);
                    exist.base = (
                      Number(exist.base) + Number(tax.base)
                    ).toFixed(2);
                  }
                });
              }
              taxItemDetails.push({
                item: i,
                ...(taxRetAuxTemp && { taxRetDetails: taxRetAuxTemp }),
                ...(taxTrasAuxTemp && { taxTrasDetails: taxTrasAuxTemp }),
              });
            } else {
              let taxRetAuxTemp = null;
              let taxTrasAuxTemp = null;
              if (taxListDetails.isRet) {
                retExist = true;
                taxRetAuxTemp = taxListDetails.taxesPerItem;
                //Push summary
                const exist = taxSummary.summaryRet.find(
                  (element) =>
                    element.impuesto === taxListDetails.taxesPerItem.impuesto &&
                    element.tasaOcuota ===
                      taxListDetails.taxesPerItem.tasaOcuota
                );
                if (!exist) {
                  taxSummary.summaryRet.push({
                    base: Number(taxListDetails.taxesPerItem.base),
                    impuesto: taxListDetails.taxesPerItem.impuesto,
                    tipoFactor: taxListDetails.taxesPerItem.tipoFactor,
                    tasaOcuota: taxListDetails.taxesPerItem.tasaOcuota,
                    importe: Number(
                      Number(taxListDetails.taxesPerItem.importe).toFixed(2)
                    ),
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
                trasExist = true;
                taxTrasAuxTemp = taxListDetails.taxesPerItem;
                //Push summary
                const exist = taxSummary.summaryTras.find(
                  (element) =>
                    element.impuesto === taxListDetails.taxesPerItem.impuesto &&
                    element.tasaOcuota ===
                      taxListDetails.taxesPerItem.tasaOcuota
                );
                if (!exist) {
                  taxSummary.summaryTras.push({
                    exempt: taxListDetails.taxesPerItem.exempt,
                    base: Number(taxListDetails.taxesPerItem.base),
                    impuesto: taxListDetails.taxesPerItem.impuesto,
                    tipoFactor: taxListDetails.taxesPerItem.tipoFactor,
                    tasaOcuota: taxListDetails.taxesPerItem.tasaOcuota,
                    importe: Number(
                      Number(taxListDetails.taxesPerItem.importe).toFixed(2)
                    ),
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
              taxItemDetails.push({
                item: i,
                ...(taxRetAuxTemp && { taxRetDetails: taxRetAuxTemp }),
                ...(taxTrasAuxTemp && { taxTrasDetails: taxTrasAuxTemp }),
              });
            }
          }
        }
      } catch (error) {
        log.debug("ERROR EN CALCULO IMPUESTOS", error);
      }
    }
    const taxTotal = handleTaxTotal(taxSummary);
    const newTaxSummary = handleNewTaxSummary(taxSummary);
    return {
      ...(retExist && { retExist }),
      ...(trasExist && { trasExist }),
      taxItemDetails,
      taxTotal,
      taxSummary: newTaxSummary,
      satUnitCodes,
      ...(totalDiscount > 0 && {
        discounts: {
          totalDiscount,
          discounts,
        },
      }),
    };
  };
  const handleDataForFvNc = (currentRecord, taxDataBase, mapUnitsDataBase) => {
    const { fullItems: newItems, totalDiscount } =
      handleSplitDiscountItems(currentRecord);
    return handleCustomItem(
      newItems,
      totalDiscount,
      taxDataBase,
      mapUnitsDataBase
    );
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
  const handleSplitDiscountItemsForPayment = (currentRecord, factor) => {
    const fullItems = [];
    const items = [];
    const discounts = [];
    let totalDiscount = 0;
    const totalItemLines = currentRecord.getLineCount({ sublistId: "item" });
    const tranid = currentRecord.getValue({
      fieldId: "tranid",
    });
    for (let i = 0; i < totalItemLines; i++) {
      const itemType = currentRecord.getSublistValue({
        sublistId: "item",
        fieldId: "itemtype",
        line: i,
      });
      const taxcodeId = currentRecord.getSublistValue({
        sublistId: "item",
        fieldId: "taxcode",
        line: i,
      });
      //Calc taxAmount
      const taxAmount = currentRecord.getSublistValue({
        sublistId: "item",
        fieldId: "tax1amt",
        line: i,
      });
      const calcTaxAmount = Number(
        (Number(taxAmount) * (factor / 100)).toFixed(2)
      );
      //Calc amount
      const amount = currentRecord.getSublistValue({
        sublistId: "item",
        fieldId: "amount",
        line: i,
      });
      const calcAmount = Number((Number(amount) * (factor / 100)).toFixed(2));
      const unit = currentRecord.getSublistValue({
        sublistId: "item",
        fieldId: "units",
        line: i,
      });
      if (itemType === "Discount") {
        const discline = currentRecord.getSublistValue({
          sublistId: "item",
          fieldId: "discline",
          line: i,
        });
        discounts.push({
          line: discline,
          amount: calcAmount,
          taxAmount: calcTaxAmount,
        });
      } else {
        const line = currentRecord.getSublistValue({
          sublistId: "item",
          fieldId: "line",
          line: i,
        });
        items.push({
          line,
          unit,
          taxcodeId,
          amount: calcAmount,
          taxAmount: calcTaxAmount,
        });
      }
    }
    items.forEach((item) => {
      const discountFound = discounts.find(
        (element) => element.line === item.line
      );
      if (discountFound) {
        const newAmount = (
          Number(item.amount) + Number(discountFound.amount)
        ).toFixed(2);
        const newTaxAmount = (
          Number(item.taxAmount) + Number(discountFound.taxAmount)
        ).toFixed(2);
        fullItems.push({
          discount: Math.abs(Number(discountFound.amount)),
          unit: item.unit,
          taxcodeId: item.taxcodeId,
          amount: newAmount,
          taxAmount: newTaxAmount,
        });
      } else {
        fullItems.push({
          unit: item.unit,
          taxcodeId: item.taxcodeId,
          amount: item.amount,
          taxAmount: item.taxAmount,
        });
      }
    });
    discounts.forEach((discount) => {
      totalDiscount += Math.abs(Number(discount.amount));
    });
    return {
      fullItems,
      totalDiscount: Number(totalDiscount.toFixed(2)),
    };
  };
  const handleTaxesForPayment = (
    invoiceRecord,
    paymentAmount,
    taxDataBase,
    mapUnitsDataBase
  ) => {
    const currentRecord = invoiceRecord;
    const invoiceAmount = invoiceRecord.getValue({
      fieldId: "total",
    });
    const porcentajePago =
      (Number(paymentAmount) * 100) / Number(invoiceAmount);
    //CALCULATE
    const { fullItems: newItems, totalDiscount } =
      handleSplitDiscountItemsForPayment(currentRecord, porcentajePago);
    const itemFullSummary = handleCustomItem(
      newItems,
      totalDiscount,
      taxDataBase,
      mapUnitsDataBase
    );
    return itemFullSummary;
  };
  const handleDocRelData = (invoiceRelated, paymentId) => {
    const totalLinkLines = invoiceRelated.getLineCount({ sublistId: "links" });
    let numParcialidad = 1;
    let internalCounter = 0;
    let tempIndex = 0;
    let saldoAnterior = 0;
    let paymentLinkListTotal = 0;
    const invoiceTranId = invoiceRelated.getValue({
      fieldId: "tranid",
    });
    const invoiceUuid = invoiceRelated.getValue({
      fieldId: "custbody_ent_entloc_uuid",
    });
    const invoiceCurrency = invoiceRelated.getValue({
      fieldId: "currencysymbol",
    });
    const invoiceTotal = invoiceRelated.getValue({
      fieldId: "total",
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
      const currentPaymentTotal = invoiceRelated.getSublistValue({
        sublistId: "links",
        fieldId: "total",
        line: i,
      });
      if (
        Number(currentPaymentId) === Number(paymentId) &&
        currentPaymentType === "Pago"
      ) {
        tempIndex = i;
        numParcialidad = internalCounter + 1;
        internalCounter++;
        break;
      } else if (currentPaymentType === "Pago") {
        paymentLinkListTotal += Number(currentPaymentTotal);
      }
    }
    saldoAnterior = Number(invoiceTotal) - paymentLinkListTotal;
    return {
      invoiceTranId,
      saldoAnterior: Number(saldoAnterior.toFixed(2)),
      numParcialidad,
      invoiceUuid,
      invoiceCurrency,
    };
  };
  const handleTotalTaxesForPayment = (resultTaxes) => {
    let resultTrasTaxesList = [];
    let paymentTrasTaxesTotals = [];
    let resultRetTaxesList = [];
    let paymentRetTaxesTotals = [];
    resultTaxes.forEach((invoice) => {
      invoice.summaryTras.forEach((trasTaxElement) => {
        resultTrasTaxesList.push({
          ...(trasTaxElement.exempt && { exempt: trasTaxElement.exempt }),
          base: trasTaxElement.base,
          impuesto: trasTaxElement.impuesto,
          tipoFactor: trasTaxElement.tipoFactor,
          tasaOcuota: trasTaxElement.tasaOcuota,
          importe: trasTaxElement.importe,
        });
      });
      invoice.summaryRet.forEach((retTaxElement) => {
        resultRetTaxesList.push({
          base: retTaxElement.base,
          impuesto: retTaxElement.impuesto,
          tipoFactor: retTaxElement.tipoFactor,
          tasaOcuota: retTaxElement.tasaOcuota,
          importe: retTaxElement.importe,
        });
      });
    });
    for (let i = 0; i < resultTrasTaxesList.length; i++) {
      if (paymentTrasTaxesTotals.length === 0) {
        paymentTrasTaxesTotals.push({
          base: Number(resultTrasTaxesList[i].base),
          impuesto: resultTrasTaxesList[i].impuesto,
          tasaOcuota: resultTrasTaxesList[i].tasaOcuota,
          importe: Number(resultTrasTaxesList[i].importe),
        });
      } else {
        const found = paymentTrasTaxesTotals.find(
          (e) =>
            e.impuesto === resultTrasTaxesList[i].impuesto &&
            e.tasaOcuota === resultTrasTaxesList[i].tasaOcuota
        );
        if (found) {
          const tempImporte =
            Number(found.importe) + Number(resultTrasTaxesList[i].importe);
          const tempBase =
            Number(found.base) + Number(resultTrasTaxesList[i].base);
          found.importe = Number(tempImporte.toFixed(2));
          found.base = Number(tempBase.toFixed(2));
        } else {
          paymentTrasTaxesTotals.push({
            ...(resultTrasTaxesList[i].exempt && {
              exempt: resultTrasTaxesList[i].exempt,
            }),
            base: Number(resultTrasTaxesList[i].base),
            impuesto: resultTrasTaxesList[i].impuesto,
            tasaOcuota: resultTrasTaxesList[i].tasaOcuota,
            importe: Number(resultTrasTaxesList[i].importe),
          });
        }
      }
    }
    for (let i = 0; i < resultRetTaxesList.length; i++) {
      if (paymentRetTaxesTotals.length === 0) {
        paymentRetTaxesTotals.push({
          base: Number(resultRetTaxesList[i].base),
          impuesto: resultRetTaxesList[i].impuesto,
          tasaOcuota: resultRetTaxesList[i].tasaOcuota,
          importe: Number(resultRetTaxesList[i].importe),
        });
      } else {
        const found = paymentRetTaxesTotals.find(
          (e) =>
            e.impuesto === resultRetTaxesList[i].impuesto &&
            e.tasaOcuota === resultRetTaxesList[i].tasaOcuota
        );
        if (found) {
          const tempImporte =
            Number(found.importe) + Number(resultRetTaxesList[i].importe);
          const tempBase =
            Number(found.base) + Number(resultRetTaxesList[i].base);
          found.importe = Number(tempImporte.toFixed(2));
          found.base = Number(tempBase.toFixed(2));
        } else {
          paymentRetTaxesTotals.push({
            base: Number(resultRetTaxesList[i].base),
            impuesto: resultRetTaxesList[i].impuesto,
            tasaOcuota: resultRetTaxesList[i].tasaOcuota,
            importe: Number(resultRetTaxesList[i].importe),
          });
        }
      }
    }
    return {
      paymentTrasTaxesTotals,
      paymentRetTaxesTotals,
    };
  };
  const handleDataForPayment = (
    currentRecord,
    taxDataBase,
    mapUnitsDataBase
  ) => {
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
        const resultTaxes = handleTaxesForPayment(
          invoiceRelated,
          amount,
          taxDataBase,
          mapUnitsDataBase
        );
        totalPaymentTaxesList.push(resultTaxes.taxSummary);
        totalPaymentAmount += Number(amount);
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
      totalPaymentAmount: Number(totalPaymentAmount.toFixed(2)),
    };
  };
  const getExtraCustomData = (currentRecord) => {
    //Get taxGroup data
    const taxDataBase = handleTaxGroupData();
    //Get mapUnit data
    const mapUnitsDataBase = handleSatMappingUnits();
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
      const dataForPayment = handleDataForPayment(
        currentRecord,
        taxDataBase,
        mapUnitsDataBase
      );
      customItem = dataForPayment.taxesForPayment;
      totalTaxesForPayment = dataForPayment.totalPaymentTaxes;
      totalPaymentAmount = dataForPayment.totalPaymentAmount;
    } else {
      customItem = handleDataForFvNc(
        currentRecord,
        taxDataBase,
        mapUnitsDataBase
      );
    }
    //Related CFDIS
    const relatedCfdis = handleRelatedCfdis(currentRecord);
    return {
      customRecordData: {
        serie,
        folio,
        ...(relatedCfdis && { relatedCfdis }),
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
    userConfig,
    folderId,
    pdfName
  ) => {
    const renderer = render.create();
    renderer.addCustomDataSource({
      format: render.DataSource.OBJECT,
      alias: "customData",
      data: customData,
    });
    renderer.addCustomDataSource({
      format: render.DataSource.OBJECT,
      alias: "customColors",
      data: {
        ...(userConfig.printColor && { mainColor: userConfig.printColor }),
        ...(userConfig.font && { font: userConfig.font }),
        ...(userConfig.fontSize && { fontSize: userConfig.fontSize }),
      },
    });
    renderer.addRecord("record", currentRecord);
    renderer.addRecord("subsidiary", subsidiaryRecord);
    renderer.addRecord("customer", customerRecord);

    renderer.setTemplateById(userConfig.plantillaPdfPublica);
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
