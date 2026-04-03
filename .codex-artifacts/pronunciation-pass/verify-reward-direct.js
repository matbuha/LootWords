const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
  await page.goto('http://127.0.0.1:8123/', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    const storage = await import('/scripts/storage.js');
    const profile = storage.createInitialProfile();
    profile.rewardBoxes = 1;
    profile.rewardBoxesEarned = 1;
    storage.saveProfile(profile);
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('[data-route]')].find((el) => el.dataset.route === 'reward');
    if (btn) btn.click();
  });
  await page.waitForTimeout(250);
  for (let i = 0; i < 3; i += 1) {
    await page.evaluate(() => {
      const button = document.querySelector('[data-reward-box="true"]');
      if (button && !button.disabled) {
        button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }
    });
    await page.waitForTimeout(i === 2 ? 1600 : 320);
  }
  await page.waitForTimeout(700);
  const metrics = await page.evaluate(() => {
    const panel = document.querySelector('.reward-reveal');
    const stage = document.querySelector('.reward-reveal__stage');
    const launch = document.querySelector('.reward-reveal__launch');
    const card = document.querySelector('.reward-reveal__card--showcase .detail-card');
    const rect = (el) => el ? el.getBoundingClientRect().toJSON() : null;
    const style = (el) => el ? getComputedStyle(el).transform : null;
    return {
      panel: rect(panel),
      stage: rect(stage),
      launch: rect(launch),
      card: rect(card),
      word: card?.querySelector('.detail-card__word')?.textContent?.trim() ?? null,
      launchTransform: style(launch),
      cardTransform: style(card),
    };
  });
  await page.screenshot({ path: '.codex-artifacts/pronunciation-pass/reward-he-fixed-desktop-final-2.png', fullPage: true });
  console.log(JSON.stringify(metrics, null, 2));
  await browser.close();
})();
