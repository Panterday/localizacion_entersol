/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
/*The mode in which the record is being accessed. The mode can be set
to one of the following values:
copy, create, edit*/
define(["N/record", "N/search", "N/ui/message"], (record, search, message) => {
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
  const getCurrencyAccount = (currenRecord) => {
    let accountRecord = null;
    let accountCurrency = null;
    const accountId = currenRecord.getValue({
      fieldId: "account",
    });
    if (accountId) {
      accountRecord = record.load({
        type: "account",
        id: accountId,
      });
      accountCurrency = accountRecord.getValue({
        fieldId: "currency",
      });
    }
    return accountCurrency;
  };
  const handleCustomerFields = (currenRecord) => {
    const customerId = currenRecord.getValue({
      fieldId: "customer",
    });
    const formaPago = currenRecord.getValue({
      fieldId: "custbody_ent_entloc_forma_pago",
    });
    const regimenFiscalReceptor = currenRecord.getValue({
      fieldId: "custbody_ent_entloc_reg_fis_receptor",
    });
    if (customerId) {
      const customerRecord = record.load({
        type: "customer",
        id: customerId,
      });
      const customerFormaPago = customerRecord.getValue({
        fieldId: "custentity_ent_entloc_forma_pago",
      });
      const customerRegimenFiscal = customerRecord.getValue({
        fieldId: "custentity_ent_entloc_regimen_fiscal",
      });
      if (!formaPago && customerFormaPago) {
        currenRecord.setValue({
          fieldId: "custbody_ent_entloc_forma_pago",
          value: customerFormaPago,
        });
      }
      if (!regimenFiscalReceptor && customerRegimenFiscal) {
        currenRecord.setValue({
          fieldId: "custbody_ent_entloc_reg_fis_receptor",
          value: customerRegimenFiscal,
        });
      }
    }
  };
  const paymentPageInit = (currentRecord) => {
    handleCustomerFields(currentRecord);
    //Account currency
    const currencyAccount = getCurrencyAccount(currentRecord);
    const isFactoraje = currentRecord.getValue({
      fieldId: "custbody_ent_entloc_fraje_habilitar_fa",
    });
    const facturaCompraField = currentRecord.getField({
      fieldId: "custbody_ent_entloc_fraje_oc_relaciona",
    });
    const invoiceCurrencySymbol = currentRecord.getValue({
      fieldId: "currencysymbol",
    });
    const customCurrencyId = currentRecord.getValue({
      fieldId: "custbody_ent_entloc_moneda_pago",
    });
    const customCurrencySymbol = handleCurrencySymbol(customCurrencyId);
    const montoPagoField = currentRecord.getField({
      fieldId: "custbody_ent_entloc_monto_pagado",
    });
    if (
      !currentRecord.getValue({
        fieldId: "custbody_ent_entloc_moneda_pago",
      })
    ) {
      currentRecord.setValue({
        fieldId: "custbody_ent_entloc_moneda_pago",
        value: currencyAccount,
      });
    }
    const exchangeRate = currentRecord.getValue({
      fieldId: "custbody_ent_entloc_tipo_cambio_pago",
    });
    if (!exchangeRate) {
      currentRecord.setValue({
        fieldId: "custbody_ent_entloc_tipo_cambio_pago",
        value: 1,
      });
    }
    if (isFactoraje) {
      facturaCompraField.isDisabled = false;
    } else {
      facturaCompraField.isDisabled = true;
    }
    log.debug(
      "CURRENCIES",
      `I CURR ${invoiceCurrencySymbol} P CURR ${customCurrencySymbol}`
    );
    if (
      invoiceCurrencySymbol === "MXN" &&
      customCurrencySymbol !== invoiceCurrencySymbol
    ) {
      log.debug("DESBLOQUEO CAMPO CAMPO", "DESBLOQUEO CAMPO");
      montoPagoField.isDisabled = false;
    } else {
      log.debug("BLOQUEO CAMPO", "BLOQUEO CAMPO");
      montoPagoField.isDisabled = true;
    }
  };
  const paymentFieldChanged = (context) => {
    const currentRecord = context.currentRecord;
    if (context.fieldId === "custbody_ent_entloc_moneda_pago") {
      const invoiceCurrencySymbol = currentRecord.getValue({
        fieldId: "currencysymbol",
      });
      const customCurrencyId = Number(
        currentRecord.getValue({
          fieldId: "custbody_ent_entloc_moneda_pago",
        })
      );
      const customCurrencySymbol = handleCurrencySymbol(customCurrencyId);
      const exchangeRateField = currentRecord.getField({
        fieldId: "custbody_ent_entloc_tipo_cambio_pago",
      });
      const montoPagoField = currentRecord.getField({
        fieldId: "custbody_ent_entloc_monto_pagado",
      });
      if (
        invoiceCurrencySymbol === "MXN" &&
        customCurrencySymbol !== invoiceCurrencySymbol
      ) {
        log.debug("DESBLOQUEO CAMPO CAMPO", "DESBLOQUEO CAMPO");
        montoPagoField.isDisabled = false;
        exchangeRateField.isDisabled = false;
      } else {
        log.debug("BLOQUEO CAMPO", "BLOQUEO CAMPO");
        montoPagoField.isDisabled = true;
        exchangeRateField.isDisabled = true;
        currentRecord.setValue({
          fieldId: "custbody_ent_entloc_monto_pagado",
          value: "",
        });
        currentRecord.setValue({
          fieldId: "custbody_ent_entloc_tipo_cambio_pago",
          value: 1,
        });
      }
    }
    if (context.fieldId === "custbody_ent_entloc_fraje_oc_relaciona") {
      log.debug("SELECCIONANDO FAC COMPRA", "FAC COMPRA");
      const facturaCompraId = currentRecord.getValue({
        fieldId: "custbody_ent_entloc_fraje_oc_relaciona",
      });
      const totalApplyLines = currentRecord.getLineCount({
        sublistId: "apply",
      });
      for (let j = 0; j < totalApplyLines; j++) {
        currentRecord.selectLine({
          sublistId: "apply",
          line: j,
        });
        currentRecord.setCurrentSublistValue({
          sublistId: "apply",
          fieldId: "apply",
          value: false,
        });
      }
      if (facturaCompraId) {
        const facturaCompraRecord = record.load.promise({
          type: "vendorbill",
          id: facturaCompraId,
        });
        facturaCompraRecord.then(
          (objRecord) => {
            const totalFacCompraLines = objRecord.getLineCount({
              sublistId: "item",
            });
            for (let i = 0; i < totalFacCompraLines; i++) {
              const invoiceRefId = objRecord.getSublistValue({
                sublistId: "item",
                fieldId: "custcol_ent_entloc_fraje_ref_fv",
                line: i,
              });
              for (let j = 0; j < totalApplyLines; j++) {
                const invoiceLineRefId = currentRecord.getSublistValue({
                  sublistId: "apply",
                  fieldId: "internalid",
                  line: j,
                });
                if (invoiceRefId === invoiceLineRefId) {
                  log.debug("INVOICE REF ID LINE", invoiceLineRefId);
                  currentRecord.selectLine({
                    sublistId: "apply",
                    line: j,
                  });
                  currentRecord.setCurrentSublistValue({
                    sublistId: "apply",
                    fieldId: "apply",
                    value: true,
                  });
                }
              }
            }
          },
          (error) => {
            log.error({
              title: "Unable to load record",
              details: error.name,
            });
          }
        );
      }
    }
    if (context.fieldId === "custbody_ent_entloc_fraje_habilitar_fa") {
      const isFactoraje = currentRecord.getValue({
        fieldId: "custbody_ent_entloc_fraje_habilitar_fa",
      });
      const facturaCompraField = currentRecord.getField({
        fieldId: "custbody_ent_entloc_fraje_oc_relaciona",
      });
      if (isFactoraje) {
        facturaCompraField.isDisabled = false;
      } else {
        facturaCompraField.isDisabled = true;
      }
    }
    if (context.fieldId === "custbody_ent_entloc_moneda_cuenta") {
      const monedaCuenta = currentRecord.getValue({
        fieldId: "custbody_ent_entloc_moneda_cuenta",
      });
      currentRecord.setValue({
        fieldId: "custbody_ent_entloc_moneda_pago",
        value: monedaCuenta,
      });
    }
    if (context.fieldId === "custbody_ent_entloc_monto_pagado") {
      const montoPago = Number(
        currentRecord.getValue({
          fieldId: "payment",
        })
      );
      const montoPagado = Number(
        currentRecord.getValue({
          fieldId: context.fieldId,
        })
      );
      if (montoPagado) {
        const tipoCambio = Number((montoPago / montoPagado).toFixed(4));
        currentRecord.setValue({
          fieldId: "custbody_ent_entloc_tipo_cambio_pago",
          value: tipoCambio,
        });
      } else {
        currentRecord.setValue({
          fieldId: "custbody_ent_entloc_tipo_cambio_pago",
          value: 1,
        });
      }
    }
  };
  const paymentSaveRecord = (context) => {
    const montoMsg = message.create({
      title: "Falta el valor para monto pagado",
      message: `Debe ingresar un monto pagado para calcular el tipo de cambio.`,
      type: message.Type.WARNING,
    });
    const facturaCompraMsg = message.create({
      title: "Factoraje: Falta referencia de factura de compra",
      message: `Si desea utilizar factoraje, seleccione una factura de compra en el campo: CFDI 4.0 : FACTURA DE COMPRA RELACIONADA, en la Subficha CFDI 4.0.`,
      type: message.Type.WARNING,
    });
    const currentRecord = context.currentRecord;
    const invoiceCurrencySymbol = currentRecord.getValue({
      fieldId: "currencysymbol",
    });
    const customCurrencyId = currentRecord.getValue({
      fieldId: "custbody_ent_entloc_moneda_pago",
    });
    const customExchangeRate = currentRecord.getValue({
      fieldId: "custbody_ent_entloc_tipo_cambio_pago",
    });
    const customCurrencySymbol = handleCurrencySymbol(customCurrencyId);
    const montoPagado = currentRecord.getValue({
      fieldId: "custbody_ent_entloc_monto_pagado",
    });
    if (
      invoiceCurrencySymbol === "MXN" &&
      customCurrencySymbol !== invoiceCurrencySymbol &&
      !montoPagado
    ) {
      //Show message
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      montoMsg.show({
        duration: 10000,
      });
      return false;
    } else {
      //Factoraje
      const isFactoraje = currentRecord.getValue({
        fieldId: "custbody_ent_entloc_fraje_habilitar_fa",
      });
      const facturaCompra = currentRecord.getValue({
        fieldId: "custbody_ent_entloc_fraje_oc_relaciona",
      });
      if (isFactoraje && !facturaCompra) {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        facturaCompraMsg.show({
          duration: 10000,
        });
        return false;
      } else {
        return true;
      }
    }
  };
  const handleUuid = (invoiceId) => {
    let uuid = null;
    const invoiceSearchObj = search.create({
      type: "transaction",
      filters: [
        ["mainline", "is", "T"],
        "AND",
        ["custbody_ent_entloc_uuid", "isnotempty", ""],
        "AND",
        ["internalid", "anyof", invoiceId],
      ],
      columns: ["custbody_ent_entloc_uuid"],
    });
    const searchResultCount = invoiceSearchObj.runPaged().count;
    if (searchResultCount > 0) {
      invoiceSearchObj.run().each((result) => {
        uuid = result.getValue({
          name: "custbody_ent_entloc_uuid",
        });
        return true;
      });
    }
    return uuid;
  };
  const fieldChanged = (context) => {
    const currentRecord = context.currentRecord;
    const sublistId = context.sublistId;
    const fieldId = context.fieldId;
    if (
      currentRecord.type === "invoice" ||
      currentRecord.type === "creditmemo" ||
      currentRecord.type === "salesorder"
    ) {
      //Entity
      if (fieldId === "entity") {
        try {
          const currentRecord = context.currentRecord;
          const customerId = currentRecord.getValue({
            fieldId: "entity",
          });
          const customerRecord = record.load({
            type: "customer",
            id: customerId,
          });
          const usoCfdiFac = currentRecord.getValue({
            fieldId: "custbody_ent_entloc_uso_cfdi",
          });
          const metodoPagoFac = currentRecord.getValue({
            fieldId: "custbody_ent_entloc_ent_metodo_pago",
          });
          const formaPagoFac = currentRecord.getValue({
            fieldId: "custbody_ent_entloc_forma_pago",
          });
          const regimenFiscalFac = currentRecord.getValue({
            fieldId: "custbody_ent_entloc_reg_fis_receptor",
          });
          if (!usoCfdiFac) {
            const usoCfdiCliente = customerRecord.getValue({
              fieldId: "custentity_ent_entloc_uso_cfdi",
            });
            currentRecord.setValue({
              fieldId: "custbody_ent_entloc_uso_cfdi",
              value: usoCfdiCliente,
            });
          }
          if (!metodoPagoFac) {
            const metodoPagoCliente = customerRecord.getValue({
              fieldId: "custentity_ent_entloc_metodo_pago",
            });
            currentRecord.setValue({
              fieldId: "custbody_ent_entloc_ent_metodo_pago",
              value: metodoPagoCliente,
            });
          }
          if (!formaPagoFac) {
            const formaPagoCliente = customerRecord.getValue({
              fieldId: "custentity_ent_entloc_forma_pago",
            });
            currentRecord.setValue({
              fieldId: "custbody_ent_entloc_forma_pago",
              value: formaPagoCliente,
            });
          }
          if (!regimenFiscalFac) {
            const regimenFiscalCliente = customerRecord.getValue({
              fieldId: "custentity_ent_entloc_regimen_fiscal",
            });
            currentRecord.setValue({
              fieldId: "custbody_ent_entloc_reg_fis_receptor",
              value: regimenFiscalCliente,
            });
          }
        } catch (error) {
          log.debug("ERROR", error);
        }
      }
    } else if (currentRecord.type === "customerpayment") {
      paymentFieldChanged(context);
    }
    //Related CFDIS
    if (
      sublistId === "recmachcustrecord_ent_entloc_registro_padre" &&
      fieldId === "custrecord_ent_entloc_transaccion"
    ) {
      const refId = currentRecord.getCurrentSublistValue({
        sublistId: "recmachcustrecord_ent_entloc_registro_padre",
        fieldId: fieldId,
      });
      if (refId) {
        const uuid = handleUuid(refId);
        currentRecord.setCurrentSublistValue({
          sublistId: "recmachcustrecord_ent_entloc_registro_padre",
          fieldId: "custrecord_ent_entloc_uuid",
          value: uuid,
        });
      } else {
        currentRecord.setCurrentSublistValue({
          sublistId: "recmachcustrecord_ent_entloc_registro_padre",
          fieldId: "custrecord_ent_entloc_uuid",
          value: "",
        });
      }
    }
  };
  const pageInit = (context) => {
    const currentRecord = context.currentRecord;
    if (
      currentRecord.type === "invoice" ||
      currentRecord.type === "creditmemo" ||
      currentRecord.type === "salesorder"
    ) {
      try {
        const customerId = currentRecord.getValue({
          fieldId: "entity",
        });
        const customerRecord = record.load({
          type: "customer",
          id: customerId,
        });
        const usoCfdiFac = currentRecord.getValue({
          fieldId: "custbody_ent_entloc_uso_cfdi",
        });
        const metodoPagoFac = currentRecord.getValue({
          fieldId: "custbody_ent_entloc_ent_metodo_pago",
        });
        const formaPagoFac = currentRecord.getValue({
          fieldId: "custbody_ent_entloc_forma_pago",
        });
        const regimenFiscalFac = currentRecord.getValue({
          fieldId: "custbody_ent_entloc_reg_fis_receptor",
        });
        log.debug("USO CFDI FACTURA", usoCfdiFac);
        if (!usoCfdiFac) {
          const usoCfdiCliente = customerRecord.getValue({
            fieldId: "custentity_ent_entloc_uso_cfdi",
          });
          log.debug("USO CFDI CLIENTE", usoCfdiCliente);
          currentRecord.setValue({
            fieldId: "custbody_ent_entloc_uso_cfdi",
            value: usoCfdiCliente,
          });
        }
        if (!metodoPagoFac) {
          const metodoPagoCliente = customerRecord.getValue({
            fieldId: "custentity_ent_entloc_metodo_pago",
          });
          currentRecord.setValue({
            fieldId: "custbody_ent_entloc_ent_metodo_pago",
            value: metodoPagoCliente,
          });
        }
        if (!formaPagoFac) {
          const formaPagoCliente = customerRecord.getValue({
            fieldId: "custentity_ent_entloc_forma_pago",
          });
          currentRecord.setValue({
            fieldId: "custbody_ent_entloc_forma_pago",
            value: formaPagoCliente,
          });
        }
        if (!regimenFiscalFac) {
          const regimenFiscalCliente = customerRecord.getValue({
            fieldId: "custentity_ent_entloc_regimen_fiscal",
          });
          currentRecord.setValue({
            fieldId: "custbody_ent_entloc_reg_fis_receptor",
            value: regimenFiscalCliente,
          });
        }
      } catch (error) {
        log.debug("ERROR PAGE INIT LOAD", error);
      }
    } else if (currentRecord.type === "customerpayment") {
      paymentPageInit(currentRecord);
    }
  };
  const saveRecord = (context) => {
    const currentRecord = context.currentRecord;
    if (currentRecord.type === "customerpayment") {
      return paymentSaveRecord(context);
    } else {
      return true;
    }
  };
  return {
    fieldChanged,
    pageInit,
    saveRecord,
  };
});
