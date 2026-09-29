import { test, expect } from '@playwright/test';

test('Home search opens real text, preserves results and returns Home', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await page.getByRole('searchbox').fill('representation');
  await page.getByRole('button', { name: 'Search the archive', exact: true }).click();
  await expect(page).toHaveURL(/search\?q=representation/);
  await expect(page.locator('.passage-link')).toHaveCount(6);
  await page.getByRole('navigation', { name: 'Collections' }).getByRole('link', { name: /Constituent Assembly/ }).click();
  await expect(page.locator('.passage-meta').first()).toContainText('ASSEMBLY DEBATES');
  await page.getByRole('link', { name: 'Next', exact: true }).click();
  const resultsUrl = page.url();
  await page.locator('.passage-link').first().click();
  await expect(page.getByRole('article', { name: 'Source passage' })).toBeVisible();
  await expect(page.locator('.source-text')).not.toBeEmpty();
  await expect(page.locator('.source-citation')).toContainText('CAD Volume');
  await page.getByRole('link', { name: 'Next passage', exact: true }).click();
  await page.getByRole('link', { name: 'Back to results' }).click();
  await expect(page).toHaveURL(resultsUrl);
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.locator('.hero')).toBeVisible();
  await expect(page.getByRole('searchbox')).toHaveValue('representation');
  expect(errors).toEqual([]);
});

test('Collection entry points, empty search, URL validation and missing document', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Writings & Speeches', exact: true }).click();
  await expect(page.locator('.passage-meta').first()).toContainText('WRITINGS & SPEECHES');
  await page.goto('/search');
  await expect(page.locator('.passage-link')).toHaveCount(6);
  await page.goto('/manuscripts');
  await expect(page.getByRole('heading', { name: 'Original pages take time to preserve.' })).toBeVisible();
  await page.goto('/search?collection=invalid&page=-4');
  await expect(page.getByRole('link', { name: /All collections/ })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('navigation', { name: 'Results pages' })).toContainText('Page 1 of');
  await page.goto('/documents/missing-reference');
  await expect(page.getByRole('heading', { name: 'Passage not found.' })).toBeVisible();
});

test('Topic entry, back navigation and accessibility preferences persist across routes', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Accessibility', exact: true }).click();
  await page.getByRole('switch', { name: /Larger text/ }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('link', { name: 'Education', exact: true }).click();
  await expect(page.locator('.archive-shell')).toHaveClass(/large-text/);
  await expect(page.getByRole('searchbox')).toHaveValue('Education');
  await page.locator('.passage-link').first().click();
  await expect(page).toHaveURL(/\/documents\//);
  await page.goBack();
  await expect(page).toHaveURL(/\/search\?/);
  await expect(page.getByRole('searchbox')).toHaveValue('Education');
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.locator('.museum-shell')).toHaveClass(/large-text/);
});

for (const size of [{width:1920,height:1080},{width:1366,height:768},{width:390,height:844}]) {
  test(`Discovery and reader fit ${size.width}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto('/search?q=democracy');
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const smallTargets = await page.locator('.archive-header a,.archive-header button,.collection-index a,.passage-link,.results-pagination a').evaluateAll(elements => elements.filter(el => { const b = el.getBoundingClientRect(); return b.width < 44 || b.height < 44; }).length);
    expect(smallTargets).toBe(0);
    await page.screenshot({path:`docs/discovery-${size.width}.png`,fullPage:true});
    await page.locator('.passage-link').first().click();
    await expect(page.locator('.source-text')).toBeVisible();
    await page.reload();
    await expect(page.locator('.source-text')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({path:`docs/reader-${size.width}.png`,fullPage:true});
  });
}
