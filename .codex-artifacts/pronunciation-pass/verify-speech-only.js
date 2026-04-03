const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://127.0.0.1:8123/', { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    localStorage.clear();
    const storage = await import('/scripts/storage.js');
    const profile = storage.createInitialProfile();
    profile.settings.language = 'he';
    profile.unlockedCardIds = ['banana'];
    profile.discoveredAtByCardId.banana = new Date().toISOString();
    storage.saveProfile(profile);
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.evaluate(() => [...document.querySelectorAll('[data-route]')].find((el) => el.dataset.route === 'collection')?.click());
  await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector('.collection-card-button[data-speak-word]')?.click());
  await page.waitForTimeout(500);
  const out = await page.evaluate(() => ({ render: window.render_game_to_text(), speechManager: window.render_game_to_text().speech ?? null }));
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})();
