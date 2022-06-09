/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
/*The mode in which the record is being accessed. The mode can be set
to one of the following values:
copy, create, edit*/
define(["N/record", "N/search", "N/ui/message"], (record, search, message) => {
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
  };
  const paymentFieldChanged = (context) => {
    const currentRecord = context.currentRecord;
    if (context.fieldId === "custbody_ent_entloc_moneda_pago") {
      const paymentCurrency = Number(
        currentRecord.getValue({
          fieldId: "currency",
        })
      );
      const customCurrency = Number(
        currentRecord.getValue({
          fieldId: "custbody_ent_entloc_moneda_pago",
        })
      );
      const exchangeRateField = currentRecord.getField({
        fieldId: "custbody_ent_entloc_tipo_cambio_pago",
      });
      if (paymentCurrency === customCurrency || customCurrency === 1) {
        exchangeRateField.isDisabled = true;
        currentRecord.setValue({
          fieldId: "custbody_ent_entloc_tipo_cambio_pago",
          value: 1,
        });
      } else {
        exchangeRateField.isDisabled = false;
      }
    }
  };
  const paymentSaveRecord = (context) => {
    const currencyMsg = message.create({
      title: "Falta el valor para tipo de cambio",
      message: `Debe ingresar un tipo de cambio distinto de 1`,
      type: message.Type.WARNING,
    });
    const currentRecord = context.currentRecord;
    const currencyId = Number(
      currentRecord.getValue({
        fieldId: "currency",
      })
    );
    const customCurrencyId = Number(
      currentRecord.getValue({
        fieldId: "custbody_ent_entloc_moneda_pago",
      })
    );
    const customExchangeRate = currentRecord.getValue({
      fieldId: "custbody_ent_entloc_tipo_cambio_pago",
    });
    //paymentCurrency === customCurrency || customCurrency === 1
    if (
      currencyId !== customCurrencyId &&
      customCurrencyId !== 1 &&
      customExchangeRate === 1
    ) {
      //Show message
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      currencyMsg.show({
        duration: 10000,
      });
      return false;
    } else {
      return true;
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
              fieldId: "custentity_ent_entloc_metodo_pago",
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
