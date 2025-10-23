import { test, expect } from '@playwright/test';
import { deleteAllMessages } from '../utils/api';

// Creates an escalatable message and verifies urgent + courtroom overlay using test mode (fast timers)
async function createMessage(request: any, payload: {
  category: string,
  text: string,
  status?: string,
  escalatable?: boolean,
  lawBroken?: string | null,
  reason?: string | null,
}) {
  const res = await request.post('/api/messages', { data: payload });
  expect(res.ok()).toBeTruthy();
  return res.json();
}

test('escalates to URGENT then courtroom overlay (test mode)', async ({ page, request }) => {
  await deleteAllMessages(request);
  const created = await createMessage(request, {
    category: 'Agile',
    text: 'Fix alt in img1',
    status: 'normal',
    escalatable: true,
  });

  // Visit with test mode enabled to shorten timers
  await page.goto('/court-room?test=1');

  const row = page.locator(`[data-testid="inbox-row"][data-message-id="${created.id}"]`);
  await expect(row).toBeVisible();

  // Deny it to allow escalation to re-add as URGENT
  await row.getByTestId('deny-it').click();
  await expect(row).toHaveCount(0);

  // It should come back as URGENT quickly in test mode
  const urgentRow = page.locator(`[data-testid="inbox-row"][data-message-id="${created.id}"]`);
  await expect(urgentRow).toBeVisible({ timeout: 5000 });
  await expect(urgentRow).toContainText('URGENT:');

  // After a bit more, the courtroom overlay should appear
  await expect(page.getByRole('heading', { name: 'Courtroom Ruling' })).toBeVisible({ timeout: 6000 });
  await expect(page.getByText('Law broken:')).toBeVisible();
  await expect(page.getByText('Disability Act')).toBeVisible();

  // Dismiss overlay
  await page.getByRole('button', { name: 'Acknowledge' }).click();
  await expect(page.getByRole('heading', { name: 'Courtroom Ruling' })).toHaveCount(0);
});
