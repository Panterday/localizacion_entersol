/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(["N/url", "N/https"], (url, https) => {
  onRequest = (context) => {
    const restletMainUrl = url.resolveScript({
      scriptId: "customscript_ent_entloc_cert_cfdi_rest",
      deploymentId: "customdeploy_ent_entloc_cert_cfdi_rest",
      returnExternalUrl: true,
    });
    var headers = {
      Authorization:
        "NLAuth nlauth_account=2558532, nlauth_email=dchavez@entersolteam.com.mx, nlauth_signature=Entersol@2021_, nlauth_role=3",
    };

    var response = https.get({ url: restletMainUrl, headers: headers });

    context.response.write(response.body);
  };
  return {
    onRequest,
  };
});
