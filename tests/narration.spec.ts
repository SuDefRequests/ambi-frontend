import { test, expect, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const probe = { plays: 0, pauses: 0, created: 0, revoked: [] as string[], player: null as HTMLAudioElement | null };
    Object.assign(window, { narrationProbe: probe });
    URL.createObjectURL = () => `blob:narration-${++probe.created}`;
    URL.revokeObjectURL = url => { probe.revoked.push(url); };
    class MockAudio {
      currentTime = 0;
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor() { probe.player = this as unknown as HTMLAudioElement; }
      play() { probe.plays++; return Promise.resolve(); }
      pause() { probe.pauses++; }
      removeAttribute() {}
      load() {}
    }
    window.Audio = MockAudio as unknown as typeof Audio;
  });
});

async function openReader(page: Page) {
  await page.goto('/writings');
  await page.locator('.passage-link').first().click();
  await expect(page.getByRole('button', { name: 'Listen to this passage' })).toBeVisible();
}
async function probe(page: Page) {
  return page.evaluate(() => {
    const p = (window as unknown as { narrationProbe: { plays: number; pauses: number; created: number; revoked: string[] } }).narrationProbe;
    return { plays: p.plays, pauses: p.pauses, created: p.created, revoked: p.revoked };
  });
}
const mp3 = { status: 200, contentType: 'audio/mpeg', body: Buffer.from('ID3 mocked MP3 bytes') };

test('Listen renders without autoplay; exact text, pause, resume, stop and replay reuse audio', async ({ page }) => {
  const bodies: unknown[] = [];
  await page.route('**/api/audio/speak', async route => {
    bodies.push(route.request().postDataJSON());
    await route.fulfill(mp3);
  });
  await openReader(page);
  expect(bodies).toEqual([]);
  expect((await probe(page)).plays).toBe(0);
  const text = await page.locator('.source-text').textContent();
  await page.getByRole('button', { name: 'Listen to this passage' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Pause narration' })).toBeVisible();
  expect(bodies).toEqual([{ text, voice: 'alloy', language: 'en' }]);
  expect((await probe(page)).plays).toBe(1);
  await page.getByRole('button', { name: 'Pause narration' }).click();
  await expect(page.getByRole('button', { name: 'Resume narration' })).toBeVisible();
  await page.getByRole('button', { name: 'Resume narration' }).click();
  await expect(page.getByRole('button', { name: 'Pause narration' })).toBeVisible();
  await page.getByRole('button', { name: 'Stop narration' }).click();
  await page.getByRole('button', { name: 'Listen to this passage' }).click();
  await expect(page.getByRole('button', { name: 'Pause narration' })).toBeVisible();
  expect(bodies).toHaveLength(1);
  expect((await probe(page)).created).toBe(1);
  expect((await probe(page)).plays).toBe(3);
});

test('Preparing audio disables Listen and allows cancellation', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/audio/speak', async route => { await gate; await route.fulfill(mp3); });
  await openReader(page);
  await page.getByRole('button', { name: 'Listen to this passage' }).click();
  await expect(page.getByRole('button', { name: 'Preparing audio…' })).toBeDisabled();
  expect((await probe(page)).plays).toBe(0);
  await page.getByRole('button', { name: 'Stop narration' }).click();
  release();
  await expect(page.getByRole('button', { name: 'Listen to this passage' })).toBeVisible();
  expect((await probe(page)).plays).toBe(0);
});

test('API failure stays compact and can be retried without exposing details', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/audio/speak', async route => {
    calls++;
    await route.fulfill(calls === 1 ? { status: 503, contentType: 'application/json', body: '{"secret":"private provider details"}' } : mp3);
  });
  await openReader(page);
  await page.getByRole('button', { name: 'Listen to this passage' }).click();
  await expect(page.locator('.narration-status')).toHaveText('Narration is unavailable at the moment. Please try again.');
  await expect(page.locator('.reader-narration')).not.toContainText('private');
  expect((await probe(page)).created).toBe(0);
  await page.getByRole('button', { name: 'Listen to this passage' }).click();
  await expect(page.getByRole('button', { name: 'Pause narration' })).toBeVisible();
});

test('Passage navigation stops playback, revokes URL and does not autoplay the next passage', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/audio/speak', async route => { calls++; await route.fulfill(mp3); });
  await openReader(page);
  await page.getByRole('button', { name: 'Listen to this passage' }).click();
  await expect(page.getByRole('button', { name: 'Pause narration' })).toBeVisible();
  const text = await page.locator('.source-text').textContent();
  await page.getByRole('link', { name: 'Next passage', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Listen to this passage' })).toBeVisible();
  expect(await page.locator('.source-text').textContent()).not.toBe(text);
  expect((await probe(page)).revoked).toEqual(['blob:narration-1']);
  expect((await probe(page)).pauses).toBeGreaterThan(0);
  expect((await probe(page)).plays).toBe(1);
  expect(calls).toBe(1);
});

test('Ended audio can replay without another request', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/audio/speak', async route => { calls++; await route.fulfill(mp3); });
  await openReader(page);
  await page.getByRole('button', { name: 'Listen to this passage' }).click();
  await expect(page.getByRole('button', { name: 'Pause narration' })).toBeVisible();
  await page.evaluate(() => {
    const p = (window as unknown as { narrationProbe: { player: HTMLAudioElement } }).narrationProbe.player;
    p.onended?.call(p, new Event('ended'));
  });
  await expect(page.locator('.narration-status')).toHaveText('Narration complete.');
  await page.getByRole('button', { name: 'Listen to this passage' }).click();
  await expect(page.getByRole('button', { name: 'Pause narration' })).toBeVisible();
  expect(calls).toBe(1);
});
