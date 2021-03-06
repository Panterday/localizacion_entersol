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
  const handleCertButton = (recordId, recordType, cfdi44, form) => {
    const suiteletUrl = url.resolveScript({
      scriptId: "customscript_ent_entloc_certifica_cfdi",
      deploymentId: "customdeploy_ent_entloc_certifica_cfdi",
    });
    //Building params string
    const params = `&id=${recordId}&type=${recordType}&genCert=0`;

    //Building target url
    const target = `${suiteletUrl}+${params}`;

    //TESTING INLINE HTML
    const hideField = form.addField({
      id: "custpage_ent_entloc_hide_certification",
      label: "Hidden",
      type: serverWidget.FieldType.INLINEHTML,
    });

    hideField.defaultValue = /* html */ `
          <script>
            const btnCertification = document.querySelector("#custpage_ent_locent_button_cert");
            btnCertification.addEventListener("click", () => {
              btnCertification.style.pointerEvents = "none";
            });
          </script>
        `;
    const dynamicVersionText = !cfdi44
      ? "Certificar XML CFDI 4.0"
      : "Certificar XML CFDI 3.3";
    //Adding a button to the form
    form.addButton({
      id: "custpage_ent_locent_button_cert",
      label: dynamicVersionText,
      functionName: `window.open("${target}", "_self")`,
    });
  };
  const handleGenerationButton = (recordType, recordId, cfdi44, form) => {
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
            const btnGenerar = document.querySelector("#custpage_ent_entloc_gen_btn");
            btnGenerar.addEventListener("click", () => {
              btnGenerar.style.pointerEvents = "none";
            });
          </script>
        `;
    const dynamicVersionText = !cfdi44
      ? "Generar XML CFDI 4.0"
      : "Generar XML CFDI 3.3";
    //Adding a button to the form
    form.addButton({
      id: "custpage_ent_entloc_gen_btn",
      label: dynamicVersionText,
      functionName: `window.open("${target}", "_self")`,
    });
  };
  const beforeLoad = (context) => {
    if (context.type === context.UserEventType.VIEW) {
      try {
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
        const subsidiaryRealm = keepBefore(
          currentRecord.getValue({
            fieldId: "_eml_nkey_",
          }),
          "~3~3~N"
        );
        log.debug("SUBSIDIARY", subsidiaryRealm);
        //Global config
        const globalConfig = funcionesLoc.getGlobalConfig(
          subsidiaryId,
          recordType
        );
        //User config
        const userConfig = funcionesLoc.getUserConfig(
          globalConfig.internalIdRegMaestro,
          recordType,
          globalConfig.access
        );
        log.debug("GLOBAL", globalConfig);
        if (subsidiaryRealm === "2558532") {
          handleGenerationButton(
            recordType,
            recordId,
            globalConfig.cfdi44,
            form
          );
          handleCertButton(recordId, recordType, globalConfig.cfdi44, form);
        } else {
          if (userConfig.aplica && !uuid) {
            handleGenerationButton(
              recordType,
              recordId,
              globalConfig.cfdi44,
              form
            );
            if (userConfig.habilitaCertDosPasos) {
              if (xmlPrev && !estatusCert) {
                handleCertButton(
                  recordId,
                  recordType,
                  globalConfig.cfdi44,
                  form
                );
              }
            } else {
              handleCertButton(recordId, recordType, globalConfig.cfdi44, form);
            }
          }
        }
      } catch (error) {
        log.debug("MAIN BUTTON ERROR", error);
      }
    }
  };
  return {
    beforeLoad,
  };
});
