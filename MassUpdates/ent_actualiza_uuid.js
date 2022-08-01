/**
 *@NApiVersion 2.1
 *@NScriptType MassUpdateScript
 */
 define(["N/record", "N/search"], (record, search) => {
  const each = (params) => {
    const currentRecord = record.load({
      type: params.type,
      id: params.id,
      isDynamic: true,
    });
    try {
      const uuidEntersol = currentRecord.getValue({
        fieldId: "custbody_ent_entloc_uuid",
      });
      const uuidMx = currentRecord.getValue({
        fieldId: "custbody_mx_cfdi_uuid",
      });
      const xmlMx = currentRecord.getValue({
        fieldId: "custbody_psg_ei_certified_edoc",
      });
      const pdfMx = currentRecord.getValue({
        fieldId: "custbody_edoc_generated_pdf",
      });
      const xmlEntersol = currentRecord.getValue({
        fieldId: "custbody_ent_entloc_doc_prev",
      });
      const pdfEntersol = currentRecord.getValue({
        fieldId: "custbody_ent_entloc_pdf_timbrado",
      });

      if (uuidEntersol) {
        if (!uuidMx) {
          currentRecord.setValue({
            fieldId: "custbody_mx_cfdi_uuid",
            value: uuidEntersol,
          });
          currentRecord.setValue({
            fieldId: "custbody_ent_entloc_version_cfdi",
            value: "3.3",
          });
        }
      } else if (uuidMx) {
        if (!uuidEntersol) {
          log.debug('PRINT', "!uuidEntersol");
          currentRecord.setValue({
            fieldId: "custbody_ent_entloc_uuid",
            value: uuidMx,
          });
          currentRecord.setValue({
            fieldId: "custbody_ent_entloc_doc_prev",
            value: xmlMx,
          });
          currentRecord.setValue({
            fieldId: "custbody_ent_entloc_pdf_timbrado",
            value: pdfMx,
          });
          currentRecord.setValue({
            fieldId: "custbody_ent_entloc_version_cfdi",
            value: "3.3",
          });
        } else if (uuidEntersol && !xmlEntersol && !pdfEntersol) {
          log.debug('PRINT', "!uuidEntersol && !xml && !pdf");
          currentRecord.setValue({
            fieldId: "custbody_ent_entloc_doc_prev",
            value: xmlMx,
          });
          currentRecord.setValue({
            fieldId: "custbody_ent_entloc_pdf_timbrado",
            value: pdfMx,
          });
        }
      }
      currentRecord.save({
        ignoreMandatoryFields: true,
      });
    } catch (error) {
      log.debug("ERROR", error);
    }
  };
  return {
    each,
  };
});
