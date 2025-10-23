import { test, expect } from '@playwright/test'
import { deleteAllMessages } from '../utils/api'

async function createMessage(request: any, payload: any) {
  const res = await request.post('/api/messages', { data: payload })
  expect(res.ok()).toBeTruthy()
  return res.json()
}

test('dynamic HTML page returns text/html and message data', async ({ request }) => {
  await deleteAllMessages(request)
  const created = await createMessage(request, {
    category: 'Agile',
    text: 'Fix alt in img1',
    status: 'normal',
    escalatable: true,
  })

  const res = await request.get(`/api/pages/${created.id}`)
  expect(res.ok()).toBeTruthy()
  expect(res.headers()['content-type']).toContain('text/html')
  const body = await res.text()
  expect(body).toContain(`<title>Message ${created.id}`)
  expect(body).toContain('Disability Act')
})
