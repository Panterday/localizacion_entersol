/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
/*This event can be used with the following context.UserEventType:
CREATE, EDIT, VIEW, COPY, PRINT, EMAIL, QUICKVIEW*/
define([], () => {
  const beforeLoad = (context) => {
    if (context.type === context.UserEventType.COPY) {
      const newRecord = context.newRecord;
      const uuid = newRecord.getValue({
        fieldId: "custbody_ent_entloc_uuid",
      });
      if (uuid) {
        const form = context.form;
        const voidButton = form.getButton({
          id: "void",
        });
        if (voidButton) {
          if (uuid || customUuid) {
            voidButton.isDisabled = true;
            if (estadoCancelacion === "Cancelado") {
              voidButton.isDisabled = false;
            }
          }
        }
      }
    }
    if (
      context.type === context.UserEventType.COPY ||
      context.type === context.UserEventType.CREATE
    ) {
      const newRecord = context.newRecord;
      log.debug("COPY", "COPY");
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
    }
  };
  return {
    beforeLoad,
  };
});
