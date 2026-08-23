#!/usr/bin/env node
// Deterministic i18n safety gate. Never rewrites translations.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),"..");
const dir=path.join(root,"app","lib","i18n");
const locales=[{code:"uk",dir:"ltr"},{code:"ar",dir:"rtl"},{code:"fr",dir:"ltr"},{code:"nl",dir:"ltr"},{code:"ro",dir:"ltr"}];
function extract(src){const out={};const stack=[{indent:-1,name:""}];const lines=src.split("\n");for(const line of lines){const ns=line.match(/^(\s+)([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*\{/);if(ns){const n=ns[1].length;while(stack.length>1&&stack.at(-1).indent>=n)stack.pop();stack.push({name:ns[2],indent:n});continue;}const leaf=line.match(/^(\s+)([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)/);if(leaf){const n=leaf[1].length;while(stack.length>1&&stack.at(-1).indent>=n)stack.pop();const ns=stack.filter(x=>x.name).map(x=>x.name).join(".");out[ns?ns+"."+leaf[2]:leaf[2]]=leaf[3].trimEnd();}}return out;}
const unquote=v=>v.trim().replace(/,\s*$/,"").replace(/^("|')(.*)\1$/s,"$2");
const isPlain=v=>{const s=v.trim();return (s.startsWith("\"")||s.startsWith("'"))&&!s.startsWith("(");};
const placeholders=s=>(s.match(/\$\{[^}]+\}/g)||[]).map(x=>{const body=x.slice(2,-1).replace(/(["\']).*?\1/g,"");return [...new Set(body.match(/\b[a-zA-Z_$][\w$]*\b/g)||[])].filter(v=>!new Set(["true","false","null","undefined"]).has(v)).sort();}).flat().filter(v=>v.length<=30);
const tags=s=>(s.match(/<\/?[a-zA-Z][^>]*>/g)||[]).map(x=>x.replace(/\s+/g," ")).join("|");
const ending=s=>{const m=s.match(/([←→…·])\s*$/);return m?.[1]||"";};
const en=extract(fs.readFileSync(path.join(dir,"en.ts"),"utf8"));let errors=0,warns=0;
for(const l of locales){const file=path.join(dir,l.code+".ts");const vals=extract(fs.readFileSync(file,"utf8"));const missing=Object.keys(en).filter(k=>!(k in vals));const extra=Object.keys(vals).filter(k=>!(k in en));for(const k of missing) {console.error(l.code+" missing "+k);errors++;}for(const k of extra){console.error(l.code+" extra "+k);errors++;}for(const [k,raw] of Object.entries(en)){if(!(k in vals))continue;if(!isPlain(raw)||!isPlain(vals[k]))continue;const a=unquote(raw),b=unquote(vals[k]);if(!b.trim()){console.warn(l.code+" empty optional value "+k);warns++;continue;}const required=[...new Set(placeholders(a))];const actual=new Set(placeholders(b));if(required.some(v=>!actual.has(v))){console.error(l.code+" placeholder mismatch "+k+" missing ["+required.filter(v=>!actual.has(v)).join(", ")+"]");errors++;}if(tags(a)!==tags(b)){console.error(l.code+" markup mismatch "+k);errors++;}if(ending(a)&&!ending(b)) {console.error(l.code+" missing terminal symbol "+k+" expected "+ending(a));errors++;}if(a.includes("Quiet Mirror")&&!b.includes("Quiet Mirror")&&!b.includes("appName")){console.error(l.code+" brand changed "+k);errors++;}}
if(l.dir==="rtl"){const plain=Object.values(vals).filter(v=>/^(["']).*\1,?$/.test(v)).map(unquote);const arabic=plain.filter(v=>/[\u0600-\u06ff]/.test(v)).length;if(arabic<20){console.error(l.code+" unexpectedly has too few Arabic strings ("+arabic+")");errors++;}}
console.log(l.code+" checked "+Object.keys(vals).length+" keys");}
if(errors){console.error("\nFAIL: "+errors+" deterministic i18n error(s)");process.exit(1);}console.log("\nPASS: deterministic i18n safety checks passed for all locales.");
