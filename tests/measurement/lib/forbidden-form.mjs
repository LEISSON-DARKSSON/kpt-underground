// Scanner for contact-capture forms. This shop collects no email, name or phone on its own pages (the
// hosted checkout does that on Fourthwall), so any such form on our pages is a finding.
// The patterns are built from plain strings WITHOUT control characters: an earlier regex used a backspace
// (a raw "\b" inside a string) and silently matched nothing. `assertNoControlCharacters` guards that.

const FIELD_HINT = "(e-?mail|newsletter|sign-?up|subscribe|phone|tel|first-?name|last-?name|full-?name)";
const WB = String.raw`\b`; // a real word-boundary token, never the backspace character

export const PATTERNS = {
  // any form except a search box (the shop's own catalog search is not contact capture)
  formTag: new RegExp(String.raw`<form(?![^>]*role\s*=\s*["']search["'])[\s>]`, "i"),
  emailInput: new RegExp(String.raw`<input[^>]*type\s*=\s*["']?(email|tel)["']?`, "i"),
  hintedField: new RegExp(String.raw`<(input|textarea|select)[^>]*(name|id|autocomplete|placeholder)\s*=\s*["'][^"']*${WB}${FIELD_HINT}${WB}`, "i"),
};

export function assertNoControlCharacters() {
  for (const [name, re] of Object.entries(PATTERNS)) {
    for (const ch of re.source) {
      if (ch.charCodeAt(0) < 32) throw new Error(`pattern ${name} contains control character ${ch.charCodeAt(0)}`);
    }
  }
}

/** Returns the list of findings (empty = clean). */
export function findForbiddenForms(html) {
  assertNoControlCharacters();
  const findings = [];
  for (const [name, re] of Object.entries(PATTERNS)) if (re.test(html)) findings.push(name);
  return findings;
}
