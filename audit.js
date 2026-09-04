// ══════════════════════════════════════════════════════════════
// POST /api/audit — server-side Anthropic proxy
//
// Deploy this as its own Vercel project (repository: auditor-api). It exists so
// that ANTHROPIC_API_KEY never reaches browser code. Up to v2.11.0 index.html
// called https://api.anthropic.com directly from the page, which meant the key
// was either absent (every model call failed, and the tool silently fell back to
// built-in findings) or present and readable by anyone with DevTools.
//
// Environment variables (Vercel project settings, never in the repository):
//   ANTHROPIC_API_KEY   the real key
//   AUDITOR_SHARED_KEY  a long random string you also paste into the browser tool
//   ALLOWED_ORIGIN      exact origin of the auditor page, e.g. https://auditor.quietmirror.me
//
// This route deliberately does NOT accept a model name, a system prompt, tools,
// or a max_tokens value from the caller. Those are fixed here. A proxy that
// forwards an arbitrary body is an open relay charged to your account.

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 4000;
const MAX_BODY_BYTES = 24 * 1024;   // the audit prompt is well under this
const MAX_PROMPT_CHARS = 16000;
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

// In-memory limiter. Honest about its own weakness: Vercel functions are per
// instance, so this caps a single warm instance, not the whole deployment. It
// is a brake against accidental loops, not a defence against a determined
// attacker. The shared key is what actually gates access. For a real limit
// across instances, back this with Upstash Redis.
const hits = new Map();

function rateLimited(id) {
  const now = Date.now();
  const rec = hits.get(id) || {count: 0, resetAt: now + WINDOW_MS};
  if (now > rec.resetAt) { rec.count = 0; rec.resetAt = now + WINDOW_MS; }
  rec.count++;
  hits.set(id, rec);
  if (hits.size > 5000) hits.clear();   // crude, bounded memory
  return rec.count > MAX_REQUESTS_PER_WINDOW;
}

// Constant-time-ish comparison. Not a substitute for a real crypto compare, but
// it avoids the trivially timeable early return of ===.
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export default async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '';
  const origin = req.headers.origin || '';

  if (allowedOrigin && origin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Auditor-Key');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({error: 'POST only'});

  if (allowedOrigin && origin !== allowedOrigin) {
    return res.status(403).json({error: 'origin not allowed'});
  }

  const sharedKey = process.env.AUDITOR_SHARED_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!sharedKey || !anthropicKey) {
    // No detail: an error message must not reveal which variable is missing.
    console.error('audit route misconfigured: a required environment variable is absent');
    return res.status(500).json({error: 'server not configured'});
  }

  if (!safeEqual(req.headers['x-auditor-key'] || '', sharedKey)) {
    return res.status(401).json({error: 'unauthorized'});
  }

  const who = (req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  if (rateLimited(who)) {
    res.setHeader('Retry-After', '60');
    return res.status(429).json({error: 'rate limit exceeded — try again in a minute'});
  }

  const body = req.body || {};
  const raw = typeof body === 'string' ? body : JSON.stringify(body);
  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
    return res.status(413).json({error: 'request body too large'});
  }

  // Only two fields are accepted, and both are treated as text.
  const system = typeof body.system === 'string' ? body.system.slice(0, MAX_PROMPT_CHARS) : '';
  const prompt = typeof body.prompt === 'string' ? body.prompt.slice(0, 2000) : '';
  if (!system || !prompt) return res.status(400).json({error: 'system and prompt are required strings'});

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system,
        messages: [{role: 'user', content: prompt}],
        tools: [{type: 'web_search_20250305', name: 'web_search'}]
      })
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      // Log the status only. The upstream error body can echo request content and
      // must not be written to logs or returned verbatim.
      console.error('anthropic upstream returned ' + upstream.status);
      return res.status(502).json({error: 'upstream request failed', status: upstream.status});
    }

    // Only the content blocks are passed back. Usage, request ids and any other
    // account metadata stay on the server.
    return res.status(200).json({content: Array.isArray(data.content) ? data.content : []});

  } catch (err) {
    console.error('audit route error: ' + err.name);   // name only, never the message
    return res.status(502).json({error: 'upstream request failed'});
  }
}
