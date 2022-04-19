/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
/*This event can be used with the following context.UserEventType:
CREATE, EDIT, VIEW, COPY, PRINT, EMAIL, QUICKVIEW*/
define(["N/record", "N/ui/message"], (record, message) => {
  const handleUserMessage = (
    showCertMessage,
    showGenMessage,
    errorCertMessage,
    errorGenMessage,
    form
  ) => {
    if (showCertMessage) {
      //Show success message cert
      form.addPageInitMessage({
        type: message.Type.CONFIRMATION,
        title: "Certificación correcta",
        message: "Certificado correctamente, consulte la subficha CFDI 4.0",
        duration: 5000,
      });
    } else if (showGenMessage) {
      //Show success message generation
      form.addPageInitMessage({
        type: message.Type.CONFIRMATION,
        title: "Generación correcta",
        message:
          "Documento electrónico previo generado correctamente, consulte la subficha CFDI 4.0",
        duration: 5000,
      });
    } else if (errorCertMessage) {
      //Show error message
      form.addPageInitMessage({
        type: message.Type.ERROR,
        title: "Error en la certificación",
        message:
          "El documento no se pudo certificar, consulte la subficha CFDI 4.0",
        duration: 5000,
      });
    } else if (errorGenMessage) {
      //Show error message
      form.addPageInitMessage({
        type: message.Type.ERROR,
        title: "Error en la certificación",
        message:
          "El documento no se pudo certificar, consulte la subficha CFDI 4.0",
        duration: 5000,
      });
    }
  };
  const beforeLoad = (context) => {
    if (context.type === context.UserEventType.VIEW) {
      const newRecord = context.newRecord;
      //Parameters
      const showCertMessage = context.request.parameters.showCertMessage;
      const showGenMessage = context.request.parameters.showGenMessage;
      const errorCertMessage = context.request.parameters.errorCertMessage;
      const errorGenMessage = context.request.parameters.errorGenMessage;
      //User Message
      handleUserMessage(
        showCertMessage,
        showGenMessage,
        errorCertMessage,
        errorGenMessage,
        context.form
      );
    }
  };
  return {
    beforeLoad,
  };
});
