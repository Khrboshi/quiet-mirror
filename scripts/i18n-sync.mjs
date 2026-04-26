#!/usr/bin/env node
// scripts/i18n-sync.mjs
//
// ┌─────────────────────────────────────────────────────────────────┐
// │  Quiet Mirror — i18n translation sync tool                      │
// │                                                                  │
// │  USAGE:                                                          │
// │    node scripts/i18n-sync.mjs                 ← audit missing keys (safe) │
// │    node scripts/i18n-sync.mjs --write         ← translate & write         │
// │    node scripts/i18n-sync.mjs --audit-values  ← flag values still in EN   │
// │                                                                  │
// │  REQUIRES:                                                       │
// │    GROQAPIKEY env var (same key the app uses)                    │
// │                                                                  │
// │  WHAT IT DOES:                                                   │
// │    1. Parses en.ts as the reference                              │
// │    2. Parses each of the 5 other locale files                    │
// │    3. Finds keys present in en.ts but missing from a locale      │
// │    4. In audit mode  → prints a report and exits                 │
// │    5. In --write mode → calls Groq to translate missing keys,    │
// │       inserts them into the correct position in each locale file │
// │                                                                  │
// │  WHAT IT NEVER TOUCHES:                                          │
// │    - Existing translated strings (no silent overwrites)          │
// │    - Locale-specific helper functions (ukReflections etc.)       │
// │    - Keys that already exist in a locale                         │
// │    - The Translations interface in types.ts                      │
// └─────────────────────────────────────────────────────────────────┘

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.join(__dirname, "..");
const I18N_DIR  = path.join(ROOT, "app", "lib", "i18n");
const WRITE         = process.argv.includes("--write");
const AUDIT_VALUES  = process.argv.includes("--audit-values");

// Words that are legitimately identical across languages — international tech/brand terms,
// letter labels, symbols, and words borrowed from English into most target languages.
// A value matching English AND in this set is NOT flagged as untranslated.
const INTL_OK = new Set([
  // Brand term — intentionally kept in English in all locales
  "Premium",
  // Tech/product terms used internationally
  "Blog", "Dashboard", "Account", "Status", "Contact", "Upgrade",
  "Tools", "Product", "Legal", "Plan:", "Fitness", "Momentum",
  "Communication", "Journaling",
  // Finance/billing terms identical across languages
  "Transactions", "credits:",
  // French/Dutch/Romanian words identical to English spelling
  "Journal",       // French word
  "Date",          // French/Dutch word
  "Active",        // French feminine form
  "Option A", "Option B",  // letter labels — same everywhere
  "Later",         // Dutch word identical
  // Symbols and placeholders — legitimately same in all languages
  "you@example.com",
  "/ mo",
  // Brand name fragments that must stay Latin
  "Quiet Mirror is",
]);

const LOCALES = [
  { code: "uk", label: "Ukrainian (Українська)",    dir: "ltr" },
  { code: "ar", label: "Arabic (العربية)",           dir: "rtl" },
  { code: "fr", label: "French (Français)",          dir: "ltr" },
  { code: "nl", label: "Dutch (Nederlands)",         dir: "ltr" },
  { code: "ro", label: "Romanian (Română)",          dir: "ltr" },
];

// ─── Colours ──────────────────────────────────────────────────────────────────
const c = {
  reset:  "\x1b[0m",
  bold:   "\x1b[1m",
  green:  "\x1b[32m",
  yellow: "\x1b[33m",
  red:    "\x1b[31m",
  cyan:   "\x1b[36m",
  grey:   "\x1b[90m",
};
const ok    = (s) => `${c.green}${s}${c.reset}`;
const warn  = (s) => `${c.yellow}${s}${c.reset}`;
const err   = (s) => `${c.red}${s}${c.reset}`;
const info  = (s) => `${c.cyan}${s}${c.reset}`;
const muted = (s) => `${c.grey}${s}${c.reset}`;
const bold  = (s) => `${c.bold}${s}${c.reset}`;

