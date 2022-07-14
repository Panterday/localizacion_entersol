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
  const getCustomerDataObj = (customerId) => {
    const customerDataObj = {};
    const customerSearchObj = search.create({
      type: "customer",
      filters: [["internalidnumber", "equalto", customerId]],
      columns: [
        search.createColumn({
          name: "entityid",
          sort: search.Sort.ASC,
        }),
        "altname",
        "email",
        "phone",
        "altphone",
        "fax",
        "contact",
        "altemail",
        "custentity_be_rfc_sat",
        "custentity_chp_iaf_razon_social_cfdi",
        "billzipcode",
        "custentity_be_regimenfiscal",
        "custentity_be_clie_formpayment_sat",
        "custentity_be__cli_cfdiuse_sat",
        "custentity_be_cli_methodpayment_sat",
        "billaddress",
      ],
    });
    customerSearchObj.run().each((result) => {
      customerDataObj.altname = result.getValue({
        name: "altname",
      });
      customerDataObj.email = result.getValue({
        name: "email",
      });
      customerDataObj.phone = result.getValue({
        name: "phone",
      });
      customerDataObj.altphone = result.getValue({
        name: "altphone",
      });
      customerDataObj.contact = result.getValue({
        name: "contact",
      });
      customerDataObj.fax = result.getValue({
        name: "fax",
      });
      customerDataObj.altemail = result.getValue({
        name: "altemail",
      });
      //RFC
      customerDataObj.custentity_be_rfc_sat = result.getValue({
        name: "custentity_be_rfc_sat",
      });
      //Nombre
      customerDataObj.custentity_chp_iaf_razon_social_cfdi = result.getValue({
        name: "custentity_chp_iaf_razon_social_cfdi",
      });
      //Zip receptor
      customerDataObj.billzip = result.getValue({
        name: "billzipcode",
      });
      //Régimen fiscal
      customerDataObj.custentity_be_regimenfiscal = result.getText({
        name: "custentity_be_regimenfiscal",
      });
      //Forma de pago
      customerDataObj.custentity_be_clie_formpayment_sat = result.getText({
        name: "custentity_be_clie_formpayment_sat",
      });
      //Uso de CFDI
      customerDataObj.custentity_be__cli_cfdiuse_sat = result.getText({
        name: "custentity_be__cli_cfdiuse_sat",
      });
      //Método de pago
      customerDataObj.custentity_be_cli_methodpayment_sat = result.getText({
        name: "custentity_be_cli_methodpayment_sat",
      });
      customerDataObj.billaddress = result.getValue({
        name: "billaddress",
      });
      return true;
    });
    return customerDataObj;
  };
  const handleMontoEnLetra = (num, moneda) => {
    function Unidades(num) {
      switch (num) {
        case 1:
          return "UNO";
        case 2:
          return "DOS";
        case 3:
          return "TRES";
        case 4:
          return "CUATRO";
        case 5:
          return "CINCO";
        case 6:
          return "SEIS";
        case 7:
          return "SIETE";
        case 8:
          return "OCHO";
        case 9:
          return "NUEVE";
      }

      return "";
    } //Unidades()

    function Decenas(num) {
      var decena = Math.floor(num / 10);
      var unidad = num - decena * 10;

      switch (decena) {
        case 1:
          switch (unidad) {
            case 0:
              return "DIEZ";
            case 1:
              return "ONCE";
            case 2:
              return "DOCE";
            case 3:
              return "TRECE";
            case 4:
              return "CATORCE";
            case 5:
              return "QUINCE";
            default:
              return "DIECI" + Unidades(unidad);
          }
        case 2:
          switch (unidad) {
            case 0:
              return "VEINTE";
            default:
              return "VEINTI" + Unidades(unidad);
          }
        case 3:
          return DecenasY("TREINTA", unidad);
        case 4:
          return DecenasY("CUARENTA", unidad);
        case 5:
          return DecenasY("CINCUENTA", unidad);
        case 6:
          return DecenasY("SESENTA", unidad);
        case 7:
          return DecenasY("SETENTA", unidad);
        case 8:
          return DecenasY("OCHENTA", unidad);
        case 9:
          return DecenasY("NOVENTA", unidad);
        case 0:
          return Unidades(unidad);
      }
    } //Unidades()

    function DecenasY(strSin, numUnidades) {
      if (numUnidades > 0) return strSin + " Y " + Unidades(numUnidades);

      return strSin;
    } //DecenasY()

    function Centenas(num) {
      centenas = Math.floor(num / 100);
      decenas = num - centenas * 100;

      switch (centenas) {
        case 1:
          if (decenas > 0) return "CIENTO " + Decenas(decenas);
          return "CIEN";
        case 2:
          return "DOSCIENTOS " + Decenas(decenas);
        case 3:
          return "TRESCIENTOS " + Decenas(decenas);
        case 4:
          return "CUATROCIENTOS " + Decenas(decenas);
        case 5:
          return "QUINIENTOS " + Decenas(decenas);
        case 6:
          return "SEISCIENTOS " + Decenas(decenas);
        case 7:
          return "SETECIENTOS " + Decenas(decenas);
        case 8:
          return "OCHOCIENTOS " + Decenas(decenas);
        case 9:
          return "NOVECIENTOS " + Decenas(decenas);
      }

      return Decenas(decenas);
    } //Centenas()

    function Seccion(num, divisor, strSingular, strPlural) {
      cientos = Math.floor(num / divisor);
      resto = num - cientos * divisor;

      letras = "";

      if (cientos > 0)
        if (cientos > 1) letras = Centenas(cientos) + " " + strPlural;
        else letras = strSingular;

      if (resto > 0) letras += "";

      return letras;
    } //Seccion()

    function Miles(num) {
      divisor = 1000;
      cientos = Math.floor(num / divisor);
      resto = num - cientos * divisor;

      strMiles = Seccion(num, divisor, "UN MIL ", "MIL ");
      strCentenas = Centenas(resto);

      if (strMiles == "") return strCentenas;

      return strMiles + " " + strCentenas;
    } //Miles()

    function Millones(num) {
      divisor = 1000000;
      cientos = Math.floor(num / divisor);
      resto = num - cientos * divisor;

      strMillones = Seccion(num, divisor, "UN MILLON ", " MILLONES");
      strMiles = Miles(resto);

      if (strMillones == "") return strMiles;

      return strMillones + " " + strMiles;
    } //Millones()

    function NumeroALetras(num, moneda) {
      var data = {
        numero: num,
        enteros: Math.floor(num),
        centavos: Math.round(num * 100) - Math.floor(num) * 100,
        letrasCentavos: "",
      };
      data.letrasCentavos =
        data.centavos === 0 ? "00/100" : data.centavos + "/100";

      if (data.enteros == 0) return "CERO" + " " + moneda;

      return Millones(data.enteros) + " " + moneda + " " + data.letrasCentavos;
    }
    //MAIN
    let txtMoneda = null;
    if (moneda === "MXN") {
      txtMoneda = "Pesos Mexicanos";
    } else if (moneda === "USD") {
      txtMoneda = "Dólares";
    }
    const main = NumeroALetras(num, txtMoneda);
    return main;
  };
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
        "custrecord_ent_entloc_obj_impuesto",
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
        "custrecord_ent_entloc_obj_impuesto",
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
      const objetoImpuesto = result.getText({
        name: "custrecord_ent_entloc_obj_impuesto",
      });
      if (taxGroupData.length === 0) {
        taxGroupElementAux.taxGroupId = taxGroupId;
        taxGroupElementAux.codes.push({
          taxCodeId,
          rate,
          exempt,
          customCode,
          objetoImpuesto,
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
            objetoImpuesto,
          });
        } else {
          taxGroupElementAux.taxGroupId = taxGroupId;
          taxGroupElementAux.codes.push({
            taxCodeId,
            rate,
            exempt,
            customCode,
            objetoImpuesto,
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
      const objetoImpuesto = result.getText({
        name: "custrecord_ent_entloc_obj_impuesto",
      });
      taxCodeData.push({
        taxCodeId,
        rate,
        exempt,
        customCode,
        objetoImpuesto,
      });
      return true;
    });
    return {
      taxGroupData,
      taxCodeData,
    };
  };
  const handleTaxGroupDataSuiteTax = () => {
    const taxCodeData = [];
    //Tax code
    const taxCodeDetailsSearch = search.create({
      type: "salestaxitem",
      filters: [],
      columns: [
        "internalid",
        "custrecord_ent_entloc_codigo_impuesto",
        "custrecord_ent_entloc_obj_impuesto",
        "custrecord_ste_taxcode_ratetype",
      ],
    });
    taxCodeDetailsSearch.run().each((result) => {
      const taxCodeId = Number(
        result.getValue({
          name: "internalid",
        })
      );
      const taxRateType = result.getValue({
        name: "custrecord_ste_taxcode_ratetype",
      });
      const customCode = result.getText({
        name: "custrecord_ent_entloc_codigo_impuesto",
      });
      const objetoImpuesto = result.getText({
        name: "custrecord_ent_entloc_obj_impuesto",
      });
      taxCodeData.push({
        taxCodeId,
        taxRateType,
        customCode,
        objetoImpuesto,
      });
      return true;
    });
    return {
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
  const handleFolioSerie = (tranid, longitudSerie, longitudFolio) => {
    let serie = null;
    let folio = null;
    const manageFolio = (tranid, longitudFolio) => {
      try {
        let newFolio = "";
        let reversFolio = "";
        for (
          let i = tranid.length - 1;
          i > tranid.length - 1 - longitudFolio;
          i--
        ) {
          newFolio += tranid[i];
        }
        for (let i = newFolio.length - 1; i >= 0; i--) {
          reversFolio += newFolio[i];
        }
        return reversFolio;
      } catch (error) {
        log.debug("ERROR HANDLE FOLIO SERIE", error);
        return null;
      }
    };
    if (longitudSerie) {
      serie = tranid.slice(0, longitudSerie);
    } else {
      serie = tranid.replace(/[^a-z]/gi, "");
    }
    if (longitudFolio) {
      folio = manageFolio(tranid, longitudFolio);
    } else {
      folio = tranid.replace(/[^0-9]/g, "");
    }
    return {
      serie,
      folio,
    };
  };
  /* ------------------------------------------------------------------------------------- */

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
            longitudSerie: globalConfigRecord.getValue({
              fieldId: "custrecord_ent_entloc_long_serie_fv",
            }),
            longitudFolio: globalConfigRecord.getValue({
              fieldId: "custrecord_ent_entloc_long_folio_fv",
            }),
            bloqueoEliminacion: globalConfigRecord.getValue({
              fieldId: "custrecord_ent_entloc_bloqueo_eli_fv",
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
            longitudSerie: globalConfigRecord.getValue({
              fieldId: "custrecord_ent_entloc_long_serie_nc",
            }),
            longitudFolio: globalConfigRecord.getValue({
              fieldId: "custrecord_ent_entloc_long_folio_nc",
            }),
            bloqueoEliminacion: globalConfigRecord.getValue({
              fieldId: "custrecord_ent_entloc_bloqueo_eli_nc",
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
            longitudSerie: globalConfigRecord.getValue({
              fieldId: "custrecord_ent_entloc_long_serie_pc",
            }),
            longitudFolio: globalConfigRecord.getValue({
              fieldId: "custrecord_ent_entloc_long_folio_pc",
            }),
            bloqueoEliminacion: globalConfigRecord.getValue({
              fieldId: "custrecord_ent_entloc_bloqueo_eli_pc",
            }),
          };
      }
    } else {
      return false;
    }
  };
  const getUserConfigTras = (globalConfigRecordId, recordType, access) => {
    if (access) {
      const globalConfigRecord = record.load({
        type: "customrecord_ent_entloc_config_registro",
        id: globalConfigRecordId,
      });
      let aplica = null;
      const plantillaEdocument = globalConfigRecord.getValue({
        fieldId: "custrecord_ent_entloc_plan_gen_xml_ft",
      });
      const habilitaCertDosPasos = globalConfigRecord.getValue({
        fieldId: "custrecord_ent_entloc_hab_cert_2_ft",
      });
      const plantillaPdfPublica = globalConfigRecord.getValue({
        fieldId: "custrecord_ent_entloc_plantilla_imp_ft",
      });
      const longitudSerie = globalConfigRecord.getValue({
        fieldId: "custrecord_ent_entloc_long_serie_ft",
      });
      const longitudFolio = globalConfigRecord.getValue({
        fieldId: "custrecord_ent_entloc_long_folio_ft",
      });
      switch (recordType) {
        case "itemfulfillment":
          aplica = globalConfigRecord.getValue({
            fieldId: "custrecord_ent_entloc_ejec_ped_ov_ft",
          });
          break;
        case "salesorder":
          aplica = globalConfigRecord.getValue({
            fieldId: "custrecord_ent_entloc_orden_venta_ft",
          });
          break;
        case "transferorder":
          aplica = globalConfigRecord.getValue({
            fieldId: "custrecord_ent_entloc_orden_traslado_ft",
          });
          break;
      }
      return {
        aplica,
        habilitaCertDosPasos,
        plantillaPdfPublica,
        plantillaEdocument,
        longitudSerie,
        longitudFolio,
      };
    } else {
      return false;
    }
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
        ? (importeIepsLinea = importeIepsLinea - diferenciaImpuesto)
        : null;
    } else {
      //Sumar diferencia a un impuesto
      importeIvaLinea > 0 && importeIvaLinea > importeIepsLinea
        ? (importeIvaLinea = importeIvaLinea + diferenciaImpuesto)
        : importeIepsLinea > 0
        ? (importeIepsLinea = importeIepsLinea + diferenciaImpuesto)
        : null;
    }
    return {
      nuevoImporteIvaLinea: Number(importeIvaLinea.toFixed(2)),
      nuevoImporteIepsLinea: Number(importeIepsLinea.toFixed(2)),
    };
  };
  const handleTaxesCalc = (
    taxList,
    amount,
    taxAmount,
    isPayment,
    globalDiscount
  ) => {
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
          let nuevoImporteIvaLinea = null;
          let nuevoImporteIepsLinea = null;
          if (isPayment) {
            nuevoImporteIvaLinea = importeIvaLinea;
            nuevoImporteIepsLinea = importeIepsLinea;
          } else {
            const taxCorrectionResponse = handleTaxCorrection(
              importeIvaLinea,
              importeIepsLinea,
              taxAmount
            );
            nuevoImporteIvaLinea = taxCorrectionResponse.nuevoImporteIvaLinea;
            nuevoImporteIepsLinea = taxCorrectionResponse.nuevoImporteIepsLinea;
          }
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
  const handleTaxGroupDetails = (
    taxRecord,
    amount,
    taxAmount,
    isPayment,
    globalDiscount
  ) => {
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
          base: globalDiscount
            ? Number(
                (Math.abs(taxAmount) / (Math.abs(currentRate) / 100)).toFixed(2)
              )
            : amount,
          impuesto: keepBefore(taxRecord.codes[0].customCode, " -"),
          tipoFactor: "Tasa",
          tasaOcuota: currentRate < 0 ? currentRate * -1 : currentRate,
          importe: currentRate < 0 ? taxAmount * -1 : taxAmount,
        },
      };
    } else {
      //Handle tax calc
      const taxesPerItem = handleTaxesCalc(
        taxRecord,
        amount,
        taxAmount,
        isPayment,
        globalDiscount
      );
      return {
        isGroup: 1,
        taxesPerItem,
      };
    }
  };
  const handleTaxTotal = (taxSummary) => {
    let totalTraslados = null;
    let totalRetenciones = null;
    if (taxSummary.summaryTras.length > 0) {
      totalTraslados = 0;
      taxSummary.summaryTras.forEach((element) => {
        totalTraslados += Number(element.importe);
      });
    }
    if (taxSummary.summaryRet.length > 0) {
      totalRetenciones = 0;
      taxSummary.summaryRet.forEach((element) => {
        totalRetenciones += Number(element.importe);
      });
    }
    return {
      ...((totalTraslados || totalTraslados === 0) && {
        totalTraslados: Number(totalTraslados.toFixed(2)),
      }),
      ...((totalRetenciones || totalRetenciones === 0) && {
        totalRetenciones: Number(totalRetenciones.toFixed(2)),
      }),
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
      let objImpuesto = false;
      if (Array.isArray(element.objImpuesto)) {
        for (let i = 0; i < element.objImpuesto.length; i++) {
          if (
            element.objImpuesto[i].objetoImpuesto ===
            "02 - Sí objeto de impuesto."
          ) {
            objImpuesto = true;
            break;
          }
        }
      } else {
        if (element.objImpuesto === "02 - Sí objeto de impuesto.") {
          objImpuesto = true;
        }
      }
      newTaxSummaryTras.push({
        ...(element.exempt && { exempt: element.exempt }),
        base: element.base,
        impuesto: element.impuesto,
        tipoFactor: element.tipoFactor,
        tasaOcuota: element.tasaOcuota,
        importe: element.importe,
        objImpuesto,
      });
    });
    return {
      ...(newTaxSummaryRet.length > 0 && { summaryRet: newTaxSummaryRet }),
      ...(newTaxSummaryTras.length > 0 && { summaryTras: newTaxSummaryTras }),
    };
  };
  const handleDescCorrection = (description) => {
    const newDescription = description
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
    return newDescription;
  };
  const handleGlobalDiscountCorrection = (
    newSubTotal,
    totalDiscount,
    taxTotal,
    discounts,
    total
  ) => {
    const totalTraslados = taxTotal.totalTraslados
      ? taxTotal.totalTraslados
      : 0;
    const totalRetenciones = taxTotal.totalRetenciones
      ? taxTotal.totalRetenciones
      : 0;
    const tempTotal =
      Number(newSubTotal) -
      Number(totalDiscount) +
      totalTraslados -
      totalRetenciones;
    const totalDif = tempTotal - total;
    if (totalDif > 0) {
      discounts[0].discount = Number(
        (discounts[0].discount + totalDif).toFixed(2)
      );
    } else {
      discounts[0].discount = Number(
        (discounts[0].discount - Math.abs(totalDif)).toFixed(2)
      );
    }
  };
  const handleNewTotalDiscount = (discounts) => {
    let totalDiscount = 0;
    discounts.forEach((element) => {
      totalDiscount += element.discount;
    });
    return Number(totalDiscount.toFixed(2));
  };
  const handleDiscountCorrection = (fullItems, totalDiscount) => {
    let tempTotalDiscount = 0;
    fullItems.forEach((item) => {
      tempTotalDiscount += item.discount;
    });
    tempTotalDiscount = Number(tempTotalDiscount.toFixed(2));
    if (tempTotalDiscount !== totalDiscount) {
      const discDifference = Number(
        (tempTotalDiscount - totalDiscount).toFixed(2)
      );
      if (discDifference > 0) {
        fullItems[0].discount -= discDifference;
      } else {
        fullItems[0].discount += Math.abs(discDifference);
      }
    }
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
  const handleLinkRecordType = (id) => {
    let isPayment = false;
    try {
      const fieldLookUp = search.lookupFields({
        type: "customerpayment",
        id: id,
        columns: ["type"],
      });
      if (Object.keys(fieldLookUp).length > 0) {
        isPayment = true;
      }
    } catch (error) {
      isPayment = false;
    }
    return isPayment;
  };
  const handleDocRelData = (
    invoiceRelated,
    paymentId,
    importePagado,
    docToEquivalence,
    invoiceObjImpuesto
  ) => {
    const totalLinkLines = invoiceRelated.getLineCount({ sublistId: "links" });
    let numParcialidad = 0;
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
    const invoiceExchangeRate = invoiceRelated.getValue({
      fieldId: "exchangerate",
    });
    for (let i = 0; i < totalLinkLines - 1; i++) {
      const currentPaymentId = invoiceRelated.getSublistValue({
        sublistId: "links",
        fieldId: "id",
        line: i,
      });
      const currentPaymentTotal = invoiceRelated.getSublistValue({
        sublistId: "links",
        fieldId: "total",
        line: i,
      });
      const linkRecordType = handleLinkRecordType(currentPaymentId);
      if (Number(currentPaymentId) === Number(paymentId) && linkRecordType) {
        numParcialidad++;
        break;
      } else if (linkRecordType) {
        paymentLinkListTotal +=
          Number(currentPaymentTotal) / Number(invoiceExchangeRate);
        numParcialidad++;
      }
    }
    saldoAnterior = Number(invoiceTotal) - paymentLinkListTotal;
    return {
      invoiceTranId,
      importePagado,
      saldoAnterior: Number(saldoAnterior.toFixed(2)),
      numParcialidad,
      invoiceUuid,
      invoiceCurrency,
      docToEquivalence,
      ...(invoiceObjImpuesto && { invoiceObjImpuesto }),
    };
  };
  const handleTotalTaxesForPayment = (resultTaxes) => {
    log.debug("RESULT TAXES", resultTaxes);
    let resultTrasTaxesList = [];
    let paymentTrasTaxesTotals = [];
    let resultRetTaxesList = [];
    let paymentRetTaxesTotals = [];
    resultTaxes.forEach((invoice) => {
      if (invoice.resultTaxes.summaryTras) {
        invoice.resultTaxes.summaryTras.forEach((trasTaxElement) => {
          log.debug("TAXT TRAS ELÑEMENTO", trasTaxElement.exempt);
          resultTrasTaxesList.push({
            ...(trasTaxElement.exempt && { exempt: trasTaxElement.exempt }),
            base: (
              Number(trasTaxElement.base) * invoice.globalExchangeRate
            ).toFixed(2),
            impuesto: trasTaxElement.impuesto,
            tipoFactor: trasTaxElement.tipoFactor,
            tasaOcuota: trasTaxElement.tasaOcuota,
            importe: (
              Number(trasTaxElement.importe) * invoice.globalExchangeRate
            ).toFixed(2),
          });
        });
      }
      if (invoice.resultTaxes.summaryRet) {
        invoice.resultTaxes.summaryRet.forEach((retTaxElement) => {
          resultRetTaxesList.push({
            base: (
              Number(retTaxElement.base) * invoice.globalExchangeRate
            ).toFixed(2),
            impuesto: retTaxElement.impuesto,
            tipoFactor: retTaxElement.tipoFactor,
            tasaOcuota: retTaxElement.tasaOcuota,
            importe: (
              Number(retTaxElement.importe) * invoice.globalExchangeRate
            ).toFixed(2),
          });
        });
      }
    });
    log.debug("RESUL TAX TRAS TAXE", resultTrasTaxesList);
    for (let i = 0; i < resultTrasTaxesList.length; i++) {
      if (paymentTrasTaxesTotals.length === 0) {
        paymentTrasTaxesTotals.push({
          base: Number(resultTrasTaxesList[i].base),
          impuesto: resultTrasTaxesList[i].impuesto,
          tasaOcuota: resultTrasTaxesList[i].tasaOcuota,
          importe: Number(resultTrasTaxesList[i].importe),
          exempt: resultTrasTaxesList[i].exempt,
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
            exempt: resultTrasTaxesList[i].exempt,
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
  const handleCurrencySymbol = (currencyId) => {
    if (currencyId) {
      const currencySymbol = search.lookupFields({
        type: search.Type.CURRENCY,
        id: currencyId,
        columns: ["symbol"],
      });
      return currencySymbol.symbol;
    } else {
      return null;
    }
  };
  const handleGlobalExchangeRate = (
    paymentCurrency,
    invoiceCurrency,
    customExchangeRate
  ) => {
    if (invoiceCurrency === paymentCurrency) {
      return 1;
    } else if (paymentCurrency === "MXN") {
      return 1;
    } else {
      return customExchangeRate;
    }
  };
  const handleDocToEquivalence = (
    paymentCurrency,
    invoiceCurrency,
    exchangeRate,
    customExchangeRate
  ) => {
    if (invoiceCurrency === paymentCurrency) {
      return 1;
    } else if (paymentCurrency === "MXN") {
      return Number((1 / exchangeRate + 0.001).toFixed(4));
    } else {
      return customExchangeRate;
    }
  };
  const handleConvertedDecimals = (base, noDecimals) => {
    const esEntero = Number.isInteger(base);
    const stringBase = base + "";
    const intPart = keepBefore(stringBase, ".");
    const decimalPart = keepAfter(stringBase, ".");
    let newDecimalPart = "";
    if (decimalPart) {
      for (let i = 0; i < noDecimals; i++) {
        newDecimalPart += decimalPart[i] ? decimalPart[i] : 0;
      }
    }
    if (esEntero) {
      return base.toFixed(noDecimals);
    } else {
      return intPart + "." + newDecimalPart;
    }
  };
  const handleRecalcAmountsForPayment = (customItem) => {
    customItem.forEach((item) => {
      if (item.taxes.trasExist) {
        //Recalculo de traslados
        item.taxes.taxSummary.summaryTras.forEach((summaryElement) => {
          const currentBase =
            Number(summaryElement.base) /
            Number(item.docToRel.docToEquivalence);
          const currentAmount =
            Number(summaryElement.importe) /
            Number(item.docToRel.docToEquivalence);
          const convertedBase = handleConvertedDecimals(currentBase, 2);
          const convertedAmount = handleConvertedDecimals(currentAmount, 2);
          summaryElement.base = convertedBase;
          summaryElement.importe = convertedAmount;
        });
      }
      if (item.taxes.retExist) {
        //Recalculo de retenciones
        item.taxes.taxSummary.summaryRet.forEach((summaryElement) => {
          const currentBase =
            Number(summaryElement.base) /
            Number(item.docToRel.docToEquivalence);
          const currentAmount =
            Number(summaryElement.importe) /
            Number(item.docToRel.docToEquivalence);
          const convertedBase = handleConvertedDecimals(currentBase, 2);
          const convertedAmount = handleConvertedDecimals(currentAmount, 2);
          summaryElement.base = convertedBase;
          summaryElement.importe = convertedAmount;
        });
      }
    });
    return customItem;
  };
  const handleSubsidiaryAddressFields = (currentSubsidiary) => {
    let currentSubsidiaryAddress = null;
    const subsidiaryAddressObj = {};
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
        const calleSubsidiaria = currentSubsidiaryAddress.getValue({
          fieldId: "custrecord_streetname",
        });
        subsidiaryAddressObj.zip = cpSubsidiaria;
        subsidiaryAddressObj.street = calleSubsidiaria;
      }
    }
    return subsidiaryAddressObj;
  };
  const handleDataForTransfer = () => {
    const handler = {};
    handler.manageCustomItem = (currentRecord, mapUnitsDataBase) => {
      let pesoTotal = 0;
      let trasMatPeligroso = false;
      const satUnitCodes = [];
      const totalLines = currentRecord.getLineCount({ sublistId: "item" });
      for (let i = 0; i < totalLines; i++) {
        const netsuiteUnit = currentRecord.getSublistValue({
          sublistId: "item",
          fieldId: "units",
          line: i,
        });
        let pesoItem = currentRecord.getSublistValue({
          sublistId: "item",
          fieldId: "custcol_ent_entloc_peso_en_kg",
          line: i,
        });
        const isMatPel = currentRecord.getSublistValue({
          sublistId: "item",
          fieldId: "custcol_ent_entloc_material_peligroso",
          line: i,
        });
        if (isMatPel) {
          trasMatPeligroso = true;
        }
        const tempSatCode = mapUnitsDataBase.find(
          (element) => element.netsuiteCode === netsuiteUnit
        );
        satUnitCodes.push(tempSatCode.satCode);
        pesoItem = Number(pesoItem);
        pesoTotal += pesoItem;
      }
      return { satUnitCodes, pesoTotal, totalLines, trasMatPeligroso };
    };
    handler.getDataOrigen = () => {};
    return handler;
  };
  const getExtraCustomDataTraslado = (
    currentRecord,
    currentSubsidiary,
    longitudSerie,
    longitudFolio,
    prodMod
  ) => {
    //Get mapUnit data
    const mapUnitsDataBase = handleSatMappingUnits();
    const tranid = currentRecord.getValue({
      fieldId: "tranid",
    });
    const subsidiaryAddress = handleSubsidiaryAddressFields(currentSubsidiary);
    //Units, total weight
    const {
      satUnitCodes,
      pesoTotal,
      totalLines: totalArticulos,
      trasMatPeligroso,
    } = handleDataForTransfer().manageCustomItem(
      currentRecord,
      mapUnitsDataBase
    );
    //Custom transaction
    const { serie, folio } = handleFolioSerie(
      tranid,
      longitudSerie,
      longitudFolio
    );
    return {
      customRecordData: {
        serie,
        folio,
        prodMod,
      },
      customSubsidiaryData: {
        address: subsidiaryAddress,
      },
      customItem: {
        pesoTotal,
        totalArticulos,
        trasMatPeligroso,
        satUnitCodes,
      },
    };
  };
  const getPdfRendered = (
    currentRecord,
    subsidiaryRecord,
    customerRecord,
    customData,
    userConfig,
    folderId,
    pdfName,
    customPdfCustomerTemplate
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

    renderer.setTemplateById(
      customPdfCustomerTemplate
        ? customPdfCustomerTemplate
        : userConfig.plantillaPdfPublica
    );
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
        log.debug("handleFolderId", error);
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
      const mes = fechaTimbradoObj.getMonth() + 1;
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
  const getXmlCustomerTemplate = (customerRecord, recordType) => {
    let customCustomerTemplateId = null;
    switch (recordType) {
      case "invoice":
        customCustomerTemplateId = customerRecord.getValue({
          fieldId: "custentity_ent_entloc_plantilla_xml_fv",
        });
        break;
      case "creditmemo":
        customCustomerTemplateId = customerRecord.getValue({
          fieldId: "custentity_ent_entloc_plantilla_xml_nc",
        });
        break;
      case "customerpayment":
        customCustomerTemplateId = customerRecord.getValue({
          fieldId: "custentity_ent_entloc_plantilla_xml_pc",
        });
        break;
    }
    if (customCustomerTemplateId) {
      const customCustomerTemplate = search.lookupFields({
        type: "customrecord_ent_entloc_plantilla_e_doc",
        id: customCustomerTemplateId,
        columns: ["custrecord_ent_entloc_plantilla_e_doc"],
      });
      return customCustomerTemplate.custrecord_ent_entloc_plantilla_e_doc;
    } else {
      return null;
    }
  };
  const getPdfCustomerTemplate = (customerRecord, recordType) => {
    let customCustomerTemplateId = null;
    switch (recordType) {
      case "invoice":
        customCustomerTemplateId = customerRecord.getValue({
          fieldId: "custentity_ent_entloc_plantilla_pdf_fv",
        });
        break;
      case "creditmemo":
        customCustomerTemplateId = customerRecord.getValue({
          fieldId: "custentity_ent_entloc_plantilla_pdf_nc",
        });
        break;
      case "customerpayment":
        customCustomerTemplateId = customerRecord.getValue({
          fieldId: "custentity_ent_entloc_plantilla_pdf_pc",
        });
        break;
    }
    if (customCustomerTemplateId) {
      return customCustomerTemplateId;
    } else {
      return null;
    }
  };
  const handleCustomItemSuiteTax = (
    newItems,
    totalDiscount,
    taxDataBase,
    mapUnitsDataBase,
    isPayment,
    currentRecord,
    globalDiscount,
    newSubTotal,
    total
  ) => {
    let retExist = false;
    let trasExist = false;
    const newItemDescriptions = [];
    const taxItemDetails = [];
    const taxSummary = { summaryRet: [], summaryTras: [] };
    const satUnitCodes = [];
    const discounts = [];
    const objImpuesto = [];
    const quantityItems = [];
    const totalTaxDetailLines = currentRecord.getLineCount({
      sublistId: "taxdetails",
    });
    //Tax details
    for (let i = 0; i < newItems.length; i++) {
      const unit = newItems[i].unit;
      const discount = newItems[i].discount;
      const quantity = newItems[i].quantity;
      //Units
      const tempSatCode = mapUnitsDataBase.find(
        (element) => element.netsuiteCode === unit
      );
      //Description
      satUnitCodes.push(tempSatCode.satCode);
      newItemDescriptions.push(handleDescCorrection(newItems[i].description));
      //Quantity
      quantityItems.push(quantity);
      //Discounts
      if (discount) {
        discounts.push({
          item: i,
          discount,
        });
      } else {
        discounts.push({
          item: i,
        });
      }
    }
    for (let i = 0; i < totalTaxDetailLines; i++) {
      const taxCode = currentRecord.getSublistValue({
        sublistId: "taxdetails",
        fieldId: "taxcode",
        line: i,
      });
      const taxBasis = currentRecord.getSublistValue({
        sublistId: "taxdetails",
        fieldId: "taxbasis",
        line: i,
      });
      const taxRate = currentRecord.getSublistValue({
        sublistId: "taxdetails",
        fieldId: "taxrate",
        line: i,
      });
      const taxAmount = currentRecord.getSublistValue({
        sublistId: "taxdetails",
        fieldId: "taxamount",
        line: i,
      });
      //Try to load taxcode
      const taxRecord = taxDataBase.taxCodeData.find(
        (taxCodeElement) => taxCodeElement.taxCodeId === Number(taxCode)
      );
      //Obj impuesto
      objImpuesto.push(taxRecord.objetoImpuesto);
      /*    
        4	Exempt	
        2	Reduced
        1	Standard	
        3	Zero 
        */
      if (Number(taxRecord.taxRateType) !== 2) {
        //Es traslado
        trasExist = true;
        const taxTrasDetails = {
          isGroup: 0,
          exempt: Number(taxRecord.taxRateType) === 4 ? true : false,
          base: taxBasis,
          impuesto: keepBefore(taxRecord.customCode, " -"),
          tipoFactor: "Tasa",
          tasaOcuota: taxRate,
          importe: taxAmount,
        };
        taxItemDetails.push({
          item: i,
          taxTrasDetails,
        });
        //Summary
        //Push summary
        const exist = taxSummary.summaryTras.find(
          (element) =>
            element.impuesto === keepBefore(taxRecord.customCode, " -") &&
            element.tasaOcuota === taxRate
        );
        if (!exist) {
          taxSummary.summaryTras.push({
            base: taxTrasDetails.base,
            impuesto: taxTrasDetails.impuesto,
            tipoFactor: taxTrasDetails.tipoFactor,
            tasaOcuota: taxTrasDetails.tasaOcuota,
            importe: taxTrasDetails.importe,
          });
        } else {
          exist.importe = (
            Number(exist.importe) + Number(taxTrasDetails.importe)
          ).toFixed(2);
          exist.base = (
            Number(exist.base) + Number(taxTrasDetails.base)
          ).toFixed(2);
        }
      } else {
        //Es retención
        retExist = true;
        const taxRetDetails = {
          isGroup: 0,
          exempt: Number(taxRecord.taxRateType) === 4 ? true : false,
          base: taxBasis,
          impuesto: keepBefore(taxRecord.customCode, " -"),
          tipoFactor: "Tasa",
          tasaOcuota: taxRate,
          importe: taxAmount,
        };
        taxItemDetails.push({
          item: i,
          taxRetDetails,
        });
        //Summary
        //Push summary
        const exist = taxSummary.summaryRet.find(
          (element) =>
            element.impuesto === keepBefore(taxRecord.customCode, " -") &&
            element.tasaOcuota === taxRate
        );
        if (!exist) {
          taxSummary.summaryRet.push({
            base: taxRetDetails.base,
            impuesto: taxRetDetails.impuesto,
            tipoFactor: taxRetDetails.tipoFactor,
            tasaOcuota: taxRetDetails.tasaOcuota,
            importe: taxRetDetails.importe,
          });
        } else {
          exist.importe = (
            Number(exist.importe) + Number(taxRetDetails.importe)
          ).toFixed(2);
          exist.base = (
            Number(exist.base) + Number(taxRetDetails.base)
          ).toFixed(2);
        }
      }
    }
    const taxTotal = handleTaxTotal(taxSummary);
    const globalObjImpuesto = handleGlobalObjImpuesto(objImpuesto);
    const showTotalIfTraslado = handleGlobalExempt(taxSummary);
    log.debug("DISCOUNTS", discounts);
    return {
      ...(retExist && { retExist }),
      ...(trasExist && { trasExist }),
      taxItemDetails,
      taxTotal,
      taxSummary,
      satUnitCodes,
      ...((totalDiscount > 0 || globalDiscount) && {
        discounts: {
          totalDiscount,
          discounts,
        },
      }),
      objImpuesto,
      newItemDescriptions,
      newSubTotal,
      quantityItems,
      globalObjImpuesto,
      showTotalIfTraslado,
    };
  };
  const handleGlobalExempt = (newTaxSummary) => {
    let globalExempt = false;
    if (newTaxSummary.summaryTras.length === 1) {
      if (!newTaxSummary.summaryTras[0].exempt) {
        globalExempt = true;
      }
    } else {
      for (let i = 0; i < newTaxSummary.summaryTras.length; i++) {
        if (!newTaxSummary.summaryTras[i].exempt) {
          globalExempt = true;
          break;
        }
      }
    }
    return globalExempt;
  };
  const handleGlobalObjImpuesto = (objImpuesto) => {
    let globalObjImpuesto = false;
    if (objImpuesto.length === 1) {
      if (objImpuesto[0] === "02 - Sí objeto de impuesto.") {
        globalObjImpuesto = true;
      }
    } else {
      for (let i = 0; i < objImpuesto.length; i++) {
        if (objImpuesto[i] === "02 - Sí objeto de impuesto.") {
          globalObjImpuesto = true;
          break;
        }
      }
    }
    return globalObjImpuesto;
  };
  const handleCustomItem = (
    newItems,
    totalDiscount,
    taxDataBase,
    mapUnitsDataBase,
    isPayment,
    globalDiscount,
    newSubTotal,
    total
  ) => {
    log.debug("newItems", newItems);
    let retExist = false;
    let trasExist = false;
    const newItemDescriptions = [];
    const taxItemDetails = [];
    const taxSummary = { summaryRet: [], summaryTras: [] };
    const satUnitCodes = [];
    const discounts = [];
    const objImpuesto = [];
    const quantityItems = [];
    for (let i = 0; i < newItems.length; i++) {
      const discount = newItems[i].discount;
      const taxcodeId = newItems[i].taxcodeId;
      const taxAmount = newItems[i].taxAmount;
      const amount = newItems[i].amount;
      const unit = newItems[i].unit;
      const quantity = newItems[i].quantity;
      //Units
      const tempSatCode = mapUnitsDataBase.find(
        (element) => element.netsuiteCode === unit
      );
      satUnitCodes.push(tempSatCode.satCode);
      //Discounts
      discounts.push({
        item: i,
        discount,
      });
      //Description
      newItemDescriptions.push(handleDescCorrection(newItems[i].description));
      //Quantity
      quantityItems.push(quantity);
      //Taxgroup or taxcode
      let taxRecord = null;
      try {
        //Try to load taxcode
        taxRecord = taxDataBase.taxCodeData.find(
          (taxCodeElement) => taxCodeElement.taxCodeId === Number(taxcodeId)
        );
        if (taxRecord) {
          //Objeto de impuesto
          objImpuesto.push(taxRecord.objetoImpuesto);
          let taxTrasDetails = null;
          let taxRetDetails = null;
          const { customCode: taxcode, rate, exempt } = taxRecord;
          let newRate = Number(rate.replace("%", ""));
          const rateRetTemp = newRate;
          newRate = newRate < 0 ? newRate * -1 : newRate;
          let newTaxAmount = taxAmount < 0 ? taxAmount * -1 : taxAmount;
          if (rateRetTemp < 0) {
            retExist = true;
            //Es retención
            taxRetDetails = {
              isGroup: 0,
              exempt,
              base: globalDiscount
                ? Number(
                    (Number(newTaxAmount) / (Math.abs(newRate) / 100)).toFixed(
                      2
                    )
                  )
                : Number(amount),
              impuesto: keepBefore(taxcode, " -"),
              tipoFactor: "Tasa",
              tasaOcuota: newRate,
              importe: Number(Number(newTaxAmount).toFixed(2)),
            };
            //Push summary
            const exist = taxSummary.summaryRet.find(
              (element) =>
                element.impuesto === taxRetDetails.impuesto &&
                element.tasaOcuota === taxRetDetails.tasaOcuota
            );
            if (!exist) {
              taxSummary.summaryRet.push({
                base: taxRetDetails.base,
                impuesto: taxRetDetails.impuesto,
                tipoFactor: taxRetDetails.tipoFactor,
                tasaOcuota: taxRetDetails.tasaOcuota,
                importe: taxRetDetails.importe,
              });
            } else {
              exist.importe = (
                Number(exist.importe) + Number(taxRetDetails.importe)
              ).toFixed(2);
              exist.base = (
                Number(exist.base) + Number(taxRetDetails.base)
              ).toFixed(2);
            }
          } else {
            trasExist = true;
            //Es traslado
            taxTrasDetails = {
              isGroup: 0,
              exempt,
              base:
                globalDiscount && !exempt
                  ? Number(
                      (
                        Number(newTaxAmount) /
                        (Math.abs(newRate) / 100)
                      ).toFixed(2)
                    )
                  : Number(amount),
              impuesto: keepBefore(taxcode, " -"),
              tipoFactor: "Tasa",
              tasaOcuota: newRate,
              importe: Number(Number(newTaxAmount).toFixed(2)),
            };
            //Push summary
            const exist = taxSummary.summaryTras.find(
              (element) =>
                element.impuesto === taxTrasDetails.impuesto &&
                element.tasaOcuota === taxTrasDetails.tasaOcuota
            );
            if (!exist) {
              taxSummary.summaryTras.push({
                exempt: taxTrasDetails.exempt,
                base: taxTrasDetails.base,
                impuesto: taxTrasDetails.impuesto,
                tipoFactor: taxTrasDetails.tipoFactor,
                tasaOcuota: taxTrasDetails.tasaOcuota,
                importe: taxTrasDetails.importe,
                objImpuesto: taxRecord.objetoImpuesto,
              });
            } else {
              exist.importe = (
                Number(exist.importe) + Number(taxTrasDetails.importe)
              ).toFixed(2);
              exist.base = (
                Number(exist.base) + Number(taxTrasDetails.base)
              ).toFixed(2);
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
            //Objeto de impuesto
            objImpuesto.push(taxRecord.codes[0].objetoImpuesto);
            const taxListDetails = handleTaxGroupDetails(
              taxRecord,
              amount,
              taxAmount,
              isPayment,
              globalDiscount
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
                      objImpuesto: taxRecord.codes,
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
                    objImpuesto: taxRecord.codes,
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
    if (globalDiscount) {
      handleGlobalDiscountCorrection(
        newSubTotal,
        totalDiscount,
        taxTotal,
        discounts,
        total
      );
      totalDiscount = handleNewTotalDiscount(discounts);
    }
    const globalObjImpuesto = handleGlobalObjImpuesto(objImpuesto);
    const showTotalIfTraslado = handleGlobalExempt(newTaxSummary);
    return {
      ...(retExist && { retExist }),
      ...(trasExist && { trasExist }),
      taxItemDetails,
      taxTotal,
      taxSummary: newTaxSummary,
      satUnitCodes,
      ...((totalDiscount > 0 || globalDiscount) && {
        discounts: {
          totalDiscount,
          discounts,
        },
      }),
      objImpuesto,
      newItemDescriptions,
      newSubTotal,
      quantityItems,
      globalObjImpuesto,
      showTotalIfTraslado,
    };
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
        log.debug("ERROR HANDLE ACCESS FUNCTION", error);
        return false;
      }
    } else {
      return false;
    }
  };
  const handlePerms = (subsidiary, currentRole, recordType, esTraslado) => {
    //==================================Credentials====================================//
    let internalIdRegMaestro = null;
    let subsidiaryId = null;
    let permisosValidex = "";
    let permisosPruebaValidex = "";
    let prodMod = false;
    let idGuardaDocumentosCarpeta = null;
    let roles = null;
    let emailAutomatico = false;
    let suiteTax = false;
    let errorInterDescription = "";
    try {
      const buscaGlobalConfig = search.create({
        type: "customrecord_ent_entloc_config_registro",
        filters: [["custrecord_ent_entloc_subsidiaria", "anyof", subsidiary]],
        columns: [
          "internalId",
          "custrecord_ent_entloc_subsidiaria",
          "custrecord_ent_entloc_usuario_validex",
          "custrecord_ent_entloc_usuario_prue_valid",
          "custrecord_ent_entloc_entorno_prod",
          "custrecord_ent_entloc_carpeta_archivos",
          "custrecord_ent_entloc_roles",
          "custrecord_ent_entloc_roles_fv",
          "custrecord_ent_entloc_roles_nc",
          "custrecord_ent_entloc_roles_pc",
          "custrecord_ent_entloc_roles_ft",
          "custrecord_ent_entloc_envio_email_auto",
          "custrecord_ent_entloc_suite_tax",
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
        permisosPruebaValidex = result.getValue({
          name: "custrecord_ent_entloc_usuario_prue_valid",
        });
        prodMod = result.getValue({
          name: "custrecord_ent_entloc_entorno_prod",
        });
        idGuardaDocumentosCarpeta = result.getValue({
          name: "custrecord_ent_entloc_carpeta_archivos",
        });
        emailAutomatico = result.getValue({
          name: "custrecord_ent_entloc_envio_email_auto",
        });
        suiteTax = result.getValue({
          name: "custrecord_ent_entloc_suite_tax",
        });
        switch (recordType) {
          case "invoice":
            roles = result.getValue({
              name: "custrecord_ent_entloc_roles_fv",
            });
            break;
          case "creditmemo":
            roles = result.getValue({
              name: "custrecord_ent_entloc_roles_nc",
            });
            break;
          case "customerpayment":
            roles = result.getValue({
              name: "custrecord_ent_entloc_roles_pc",
            });
            break;
          default:
            if (esTraslado) {
              roles = result.getValue({
                name: "custrecord_ent_entloc_roles_ft",
              });
            }
            break;
        }
        if (!roles) {
          roles = result.getValue({
            name: "custrecord_ent_entloc_roles",
          });
        }
      });
    } catch (error) {
      errorInterDescription += "<br /> " + error;
      log.debug("ERROR IN HANDLEPERMS FUNCTION", error);
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
      emailAutomatico,
      suiteTax,
      permisosPruebaValidex,
    };
  };
  const getGlobalConfig = (subsidiaryId, recordType, esTraslado) => {
    //Info for access
    const currentUser = runtime.getCurrentUser();
    const currentRole = currentUser.role;
    //Config record info
    const globalConfig = handlePerms(
      subsidiaryId,
      currentRole,
      recordType,
      esTraslado
    );
    return globalConfig;
  };
  const handleSplitDiscountItems = (currentRecord) => {
    const fullItems = [];
    const items = [];
    const discounts = [];
    let totalDiscount = 0;
    let globalDiscount = false;
    let newSubTotal = 0;
    const totalItemLines = currentRecord.getLineCount({ sublistId: "item" });
    const globalRate = currentRecord.getValue({
      fieldId: "discountrate",
    });
    const subtotal = Number(
      currentRecord.getValue({
        fieldId: "subtotal",
      })
    );
    const total = Number(
      currentRecord.getValue({
        fieldId: "total",
      })
    );
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
      const desc = currentRecord.getSublistValue({
        sublistId: "item",
        fieldId: "description",
        line: i,
      });
      const quantity = currentRecord.getSublistValue({
        sublistId: "item",
        fieldId: "quantity",
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
          desc,
          quantity,
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
          description: item.desc,
          quantity: item.quantity,
        });
      } else {
        fullItems.push({
          unit: item.unit,
          taxcodeId: item.taxcodeId,
          amount: item.amount,
          taxAmount: item.taxAmount,
          description: item.desc,
          quantity: item.quantity,
        });
      }
    });
    discounts.forEach((discount) => {
      totalDiscount += Math.abs(Number(discount.amount));
    });
    newSubTotal = subtotal + totalDiscount;
    if (globalRate) {
      globalDiscount = true;
      let globalDiscountTotal = 0;
      fullItems.forEach((item) => {
        const currentItemDiscount =
          Number(item.amount) * (Math.abs(globalRate) / 100);
        globalDiscountTotal += currentItemDiscount;
        item.amount = Number(
          (Number(item.amount) - currentItemDiscount).toFixed(2)
        );
        item.discount = Number(
          (
            Number(item.discount ? item.discount : 0) + currentItemDiscount
          ).toFixed(2)
        );
        item.taxAmount = Number(
          (
            Number(item.taxAmount) -
            Number(item.taxAmount) * (Math.abs(globalRate) / 100)
          ).toFixed(2)
        );
      });
      totalDiscount += globalDiscountTotal;
    }
    handleDiscountCorrection(fullItems, Number(totalDiscount.toFixed(2)));
    return {
      fullItems,
      totalDiscount: Number(totalDiscount.toFixed(2)),
      globalDiscount,
      newSubTotal: Number(newSubTotal.toFixed(2)),
      total,
    };
  };
  const handleDataForFvNc = (
    currentRecord,
    taxDataBase,
    mapUnitsDataBase,
    isPayment,
    suiteTax
  ) => {
    const {
      fullItems: newItems,
      totalDiscount,
      globalDiscount,
      newSubTotal,
      total,
    } = handleSplitDiscountItems(currentRecord);
    if (suiteTax) {
      return handleCustomItemSuiteTax(
        newItems,
        totalDiscount,
        taxDataBase,
        mapUnitsDataBase,
        isPayment,
        currentRecord,
        globalDiscount,
        newSubTotal,
        total
      );
    } else {
      return handleCustomItem(
        newItems,
        totalDiscount,
        taxDataBase,
        mapUnitsDataBase,
        isPayment,
        globalDiscount,
        newSubTotal,
        total
      );
    }
  };
  const handleSplitDiscountItemsForPayment = (currentRecord, factor) => {
    const fullItems = [];
    const items = [];
    const discounts = [];
    let totalDiscount = 0;
    let globalDiscount = false;
    let newSubTotal = 0;
    const totalItemLines = currentRecord.getLineCount({ sublistId: "item" });
    const tranid = currentRecord.getValue({
      fieldId: "tranid",
    });
    const globalRate = currentRecord.getValue({
      fieldId: "discountrate",
    });
    const subtotal = Number(
      currentRecord.getValue({
        fieldId: "subtotal",
      })
    );
    const total = Number(
      currentRecord.getValue({
        fieldId: "total",
      })
    );
    for (let i = 0; i < totalItemLines; i++) {
      const desc = currentRecord.getSublistValue({
        sublistId: "item",
        fieldId: "description",
        line: i,
      });
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
          desc,
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
          description: item.desc,
        });
      } else {
        fullItems.push({
          unit: item.unit,
          taxcodeId: item.taxcodeId,
          amount: item.amount,
          taxAmount: item.taxAmount,
          description: item.desc,
        });
      }
    });
    discounts.forEach((discount) => {
      totalDiscount += Math.abs(Number(discount.amount));
    });
    newSubTotal = subtotal + totalDiscount;
    if (globalRate) {
      globalDiscount = true;
      let globalDiscountTotal = 0;
      fullItems.forEach((item) => {
        const currentItemDiscount =
          Number(item.amount) * (Math.abs(globalRate) / 100);
        globalDiscountTotal += currentItemDiscount;
        item.amount = Number(
          (Number(item.amount) - currentItemDiscount).toFixed(2)
        );
        item.discount = Number(
          (
            Number(item.discount ? item.discount : 0) + currentItemDiscount
          ).toFixed(2)
        );
        item.taxAmount = Number(
          (
            Number(item.taxAmount) -
            Number(item.taxAmount) * (Math.abs(globalRate) / 100)
          ).toFixed(2)
        );
      });
      totalDiscount += globalDiscountTotal;
    }
    handleDiscountCorrection(fullItems, Number(totalDiscount.toFixed(2)));
    return {
      fullItems,
      totalDiscount: Number(totalDiscount.toFixed(2)),
      globalDiscount,
      newSubTotal: Number(newSubTotal.toFixed(2)),
      total,
    };
  };
  const handleTaxesForPayment = (
    invoiceRecord,
    paymentAmount,
    taxDataBase,
    mapUnitsDataBase,
    isPayment,
    suiteTax
  ) => {
    const currentRecord = invoiceRecord;
    const invoiceAmount = invoiceRecord.getValue({
      fieldId: "total",
    });
    const porcentajePago =
      (Number(paymentAmount) * 100) / Number(invoiceAmount);
    //CALCULATE
    const {
      fullItems: newItems,
      totalDiscount,
      globalDiscount,
      newSubTotal,
      total,
    } = handleSplitDiscountItemsForPayment(currentRecord, porcentajePago);
    let itemFullSummary = null;
    if (suiteTax) {
      itemFullSummary = handleCustomItemSuiteTax(
        newItems,
        totalDiscount,
        taxDataBase,
        mapUnitsDataBase,
        isPayment,
        currentRecord,
        false
      );
    } else {
      itemFullSummary = handleCustomItem(
        newItems,
        totalDiscount,
        taxDataBase,
        mapUnitsDataBase,
        isPayment,
        globalDiscount,
        newSubTotal,
        total
      );
    }
    return itemFullSummary;
  };
  const handleRelatedInvoiceObjImp = (
    invoiceRelated,
    taxDataBase,
    suiteTax
  ) => {
    let invoiceObjImpuesto = false;
    try {
      const totalLines = invoiceRelated.getLineCount({
        sublistId: suiteTax ? "taxdetails" : "item",
      });
      for (let i = 0; i < totalLines; i++) {
        const taxCode = Number(
          invoiceRelated.getSublistValue({
            sublistId: suiteTax ? "taxdetails" : "item",
            fieldId: "taxcode",
            line: i,
          })
        );
        let found = null;
        if (!suiteTax) {
          found = taxDataBase.taxGroupData.find(
            (element) => element.taxGroupId === taxCode
          );
        }
        if (found) {
          found.codes.forEach((element) => {
            if (element.objetoImpuesto === "02 - Sí objeto de impuesto.") {
              invoiceObjImpuesto = true;
            }
          });
        } else {
          found = taxDataBase.taxCodeData.find(
            (element) => element.taxCodeId === taxCode
          );
          if (found.objetoImpuesto === "02 - Sí objeto de impuesto.") {
            invoiceObjImpuesto = true;
          }
        }
        if (invoiceObjImpuesto) {
          break;
        }
      }
      return invoiceObjImpuesto;
    } catch (error) {
      log.debug("ERROR handleRelatedInvoiceObjImp", error);
      return invoiceObjImpuesto;
    }
  };
  const handleVendorBillListForFactoraje = (
    habilitarFactoraje,
    vendorBillId,
    taxDataBase,
    mapUnitsDataBase,
    isPayment,
    suiteTax,
    currency,
    invoiceCurrencySymbol,
    exchangeRate,
    customExchangeRate,
    paymentId
  ) => {
    const taxesFactoraje = [];
    const docToRelFactoraje = [];
    const tempDocToRel = [];
    const customItemFactoraje = [];
    if (vendorBillId) {
      const vendorBillRecord = record.load({
        type: "vendorbill",
        id: vendorBillId,
      });
      const totalLines = vendorBillRecord.getLineCount({
        sublistId: "item",
      });
      for (let i = 0; i < totalLines; i++) {
        const invoiceRef = vendorBillRecord.getSublistValue({
          sublistId: "item",
          fieldId: "custcol_ent_entloc_fraje_ref_fv",
          line: i,
        });
        const uuidInvoiceRef = vendorBillRecord.getSublistValue({
          sublistId: "item",
          fieldId: "custcol_ent_entloc_fraje_uuid_fv",
          line: i,
        });
        const amount = vendorBillRecord.getSublistValue({
          sublistId: "item",
          fieldId: "amount",
          line: i,
        });
        const invoiceRecord = record.load({
          type: "invoice",
          id: invoiceRef,
        });
        const tempResponseTaxes = handleTaxesForPayment(
          invoiceRecord,
          amount,
          taxDataBase,
          mapUnitsDataBase,
          isPayment,
          suiteTax
        );
        //Equivalencia
        const docToEquivalence = handleDocToEquivalence(
          currency,
          invoiceCurrencySymbol,
          exchangeRate,
          customExchangeRate
        );
        //Obj impuesto
        const invoiceObjImpuesto = handleRelatedInvoiceObjImp(
          invoiceRecord,
          taxDataBase,
          suiteTax
        );
        customItemFactoraje.push({
          taxes: tempResponseTaxes,
          docToRel: handleDocRelData(
            invoiceRecord,
            paymentId,
            amount,
            docToEquivalence,
            invoiceObjImpuesto
          ),
        });
      }
    }
    return {
      habilitarFactoraje,
      customItemFactoraje,
    };
  };
  const handleDataForPayment = (
    currentRecord,
    taxDataBase,
    mapUnitsDataBase,
    isPayment,
    suiteTax
  ) => {
    let taxesForPayment = [];
    let totalPaymentTaxesList = [];
    let totalPaymentAmount = 0;
    let factorajeObj = null;
    const totalApplyLines = currentRecord.getLineCount({ sublistId: "apply" });
    const paymentId = currentRecord.id;
    const paymentDate = currentRecord.getValue({
      fieldId: "createddate",
    });
    const paymentForm = currentRecord.getText({
      fieldId: "custbody_ent_entloc_forma_pago",
    });
    const currencyId = currentRecord.getValue({
      fieldId: "custbody_ent_entloc_moneda_pago",
    });
    const currency = handleCurrencySymbol(currencyId);
    const exchangeRate = currentRecord.getValue({
      fieldId: "exchangerate",
    });
    const customExchangeRate = currentRecord.getValue({
      fieldId: "custbody_ent_entloc_tipo_cambio_pago",
    });
    const invoiceCurrencySymbol = currentRecord.getValue({
      fieldId: "currencysymbol",
    });
    const habilitarFactoraje = currentRecord.getValue({
      fieldId: "custbody_ent_entloc_fraje_habilitar_fa",
    });
    //Obtener datos de factura de compra si se requiere factoraje
    if (habilitarFactoraje) {
      const vendorBillId = currentRecord.getValue({
        fieldId: "custbody_ent_entloc_fraje_oc_relaciona",
      });
      factorajeObj = handleVendorBillListForFactoraje(
        habilitarFactoraje,
        vendorBillId,
        taxDataBase,
        mapUnitsDataBase,
        isPayment,
        suiteTax,
        currency,
        invoiceCurrencySymbol,
        exchangeRate,
        customExchangeRate,
        paymentId
      );
      log.debug("Factoraje OBJ", factorajeObj);
    }
    const paymentGlobalData = {
      paymentDate,
      paymentForm,
      currency,
      ...(currency === invoiceCurrencySymbol || currency === "MXN"
        ? { exchangeRate: 1 }
        : { exchangeRate: customExchangeRate }),
    };
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
        const invoiceCurrencyId = invoiceRelated.getValue({
          fieldId: "currency",
        });
        const invoiceCurrency = handleCurrencySymbol(invoiceCurrencyId);
        const invoiceObjImpuesto = handleRelatedInvoiceObjImp(
          invoiceRelated,
          taxDataBase,
          suiteTax
        );
        //Exchange rate
        const globalExchangeRate = handleGlobalExchangeRate(
          currency,
          invoiceCurrency,
          customExchangeRate
        );
        //Equivalencia
        const docToEquivalence = handleDocToEquivalence(
          currency,
          invoiceCurrency,
          exchangeRate,
          customExchangeRate
        );
        log.debug("DOC TO EQ", docToEquivalence);
        //Taxes summary for payment
        const resultTaxes = handleTaxesForPayment(
          invoiceRelated,
          amount,
          taxDataBase,
          mapUnitsDataBase,
          isPayment,
          suiteTax
        );
        totalPaymentTaxesList.push({
          resultTaxes: resultTaxes.taxSummary,
          globalExchangeRate,
        });
        totalPaymentAmount += Number(
          (amount / Number(docToEquivalence)).toFixed(2)
        );
        taxesForPayment.push({
          taxes: resultTaxes,
          docToRel: handleDocRelData(
            invoiceRelated,
            paymentId,
            amount,
            docToEquivalence,
            invoiceObjImpuesto
          ),
        });
      }
    }
    const recalcAmounts = handleRecalcAmountsForPayment(taxesForPayment);
    const totalPaymentTaxes = handleTotalTaxesForPayment(totalPaymentTaxesList);
    log.debug("TOTAL PAYMENT AMOUNT", totalPaymentAmount);
    log.debug("CUSTOM EXCHANGE RATE", customExchangeRate);
    return {
      paymentGlobalData,
      taxesForPayment: recalcAmounts,
      totalPaymentTaxes,
      totalPaymentAmount: Number(
        (totalPaymentAmount * customExchangeRate).toFixed(2)
      ),
      factoraje: factorajeObj,
    };
  };
  const getExtraCustomData = (
    currentRecord,
    currentSubsidiary,
    longitudSerie,
    longitudFolio,
    prodMod,
    suiteTax
  ) => {
    //Get taxGroup data
    const taxDataBase = suiteTax
      ? handleTaxGroupDataSuiteTax()
      : handleTaxGroupData();
    //Get mapUnit data
    const mapUnitsDataBase = handleSatMappingUnits();
    let total = currentRecord.getValue({
      fieldId: "total",
    });
    let subtotal = currentRecord.getValue({
      fieldId: "subtotal",
    });
    const tranid = currentRecord.getValue({
      fieldId: "tranid",
    });
    const recordType = currentRecord.type;
    //Monto en letra
    const currency = currentRecord.getText({
      fieldId: "currencysymbol",
    });
    const montoEnLetra = handleMontoEnLetra(total, currency);

    let customItem = null;
    let totalTaxesForPayment = null;
    let totalPaymentAmount = 0;
    let paymentGlobalData = null;
    let factoraje = null;

    //Custom transaction
    const { serie, folio } = handleFolioSerie(
      tranid,
      longitudSerie,
      longitudFolio
    );
    //Summary
    total = Number(total).toFixed(2);
    subtotal = Number(subtotal).toFixed(2);
    //Custom subsidiary
    const subsidiaryAddress = handleSubsidiaryAddressFields(currentSubsidiary);
    //Custom item
    if (recordType === "customerpayment") {
      const dataForPayment = handleDataForPayment(
        currentRecord,
        taxDataBase,
        mapUnitsDataBase,
        true,
        suiteTax
      );
      customItem = dataForPayment.taxesForPayment;
      totalTaxesForPayment = dataForPayment.totalPaymentTaxes;
      totalPaymentAmount = dataForPayment.totalPaymentAmount;
      paymentGlobalData = dataForPayment.paymentGlobalData;
      factoraje = dataForPayment.factoraje;
      log.debug("CUSTOM ITEM PAYMENT", customItem);
      log.debug("TOTAL TAXES PAYMENT", totalTaxesForPayment);
    } else {
      customItem = handleDataForFvNc(
        currentRecord,
        taxDataBase,
        mapUnitsDataBase,
        false,
        suiteTax
      );
      log.debug("CUSTOM ITEM", customItem);
    }
    //Related CFDIS
    const relatedCfdis = handleRelatedCfdis(currentRecord);
    return {
      customRecordData: {
        serie,
        folio,
        ...(relatedCfdis && { relatedCfdis }),
        montoEnLetra,
        prodMod,
      },
      summary: {
        total,
        subtotal,
      },
      customSubsidiaryData: {
        address: subsidiaryAddress,
      },
      paymentGlobalData,
      customItem,
      ...(recordType === "customerpayment" && {
        totalTaxesForPayment,
        totalPaymentAmount,
      }),
      ...(factoraje && factoraje.habilitarFactoraje && { factoraje }),
    };
  };
  return {
    getGlobalConfig,
    getUserConfig,
    getUserConfigTras,
    getPdfRendered,
    getExtraCustomDataTraslado,
    getCertExtraData,
    getFolderId,
    getStringRelated,
    getStringTax,
    getXmlCustomerTemplate,
    getPdfCustomerTemplate,
    getCustomerDataObj,
    getExtraCustomData,
  };
});
