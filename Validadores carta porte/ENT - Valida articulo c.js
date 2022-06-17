/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */

/*Este script realiza las validaciones necesarias para el buen funcionamiento 
 del complemento con carta porte a nivel artículo. */
define(["N/ui/message"], (message) => {
  const saveRecord = (context) => {
    const currentRecord = context.currentRecord;
    const faltaInfoMsg = message.create({
      title: "Se requiere información",
      message: `Si se selecciona MATERIAL PELIGROSO, los campos CLAVE MATERIAL PELIGROSO y TIPO EMBALAJE
        son obligatorios.
          `,
      type: message.Type.WARNING,
    });
    const checkMaterial = currentRecord.getValue({
      fieldId: "custitem_ent_entloc_material_peligroso",
    });
    const cveMaterialPeligroso = currentRecord.getValue({
      fieldId: "custitem_ent_entloc_clave_mat_peligros",
    });
    const tipoEmbalaje = currentRecord.getValue({
      fieldId: "custitem_ent_entloc_embalaje",
    });
    if (checkMaterial && (!cveMaterialPeligroso || !tipoEmbalaje)) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      faltaInfoMsg.show({
        duration: 10000,
      });
      return false;
    }
    return true;
  };
  return {
    saveRecord,
  };
});
