import { test, expect } from '@playwright/test';
import { deleteAllMessages } from '../utils/api';

test('messages CRUD via API', async ({ request }) => {
  await deleteAllMessages(request);
  // Create
  const createRes = await request.post('/api/messages', {
    data: {
      category: 'Agile',
      text: 'CRUD test message',
      status: 'normal',
      escalatable: false,
    },
  });
  expect(createRes.ok()).toBeTruthy();
  const created = await createRes.json();
  expect(created.id).toBeTruthy();

  // Read
  const getRes = await request.get(`/api/messages/${created.id}`);
  expect(getRes.ok()).toBeTruthy();
  const got = await getRes.json();
  expect(got.text).toBe('CRUD test message');

  // Update
  const updateRes = await request.put(`/api/messages/${created.id}`, {
    data: { status: 'urgent' },
  });
  expect(updateRes.ok()).toBeTruthy();
  const updated = await updateRes.json();
  expect(updated.status).toBe('urgent');

  // Delete
  const deleteRes = await request.delete(`/api/messages/${created.id}`);
  expect(deleteRes.ok()).toBeTruthy();
});
