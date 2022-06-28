/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
/*This event can be used with the following context.UserEventType:
CREATE, EDIT, VIEW, COPY, PRINT, EMAIL, QUICKVIEW*/
define(["./Funciones/ent_funciones_localizacion"], (funcionesLoc) => {
  const beforeLoad = (context) => {
    try {
      if (context.type === context.UserEventType.EDIT) {
        const currentRecord = context.newRecord;
        const recordType = currentRecord.type;
        const subsidiaryId = currentRecord.getValue({
          fieldId: "subsidiary",
        });
        const uuid = currentRecord.getValue({
          fieldId: "custbody_ent_entloc_uuid",
        });
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
        if (userConfig.bloqueoEliminacion) {
          if (uuid) {
            const form = context.form;
            const deleteButton = form.getButton({
              id: "delete",
            });
            deleteButton.isDisabled = true;
          }
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
    } catch (error) {
      log.debug("VALIDACIONES GENERALES ERROR", error);
    }
  };
  return {
    beforeLoad,
  };
});
