// Synthetic Supabase HTTP fixture for isolated Playwright UI tests.
// Bind to loopback only. No real credentials, external services or writes.
import { createServer } from 'node:http'

const port = Number(process.env.E2E_MOCK_SUPABASE_PORT || 9876)
const origin = 'http://127.0.0.1:8081'
const headers = {
  'content-type': 'application/json; charset=utf-8',
  'access-control-allow-origin': origin,
  'access-control-allow-methods': 'GET, POST, HEAD, OPTIONS',
  'access-control-allow-headers': 'apikey, authorization, content-type, x-client-info, prefer',
  'access-control-expose-headers': 'content-range',
  'cache-control': 'no-store',
}

function send(res, code, json) {
  res.writeHead(code, { ...headers, 'content-range': '0-0/0' })
  res.end(JSON.stringify(json))
}

const server = createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  if (req.method === 'OPTIONS') return send(res, 200, {})
  if (url.pathname === '/_fixture/health') return send(res, 200, { status: 'ok' })

  // Never mint sessions. Unauthenticated users must remain unauthenticated.
  if (url.pathname.startsWith('/auth/v1/')) {
    return send(res, req.method === 'GET' ? 401 : 400, {
      code: 'invalid_credentials',
      error: 'invalid_grant',
      msg: 'Invalid login credentials',
      message: 'Invalid login credentials',
    })
  }

  if (req.method === 'GET' && url.pathname.startsWith('/rest/v1/')) {
    return send(res, 200, [])
  }
  const rpc = /^\/rest\/v1\/rpc\/(discover_professionals|discover_spaces|discover_events|discover_communities)$/
  if (req.method === 'POST' && rpc.test(url.pathname)) return send(res, 200, [])
  // Test-only service: do not accept arbitrary data mutation.
  return send(res, 403, { code: 'mock_write_denied', message: 'Synthetic E2E fixture is read-only' })
})

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`Mock Supabase listening on 127.0.0.1:${port}\n`)
})
