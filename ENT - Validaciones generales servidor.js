/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
/*This event can be used with the following context.UserEventType:
CREATE, EDIT, VIEW, COPY, PRINT, EMAIL, QUICKVIEW*/
define([], () => {
  const beforeLoad = (context) => {
    if (context.type === context.UserEventType.EDIT) {
      const newRecord = context.newRecord;
      const uuid = newRecord.getValue({
        fieldId: "custbody_ent_entloc_uuid",
      });
      if (uuid) {
        const form = context.form;
        const deleteButton = form.getButton({
          id: "delete",
        });
        deleteButton.isDisabled = true;
      }
    }
    if (
      context.type === context.UserEventType.COPY ||
      context.type === context.UserEventType.CREATE
    ) {
      try {
        const newRecord = context.newRecord;
        newRecord.setValue({
          fieldId: "custbody_ent_entloc_uuid",
          value: "",
        });
        newRecord.setValue({
          fieldId: "custbody_ent_entloc_doc_prev",
          value: "",
        });
        newRecord.setValue({
          fieldId: "custbody_ent_entloc_pdf_timbrado",
          value: "",
        });
      } catch (error) {
        log.debug("ERROR", error);
      }
    }
  };
  return {
    beforeLoad,
  };
});
