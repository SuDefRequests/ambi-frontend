import { test, expect } from '@playwright/test';
import { ideas } from '../components/connections/ideas';

// Layout/selection checks are independent of archive availability.
test.beforeEach(async ({ page }) => {
  await page.route('**/api/connections/evidence?*', route => route.fulfill({ json: { passages: [], sharedPassages: {} } }));
});

for (const viewport of [{ width: 1920, height: 1080 }, { width: 1440, height: 900 }, { width: 1366, height: 768 }, { width: 1024, height: 768 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 320, height: 740 }]) {
  test(`Connections selection and exhibit layout at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/connections');
    const selector = page.getByRole('group', { name: 'Select an idea', exact: true });
    const placard = page.locator('.connections-detail');
    for (const idea of ideas) {
      await selector.getByRole('button', { name: idea.title, exact: true }).click();
      await expect(selector.getByRole('button', { name: idea.title, exact: true })).toHaveAttribute('aria-pressed', 'true');
      await expect(selector.locator('[aria-pressed="true"]')).toHaveCount(1);
      await expect(page.locator('.connection-core')).toHaveAttribute('aria-label', `Selected idea: ${idea.title}`);
      await expect(placard.getByRole('heading', { level: 2 })).toHaveText(idea.title);
      await expect(placard.locator('.connections-detail-copy > p')).toHaveText(idea.description);
      await expect(page.locator('.connection-node')).toHaveCount(idea.connections.length);
      await expect(placard.getByRole('button')).toHaveCount(idea.connections.length);
      for (const id of idea.connections) {
        const related = ideas.find(item => item.id === id)!;
        await expect(page.getByRole('button', { name: `Explore ${related.title}`, exact: true })).toBeVisible();
        await expect(placard.getByRole('button', { name: related.title, exact: true })).toBeVisible();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (viewport.width >= 1101) {
        expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
        const exhibit = await page.locator('.connections-exhibit').boundingBox();
        expect(exhibit!.width).toBeGreaterThan(viewport.width * .9);
      }
      const smallTargets = await page.locator('.connections-experience button').evaluateAll(buttons => buttons.filter(button => {
        const rect = button.getBoundingClientRect();
        return rect.width < 44 || rect.height < 44;
      }).length);
      expect(smallTargets).toBe(0);
      const overlaps = await page.locator('.connections-network').evaluate(network => {
        const circles = [...network.querySelectorAll('.connection-core, .connection-node')].map(node => node.getBoundingClientRect());
        return circles.some((a, i) => circles.slice(i + 1).some(b =>
          Math.hypot(a.x + a.width / 2 - b.x - b.width / 2, a.y + a.height / 2 - b.y - b.height / 2) < (a.width + b.width) / 2 + 2));
      });
      expect(overlaps).toBe(false);
    }
    await selector.getByRole('button', { name: 'Equality', exact: true }).click();
    await page.getByRole('button', { name: 'Explore Education', exact: true }).click();
    await expect(placard.getByRole('heading', { level: 2 })).toHaveText('Education');
    await placard.getByRole('button', { name: 'Representation', exact: true }).click();
    await expect(page.locator('.connection-core')).toHaveAttribute('aria-label', 'Selected idea: Representation');
    await selector.getByRole('button', { name: 'Equality', exact: true }).click();
    await page.screenshot({ path: `test-results/connections-${viewport.width}.png`, fullPage: true });
    expect(errors).toEqual([]);
  });
}

test('Connections keyboard selection preserves the archive navigation', async ({ page }) => {
  await page.goto('/connections');
  await expect(page.getByRole('link', { name: 'Samvidhan home' })).toHaveAttribute('href', '/');
  await expect(page.getByRole('button', { name: 'Accessibility', exact: true })).toBeVisible();
  const rights = page.getByRole('group', { name: 'Select an idea', exact: true }).getByRole('button', { name: 'Rights', exact: true });
  await rights.focus();
  await page.keyboard.press('Enter');
  await expect(rights).toBeFocused();
  await expect(rights).toHaveAttribute('aria-pressed', 'true');
  const law = page.getByRole('button', { name: 'Explore Law', exact: true });
  await law.focus();
  await page.keyboard.press('Space');
  await expect(page.locator('.connections-detail h2')).toHaveText('Law');
});
