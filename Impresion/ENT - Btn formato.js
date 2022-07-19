/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 *@NAmdConfig ../ConfigPaths/customDataConfigPaths.json
 */
/*This event can be used with the following context.UserEventType:
CREATE, EDIT, VIEW, COPY, PRINT, EMAIL, QUICKVIEW*/
define(["N/record", "N/url", "N/ui/serverWidget", "funcionesLoc"], (
  record,
  url,
  serverWidget,
  funcionesLoc
) => {
  const beforeLoad = (context) => {
    if (context.type === context.UserEventType.VIEW) {
      try {
        const currentRecord = context.newRecord;
        const recordType = currentRecord.type;
        const recordId = currentRecord.id;
        const form = context.form;
        const uuid = currentRecord.getValue({
          fieldId: "custbody_ent_entloc_uuid",
        });
        const subsidiaryId = currentRecord.getValue({
          fieldId: "subsidiary",
        });
        //Global config
        const globalConfig = funcionesLoc.getGlobalConfig(
          subsidiaryId,
          recordType
        );
        if (uuid) {
          const suiteletUrl = url.resolveScript({
            scriptId: "customscript_ent_entloc_impresion_format",
            deploymentId: "customdeploy_ent_entloc_impresion_format",
          });
          //Building params string
          const params = `&id=${recordId}&type=${recordType}&genCert=1`;

          //Building target url
          const target = `${suiteletUrl}+${params}`;
          const dynamicVersionText = !globalConfig.cfdi44
            ? "Imprimir CFDI 4.0"
            : "Imprimir CFDI 3.3";
          //Adding a button to the form
          form.addButton({
            id: "custpage_ent_entloc_custom_print",
            label: dynamicVersionText,
            functionName: `window.open("${target}", "_blank")`,
          });
        }
      } catch (error) {
        log.debug("ERROR en creación de botón para formato CFDI", error);
      }
    }
  };
  return {
    beforeLoad,
  };
});
