#!/usr/bin/env node
// Deterministic i18n safety gate. Never rewrites translations or calls an AI provider.
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const sync = path.join(root, "scripts", "i18n-sync.mjs");
function run(args, successText) {
  const result = spawnSync(process.execPath, [sync, ...args], { cwd: root, encoding: "utf8" });
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  if (result.status !== 0 || !result.stdout.includes(successText)) {
    throw new Error("i18n safety gate failed; see the audit above.");
  }
}
console.log("Quiet Mirror — deterministic i18n safety gate\n");
run([], "All 6 locales are in sync. Nothing to do.");
run(["--audit-values"], "All locale values look translated.");
console.log("\nPASS: all locale keys are synchronized and no untranslated values were detected.");
