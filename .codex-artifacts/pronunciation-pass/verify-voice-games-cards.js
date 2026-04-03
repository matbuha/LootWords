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

  await seedProfile(page, 'he');
  await page.evaluate(() => [...document.querySelectorAll('[data-route]')].find((el) => el.dataset.route === 'collection')?.click());
  await page.waitForTimeout(250);
  const beforeSpeech = (await getDebug(page)).speech.lastRequest;
  await page.evaluate(() => {
    const lockedButton = [...document.querySelectorAll('.collection-card-button')]
      .find((button) => !button.querySelector('[data-speak-word]'));
    lockedButton?.click();
  });
  await page.waitForTimeout(250);
  const afterLocked = (await getDebug(page)).speech.lastRequest;
  await page.evaluate(() => document.querySelector('.collection-card-button [data-speak-word]')?.click());
  await page.waitForTimeout(250);
  const afterUnlocked = (await getDebug(page)).speech.lastRequest;
  results.collectionSpeech = { beforeSpeech, afterLocked, afterUnlocked };

  await page.evaluate(() => [...document.querySelectorAll('[data-route]')].find((el) => el.dataset.route === 'play')?.click());
  await page.waitForTimeout(250);
  const hiddenMemoryBefore = (await getDebug(page)).speech.lastRequest;
  await page.evaluate(() => document.querySelector('[data-tile-id]')?.click());
  await page.waitForTimeout(250);
  const hiddenMemoryAfter = (await getDebug(page)).speech.lastRequest;
  await page.evaluate(() => document.querySelector('[data-tile-id][data-speak-word]')?.click());
  await page.waitForTimeout(250);
  const revealedMemoryAfter = (await getDebug(page)).speech.lastRequest;
  results.memorySpeech = { hiddenMemoryBefore, hiddenMemoryAfter, revealedMemoryAfter };

  await page.evaluate(() => document.querySelector('[data-voice-trigger]')?.click());
  await page.waitForTimeout(150);
  const voiceOptions = await page.evaluate(() => [...document.querySelectorAll('[data-voice-option]')].map((el) => ({ id: el.dataset.voiceOption, label: el.textContent.trim() })));
  if (voiceOptions.length > 1) {
    await page.evaluate(() => document.querySelectorAll('[data-voice-option]')[1]?.click());
    await page.waitForTimeout(250);
  }
  const selectedVoiceAfterPick = (await getDebug(page)).speech.selectedVoiceId;
  await page.reload({ waitUntil: 'networkidle' });
  const selectedVoiceAfterReload = (await getDebug(page)).speech.selectedVoiceId;
  results.voiceSelector = { voiceCount: voiceOptions.length, voiceOptions, selectedVoiceAfterPick, selectedVoiceAfterReload };

  await page.evaluate(() => [...document.querySelectorAll('[data-route]')].find((el) => el.dataset.route === 'play')?.click());
  await page.waitForTimeout(200);
  await page.evaluate(() => document.querySelector('[data-game-choice="flash-find"]')?.click());
  await page.waitForTimeout(100);
  const flashPreview = await page.evaluate(() => ({
    phase: JSON.parse(window.render_game_to_text()).activeScreen.phase,
    word: document.querySelector('.target-card--spotlight strong')?.textContent?.trim() ?? null,
    speakable: Boolean(document.querySelector('.target-card--spotlight[data-speak-word]')),
  }));
  await page.waitForTimeout(1400);
  const flashHidden = await page.evaluate(() => ({
    phase: JSON.parse(window.render_game_to_text()).activeScreen.phase,
    word: document.querySelector('.target-card--spotlight strong')?.textContent?.trim() ?? null,
    speakable: Boolean(document.querySelector('.target-card--spotlight[data-speak-word]')),
  }));
  results.flashFind = { flashPreview, flashHidden };

  await page.evaluate(() => document.querySelector('[data-game-choice="loot-pop"]')?.click());
  await page.waitForTimeout(200);
  for (let i = 0; i < 6; i += 1) {
    await page.evaluate(() => {
      const active = document.querySelector('.reaction-pad.is-active');
      active?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 1, isPrimary: true }));
    });
    await page.waitForTimeout(140);
  }
  results.lootPop = (await getDebug(page)).activeScreen;

  await page.screenshot({ path: '.codex-artifacts/pronunciation-pass/cards-redesign-check.png', fullPage: true });
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();
