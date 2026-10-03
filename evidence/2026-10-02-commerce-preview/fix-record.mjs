// Re-append the new entry textually so earlier JSON (e.g. "13.00") stays byte-identical.
import { readFileSync, writeFileSync } from "node:fs";
const dir = "C:/PROJECTS/kpt-underground/";
const original = readFileSync(dir + "evidence/2026-10-02-commerce-preview/report-backups/execution-record.before-2026-10-02.json", "utf8");
const current = JSON.parse(readFileSync(dir + "execution-record.json", "utf8"));
const entries = current.commerceDesignPreviewChecks;
const body = original.replace(/\s*}\s*$/, "");
const block = JSON.stringify(entries, null, 2).split("\n").map((l, i) => (i === 0 ? l : "  " + l)).join("\n");
const out = `${body},\n  "commerceDesignPreviewChecks": ${block}\n}\n`;
JSON.parse(out); // validate
if (!out.startsWith(body)) throw new Error("prefix changed");
writeFileSync(dir + "execution-record.json", out);
console.log("ok", out.length);
