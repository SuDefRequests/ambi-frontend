import { test, expect, type Page } from '@playwright/test';

const answer = '  Education  enables participation.\n“Equality” matters [baws_v1_p10_c1]. नमस्ते  ';
const mp3 = { status: 200, contentType: 'audio/mpeg', body: Buffer.from('ID3 mocked audio') };
type Probe = { plays: number; pauses: number; created: number; revoked: string[]; aborted: number };

async function probe(page: Page) {
  return page.evaluate(() => (window as unknown as { askAudioProbe: Probe }).askAudioProbe);
}
async function submit(page: Page, question = 'What about education?') {
  await page.getByRole('textbox', { name: 'Ask the archive a question' }).fill(question);
  await page.getByRole('button', { name: 'Ask the Archive', exact: true }).click();
}

// Both APIs and playback are mocked: these tests never generate paid narration.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const state: Probe = { plays: 0, pauses: 0, created: 0, revoked: [], aborted: 0 };
    Object.assign(window, { askAudioProbe: state });
    const fetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
      if (input === '/api/audio/speak') {
        init?.signal?.addEventListener('abort', () => { state.aborted++; });
      }
      return fetch(input, init);
    };
    URL.createObjectURL = () => `blob:answer-${++state.created}`;
    URL.revokeObjectURL = url => { state.revoked.push(url); };
    class MockAudio {
      currentTime = 0;
      onended = null;
      onerror = null;
      play() { state.plays++; return Promise.resolve(); }
      pause() { state.pauses++; }
      removeAttribute() {}
      load() {}
    }
    window.Audio = MockAudio as unknown as typeof Audio;
  });
  await page.route('**/api/ask', route => route.fulfill({ json: {
    question: route.request().postDataJSON().question, answer, sources: [{
      passage_id: 'baws_v1_p10_c1', archive_type: 'baws', source: 'BAWS Vol 1',
      page: 10, volume: 1, title: null, url: null, text: 'Source evidence.',
    }],
  } }));
  await page.route('**/api/audio/speak', route => route.fulfill(mp3));
  await page.goto('/ask');
});

test('Narration appears only after success, with disclosure and no autoplay', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/audio/speak', async route => { calls++; await route.fulfill(mp3); });
  await expect(page.getByRole('button', { name: 'Listen to this answer' })).toHaveCount(0);
  await page.route('**/api/ask', route => route.fulfill({ status: 503, json: { detail: { message: 'Unavailable' } } }));
  await submit(page);
  await expect(page.getByText('The archive could not answer that question.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Listen to this answer' })).toHaveCount(0);
  await page.unroute('**/api/ask');
  await page.route('**/api/ask', route => route.fulfill({ json: { question: 'Question', answer, sources: [] } }));
  await submit(page);
  await expect(page.getByRole('button', { name: 'Listen to this answer' })).toBeVisible();
  await expect(page.getByText('AI-generated narration', { exact: true })).toBeVisible();
  expect(calls).toBe(0);
  expect((await probe(page)).plays).toBe(0);
});

test('Exact answer, keyboard Listen, pause/resume/stop and cached replay', async ({ page }) => {
  const bodies: unknown[] = [];
  await page.route('**/api/audio/speak', async route => {
    bodies.push(route.request().postDataJSON());
    await route.fulfill(mp3);
  });
  await submit(page);
  await expect(page.getByRole('link', { name: /Read passage/ })).toHaveAttribute('href', '/documents/baws_v1_p10_c1');
  const listen = page.getByRole('button', { name: 'Listen to this answer' });
  await listen.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Pause narration' })).toBeVisible();
  expect(bodies).toEqual([{ text: answer, voice: 'alloy', language: 'en' }]);
  expect((await probe(page)).plays).toBe(1);
  await page.getByRole('button', { name: 'Pause narration' }).click();
  await expect(page.getByRole('status')).toHaveText('Narration paused.');
  // Editing a draft rerenders the page but must retain the displayed answer's audio.
  await page.getByRole('textbox').fill('A draft question');
  await page.getByRole('button', { name: 'Resume narration' }).click();
  await expect(page.getByRole('button', { name: 'Pause narration' })).toBeVisible();
  await page.getByRole('button', { name: 'Stop narration' }).click();
  await listen.click();
  await expect(page.getByRole('button', { name: 'Pause narration' })).toBeVisible();
  expect(bodies).toHaveLength(1);
  expect((await probe(page)).created).toBe(1);
  expect((await probe(page)).plays).toBe(3);
});

