const { chromium } = require('playwright');

async function seedProfile(page, language = 'he') {
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

  await seedProfile(page, 'he');
  await page.evaluate(() => [...document.querySelectorAll('[data-route]')].find((el) => el.dataset.route === 'collection')?.click());
  await page.waitForTimeout(250);
  await page.evaluate(() => {
    const lockedButton = [...document.querySelectorAll('.collection-card-button')]
      .find((button) => !button.querySelector('[data-speak-word]'));
    lockedButton?.click();
  });
  await page.waitForTimeout(250);
  results.lockedCollectionSpeech = (await getDebug(page)).speech.lastRequest;
  await page.evaluate(() => document.querySelector('.collection-card-button [data-speak-word]')?.click());
  await page.waitForTimeout(250);
  results.unlockedCollectionSpeech = (await getDebug(page)).speech.lastRequest;

  await page.evaluate(() => [...document.querySelectorAll('[data-route]')].find((el) => el.dataset.route === 'play')?.click());
  await page.waitForTimeout(250);
  const memoryBefore = (await getDebug(page)).speech.lastRequest;
  await page.evaluate(() => document.querySelector('[data-tile-id]')?.click());
  await page.waitForTimeout(250);
  const memoryAfterHiddenClick = (await getDebug(page)).speech.lastRequest;
  await page.evaluate(() => document.querySelector('[data-tile-id][data-speak-word]')?.click());
  await page.waitForTimeout(250);
  const memoryAfterRevealClick = (await getDebug(page)).speech.lastRequest;
  results.memorySpeech = { memoryBefore, memoryAfterHiddenClick, memoryAfterRevealClick };

  await page.evaluate(() => document.querySelector('[data-voice-trigger]')?.click());
  await page.waitForTimeout(150);
  const voiceOptions = await page.evaluate(() => [...document.querySelectorAll('[data-voice-option]')].map((el) => el.dataset.voiceOption));
  if (voiceOptions.length > 1) {
    await page.evaluate(() => document.querySelectorAll('[data-voice-option]')[1]?.click());
    await page.waitForTimeout(250);
  }
  results.voiceAfterPick = (await getDebug(page)).speech.selectedVoiceId;
  await page.reload({ waitUntil: 'networkidle' });
  results.voiceAfterReload = (await getDebug(page)).speech.selectedVoiceId;

  await page.evaluate(() => [...document.querySelectorAll('[data-route]')].find((el) => el.dataset.route === 'play')?.click());
  await page.waitForTimeout(200);
  await page.evaluate(() => document.querySelector('.game-choice[data-game="flash-find"]')?.click());
  await page.waitForTimeout(120);
  results.flashPreview = await page.evaluate(() => ({
    debug: JSON.parse(window.render_game_to_text()).activeScreen,
    text: document.querySelector('.flash-find-stage__spotlight')?.innerText ?? null,
    speakable: Boolean(document.querySelector('.target-card--spotlight[data-speak-word]')),
  }));
  await page.waitForTimeout(1400);
  results.flashChoose = await page.evaluate(() => ({
    debug: JSON.parse(window.render_game_to_text()).activeScreen,
    text: document.querySelector('.flash-find-stage__spotlight')?.innerText ?? null,
    speakable: Boolean(document.querySelector('.target-card--spotlight[data-speak-word]')),
  }));

  await page.evaluate(() => document.querySelector('.game-choice[data-game="loot-pop"]')?.click());
  await page.waitForTimeout(250);
  for (let i = 0; i < 8; i += 1) {
    await page.evaluate(() => {
      const active = document.querySelector('.reaction-pad.is-active');
      active?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 1, isPrimary: true }));
    });
    await page.waitForTimeout(135);
  }
  results.lootPop = (await getDebug(page)).activeScreen;

  await page.evaluate(() => [...document.querySelectorAll('[data-route]')].find((el) => el.dataset.route === 'learn')?.click());
  await page.waitForTimeout(250);
  await page.screenshot({ path: '.codex-artifacts/pronunciation-pass/final-cards-learn-he.png', fullPage: true });

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();
