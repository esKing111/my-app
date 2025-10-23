import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/pages/[id] -> returns text/html dynamic page for a Message
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await context.params
  const id = Number(idParam)
  if (Number.isNaN(id)) {
    return new Response('<h1>Bad Request</h1><p>Invalid id</p>', {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  const msg = await prisma.message.findUnique({ where: { id } })
  if (!msg) {
    return new Response('<h1>Not Found</h1><p>Message not found</p>', {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  const law = msg.lawBroken ?? inferLaw(msg.text)
  const reason = msg.reason ?? inferReason(msg.text)

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Message ${msg.id} – ${escapeHtml(msg.category)}</title>
    <style>
      :root { color-scheme: light dark; }
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, sans-serif; margin: 0; padding: 2rem; }
      .card { max-width: 720px; margin: 0 auto; background: rgba(255,255,255,0.9); color: inherit; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.15); padding: 1.25rem 1.5rem; }
      h1 { margin: 0 0 0.25rem; font-size: 1.5rem; }
      .muted { opacity: .7; font-size: .875rem; }
      .row { margin: .5rem 0; }
      .tag { display: inline-block; padding: .25rem .5rem; border-radius: 999px; font-size: .75rem; background: #eee; color: #333; }
      .urgent { background: #ffe1e1; color: #8b0000; }
      .meta { display: grid; grid-template-columns: 1fr 1fr; gap: .5rem 1rem; margin: .75rem 0 0; }
      .label { font-weight: 600; }
      .value { }
      footer { margin-top: 1.25rem; font-size: .8rem; opacity: .7; }
    </style>
  </head>
  <body>
    <article class="card">
      <h1>Message #${msg.id}</h1>
      <div class="muted">Category: <span class="tag">${escapeHtml(msg.category)}</span></div>
      <div class="row ${msg.status === 'urgent' ? 'urgent' : ''}"><strong>${escapeHtml(msg.text)}</strong></div>
      <section class="meta">
        <div><span class="label">Status:</span> <span class="value">${escapeHtml(msg.status)}</span></div>
        <div><span class="label">Escalatable:</span> <span class="value">${msg.escalatable ? 'Yes' : 'No'}</span></div>
        ${law ? `<div><span class="label">Law broken:</span> <span class="value">${escapeHtml(law)}</span></div>` : ''}
        ${reason ? `<div><span class="label">Reason:</span> <span class="value">${escapeHtml(reason)}</span></div>` : ''}
        <div><span class="label">Created:</span> <span class="value">${new Date(msg.createdAt).toLocaleString()}</span></div>
        <div><span class="label">Updated:</span> <span class="value">${new Date(msg.updatedAt).toLocaleString()}</span></div>
      </section>
      <footer>Generated on ${new Date().toLocaleString()}</footer>
    </article>
  </body>
</html>`

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

function escapeHtml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function inferLaw(text: string): string | null {
  const lower = text.toLowerCase()
  if (lower.includes('fix alt')) return 'Disability Act'
  if (lower.includes('input validation')) return 'Laws of Tort'
  if (lower.includes('user login')) return 'Bankruptcy Court'
  if (lower.includes('secure database')) return 'Laws of Tort'
  return null
}

function inferReason(text: string): string | null {
  const lower = text.toLowerCase()
  if (lower.includes('fix alt')) return 'Missing alt text impacts accessibility'
  if (lower.includes('input validation')) return 'Known input validation flaw led to breach'
  if (lower.includes('user login')) return 'Declared bankruptcy: critical login broken — no users, no revenue'
  if (lower.includes('secure database')) return 'You got hacked: insecure database led to damages'
  return null
}