test('Preparing audio is visible and disabled until the MP3 arrives', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/audio/speak', async route => { await gate; await route.fulfill(mp3); });
  await submit(page);
  await page.getByRole('button', { name: 'Listen to this answer' }).click();
  await expect(page.getByRole('button', { name: 'Preparing audio…' })).toBeDisabled();
  expect((await probe(page)).plays).toBe(0);
  release();
  await expect(page.getByRole('button', { name: 'Pause narration' })).toBeVisible();
  expect((await probe(page)).plays).toBe(1);
});

test('New question stops and revokes old audio before the next answer arrives', async ({ page }) => {
  await submit(page);
  await page.getByRole('button', { name: 'Listen to this answer' }).click();
  await expect(page.getByRole('button', { name: 'Pause narration' })).toBeVisible();
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/ask', async route => { await gate; await route.fulfill({ json: {
    question: 'Next question', answer: 'A new answer.', sources: [],
  } }); });
  await submit(page, 'Next question');
  await expect(page.getByRole('heading', { name: 'Searching the archive…' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pause narration' })).toHaveCount(0);
  expect((await probe(page)).revoked).toEqual(['blob:answer-1']);
  expect((await probe(page)).pauses).toBeGreaterThan(0);
  release();
  await expect(page.getByRole('button', { name: 'Listen to this answer' })).toBeVisible();
  expect((await probe(page)).plays).toBe(1);
  await page.getByRole('button', { name: 'Listen to this answer' }).click();
  await expect(page.getByRole('button', { name: 'Pause narration' })).toBeVisible();
  expect((await probe(page)).created).toBe(2);
});

test('New question aborts pending narration and ignores its late result', async ({ page }) => {
  let release!: () => void;
  let finished!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const completed = new Promise<void>(resolve => { finished = resolve; });
  await page.route('**/api/audio/speak', async route => {
    await gate;
    await route.fulfill(mp3);
    finished();
  });
  await submit(page);
  await page.getByRole('button', { name: 'Listen to this answer' }).click();
  await expect(page.getByRole('button', { name: 'Preparing audio…' })).toBeDisabled();
  await submit(page, 'Another question');
  await expect(page.getByRole('button', { name: 'Listen to this answer' })).toBeVisible();
  expect((await probe(page)).aborted).toBe(1);
  release();
  await completed;
  expect((await probe(page)).created).toBe(0);
  expect((await probe(page)).plays).toBe(0);
});

test('Narration failure is compact, safe and retryable', async ({ page }) => {
  await page.route('**/api/audio/speak', route => route.fulfill({ status: 503, json: { secret: 'private details' } }));
  await submit(page);
  await page.getByRole('button', { name: 'Listen to this answer' }).click();
  await expect(page.getByRole('status')).toHaveText('Narration is unavailable at the moment. Please try again.');
  await expect(page.locator('main')).not.toContainText('private details');
  expect((await probe(page)).plays).toBe(0);
  await page.route('**/api/audio/speak', route => route.fulfill(mp3));
  await page.getByRole('button', { name: 'Listen to this answer' }).click();
  await expect(page.getByRole('button', { name: 'Pause narration' })).toBeVisible();
});

test('Answer narration fits a touchscreen and a new question releases audio', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await submit(page);
  const listen = page.getByRole('button', { name: 'Listen to this answer' });
  const bounds = await listen.boundingBox();
  expect(bounds?.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/ask-narration-mobile.png', fullPage: true });
  await listen.click();
  await expect(page.getByRole('button', { name: 'Pause narration' })).toBeVisible();
  const questionInput = page.getByRole('textbox', { name: 'Ask the archive a question' });
  await expect(questionInput).toBeVisible();
  await expect(questionInput).toBeEditable();
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/ask', async route => {
    await gate;
    await route.fulfill({ json: {
      question: route.request().postDataJSON().question, answer, sources: [],
    } });
  });
  await submit(page, 'What about representation?');
  await expect(page.getByRole('heading', { name: 'Searching the archive…' })).toBeVisible();
  await expect(listen).toHaveCount(0);
  expect((await probe(page)).revoked).toEqual(['blob:answer-1']);
  release();
  await expect(listen).toBeVisible();
});
