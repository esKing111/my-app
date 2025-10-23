import { test, expect } from '@playwright/test';
import { deleteAllMessages } from '../utils/api';

// Helper to create a message via API
async function createMessage(request: any, payload: {
  category: string,
  text: string,
  status?: string,
  escalatable?: boolean,
  lawBroken?: string | null,
  reason?: string | null,
}) {
  const res = await request.post('/api/messages', {
    data: payload,
  });
  expect(res.ok()).toBeTruthy();
  return res.json();
}

// GET message by id
async function getMessage(request: any, id: number) {
  const res = await request.get(`/api/messages/${id}`);
  expect(res.ok()).toBeTruthy();
  return res.json();
}

test('court-room page shows created message and resolves it', async ({ page, request }) => {
  // Ensure clean DB for this test
  await deleteAllMessages(request);
  // Arrange: create a message first so page loads it from DB
  const created = await createMessage(request, {
    category: 'Agile',
    text: 'Test message to resolve',
    status: 'normal',
    escalatable: false,
  });

  // Act: open the page and verify the message appears
  await page.goto('/court-room');
  await expect(page.getByText('Inbox')).toBeVisible();
  const rowContainer = page.locator(`[data-testid="inbox-row"][data-message-id="${created.id}"]`);
  await expect(rowContainer).toBeVisible();
  await rowContainer.getByTestId('do-it').click();

  // Assert: row disappears
  await expect(page.locator(`[data-testid="inbox-row"][data-message-id="${created.id}"]`)).toHaveCount(0);

  // Verify status updated in API as resolved (allow a brief delay for the PUT)
  await expect.poll(async () => {
    const item = await getMessage(request, created.id);
    return item.status as string;
  }, { timeout: 5000, intervals: [200, 400, 800, 1200] }).toBe('resolved');
});
