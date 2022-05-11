/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
/*This event can be used with the following context.UserEventType:
CREATE, EDIT, VIEW, COPY, PRINT, EMAIL, QUICKVIEW*/
define(["N/record", "N/url", "N/ui/serverWidget"], (
  record,
  url,
  serverWidget
) => {
  const beforeLoad = (context) => {
    if (context.type === context.UserEventType.VIEW) {
      const currentRecord = context.newRecord;
      const recordType = currentRecord.type;
      const recordId = currentRecord.id;
      const form = context.form;
      const newRecord = context.newRecord;
      const suiteletUrl = url.resolveScript({
        scriptId: "customscript_ent_entloc_impresion_format",
        deploymentId: "customdeploy_ent_entloc_impresion_format",
      });
      //Building params string
      const params = `&id=${recordId}&type=${recordType}&genCert=1`;

      //Building target url
      const target = `${suiteletUrl}+${params}`;

      //TESTING INLINE HTML
      const hideField = form.addField({
        id: "custpage_ent_entloc_hide_cust_print_4",
        label: "Hidden",
        type: serverWidget.FieldType.INLINEHTML,
      });

      hideField.defaultValue = /* html */ `
            <script>
              const btnCustomPrint = document.querySelector("#custpage_ent_entloc_custom_print");
              btnCustomPrint.addEventListener("click", () => {
                btnCustomPrint.style.pointerEvents = "none";
              });
            </script>
          `;

      //Adding a button to the form
      form.addButton({
        id: "custpage_ent_entloc_custom_print",
        label: "Imprimir Cfdi 4.0",
        functionName: `window.open("${target}", "_self")`,
      });
    }
  };
  return {
    beforeLoad,
  };
});