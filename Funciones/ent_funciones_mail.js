/**
 *@NModuleScope Public
 *@NApiVersion 2.1
 */

define(["N/record", "N/search", "N/file", "N/email", "N/render"], (
  record,
  search,
  file,
  email,
  render
) => {
  const enviaCfdiMail = (
    currentRecord,
    subsidiaryRecord,
    customerRecord,
    idPdf,
    idXml,
    envioAutomatico
  ) => {
    const recordData = (
      recordId,
      recordType,
      currentRecord,
      idCliente,
      subsidiaryId,
      xml,
      pdf
    ) => {
      //Esta función se encarga de obtener todos los datos que se van a utilizar en la función de enviarEmail
      let objDatos = {}; //Objeto que retorna todos los datos que se van a utilizar
      let objErr = { error: "" }; //El objeto almacena el mensaje que se mostrará en el campo si hay un error
      try {
        let errorFlag = false; //Flag para verificar si hay error en obtener algún dato

        //Record subsidiaria
        const subsidiary = record.load({
          type: "subsidiary",
          id: subsidiaryId,
        });

        const recordCliente = record.load({
          type: "customer",
          id: idCliente,
        });

        const tipoCampo = subsidiary.getValue({
          fieldId: "custrecord_ent_mail_id_campos",
        });

        //RFC CLIENTE
        //Validaciones tipo de campo
        let rfcCliente = "";
        if (tipoCampo == 1) {
          //RFC Entersol Localization
          rfcCliente = recordCliente.getValue({
            fieldId: "custentity_ent_entloc_rfc",
          });
        } else if (tipoCampo == 2) {
          //RFC Generados Velsimex
          rfcCliente = recordCliente.getValue({
            fieldId: "custentity_mx_rfc",
          });
        } else if (tipoCampo == 3) {
          //RFC Generados Mexico Localization
          rfcCliente = recordCliente.getValue({
            fieldId: "custentity_ent_entloc_rfc",
          });
        }

        //Definir si el correo del destinatario será de una persona fisica o moral
        let correosEmpresa = [];
        let correoPrincipal = "";
        if (rfcCliente.length == 13) {
          //Correo persona física
          correoPrincipal = recordCliente.getValue({
            fieldId: "email",
          });
          if (correoPrincipal == "") {
            //Mensaje de persona fisica no tiene correo
            objErr.error =
              "El correo electrónico del cliente asignado a esta transacción no esta definido en la configuración del cliente. Asegúrese de que el cliente tenga una dirección de correo electrónico.";
            errorFlag = true;
          }
        } else if (rfcCliente.length == 12) {
          //Correo persona moral
          const countContact = recordCliente.getLineCount({
            sublistId: "contactroles",
          });

          for (let i = 0; i < countContact; i++) {
            let idContact = recordCliente.getSublistValue({
              sublistId: "contactroles",
              fieldId: "contact",
              line: i,
            });
            //Contactos subficha Relaciones > Contactos
            const recordContact = record.load({
              type: "contact",
              id: idContact,
            });

            //Búsqueda de tipo Contacto para obtener el valor de los campos que contienen el check
            const contactChecks = search.lookupFields({
              type: search.Type.CONTACT,
              id: idContact,
              columns: [
                "custentity_ent_mail_contacto_fv",
                "custentity_ent_mail_contacto_cp",
                "custentity_ent_mail_contacto_nc",
              ],
            });

            //Checks para definir si a el contacto se le enviará el correo
            const checkFv = contactChecks.custentity_ent_mail_contacto_fv;
            const checkNc = contactChecks.custentity_ent_mail_contacto_cp;
            const checkCp = contactChecks.custentity_ent_mail_contacto_nc;

            let correo = recordCliente.getSublistValue({
              sublistId: "contactroles",
              fieldId: "email",
              line: i,
            });
            let nombre = recordCliente.getSublistValue({
              sublistId: "contactroles",
              fieldId: "contactname",
              line: i,
            });
            if (!correo) {
              objErr.error =
                "El contacto de " +
                nombre +
                " no tiene registrado un correo. Ingrese a la configuración de Cliente > Subficha-Relaciones y edite el contacto de " +
                nombre +
                ".";
              errorFlag = true;
            }
            if (recordType == "invoice" && checkFv && correo) {
              correosEmpresa.push(correo);
            }
            if (recordType == "creditmemo" && checkNc) {
              correosEmpresa.push(correo);
            }
            if (recordType == "customerpayment" && checkCp) {
              correosEmpresa.push(correo);
            }
          }
          if (correosEmpresa.length < 1 && !countContact && !errorFlag) {
            objErr.error =
              "El cliente cuenta con contactos agregados, pero no se seleccionó ningún tipo de CFDI para enviar en el registro de Contacto.";
            errorFlag = true;
          }
          if (correosEmpresa.length == 0 && !countContact) {
            objErr.error =
              "El cliente no cuenta con contactos agregados, asegúrese de agregar contactos en la configuración del cliente > subficha Relaciones > Nuevo contacto.";
            errorFlag = true;
          }
        }

        //Obtener ID de Plantilla
        let templateId = "";
        if (recordType === "invoice") {
          templateId = subsidiary.getValue({
            fieldId: "custrecord_ent_mail_plantilla_fv",
          });
          if (!templateId) {
            objErr.error =
              "En la configuración de la Subsidiaria, no se ha asignado una plantilla correspondiente a la transacción. Asegurese de seleccionar la plantilla correcta para este tipo de transacción en Configuración de Subsidiaria > ENT - PLANTILLA ENVIO EMAIL.";
            errorFlag = true;
          }
        }
        if (recordType === "customerpayment") {
          templateId = subsidiary.getValue({
            fieldId: "custrecord_ent_mail_plantilla_pago",
          });
          if (!templateId) {
            objErr.error =
              "En la configuración de la Subsidiaria, no se ha asignado una plantilla correspondiente a la transacción. Asegurese de seleccionar la plantilla correcta para este tipo de transacción en Configuración de Subsidiaria > ENT - PLANTILLA ENVIO EMAIL.";
            errorFlag = true;
          }
        }
        if (recordType === "creditmemo") {
          templateId = subsidiary.getValue({
            fieldId: "custrecord_ent_mail_plantilla_notacredit",
          });
          if (!templateId) {
            objErr.error =
              "En la configuración de la Subsidiaria, no se ha asignado una plantilla correspondiente a la transacción. Asegurese de seleccionar la plantilla correcta para este tipo de transacción en Configuración de Subsidiaria > ENT - PLANTILLA ENVIO EMAIL.";
            errorFlag = true;
          }
        }

        //Correo Remitente
        const remitenteId = subsidiary.getValue({
          fieldId: "custrecord_ent_mail_remitente",
        });
        if (!remitenteId) {
          objErr.error =
            "En la configuración de la Subsidiaria, el campo ENT - REMITENTE ENVIO EMAIL no cuenta con un usuario asignado.";
          errorFlag = true;
        }

        const remitente = record.load({
          type: "employee",
          id: remitenteId,
        });
        const remitenteEmail = remitente.getValue({
          fieldId: "email",
        });

        let remitenteEmailId = "";
        if (!remitenteEmail) {
          objErr.error =
            "El usuario asignado en la configuración de la Subsidiaria en el campo ENT - REMITENTE ENVIO EMAIL no tiene un correo registrado.";
          errorFlag = true;
        }

        remitenteEmailId = remitente.id;

        //Obtener correo para agregar como copia a correo
        const ccDefaultEmail = subsidiary.getValue({
          fieldId: "custrecord_ent_mail_cc_default",
        });
        let ccDefault = [];
        //Si agregan más de una copia por Default
        const ccDefaultCount = ccDefaultEmail.includes(",");
        let copiasDefault = [];
        if (ccDefaultCount) {
          ccDefault = ccDefaultEmail.split(",");
        } else if (ccDefaultEmail) {
          ccDefault.push(ccDefaultEmail);
        }

        //Check para agregar o no correo Representante de Ventas
        const checkRepVentas = subsidiary.getValue({
          fieldId: "custrecord_ent_mail_copia_rep_ventas",
        });
        let emailRepVentas = "";
        if (
          checkRepVentas &&
          (recordType === "invoice" || recordType === "creditmemo")
        ) {
          const repVentasId = currentRecord.getValue({
            fieldId: "salesrep",
          });
          if (repVentasId) {
            const repVentas = record.load({
              type: "employee",
              id: repVentasId,
            });

            emailRepVentas = repVentas.getValue({
              fieldId: "email",
            });
            //Mensaje error
            if (!emailRepVentas) {
              objErr.error =
                "En la configuración de la Subsidiaria se seleccionó el campo ENT - ENVIAR COPIA A REPRESENTATE DE VENTAS, pero no hay correo definido para el Representante de Ventas.";
              errorFlag = true;
            }
          } else {
            objErr.error =
              "En la configuración de la Subsidiaria se seleccionó ENT - ENVIAR COPIA A REPRESENTATE DE VENTAS, pero no hay correo definido para el Representante de Ventas.";
            errorFlag = true;
          }
        }

        //File de XML y PDG Generados
        const xmlFile = file.load({
          id: idXml,
        });
        const pdfFile = file.load({
          id: idPdf,
        });

        const msjError = objErr.error;
        objDatos = {
          recordType,
          error: errorFlag,
          msjError,
          pdfFile,
          xmlFile,
          correoPrincipal,
          correosEmpresa,
          recordId,
          templateId,
          remitenteId,
          remitenteEmailId,
          ccDefault,
          emailRepVentas,
        };
      } catch (err) {
        log.debug("Error", err);
        const { error } = objErr;
        const msjError = objErr.error;

        objDatos = { error: true, msjError };
      }

      return objDatos;
    };

    const enviarEmail = (obj, email) => {
      //Esta función se encarga de ejecutar el envío del mail usando como parametro el objeto con todo lo que se va usar en la función para enviar con éxtio el correo
      let {
        recordType,
        error,
        msjError,
        pdfFile,
        xmlFile,
        correoPrincipal,
        correosEmpresa,
        recordId,
        templateId,
        remitenteEmailId,
        ccDefault,
        emailRepVentas,
      } = obj;

      let emailDoble = false;
      let ccDefaults = ccDefault;
      let ccEmailDoble = [];

      if (!correosEmpresa) {
        correosEmpresa = [];
      }

      if (emailRepVentas) {
        ccDefaults.push(emailRepVentas);
      }

      let canTotal; //Cantidad total de destinatarios y correos que serán copia
      let numTotal; //Numero que dividira el arreglo de los correos de empresa para ser enviado en 2 emails

      if (ccDefaults) {
        let countCC = ccDefaults.length;
        let countEmp = correosEmpresa.length;
        canTotal = countCC + countEmp;
        if (canTotal > 10) {
          numTotal = countEmp - countCC;
        } else {
          numTotal = 9;
        }
      } else {
        ccDefaults = [];
      }

      if (correosEmpresa.length >= numTotal) {
        ccEmailDoble = correosEmpresa.slice(numTotal, correosEmpresa.length);
        correosEmpresa = correosEmpresa.slice(0, numTotal);
        emailDoble = true;
      }

      //Consultar Plantilla - Merge con mi Info
      const idRecord = Number(recordId);
      const idTemplate = Number(templateId);
      const mergeResult = render.mergeEmail({
        templateId: idTemplate,
        entity: null,
        recipient: null,
        supportCaseId: null,
        transactionId: idRecord,
        customRecord: null,
      });

      //Enviar Email obteniendo valores de la plantilla
      const emailSubject = mergeResult.subject;
      const emailBody = mergeResult.body;

      try {
        if (correoPrincipal) {
          //Envio de correo a personas físicas
          email.send({
            author: remitenteEmailId,
            recipients: correoPrincipal,
            cc: ccDefaults,
            subject: emailSubject,
            body: emailBody,
            attachments: [pdfFile, xmlFile],
            relatedRecords: {
              transactionId: idRecord,
            },
          });
        } else {
          email.send({
            //Envio de correo a persona moral
            author: remitenteEmailId,
            recipients: correosEmpresa,
            cc: ccDefaults,
            subject: emailSubject,
            body: emailBody,
            attachments: [pdfFile, xmlFile],
            relatedRecords: {
              transactionId: idRecord,
            },
          });
        }
        if (emailDoble) {
          //Si hay mas de 10 destinatarios y copias, se envia el correo a mails faltantes
          email.send({
            author: remitenteEmailId,
            recipients: ccEmailDoble,
            subject: emailSubject,
            body: emailBody,
            attachments: [pdfFile, xmlFile],
            relatedRecords: {
              transactionId: idRecord,
            },
          });
        }
      } catch (error) {
        return error;
      }
    };

    let objEnviarMail = {};

    const onRequest = (
      currentRecord,
      subsidiaryRecord,
      customerRecord,
      idPdf,
      idXml,
      envioAutomatico
    ) => {
      const recordId = currentRecord.id;
      const recordType = currentRecord.type;

      // const preCurrentRecord = record.load({
      //   type: recordType,
      //   id: recordId,
      // });
      // preCurrentRecord.save({
      //   ignoreMandatoryFields: true,
      // });

      // const currentRecord = record.load({
      //   type: recordType,
      //   id: recordId,
      // });

      //Validacion de tipo transaccion
      let idCliente = "";
      if (recordType == "invoice" || recordType == "creditmemo") {
        idCliente = currentRecord.getValue({
          fieldId: "entity",
        });
      } else if (recordType == "customerpayment") {
        idCliente = currentRecord.getValue({
          fieldId: "customer",
        });
      }

      const subsidiaryId = currentRecord.getValue({
        fieldId: "subsidiary",
      });

      if (envioAutomatico) {
        const obtenerDatos = recordData(
          recordId,
          recordType,
          currentRecord,
          idCliente,
          subsidiaryId,
          idXml,
          idPdf
        );
        let { error, msjError } = obtenerDatos;

        objEnviarMail = { error, msjError };
        if (!error) {
          //Si no hay error en la función de recordData
          const sendEmail = enviarEmail(obtenerDatos, email);
          //Si sendEmail tiene un error, lo retorna y es lo que se evalua
          if (sendEmail) {
            //Si tiene error, se considera que el único error es para las copias añadidas en el campo
            // record.submitFields({
            //   type: recordType,
            //   id: recordId,
            //   values: {
            //     custbody_ent_mail_estado_correo:
            //       "Los correos definidos como copia en la configuración de la Subsidiaria, en el campo ENT - CC DEFAULT ENVIO EMAIL no estan escritos de la manera correcta. Asegurese de escribir los correos con el formato correcto, separado por comas y sin espacios, ejemplo: correo@dominio.com,correo2@dominio.com,correo3@dominio.com",
            //   },
            // });
            // //Redirección a transacción
            // redirect.toRecord({
            //   type: recordType,
            //   id: recordId,
            //   parameters: {
            //     errorEmailMessage: true,
            //   },
            // })
            objEnviarMail.error = true;
            objEnviarMail.msjError =
              "Los correos definidos como copia en la configuración de la Subsidiaria, en el campo ENT - CC DEFAULT ENVIO EMAIL no estan escritos de la manera correcta. Asegurese de escribir los correos con el formato correcto, separado por comas y sin espacios, ejemplo: correo@dominio.com,correo2@dominio.com,correo3@dominio.com";
            return objEnviarMail;
          } else {
            //sendEmail no tiene error y se ejecuta correctamente
            //Redirección a la transacción
            // redirect.toRecord({
            //   type: recordType,
            //   id: recordId,
            //   parameters: {
            //     showEmailMessage: true,
            //   },
            // });
            // record.submitFields({
            //   type: recordType,
            //   id: recordId,
            //   values: {
            //     custbody_ent_mail_estado_correo: "",
            //   },
            // });
            objEnviarMail.msjError = "";
            return objEnviarMail;
          }
        } else {
          //Si hay error en la función recordData
          // record.submitFields({
          //   type: recordType,
          //   id: recordId,
          //   values: {
          //     custbody_ent_mail_estado_correo: msjError,
          //   },
          // });
          // //Redirección a transacción
          // redirect.toRecord({
          //   type: recordType,
          //   id: recordId,
          //   parameters: {
          //     errorEmailMessage: true,
          //   },
          // });

          return objEnviarMail;
        }
      }
    };

    return onRequest(
      currentRecord,
      subsidiaryRecord,
      customerRecord,
      idPdf,
      idXml,
      envioAutomatico
    );
  };
  return {
    enviaCfdiMail,
  };
});
