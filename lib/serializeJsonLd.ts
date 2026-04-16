/**
 * Safely serializes a JSON-LD object for use in dangerouslySetInnerHTML.
 *
 * Escapes <, >, and & with their Unicode equivalents so that an attacker
 * who somehow controls a field value cannot inject a closing </script> tag
 * and break out of the JSON-LD block.
 *
 * The escapes are valid JSON (RFC 8259) and are parsed correctly by all
 * browsers and search engine crawlers (Google, Bing, etc.).
 *
 * Usage:
 *   <script
 *     type="application/ld+json"
 *     dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
 *   />
 *
 * Reference: https://cheatsheetseries.owasp.org/cheatsheets/XSS_Prevention_Cheat_Sheet.html
 */
export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
