import { test, expect } from '@playwright/test';
import { buildIdeaEvidence } from '../lib/connections-evidence';
import { ideas } from '../components/connections/ideas';

const hit = {
  passage_id: 'baws_v1_p10_c1', archive_type: 'baws', source: 'BAWS Vol 1',
  page: 10, volume: 1, title: '', url: '',
  text: 'Equality and rights are mentioned together in this test passage.',
  snippet: 'Equality and rights are mentioned together in this test passage.',
};
const equality = buildIdeaEvidence(ideas[0], { results: [hit] });

test('Evidence retains source metadata and marks only literal co-mentions', () => {
  expect(equality.passages[0]).toMatchObject(hit);
  expect(equality.sharedPassages).toEqual({ education: [], rights: [hit.passage_id], democracy: [] });
  const withoutSelected = buildIdeaEvidence(ideas[0], { results: [{ ...hit, text: 'Rights and education.' }] });
  expect(Object.values(withoutSelected.sharedPassages).flat()).toEqual([]);
  expect(buildIdeaEvidence(ideas[0], { results: [] }).passages).toEqual([]);
  expect(() => buildIdeaEvidence(ideas[0], { results: [{ text: 'No source or id' }] })).toThrow();
  const legacy = buildIdeaEvidence(ideas[0], { results: [{ ...hit, passage_id: undefined, id: 'cad_v2_c3', text: undefined, archive_type: 'cad', volume: null, page: null }] });
  expect(legacy.passages[0]).toMatchObject({ passage_id: 'cad_v2_c3', page: null, volume: 0, text: hit.snippet });
});

test('Evidence panel shows real supplied metadata, passage links and curated distinctions', async ({ page }) => {
  await page.route('**/api/connections/evidence?*', route => route.fulfill({ json: equality }));
  await page.goto('/connections');
  await expect(page.locator('.connections-evidence-snippet')).toHaveText(hit.snippet);
  await expect(page.locator('.connections-evidence-source')).toContainText('BAWS');
  await expect(page.locator('.connections-evidence-source')).toContainText('Volume 1');
  await expect(page.locator('.connections-evidence-source')).toContainText('PDF page 10');
  await expect(page.getByRole('link', { name: 'Read passage', exact: true })).toHaveAttribute('href', '/documents/baws_v1_p10_c1');
  await expect(page.getByRole('link', { name: 'Read shared passage for Equality and Rights' })).toHaveAttribute('href', '/documents/baws_v1_p10_c1');
  await expect(page.locator('#connection-basis-rights')).toHaveText('Mentioned together in retrieved text');
  await expect(page.locator('#connection-basis-education')).toHaveText('Curated concept relationship');
});

test('Rapid selection ignores late evidence and reuses cached requests', async ({ page }) => {
  const calls: string[] = [];
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/connections/evidence?*', async route => {
    const id = new URL(route.request().url()).searchParams.get('idea')!;
    calls.push(id);
    if (id === 'equality') await gate;
    await route.fulfill({ json: id === 'equality' ? equality : { passages: [{ ...hit, snippet: 'Education evidence.' }], sharedPassages: {} } });
  });
  await page.goto('/connections');
  await expect.poll(() => calls).toEqual(['equality']);
  await expect(page.getByText('Finding relevant passages…')).toBeVisible();
  const selector = page.getByRole('group', { name: 'Select an idea', exact: true });
  await selector.getByRole('button', { name: 'Education', exact: true }).click();
  await expect(page.locator('.connections-evidence-snippet')).toHaveText('Education evidence.');
  release();
  await selector.getByRole('button', { name: 'Equality', exact: true }).click();
  await expect(page.locator('.connections-evidence-snippet')).toHaveText(hit.snippet);
  await selector.getByRole('button', { name: 'Education', exact: true }).click();
  await expect(page.locator('.connections-evidence-snippet')).toHaveText('Education evidence.');
  expect(calls).toEqual(['equality', 'education']);
});

test('Unavailable and empty archives preserve selection without inventing citations', async ({ page }) => {
  await page.route('**/api/connections/evidence?*', route => route.fulfill({ status: 503, json: { error: 'Unavailable' } }));
  await page.goto('/connections');
  await expect(page.getByText(/Archive evidence is temporarily unavailable/)).toBeVisible();
  await page.getByRole('button', { name: 'Explore Education', exact: true }).click();
  await expect(page.locator('.connections-detail h2')).toHaveText('Education');
  await expect(page.getByRole('link', { name: 'Read passage', exact: true })).toHaveCount(0);
  await page.route('**/api/connections/evidence?*', route => route.fulfill({ json: { passages: [], sharedPassages: {} } }));
  await page.reload();
  await expect(page.getByText(/No passages found for this idea/)).toBeVisible();
  await expect(page.locator('.connection-node')).toHaveCount(3);
  await expect(page.getByRole('link', { name: 'Read passage', exact: true })).toHaveCount(0);
});

test('Evidence proxy rejects unknown ideas before retrieval', async ({ request }) => {
  const response = await request.get('/api/connections/evidence?idea=unknown');
  expect(response.status()).toBe(400);
});
