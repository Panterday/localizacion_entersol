/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 *@NAmdConfig ../ConfigPaths/customDataConfigPaths.json
 */
define([
  "N/url",
  "N/ui/serverWidget",
  "N/search",
  "N/record",
  "N/runtime",
  "N/ui/message",
  "funcionesLoc",
], (url, serverWidget, search, record, runtime, message, funcionesLoc) => {
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
  const dynamicButtonLabel = (recordType) => {
    let buttonLabel = "";
    switch (recordType) {
      case "invoice":
        buttonLabel = "Certificar factura de ingreso";
        break;
      case "customerpayment":
        buttonLabel = "Certificar pago del cliente";
        break;
      case "creditmemo":
        buttonLabel = "Certificar nota de crédito";
        break;
    }
    return buttonLabel;
  };
  const handleCertButton = (recordId, recordType, form) => {
    const suiteletUrl = url.resolveScript({
      scriptId: "customscript_ent_entloc_certifica_fv",
      deploymentId: "customdeploy_ent_entloc_certifica_fv_imp",
    });
    //Building params string
    const params = `&id=${recordId}&type=${recordType}&genCert=0`;

    //Building target url
    const target = `${suiteletUrl}+${params}`;

    //TESTING INLINE HTML
    const hideField = form.addField({
      id: "custpage_ent_locent_hide_btn",
      label: "Hidden",
      type: serverWidget.FieldType.INLINEHTML,
    });

    hideField.defaultValue = /* html */ `
          <script>
            const btnCertificar = document.querySelector("#custpage_ent_locent_button_cert");
            btnCertificar.addEventListener("click", () => {
              btnCertificar.style.pointerEvents = "none";
            });
          </script>
        `;
    //Dynaminc button label
    let buttonLabel = dynamicButtonLabel(recordType);

    //Adding a button to the form
    form.addButton({
      id: "custpage_ent_locent_button_cert",
      label: buttonLabel,
      functionName: `window.open("${target}", "_self")`,
    });
  };
  const handleGenerationButton = (recordType, recordId, form) => {
    const suiteletUrl = url.resolveScript({
      scriptId: "customscript_ent_entloc_genera_xml_previ",
      deploymentId: "customdeploy_ent_entloc_genera_xml_p_imp",
    });
    //Building params string
    const params = `&id=${recordId}&type=${recordType}&genCert=1`;

    //Building target url
    const target = `${suiteletUrl}+${params}`;

    //TESTING INLINE HTML
    const hideField = form.addField({
      id: "custpage_ent_entloc_hide_generation",
      label: "Hidden",
      type: serverWidget.FieldType.INLINEHTML,
    });

    hideField.defaultValue = /* html */ `
          <script>
            const btnCertificar = document.querySelector("#custpage_ent_entloc_gen_btn");
            btnCertificar.addEventListener("click", () => {
              btnCertificar.style.pointerEvents = "none";
            });
          </script>
        `;

    //Adding a button to the form
    form.addButton({
      id: "custpage_ent_entloc_gen_btn",
      label: "Generar documento electrónico",
      functionName: `window.open("${target}", "_self")`,
    });
  };
  const beforeLoad = (context) => {
    if (context.type === context.UserEventType.VIEW) {
      //Global data
      const currentRecord = context.newRecord;
      const recordId = currentRecord.id;
      const recordType = currentRecord.type;
      const form = context.form;
      const subsidiaryId = currentRecord.getValue({
        fieldId: "subsidiary",
      });
      const xmlPrev = currentRecord.getValue({
        fieldId: "custbody_ent_entloc_doc_prev",
      });
      const uuid = currentRecord.getValue({
        fieldId: "custbody_ent_entloc_uuid",
      });
      const estatusCert = currentRecord.getValue({
        fieldId: "custbody_ent_entloc_estado_certifica",
      });
      //Global config
      const globalConfig = funcionesLoc.getGlobalConfig(subsidiaryId);
      //User config
      const userConfig = funcionesLoc.getUserConfig(
        globalConfig.internalIdRegMaestro,
        recordType,
        globalConfig.access
      );
      log.debug("USER CONFIG", userConfig);
      //Invoice
      if (recordType === "invoice") {
        /* handleGenerationButton(uuid, recordType, recordId, form); */
        /* if (userConfig.aplica && !uuid) {
          if (userConfig.habilitaCertDosPasos) {
            if (xmlPrev && !estatusCert) {
              handleCertButton(recordId, recordType, form);
            } else {
              handleGenerationButton(recordType, recordId, form);
            }
          } else {
            handleCertButton(recordId, recordType, form);
          }
        } */
        handleCertButton(recordId, recordType, form);
        handleGenerationButton(recordType, recordId, form);
      }
      //Customer payment
      if (recordType === "customerpayment") {
        /* handleGenerationButton(uuid, recordType, recordId, form); */
        /* if (userConfig.aplica && !uuid) {
          if (userConfig.habilitaCertDosPasos) {
            if (xmlPrev && !estatusCert) {
              handleCertButton(recordId, recordType, form);
            } else {
              handleGenerationButton(recordType, recordId, form);
            }
          } else {
            handleCertButton(recordId, recordType, form);
          }
        } */
        handleGenerationButton(recordType, recordId, form);
        handleCertButton(recordId, recordType, form);
      }
      //Credit memo
      if (recordType === "creditmemo") {
        /* handleGenerationButton(uuid, recordType, recordId, form); */
        /* if (userConfig.aplica && !uuid) {
          if (userConfig.habilitaCertDosPasos) {
            if (xmlPrev && !estatusCert) {
              handleCertButton(recordId, recordType, form);
            } else {
              handleGenerationButton(recordType, recordId, form);
            }
          } else {
            handleCertButton(recordId, recordType, form);
          }
        } */
        handleCertButton(recordId, recordType, form);
      }
    }
  };
  return {
    beforeLoad,
  };
});
