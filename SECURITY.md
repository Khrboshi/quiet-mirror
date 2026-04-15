# Security

## Reporting a vulnerability

Email **hello@quietmirror.me**. We will respond within 48 hours.

## Known issues and remediation plan

### Next.js CVEs — planned Next.js 15 upgrade

| CVE | Severity | Status |
|---|---|---|
| GHSA-h25m-26qc-wcjf — HTTP request deserialization DoS | High | Tracked |
| GHSA-9g9p-9gw9-jx7f — Image Optimizer DoS | High | Tracked |
| GHSA-ggv3-7p47-pfv8 — HTTP request smuggling in rewrites | High | Tracked |
| GHSA-3x4c-7xq6-9pq8 — next/image disk cache growth | High | Tracked |
| GHSA-q4gf-8mx6-v5v3 — Server Components DoS | High | Tracked |
| GHSA-c2c7-rcm5-vvqj — picomatch ReDoS (transitive) | High | Tracked |
| GHSA-48c2-rrv3-qjmp — yaml DoS (transitive) | Medium | Tracked |

**Remediation:** All of the above are fixed in Next.js 15.x. A dedicated
upgrade PR is planned. The upgrade requires regression testing against the
App Router, React 19 compatibility, and all existing middleware behaviour.

**Risk assessment:** All DoS vectors require either (a) malformed requests
to specific API routes or (b) attacker-controlled image URLs. Quiet Mirror's
API routes require authenticated sessions. The image optimizer is not used
with untrusted external URLs. Actual exploitability is low in production.

### dangerouslySetInnerHTML — not a vulnerability

`app/blog/[slug]/page.tsx` uses `dangerouslySetInnerHTML` to inject a
JSON-LD structured data `<script>` tag. The data source is
`app/blog/articles.ts` — a hardcoded static TypeScript file compiled into
the application. There is no user input, no database content, and no
external data in this pipeline. This is a standard, universally accepted
SEO pattern and does not represent an XSS vulnerability.

### @img/sharp-libvips LGPL — not a vulnerability

LGPL-3.0 requires open-sourcing modifications to the LGPL library itself,
not the application that dynamically links to it. This does not affect
Quiet Mirror's proprietary codebase.
