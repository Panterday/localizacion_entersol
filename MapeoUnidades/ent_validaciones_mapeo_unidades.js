/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
/*The mode in which the record is being accessed. The mode can be set
to one of the following values:
copy, create, edit*/
define(["N/record", "N/search", "N/url"], (record, search, url) => {
  const goHome = () => {
    //Redirect to HOME
    const homeUrl = url.resolveTaskLink("CARD_-29");
    window.open(homeUrl, "_self", false);
  };
  const fieldChanged = (context) => {
    const currentRecord = context.currentRecord;
    if (context.fieldId === "custpage_local_units") {
      const unitsGroupValue = currentRecord.getValue({
        fieldId: "custpage_local_units",
      });
      const params = `&unitGroupId=${unitsGroupValue}`;
      const suiteletMapUrl = url.resolveScript({
        scriptId: "customscript_ent_entloc_mapeo_unidades",
        deploymentId: "customdeploy_ent_entloc_mapeo_unidades",
      });
      //Redirect to MAP SUITELET
      window.onbeforeunload = null;
      window.open(suiteletMapUrl + params, "_self", false);
    }
  };

  return {
    fieldChanged,
    goHome,
  };
});
