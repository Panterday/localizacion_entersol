/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(["N/runtime", "N/redirect", "N/task"], (runtime, redirect, task) => {
  const onRequest = (context) => {
    const scriptTask = task.create({ taskType: task.TaskType.MAP_REDUCE });
    scriptTask.scriptId = "customscript_ent_entloc_actualiza_map_re";
    scriptTask.deploymentId = "customdeploy_ent_entloc_actualiza_map_re";
    scriptTask.submit();
    redirect.toTaskLink({
      id: "CARD_-29",
      parameters: {
        updating: true,
      },
    });
  };
  return {
    onRequest,
  };
});
