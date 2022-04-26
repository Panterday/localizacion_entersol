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
      let folderId = null;
      //Busca carpeta
      const folderSearchObj = search.create({
        type: "folder",
        filters: [
          ["name", "is", "Documentos_usuario"],
          "AND",
          ["istoplevel", "is", "F"],
        ],
        columns: ["internalid"],
      });
      const searchResultCount = folderSearchObj.runPaged().count;
      if (searchResultCount > 0) {
        folderSearchObj.run().each((result) => {
          folderId = result.getValue({
            name: "internalid",
          });
          idGuardaDocumentosCarpeta = folderId;
        });
      }
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
        //Correct tax
        const { nuevoImporteIvaLinea, nuevoImporteIepsLinea } =
          handleTaxCorrection(importeIvaLinea, importeIepsLinea, taxAmount);
        //==============================================================================//
        //Save IEPS
        itemTaxGroupDetails.push({
          base: amount,
          impuesto: iepsSatTaxCode,
          tipoFactor: "Tasa",
          tasaOcuota: iepsRate,
          importe: nuevoImporteIepsLinea,
        });
        //Save IVA
        itemTaxGroupDetails.push({
          base: nuevaBaseCalculada,
          impuesto: ivaSatTaxCode,
          tipoFactor: "Tasa",
          tasaOcuota: ivaRate,
          importe: nuevoImporteIvaLinea,
        });
      }
      return itemTaxGroupDetails;
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
      return {
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
          tasaOcuota: Number(taxDetails.rate.replace("%", "")),
          importe: taxAmount,
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
      return {
        isGroup: 1,
        taxesPerItem,
      };
    }
  };
  const handleTaxTotal = (taxSummary) => {
    log.debug("TAX SUMMARY", taxSummary);
    let totalTraslados = 0;
    taxSummary.forEach((element) => {
      totalTraslados += Number(element.importe);
    });
    return totalTraslados;
  };
  const handleSatCode = (unit) => {
    log.debug("UNIT", unit);
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
    log.debug("unitLIST", unitList);
    return unitList;
  };
  const handleCustomItem = (currentRecord) => {
    const taxItemDetails = [];
    const taxSummary = [];
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
          taxItemDetails.push({
            isGroup: 0,
            exempt,
            base: amount,
            impuesto: keepBefore(taxcode, " -"),
            tipoFactor: "Tasa",
            tasaOcuota: rate,
            importe: taxAmount,
          });
          //Push summary
          const exist = taxSummary.find(
            (element) =>
              element.impuesto === keepBefore(taxcode, " -") &&
              element.tasaOcuota === rate
          );
          if (!exist) {
            taxSummary.push({
              base: Number(amount),
              impuesto: keepBefore(taxcode, " -"),
              tipoFactor: "Tasa",
              tasaOcuota: rate,
              importe: Number(taxAmount),
            });
          } else {
            log.debug("EXIST", exist);
            exist.importe = (Number(exist.importe) + Number(taxAmount)).toFixed(
              2
            );
            exist.base = (Number(exist.base) + Number(amount)).toFixed(2);
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
          const taxListDetails = handleTaxGroupDetails(
            taxRecord,
            amount,
            taxAmount
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
                log.debug("EXIST", exist);
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
              log.debug("EXIST", exist);
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
    return { taxItemDetails, taxTotal, taxSummary, satUnitCodes };
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
    const customItem = handleCustomItem(currentRecord);
    //Related CFDIS
    const relatedCfdis = handleRelatedCfdis(currentRecord);
    log.debug("RELATEDCFDIS", relatedCfdis);
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
    log.debug("JSONSTRING", jsonString);
    //Convertir JSON
    const usoCFDI = jsonString["cfdi:Comprobante"]["cfdi:Receptor"].$.UsoCFDI;
    log.debug("obj JSON", usoCFDI);
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

    return {
      fechaTimbrado,
      noSerieCSD,
      noSerieSAT,
      firmaCFDI,
      firmaSAT,
      usoCFDI,
      metodoPago,
      formaPago,
    };
  };
  const handleFolderId = (folderName, parentFolder) => {
    //==================================Buscando carpeta en gabinete==============================//
    let folderId = null;
    //Busca carpeta
    const folderSearchObj = search.create({
      type: "folder",
      filters: [["name", "is", folderName], "AND", ["istoplevel", "is", "F"]],
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
  const getFolderId = (currentSubsidiaryText, fechaTimbrado, parent) => {
    const fechaTimbradoObj = new Date(fechaTimbrado);
    const año = fechaTimbradoObj.getFullYear();
    const mes = fechaTimbradoObj.getMonth();
    const subsidiaryFolderId = handleFolderId(currentSubsidiaryText, parent);
    const yearFolderId = handleFolderId(año + "", subsidiaryFolderId);
    const monthFolderId = handleFolderId(mes + "", yearFolderId);

    log.debug("BUSCANDO SUB FOLDER", monthFolderId);
    log.debug("SUBSID", `${currentSubsidiaryText}/${fechaTimbrado}`);
  };
  return {
    getGlobalConfig,
    getUserConfig,
    getPdfRendered,
    getExtraCustomData,
    getCertExtraData,
    getFolderId,
  };
});
//Probando GIT