// ─── Key extraction ───────────────────────────────────────────────────────────
// Extracts { "namespace.key": "value or function source" } from a locale file.
// Handles:
//   key: "string"
//   key: (arg) => `template ${arg}`
//   key: (a, b) => `...`
//   key: readonly [...array...]  (starterPrompts, prompts array)
function extractKeyValues(src) {
  const result    = {};
  const lines     = src.split("\n");
  const nsStack   = [];   // [{name, indent}]
  let   i         = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Detect namespace open: "  keyName: {" or "  keyName: {"
    const nsMatch = line.match(/^(\s+)([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*\{/);
    if (nsMatch) {
      const indent = nsMatch[1].length;
      // Pop namespaces deeper than this indent
      while (nsStack.length && nsStack[nsStack.length - 1].indent >= indent) {
        nsStack.pop();
      }
      nsStack.push({ name: nsMatch[2], indent });
      i++;
      continue;
    }

    // Detect leaf key: "  key: value"
    const leafMatch = line.match(/^(\s+)([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)/);
    if (leafMatch) {
      const indent    = leafMatch[1].length;
      const key       = leafMatch[2];
      let   valueRaw  = leafMatch[3];

      // If the value starts with [ it's a multi-line array — collect until closing ]
      if (valueRaw.trimStart().startsWith("[")) {
        const valueParts = [valueRaw];
        while (!valueParts.join("").includes("]") && i + 1 < lines.length) {
          i++;
          valueParts.push(lines[i]);
        }
        valueRaw = valueParts.join("\n");
      }
      // If the value is a multi-line template literal — collect until backtick closes
      else if (valueRaw.trimStart().startsWith("(") && !valueRaw.includes("=>")) {
        // Arrow function spans multiple lines? Collect until we see =>` or end of fn
        const valueParts = [valueRaw];
        while (!valueParts.join("").match(/=>\s*[`"']/) && !valueParts.join("").match(/=>\s*\{/) && i + 1 < lines.length) {
          i++;
          valueParts.push(lines[i]);
          if (valueParts.length > 10) break; // safety
        }
        // Also collect the template body if it's a backtick spanning lines
        const joined = valueParts.join("\n");
        if ((joined.match(/`/g) || []).length % 2 !== 0) {
          while (i + 1 < lines.length) {
            i++;
            valueParts.push(lines[i]);
            if ((valueParts.join("\n").match(/`/g) || []).length % 2 === 0) break;
          }
        }
        valueRaw = valueParts.join("\n");
      }

      // Pop namespace stack to the right depth
      while (nsStack.length && nsStack[nsStack.length - 1].indent >= indent) {
        nsStack.pop();
      }

      const ns      = nsStack.map((n) => n.name).join(".");
      const fullKey = ns ? `${ns}.${key}` : key;
      result[fullKey] = valueRaw.trimEnd();
    }

    i++;
  }

  return result;
}

// ─── Diff ─────────────────────────────────────────────────────────────────────
function findMissing(enKeys, localeKeys) {
  return Object.keys(enKeys).filter((k) => !(k in localeKeys));
}

// ─── Groq translation ─────────────────────────────────────────────────────────
async function translateBatch(missingKeys, enKeys, targetLang, targetCode) {
  const apiKey = process.env.GROQAPIKEY;
  if (!apiKey) {
    console.error(err("GROQAPIKEY env var not set. Export it before running with --write."));
    process.exit(1);
  }

  // Build the payload: list of key + English value
  const items = missingKeys.map((k) => ({
    key:     k,
    english: enKeys[k],
  }));

  const isRTL = targetCode === "ar";

  const systemPrompt = `You are a professional translator working on a journaling SaaS app called "Quiet Mirror".
The app has a warm, honest, quiet tone. It is NOT productivity-focused. No jargon, no hustle culture language.
Brand name "Quiet Mirror" is NEVER translated — keep it exactly as-is in every string.

You will receive an array of i18n key-value pairs where values are TypeScript source code snippets.
Your job: translate ONLY the human-readable text inside each value. Preserve the TypeScript structure exactly.

Rules:
1. String values like "Back to dashboard" → translate the text, keep the quotes: "Înapoi la panou"
2. Arrow functions like (n) => \`${n} reflections\` → translate only the text parts, keep the JS: (n) => \`${n} reflecții\`
3. Arrow functions with ternary like (n) => \`${n} \${n===1?"word":"words"}\` → translate "word" and "words", keep the ternary
4. Template literals with ${placeholders} → keep all \${...} expressions untouched, translate surrounding text
5. Arrays like ["string1","string2"] → translate each string inside
6. The brand name "Quiet Mirror" → NEVER translate, keep exactly as "Quiet Mirror"
7. Punctuation like "…" "←" "→" "·" → keep as-is unless the target language convention differs
8. Return ONLY a valid JSON object: { "namespace.key": "translated TypeScript value", ... }
9. No markdown, no backtick fences, no explanation — just the raw JSON object
${isRTL ? "10. Target language is RTL Arabic. Use Modern Standard Arabic with a warm, human tone." : ""}

Target language: ${targetLang}`;

  const userPrompt = JSON.stringify(items, null, 2);

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model:       process.env.GROQMODEL || "llama-4-scout-17b-16e-instruct",
      max_tokens:  8192,
      temperature: 0.1,   // low — we want consistent, accurate translation, not creativity
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt   },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Groq API error ${response.status}: ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  const raw  = data.choices?.[0]?.message?.content ?? "";

  // Extract the first top-level JSON object, tolerating any leading/trailing
  // text or markdown fences the model might emit.
  const start = raw.indexOf("{");
  const end   = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    console.error(err("Groq response contains no JSON object. Raw output:"));
    console.error(muted(raw.slice(0, 500)));
    throw new Error("No JSON object found in response");
  }
  const clean = raw.slice(start, end + 1);

  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch {
    console.error(err("Failed to parse Groq response as JSON. Raw output:"));
    console.error(muted(raw.slice(0, 500)));
    throw new Error("JSON parse failed");
  }

  return parsed; // { "namespace.key": "translated value", ... }
}

// ─── File patching ────────────────────────────────────────────────────────────
// Inserts translated keys into the right namespace in the locale file.
// Strategy: for each missing key, find the namespace block in the file and
// append the key just before the closing `},` of that namespace.
function patchLocaleFile(filePath, translations, enKeyValues) {
  let src = fs.readFileSync(filePath, "utf8");

  // Group by namespace
  const byNs = {};
  for (const [fullKey, value] of Object.entries(translations)) {
    const parts = fullKey.split(".");
    const ns    = parts.slice(0, -1).join(".");
    const key   = parts[parts.length - 1];
    if (!byNs[ns]) byNs[ns] = [];
    byNs[ns].push({ key, value, fullKey });
  }

  let changeCount = 0;

  for (const [ns, keys] of Object.entries(byNs)) {
    // Find the namespace block in the source, supporting nested namespaces.
    // e.g. "insights.momentumDescriptions.Heavy" drills through
    //   insights: { → momentumDescriptions: { → finds the closing } of momentumDescriptions
    const nsParts = ns.split(".");

    // Walk through each namespace segment to find the correct insertion point.
    // searchFrom tracks where to start looking for the next segment.
    let searchFrom = 0;
    let nsStart    = -1;
    for (const segment of nsParts) {
      const segRegex = new RegExp(`(^|\n)([ \t]*)${segment}\s*:\s*\{`);
      const match    = src.slice(searchFrom).match(segRegex);
      if (!match) { nsStart = -1; break; }
      nsStart    = searchFrom + src.slice(searchFrom).indexOf(match[0]) + match[0].indexOf(segment);
      searchFrom = searchFrom + src.slice(searchFrom).indexOf(match[0]) + match[0].length;
    }

    if (nsStart === -1) {
      console.warn(warn(`  ⚠ Namespace "${ns}" not found in ${path.basename(filePath)} — skipping`));
      continue;
    }

    // Find the closing of this (possibly nested) namespace block.
    // Walk forward from where the last segment's opening brace was found.
    let depth    = 0;
    let nsEnd    = -1;
    let inString = false;
    let strChar  = "";

    for (let j = searchFrom - 1; j < src.length; j++) {
      const ch   = src[j];
      const prev = src[j - 1];

      if (inString) {
        if (ch === strChar && prev !== "\\") inString = false;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === "`") { inString = true; strChar = ch; continue; }

      if (ch === "{") depth++;
      if (ch === "}") {
        depth--;
        if (depth === 0) { nsEnd = j; break; }
      }
    }

    if (nsEnd === -1) {
      console.warn(warn(`  ⚠ Could not find closing brace for namespace "${ns}" — skipping`));
      continue;
    }

    // Build the insertion block — each new key as a line
    // Determine indentation: look at existing keys in the namespace
    const nsBlock   = src.slice(nsStart, nsEnd);
    const indentMatch = nsBlock.match(/\n(\s+)\w+:/);
    const indent    = indentMatch ? indentMatch[1] : "    ";

    const newLines = keys.map(({ key, value }) => {
      // Get the English value to add as a comment for review
      const enVal = enKeyValues[`${ns}.${key}`] ?? "";
      const enComment = enVal.length < 80
        ? ` // EN: ${enVal.replace(/\n/g, " ")}`
        : "";
      return `${indent}${key}: ${value},${enComment}`;
    });

    const insertion = "\n" + newLines.join("\n");

    // Insert just before the closing brace of this namespace
    src = src.slice(0, nsEnd) + insertion + "\n" + src.slice(nsEnd);
    changeCount += keys.length;
  }

  if (changeCount > 0) {
    fs.writeFileSync(filePath, src, "utf8");
  }

  return changeCount;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n" + bold("Quiet Mirror — i18n sync tool"));
  console.log(muted("─".repeat(60)));
  console.log(muted(`Mode: ${WRITE ? "WRITE (translate + patch files)" : "AUDIT (read-only)"}\n`));

  // 1. Parse en.ts
  const enPath = path.join(I18N_DIR, "en.ts");
  const enSrc  = fs.readFileSync(enPath, "utf8");
  const enKeys = extractKeyValues(enSrc);
  console.log(info(`English reference: ${Object.keys(enKeys).length} keys across en.ts`));

  // 2. Per-locale diff
  let totalMissing = 0;
  const perLocale  = [];

  for (const locale of LOCALES) {
    const filePath   = path.join(I18N_DIR, `${locale.code}.ts`);
    const src        = fs.readFileSync(filePath, "utf8");
    const localeKeys = extractKeyValues(src);
    const missing    = findMissing(enKeys, localeKeys);
    totalMissing    += missing.length;
    perLocale.push({ ...locale, filePath, missing });

    if (missing.length === 0) {
      console.log(ok(`  ✅ ${locale.code} (${locale.label}) — complete`));
    } else {
      console.log(warn(`  ⚠  ${locale.code} (${locale.label}) — ${missing.length} missing keys`));
      missing.forEach((k) => console.log(muted(`       • ${k}`)));
    }
  }

  console.log("");

  // ── --audit-values mode ──────────────────────────────────────────────────────
  if (AUDIT_VALUES) {
    console.log("");
    console.log(bold("Scanning for locale values that are still in English..."));
    console.log(muted("(Values in the INTL_OK allowlist are skipped — they are intentionally identical)"));
    console.log("");
    let totalSuspect = 0;
    for (const locale of LOCALES) {
      const filePath   = path.join(I18N_DIR, `${locale.code}.ts`);
      const localeKeys = extractKeyValues(fs.readFileSync(filePath, "utf8"));
      const suspect    = [];
      for (const [k, enVal] of Object.entries(enKeys)) {
        const locVal = localeKeys[k];
        if (!locVal || locVal !== enVal) continue;
        // Skip function-valued and array-valued keys (too complex to diff meaningfully)
        // Strip trailing comma and quotes (raw TS source includes them)
        const stripped = enVal.replace(/["'`]/g, "").replace(/,\s*$/, "").trim();
        if (stripped.length < 3)         continue; // symbols
        if (/^\(/.test(stripped))        continue; // arrow functions
        if (/^(readonly )?\[/.test(stripped)) continue; // arrays
        if (INTL_OK.has(stripped))       continue; // whitelisted international terms
        suspect.push({ k, val: stripped.slice(0, 60) });
      }
      totalSuspect += suspect.length;
      if (suspect.length === 0) {
        console.log(ok(`  ✅ ${locale.code} — no untranslated values found`));
      } else {
        console.log(warn(`  ⚠  ${locale.code} (${locale.label}) — ${suspect.length} value(s) still in English:`));
        suspect.forEach(({ k, val }) => console.log(muted(`       ${k} = "${val}"`)));
      }
    }
    console.log("");
    if (totalSuspect === 0) {
      console.log(ok(bold("All locale values look translated.")));
    } else {
      console.log(warn(`${totalSuspect} value(s) may need translation.`));
      console.log(muted("Review each one — some may be legitimately international words."));
      console.log(muted("To suppress a word, add it to the INTL_OK set in scripts/i18n-sync.mjs."));
    }
    console.log("");
    return;
  }

  if (totalMissing === 0) {
    console.log(ok(bold("All 6 locales are in sync. Nothing to do.")));
    console.log("");
    return;
  }

  if (!WRITE) {
    console.log(warn(`${totalMissing} missing key(s) found across all locales.`));
    console.log(muted("Run with --write to auto-translate and patch the locale files."));
    console.log(muted("  node scripts/i18n-sync.mjs --write"));
    console.log("");
    // Exit code 2 = missing translations found (machine-readable for CI).
    // Exit code 0 = all in sync.  Exit code 1 = unexpected error (caught below).
    process.exit(2);
  }

  // 3. --write mode: translate and patch each locale
  console.log(info("Translating and patching locale files...\n"));

  for (const { code, label, filePath, missing } of perLocale) {
    if (missing.length === 0) continue;

    console.log(bold(`→ ${code} (${label}) — translating ${missing.length} key(s)...`));

    // Build { key: englishValue } map for missing keys
    const missingEnValues = {};
    for (const k of missing) missingEnValues[k] = enKeys[k];

    // Translate in one batch (Groq handles the full list)
    let translated;
    try {
      translated = await translateBatch(missing, enKeys, label, code);
    } catch (e) {
      console.error(err(`  ✗ Translation failed for ${code}: ${e.message}`));
      continue;
    }

    // Validate: filter out any unexpected keys Groq may have hallucinated,
    // and warn about any requested keys that were not returned.
    const requestedSet  = new Set(missing);
    const filteredTranslation = Object.fromEntries(
      Object.entries(translated).filter(([k]) => requestedSet.has(k))
    );
    const missingFromResponse = missing.filter((k) => !(k in filteredTranslation));
    if (missingFromResponse.length > 0) {
      console.warn(warn(`  ⚠ Groq didn't return ${missingFromResponse.length} key(s) — they will be skipped:`));
      missingFromResponse.forEach((k) => console.warn(muted(`    • ${k}`)));
    }

    // Patch the file
    const patched = patchLocaleFile(filePath, filteredTranslation, enKeys);
    console.log(ok(`  ✓ Wrote ${patched} key(s) to ${path.basename(filePath)}`));

    // Show what was added
    for (const [k, v] of Object.entries(translated)) {
      const display = v.replace(/\n/g, " ").slice(0, 70);
      console.log(muted(`    ${k}: ${display}`));
    }
    console.log("");
  }

  console.log(bold("Done."));
  console.log(warn("⚠  Review the changes before committing — auto-translations should be"));
  console.log(warn("   checked by a native speaker, especially for function-valued keys."));
  console.log(muted("   Run: git diff app/lib/i18n/"));
  console.log("");
}

main().catch((e) => {
  console.error(err(`Fatal: ${e.message}`));
  process.exit(1);
});
