#!/usr/bin/env node
// scripts/i18n-grammar-check.mjs
//
// ┌──────────────────────────────────────────────────────────────────────┐
// │  Quiet Mirror — i18n grammar & translation quality checker           │
// │                                                                      │
// │  USAGE:                                                              │
// │    node scripts/i18n-grammar-check.mjs            ← all locales     │
// │    node scripts/i18n-grammar-check.mjs --lang fr  ← one locale      │
// │    node scripts/i18n-grammar-check.mjs --dry-run  ← report only     │
// │                                                                      │
// │  REQUIRES: GROQAPIKEY env var                                        │
// │                                                                      │
// │  WHAT IT DOES:                                                       │
// │    For each locale (uk / ar / fr / nl / ro):                         │
// │      - Compares every plain-string value against the English source  │
// │      - Asks Groq to check grammar, tone, and translation accuracy    │
// │      - Collects only keys that need correction                       │
// │      - Patches the locale file with corrected values                 │
// │      - Writes a human-readable report to corrections-report.md       │
// │                                                                      │
// │  WHAT IT NEVER TOUCHES:                                              │
// │    - Arrow function values  (n) => `...`                             │
// │    - Array values           readonly [...]                           │
// │    - English locale (en.ts) — it is the reference, never changed     │
// │    - Keys where Groq returns null (already correct)                  │
// │    - Brand name "Quiet Mirror" — preserved in all strings            │
// └──────────────────────────────────────────────────────────────────────┘

import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.join(__dirname, "..");
const I18N_DIR  = path.join(ROOT, "app", "lib", "i18n");

const DRY_RUN   = process.argv.includes("--dry-run");
const LANG_IDX  = process.argv.indexOf("--lang");
const ONLY_LANG = LANG_IDX !== -1 ? process.argv[LANG_IDX + 1] : null;

const LOCALES = [
  { code: "uk", label: "Ukrainian", dir: "ltr" },
  { code: "ar", label: "Arabic",    dir: "rtl" },
  { code: "fr", label: "French",    dir: "ltr" },
  { code: "nl", label: "Dutch",     dir: "ltr" },
  { code: "ro", label: "Romanian",  dir: "ltr" },
].filter(l => !ONLY_LANG || l.code === ONLY_LANG);

// ─── Colours ──────────────────────────────────────────────────────────────────
const c = {
  reset:  "\x1b[0m", bold: "\x1b[1m",
  green:  "\x1b[32m", yellow: "\x1b[33m",
  red:    "\x1b[31m", cyan:   "\x1b[36m", grey: "\x1b[90m",
};
const ok    = s => `${c.green}${s}${c.reset}`;
const warn  = s => `${c.yellow}${s}${c.reset}`;
const info  = s => `${c.cyan}${s}${c.reset}`;
const muted = s => `${c.grey}${s}${c.reset}`;
const bold  = s => `${c.bold}${s}${c.reset}`;

