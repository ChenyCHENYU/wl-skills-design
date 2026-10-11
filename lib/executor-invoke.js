"use strict";

const path = require("node:path");

/** Design owns its CLI mapping; hosts pass structured executor parameters. */
function buildArguments({ executor, parameters, projectRoot, runId }) {
  if (!["verify-spec", "verify-flowchart", "verify-db", "verify-api"].includes(executor.id)) {
    const error = new Error(`Design 未实现执行器：${executor.id}`);
    error.code = "unsupported-executor";
    throw error;
  }
  return ["verify", executor.id.slice(7), "--file", parameters.targets[0],
    "--target", projectRoot, "--run-id", runId, "--json"];
}

function invoke(input) {
  const args = buildArguments(input);
  return require("./executor-process.cjs").invokeCli({
    cli: path.join(__dirname, "../bin/wl-skills-design.js"),
    args,
    projectRoot: input.projectRoot,
  });
}

module.exports = { buildArguments, invoke };
