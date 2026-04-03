const { chromium } = require('playwright');

async function seedProfile(page, language = 'en') {
  await page.goto('http://127.0.0.1:8123/', { waitUntil: 'networkidle' });
  await page.evaluate(async ({ language }) => {
    localStorage.clear();
    const storage = await import('/scripts/storage.js');
    const profile = storage.createInitialProfile();
    profile.settings.language = language;
    profile.unlockedCardIds = ['banana', 'lion', 'robot', 'dragon', 'bus', 'book', 'rocket', 'castle'];
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
  const page = await browser.newPage({ viewport: { width: 1920, height: 945 } });
  const results = {};

  await seedProfile(page, 'ru');
  await page.waitForTimeout(1200);
  results.voiceInit = await page.evaluate(() => ({
    voiceCount: document.querySelectorAll('[data-voice-option]').length,
    debug: JSON.parse(window.render_game_to_text()).speech,
  }));

  const topbar = await page.locator('.shell-topbar').boundingBox();
  const brand = await page.locator('.brand-lockup').boundingBox();
  const status = await page.locator('.topbar-status').boundingBox();
  results.russianTopbar = {
    topbar,
    brand,
    status,
    topbarHeight: topbar?.height ?? null,
  };
  await page.screenshot({ path: '.codex-artifacts/pronunciation-pass/russian-topbar-fixed.png', fullPage: false });

  await page.evaluate(() => [...document.querySelectorAll('[data-route]')].find((el) => el.dataset.route === 'collection')?.click());
  await page.waitForTimeout(250);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.55));
  await page.waitForTimeout(150);
  await page.evaluate(() => document.querySelector('.collection-card-button')?.click());
  await page.waitForTimeout(250);
  const modalRects = await page.evaluate(() => {
    const overlay = document.querySelector('.detail-modal');
    const dialog = document.querySelector('.detail-modal__dialog');
    const rect = (el) => el ? el.getBoundingClientRect().toJSON() : null;
    return {
      overlay: rect(overlay),
      dialog: rect(dialog),
      scrollY: window.scrollY,
      viewportHeight: window.innerHeight,
      centeredOffset: dialog ? Math.round((dialog.getBoundingClientRect().top + dialog.getBoundingClientRect().bottom) / 2 - window.innerHeight / 2) : null,
    };
  });
  results.collectionModal = modalRects;
  await page.screenshot({ path: '.codex-artifacts/pronunciation-pass/collection-modal-centered.png', fullPage: false });

  await page.evaluate(() => [...document.querySelectorAll('[data-route]')].find((el) => el.dataset.route === 'play')?.click());
  await page.waitForTimeout(250);
  const memoryBack = await page.evaluate(() => {
    const back = document.querySelector('.tile-face--back');
    const styles = back ? getComputedStyle(back, '::before') : null;
    return {
      beforeContent: styles?.content ?? null,
      beforeWidth: styles?.width ?? null,
      beforeHeight: styles?.height ?? null,
    };
  });
  results.memoryBack = memoryBack;
  await page.screenshot({ path: '.codex-artifacts/pronunciation-pass/memory-hidden-card-back.png', fullPage: false });

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();
