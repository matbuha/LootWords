const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const setProfile = async (language, extra = {}) => {
    await page.goto('http://127.0.0.1:8123/', { waitUntil: 'networkidle' });
    await page.evaluate(async ({ language, extra }) => {
      localStorage.clear();
      const storage = await import('/scripts/storage.js');
      const profile = storage.createInitialProfile();
      profile.settings.language = language;
      profile.rewardBoxes = extra.rewardBoxes ?? 0;
      profile.rewardBoxesEarned = extra.rewardBoxes ?? 0;
      if (extra.unlockIds) {
        profile.unlockedCardIds = extra.unlockIds;
        const now = new Date().toISOString();
        for (const id of extra.unlockIds) profile.discoveredAtByCardId[id] = now;
      }
      storage.saveProfile(profile);
    }, { language, extra });
    await page.reload({ waitUntil: 'networkidle' });
  };

  const results = {};

  await setProfile('he', { rewardBoxes: 1 });
  await page.evaluate(() => [...document.querySelectorAll('[data-route]')].find((el) => el.dataset.route === 'reward')?.click());
  await page.waitForTimeout(200);
  for (let i = 0; i < 3; i += 1) {
    await page.evaluate(() => document.querySelector('[data-reward-box="true"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })));
    await page.waitForTimeout(i === 2 ? 1500 : 260);
  }
  await page.waitForTimeout(500);
  results.heReward = await page.evaluate(() => ({
    dir: document.documentElement.dir,
    rewardWord: document.querySelector('.reward-reveal__card--showcase .detail-card__word')?.textContent?.trim() ?? null,
    speech: window.render_game_to_text().speech,
  }));

  await setProfile('ru', { unlockIds: ['banana', 'lion', 'robot'] });
  await page.evaluate(() => [...document.querySelectorAll('[data-route]')].find((el) => el.dataset.route === 'collection')?.click());
  await page.waitForTimeout(250);
  await page.evaluate(() => document.querySelector('.collection-card-button[data-speak-word]')?.click());
  await page.waitForTimeout(250);
  results.ruCollection = await page.evaluate(() => ({
    dir: document.documentElement.dir,
    cardWord: document.querySelector('.collection-card-button[data-speak-word] .loot-card__word')?.textContent?.trim() ?? null,
    speech: window.render_game_to_text().speech,
  }));

  await setProfile('en', { unlockIds: ['banana', 'lion', 'robot'] });
  await page.evaluate(() => [...document.querySelectorAll('[data-route]')].find((el) => el.dataset.route === 'learn')?.click());
  await page.waitForTimeout(250);
  await page.evaluate(() => document.querySelector('.learn-list button[data-speak-word]')?.click());
  await page.waitForTimeout(250);
  results.enLearn = await page.evaluate(() => ({
    dir: document.documentElement.dir,
    cardWord: document.querySelector('.learn-list button[data-speak-word] .loot-card__word')?.textContent?.trim() ?? null,
    speech: window.render_game_to_text().speech,
  }));

  await setProfile('he', { unlockIds: ['banana', 'lion', 'robot', 'dragon', 'book', 'bus'] });
  await page.evaluate(() => [...document.querySelectorAll('[data-route]')].find((el) => el.dataset.route === 'play')?.click());
  await page.waitForTimeout(250);
  results.playOrder = await page.evaluate(() => {
    const stack = document.querySelector('.screen-stack--play');
    const children = [...stack.children].map((el) => el.className);
    return { dir: document.documentElement.dir, children };
  });
  await page.evaluate(() => document.querySelector('.memory-tile [data-speak-word]')?.click());
  await page.waitForTimeout(250);
  results.heGameSpeech = await page.evaluate(() => window.render_game_to_text().speech);

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();