// ─── Key/value extractor ──────────────────────────────────────────────────────
function extractKeyValues(src) {
  const result = {};
  const lines  = src.split("\n");
  const stack  = [{ indent: -1, name: "" }];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const nsMatch = line.match(/^(\s+)([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*\{/);
    if (nsMatch) {
      const indent = nsMatch[1].length;
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
      stack.push({ name: nsMatch[2], indent });
      i++; continue;
    }
    const leafMatch = line.match(/^(\s+)([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)/);
    if (leafMatch) {
      const indent = leafMatch[1].length;
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
      const ns  = stack.filter(s => s.name).map(s => s.name).join(".");
      const key = leafMatch[2];
      result[ns ? `${ns}.${key}` : key] = leafMatch[3].trimEnd();
    }
    i++;
  }
  return result;
}

// ─── Filter to plain strings only ─────────────────────────────────────────────
// Arrow functions and arrays require structural preservation that grammar
// checking can't safely handle. We only check plain quoted strings.
function isPlainString(val) {
  const s = val.trim();
  return (s.startsWith('"') || s.startsWith("'")) && !s.startsWith("(");
}

// Strip surrounding quotes for display / sending to Groq
function unquote(val) {
  return val.trim().replace(/^["']|["'],?$/g, "");
}

// Re-wrap in double quotes with trailing comma
function requote(val) {
  // Escape any unescaped double quotes inside
  const escaped = val.replace(/(?<!\\)"/g, '\\"');
  return `"${escaped}",`;
}

// ─── Groq call ────────────────────────────────────────────────────────────────
async function checkBatch(items, targetLabel, targetCode) {
  const apiKey = process.env.GROQAPIKEY;
  if (!apiKey) {
    console.error("\x1b[31mGROQAPIKEY env var not set.\x1b[0m");
    process.exit(1);
  }

  const isRTL = targetCode === "ar";

  const systemPrompt = `You are a professional translation quality reviewer for a SaaS journaling app called "Quiet Mirror".

App tone: warm, honest, quiet, non-performative. Not productivity-focused. No jargon or hustle language.
Target language: ${targetLabel}${isRTL ? " (RTL, Modern Standard Arabic)" : ""}.

You will receive an array of objects, each with:
  - key: the i18n key path (for reference)
  - english: the English source string
  - current: the existing ${targetLabel} translation

Your job: check each translation for:
1. Grammar and spelling errors in ${targetLabel}
2. Unnatural or awkward phrasing that a native speaker would not use
3. Translation accuracy — does it faithfully convey the English meaning?
4. Tone consistency — warm, honest, quiet (never clinical, never pushy)

Rules:
- "Quiet Mirror" is NEVER translated — keep it exactly as "Quiet Mirror" in every string
- UI symbols (←, →, …, ·) and placeholder variables (\${n}, \${appName}) must be preserved exactly
- If a translation is already correct and natural, return null for that key
- Only return a corrected string when there is a genuine improvement to make
- Do NOT change a translation just to make it more literal — natural language matters more
- Return ONLY a valid JSON object: { "key.path": "corrected string" | null, ... }
- No markdown, no backtick fences, no explanation — raw JSON only`;

  const userPrompt = JSON.stringify(items, null, 2);

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model:       process.env.GROQMODEL || "llama-4-scout-17b-16e-instruct",
      max_tokens:  4096,
      temperature: 0.1,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt   },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Groq API error ${response.status}: ${body.slice(0, 200)}`);
  }

  const data = await response.json();
  const raw  = data.choices?.[0]?.message?.content ?? "";

  // Robust JSON extraction — find first { ... }
  const start = raw.indexOf("{");
  const end   = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object in Groq response");

  let parsed;
  try {
    parsed = JSON.parse(raw.slice(start, end + 1));
  } catch {
    throw new Error(`JSON parse failed. Raw: ${raw.slice(0, 300)}`);
  }

  return parsed;
}

// ─── File patcher ─────────────────────────────────────────────────────────────
// Replaces the value of a specific key in the locale file source.
// Finds the key by its leaf name within its namespace block, replaces the value.
function applyCorrections(src, corrections, enKeys) {
  let patched = src;
  const applied = [];

  for (const [fullKey, correctedText] of Object.entries(corrections)) {
    if (correctedText === null) continue;

    const parts  = fullKey.split(".");
    const leafKey = parts[parts.length - 1];

    // Find the line containing this key assignment
    // Match: optional whitespace + leafKey + : + old value
    const lineRegex = new RegExp(
      `^([ \\t]+${leafKey}\\s*:\\s*)("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'),?`,
      "m"
    );
    const match = lineRegex.exec(patched);
    if (!match) {
      console.warn(warn(`  ⚠ Could not locate "${fullKey}" in source — skipping`));
      continue;
    }

    const oldLine = match[0];
    const indent  = match[1];
    const newLine = `${indent}${requote(correctedText)}`;

    patched = patched.slice(0, match.index) + newLine + patched.slice(match.index + oldLine.length);
    applied.push({
      key:     fullKey,
      before:  unquote(match[2]),
      after:   correctedText,
      english: unquote(enKeys[fullKey] ?? ""),
    });
  }

  return { patched, applied };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n" + bold("Quiet Mirror — i18n grammar & translation quality check"));
  console.log(muted("─".repeat(65)));
  console.log(muted(`Mode: ${DRY_RUN ? "DRY RUN (report only, no file writes)" : "WRITE (corrections applied)"}`));
  if (ONLY_LANG) console.log(info(`Language filter: ${ONLY_LANG}`));
  console.log("");

  // Load English reference
  const enSrc  = fs.readFileSync(path.join(I18N_DIR, "en.ts"), "utf8");
  const enKeys = extractKeyValues(enSrc);

  // Group English keys by top-level namespace for batching
  const byNs = {};
  for (const [k, v] of Object.entries(enKeys)) {
    if (!isPlainString(v)) continue;
    const ns = k.split(".")[0];
    if (!byNs[ns]) byNs[ns] = [];
    byNs[ns].push(k);
  }
  const namespaces = Object.keys(byNs);

  // Report structure: { locale: [{ key, before, after, english }] }
  const allCorrections = {};
  let totalFixed = 0;

  for (const locale of LOCALES) {
    console.log(bold(`\n→ ${locale.code} (${locale.label})`));
    console.log(muted(`  Checking ${Object.keys(enKeys).filter(k => isPlainString(enKeys[k])).length} plain strings across ${namespaces.length} namespaces...`));

    const filePath  = path.join(I18N_DIR, `${locale.code}.ts`);
    let   localeSrc = fs.readFileSync(filePath, "utf8");
    const localeKeys = extractKeyValues(localeSrc);

    const localeCorrections = {};
    let nsCount = 0;

    for (const ns of namespaces) {
      nsCount++;
      process.stdout.write(muted(`  [${nsCount}/${namespaces.length}] ${ns}...`));

      // Build batch: keys in this namespace that have plain string values in both en + locale
      const items = byNs[ns]
        .filter(k => localeKeys[k] && isPlainString(localeKeys[k]))
        .map(k => ({
          key:     k,
          english: unquote(enKeys[k]),
          current: unquote(localeKeys[k]),
        }));

      if (items.length === 0) {
        process.stdout.write(muted(" skipped (no plain strings)\n"));
        continue;
      }

      let result;
      try {
        result = await checkBatch(items, locale.label, locale.code);
      } catch (e) {
        process.stdout.write(warn(` ✗ ${e.message}\n`));
        continue;
      }

      // Count non-null corrections
      const fixes = Object.entries(result).filter(([, v]) => v !== null);
      process.stdout.write(fixes.length > 0
        ? ok(` ${fixes.length} correction(s)\n`)
        : muted(` ✓\n`));

      for (const [k, v] of fixes) {
        localeCorrections[k] = v;
      }
    }

    const fixCount = Object.keys(localeCorrections).length;
    allCorrections[locale.code] = localeCorrections;

    if (fixCount === 0) {
      console.log(ok(`  ✅ ${locale.label}: no corrections needed`));
      continue;
    }

    console.log(warn(`  ⚠  ${locale.label}: ${fixCount} correction(s) found`));

    if (!DRY_RUN) {
      const { patched, applied } = applyCorrections(localeSrc, localeCorrections, enKeys);
      fs.writeFileSync(filePath, patched, "utf8");
      totalFixed += applied.length;
      allCorrections[locale.code] = applied; // store full detail for report
      applied.forEach(({ key, before, after }) => {
        console.log(muted(`    ${key}:`));
        console.log(muted(`      before: ${before.slice(0, 70)}`));
        console.log(ok(`      after:  ${after.slice(0, 70)}`));
      });
    } else {
      // Dry run: show what would change
      Object.entries(localeCorrections).forEach(([k, v]) => {
        console.log(muted(`    ${k}:`));
        console.log(muted(`      current: ${unquote(localeKeys[k]).slice(0, 70)}`));
        console.log(warn(`      would be: ${v.slice(0, 70)}`));
      });
    }
  }

  // ─── Write report ──────────────────────────────────────────────────────────
  const reportPath = path.join(ROOT, "corrections-report.md");
  const ts = new Date().toISOString().slice(0, 16).replace("T", " ");

  let report = `# i18n Grammar & Translation Corrections — ${ts}\n\n`;
  report += `**Mode:** ${DRY_RUN ? "Dry run (no files changed)" : "Corrections applied"}\n`;
  report += `**Locales checked:** ${LOCALES.map(l => l.code).join(", ")}\n\n`;

  let hasAny = false;
  for (const locale of LOCALES) {
    const fixes = allCorrections[locale.code];
    if (!fixes || Object.keys(fixes).length === 0) {
      report += `## ${locale.code} (${locale.label})\n\n✅ No corrections needed.\n\n`;
      continue;
    }
    hasAny = true;
    report += `## ${locale.code} (${locale.label})\n\n`;
    const entries = Array.isArray(fixes)
      ? fixes
      : Object.entries(fixes).map(([key, after]) => ({ key, after, before: "—", english: "" }));
    for (const { key, before, after, english } of entries) {
      report += `### \`${key}\`\n`;
      if (english) report += `- **English:** ${english}\n`;
      report += `- **Before:** ${before}\n`;
      report += `- **After:** ${after}\n\n`;
    }
  }

  if (!hasAny) {
    report += `\n✅ All translations look correct. No corrections needed.\n`;
  }

  fs.writeFileSync(reportPath, report, "utf8");
  console.log(info(`\n📄 Report written to corrections-report.md`));

  if (!DRY_RUN && totalFixed > 0) {
    console.log(ok(bold(`\n✅ Done. ${totalFixed} correction(s) applied across locale files.`)));
    console.log(warn("⚠  Review git diff app/lib/i18n/ before committing."));
    // Exit 2 = corrections were made (used by GitHub Action to decide whether to open a PR)
    process.exit(2);
  } else if (DRY_RUN) {
    console.log(bold("\nDry run complete. No files were changed."));
  } else {
    console.log(ok(bold("\n✅ All translations already correct. Nothing to change.")));
  }
  // Exit 0 = nothing changed
}

main().catch(e => {
  console.error(`\x1b[31mFatal: ${e.message}\x1b[0m`);
  process.exit(1);
});
