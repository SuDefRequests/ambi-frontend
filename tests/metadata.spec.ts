import { test, expect } from '@playwright/test';
import type { ArchivePassage, Adjacency, SearchResponse, BrowseResponse } from '../lib/archive-api';
import { passageTitle } from '../lib/archive-metadata';

// Synthetic metadata exercises future populated titles without altering archive exports.
test('Document titles take precedence; missing titles never become volume labels', () => {
  expect(passageTitle({ archive_type: 'BAWS', title: '  Supplied document title  ' })).toBe('Supplied document title');
  expect(passageTitle({ archive_type: 'CAD', title: '09 Dec 1946' })).toBe('Assembly session · 09 Dec 1946');
  for (const title of ['', '  ', null, undefined]) {
    for (const archive_type of ['BAWS', 'CAD']) {
      expect(passageTitle({ archive_type, title })).toBe('Source document unavailable');
    }
  }
});

test('Backend search metadata and reader text remain exact', async ({ page, request }) => {
  const base = process.env.ARCHIVE_API_URL || 'http://127.0.0.1:8001';
  for (const [collection, archive] of [['writings', 'baws'], ['debates', 'cad']]) {
    const response = await request.get(`${base}/api/v1/search`, { params: { q: 'Education', archive, limit: 20 } });
    expect(response.ok()).toBe(true);
    const result: SearchResponse = await response.json();
    await page.goto(`/search?q=Education&collection=${collection}`);
    await expect(page.locator('.results-heading h2')).toHaveText(`${result.total_results} passages`);
    const record = result.results[0];
    await expect(page.locator('.passage-link').first()).toHaveAttribute('href', `/documents/${record.passage_id}?q=Education&collection=${collection}&page=1`);
    await expect(page.locator('.passage-link h3').first()).toHaveText(passageTitle(record));
    await page.locator('.passage-link').first().click();
    const passage: ArchivePassage = await (await request.get(`${base}/api/v1/passages/${record.passage_id}`)).json();
    expect(await page.locator('.source-text').textContent()).toBe(passage.text);
    await expect(page.locator('.source-citation')).toContainText(passage.passage_id);
    const adjacency: Adjacency = await (await request.get(`${base}/api/v1/passages/${record.passage_id}/adjacency`)).json();
    for (const [key, label] of [['previous', 'Previous passage'], ['next', 'Next passage']] as const) {
      const link = page.getByRole('link', { name: label, exact: true });
      if (adjacency[key]) await expect(link).toHaveAttribute('href', `/documents/${adjacency[key].passage_id}?q=Education&collection=${collection}&page=1`);
      else await expect(link).toHaveCount(0);
    }
  }
});

test('Reader hides missing neighbors at source boundaries', async ({ page, request }) => {
  const base = process.env.ARCHIVE_API_URL || 'http://127.0.0.1:8001';
  const first: BrowseResponse = await (await request.get(`${base}/api/v1/passages?archive=baws&limit=1`)).json();
  await page.goto(`/documents/${first.results[0].passage_id}`);
  await expect(page.getByRole('link', { name: 'Previous passage', exact: true })).toHaveCount(0);
  const last: BrowseResponse = await (await request.get(`${base}/api/v1/passages?archive=baws&limit=1&offset=${first.total - 1}`)).json();
  await page.goto(`/documents/${last.results[0].passage_id}`);
  await expect(page.getByRole('link', { name: 'Next passage', exact: true })).toHaveCount(0);
});
