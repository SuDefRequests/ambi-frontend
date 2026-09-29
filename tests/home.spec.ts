import { test, expect } from '@playwright/test';

test.beforeEach(async({page})=>{await page.goto('/');await page.evaluate(()=>document.fonts.ready);});

for(const size of [{width:1920,height:1080},{width:1440,height:900},{width:1366,height:768}]){
 test(`Kiosk composition ${size.width}×${size.height}`,async({page})=>{
  await page.setViewportSize(size);
  await expect(page.getByRole('button',{name:'General Visitor Explore & Learn'})).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.discovery-card')).toHaveCount(6);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight)).toBe(true);
  const cardOverflows=await page.locator('.exhibit-content').evaluateAll(cards=>cards.filter(c=>c.scrollHeight>c.clientHeight+2||c.scrollWidth>c.clientWidth+2).length);
  expect(cardOverflows).toBe(0);
  expect(await page.locator('.site-footer').evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight+1)).toBe(true);
  await page.screenshot({path:`docs/home-${size.width}.png`,fullPage:true});
 });
}

test('Unimplemented exhibits retain their previews',async({page})=>{
 const routes=['/media','/timeline','/connections','/ask'];
 for(let i=0;i<routes.length;i++){
  await page.locator('.discovery-card').nth(i+2).click();
  await expect(page.locator('.destination-preview')).toHaveAttribute('data-destination',routes[i]);
  await page.keyboard.press('Escape');
 }
 await page.getByRole('link',{name:'1927 — Mahad Satyagraha',exact:true}).click();
 await expect(page.locator('.destination-preview')).toHaveAttribute('data-destination','/timeline?year=1927');
});

test('Mode selection, locale, access controls and dialog keyboard behavior',async({page})=>{
 await page.getByRole('button',{name:'Student Learn & Study'}).click();
 await expect(page.getByRole('button',{name:'Student Learn & Study'})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Institution Archive & Manage'}).click();
 await expect(page.getByRole('dialog')).toContainText('authorized archive teams');
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'हिन्दी',exact:true}).click();
 await expect(page.locator('html')).toHaveAttribute('lang','hi');
 await expect(page.locator('h1')).toContainText('जानिए');
 await page.getByRole('button',{name:'मराठी',exact:true}).click();
 await expect(page.locator('html')).toHaveAttribute('lang','mr');
 await expect(page.locator('h1')).toContainText('जाणून');
 await page.getByRole('button',{name:'English',exact:true}).click();
 await page.getByRole('button',{name:'Accessibility',exact:true}).click();
 await page.getByRole('switch',{name:/Larger text/}).click();
 await page.getByRole('switch',{name:/Stronger contrast/}).click();
 await page.getByRole('switch',{name:/Reduce motion/}).click();
 await expect(page.locator('.museum-shell')).toHaveClass(/large-text high-contrast reduced-motion/);
 await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).focus();
 await page.keyboard.press('Shift+Tab');
 expect(await page.evaluate(()=>document.activeElement?.closest('dialog')!==null)).toBe(true);
 await page.keyboard.press('Escape');
 await expect(page.getByRole('button',{name:'Accessibility',exact:true})).toBeFocused();
 await page.getByRole('button',{name:'Settings',exact:true}).click();
 await page.getByRole('button',{name:/Reset visitor preferences/}).click();
 await expect(page.locator('.museum-shell')).not.toHaveClass(/large-text/);
 await expect(page.getByRole('button',{name:'General Visitor Explore & Learn'})).toHaveAttribute('aria-pressed','true');
});

test('Mobile adaptation, touch targets and no client errors',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:390,height:844});
 await page.reload();await page.evaluate(()=>document.fonts.ready);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const undersized=await page.locator('.mode-button,.utility-button,.language-control button,.search-action,.topic-chips a').evaluateAll(elements=>elements.filter(el=>{const b=el.getBoundingClientRect();return b.width<43||b.height<43}).length);
 expect(undersized).toBe(0);
 await page.screenshot({path:'docs/home-mobile.png',fullPage:true});
 await page.getByRole('link',{name:'Writings & Speeches',exact:true}).click();
 await expect(page).toHaveURL(/\/writings$/);
 await expect(page.getByRole('heading',{name:'Writings & Speeches',exact:true})).toBeVisible();
 expect(errors).toEqual([]);
});
