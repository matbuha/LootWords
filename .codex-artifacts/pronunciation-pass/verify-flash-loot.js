const { chromium } = require('playwright');

async function seedProfile(page, language = 'en') {
  await page.goto('http://127.0.0.1:8123/', { waitUntil: 'networkidle' });
  await page.evaluate(async ({ language }) => {
    localStorage.clear();
    const storage = await import('/scripts/storage.js');
    const profile = storage.createInitialProfile();
    profile.settings.language = language;
    profile.unlockedCardIds = ['banana', 'lion', 'robot', 'dragon', 'bus', 'book'];
    const now = new Date().toISOString();
    for (const id of profile.unlockedCardIds) profile.discoveredAtByCardId[id] = now;
    storage.saveProfile(profile);
  }, { language });
  await page.reload({ waitUntil: 'networkidle' });
}

async function getDebug(page) {
  return page.evaluate(() => JSON.parse(window.render_game_to_text()));
}

(async() => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const results = {};

  await seedProfile(page, 'en');
  await page.evaluate(() => [...document.querySelectorAll('[data-route]')].find((el) => el.dataset.route === 'play')?.click());
  await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector('.game-choice[data-game="flash-find"]')?.click());
  await page.waitForTimeout(150);
  const flashPreview = await page.evaluate(() => ({
    screen: JSON.parse(window.render_game_to_text()).activeScreen,
    word: document.querySelector('.target-card--spotlight strong')?.textContent?.trim() ?? null,
    speakable: Boolean(document.querySelector('.target-card--spotlight[data-speak-word]')),
  }));
  await page.waitForTimeout(1400);
  const flashHidden = await page.evaluate(() => ({
    screen: JSON.parse(window.render_game_to_text()).activeScreen,
    word: document.querySelector('.target-card--spotlight strong')?.textContent?.trim() ?? null,
    speakable: Boolean(document.querySelector('.target-card--spotlight[data-speak-word]')),
    html: document.querySelector('.flash-find-stage__spotlight')?.innerText ?? null,
  }));
  results.flashFind = { flashPreview, flashHidden };

  await page.evaluate(() => document.querySelector('.game-choice[data-game="loot-pop"]')?.click());
  await page.waitForTimeout(250);
  for (let i = 0; i < 6; i += 1) {
    await page.evaluate(() => {
      const active = document.querySelector('.reaction-pad.is-active');
      active?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 1, isPrimary: true }));
    });
    await page.waitForTimeout(140);
  }
  results.lootPop = await page.evaluate(() => ({
    screen: JSON.parse(window.render_game_to_text()).activeScreen,
    hitsText: document.querySelector('.arena-stat:nth-child(2)')?.textContent?.trim() ?? null,
  }));

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();
