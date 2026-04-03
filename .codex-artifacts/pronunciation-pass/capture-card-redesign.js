const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://127.0.0.1:8123/', { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    localStorage.clear();
    const storage = await import('/scripts/storage.js');
    const profile = storage.createInitialProfile();
    profile.settings.language = 'en';
    profile.unlockedCardIds = ['banana', 'lion', 'robot', 'dragon', 'bus', 'book', 'castle', 'rocket'];
    const now = new Date().toISOString();
    for (const id of profile.unlockedCardIds) profile.discoveredAtByCardId[id] = now;
    storage.saveProfile(profile);
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.evaluate(() => [...document.querySelectorAll('[data-route]')].find((el) => el.dataset.route === 'collection')?.click());
  await page.waitForTimeout(300);
  await page.screenshot({ path: '.codex-artifacts/pronunciation-pass/collection-cards-redesign.png', fullPage: true });
  await page.evaluate(() => [...document.querySelectorAll('[data-route]')].find((el) => el.dataset.route === 'learn')?.click());
  await page.waitForTimeout(300);
  await page.screenshot({ path: '.codex-artifacts/pronunciation-pass/learn-cards-redesign.png', fullPage: true });
  await browser.close();
})();
