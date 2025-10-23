import { APIRequestContext, expect } from '@playwright/test';

export async function listMessages(request: APIRequestContext) {
  const res = await request.get('/api/messages');
  expect(res.ok()).toBeTruthy();
  return res.json() as Promise<Array<{ id: number }>>;
}

export async function deleteAllMessages(request: APIRequestContext) {
  const items = await listMessages(request);
  for (const m of items) {
    await request.delete(`/api/messages/${m.id}`);
  }
}
