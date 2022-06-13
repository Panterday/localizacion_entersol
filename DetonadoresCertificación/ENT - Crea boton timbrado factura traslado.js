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
  const handleCertButton = (recordId, recordType, form) => {
    const suiteletUrl = url.resolveScript({
      scriptId: "customscript_ent_entloc_cert_cfdi_tras",
      deploymentId: "customdeploy_ent_entloc_cert_cfdi_tras",
    });
    //Building params string
    const params = `&id=${recordId}&type=${recordType}`;

    //Building target url
    const target = `${suiteletUrl}+${params}`;

    //TESTING INLINE HTML
    const hideField = form.addField({
      id: "custpage_ent_entloc_hide_cert_traslado",
      label: "Hidden",
      type: serverWidget.FieldType.INLINEHTML,
    });

    hideField.defaultValue = /* html */ `
            <script>
              const btnCertification = document.querySelector("#custpage_ent_entloc_cert_traslado");
              btnCertification.addEventListener("click", () => {
                btnCertification.style.pointerEvents = "none";
              });
            </script>
          `;

    //Adding a button to the form
    form.addButton({
      id: "custpage_ent_entloc_cert_traslado",
      label: "Certificar factura de traslado",
      functionName: `window.open("${target}", "_self")`,
    });
  };
  const handleGenerationButton = (recordType, recordId, form) => {
    const suiteletUrl = url.resolveScript({
      scriptId: "customscript_ent_entloc_gen_xml_prev_tra",
      deploymentId: "customdeploy_ent_entloc_gen_xml_prev_tra",
    });
    //Building params string
    const params = `&id=${recordId}&type=${recordType}`;

    //Building target url
    const target = `${suiteletUrl}+${params}`;

    //TESTING INLINE HTML
    const hideField = form.addField({
      id: "custpage_ent_entloc_hide_gen_traslado",
      label: "Hidden",
      type: serverWidget.FieldType.INLINEHTML,
    });

    hideField.defaultValue = /* html */ `
            <script>
              const btnGenerar = document.querySelector("#custpage_ent_entloc_gen_traslado");
              btnGenerar.addEventListener("click", () => {
                btnGenerar.style.pointerEvents = "none";
              });
            </script>
          `;

    //Adding a button to the form
    form.addButton({
      id: "custpage_ent_entloc_gen_traslado",
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
      const globalConfig = funcionesLoc.getGlobalConfig(
        subsidiaryId,
        recordType,
        true
      );
      //User config
      const userConfig = funcionesLoc.getUserConfigTras(
        globalConfig.internalIdRegMaestro,
        recordType,
        globalConfig.access
      );
      log.debug("USER CONFIG", userConfig);
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
  };
  return {
    beforeLoad,
  };
});
