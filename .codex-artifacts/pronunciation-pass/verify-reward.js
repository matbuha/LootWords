const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
  await page.goto('http://127.0.0.1:8123/', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  const pick = async (route) => {
    const btn = [...document.querySelectorAll('[data-route]')].find((el) => el.dataset.route === route);
    if (btn) btn.click();
  };
  await page.evaluate(pick, 'play');
  await page.waitForTimeout(150);
  // win a game quickly
  const startBtn = page.locator('[data-game-choice="loot-pop"]');
  if (await startBtn.count()) await startBtn.first().click();
  await page.waitForTimeout(150);
  await page.evaluate(() => {
    const button = [...document.querySelectorAll('[data-quick-target]')][0];
    if (!button) return;
    const trigger = () => button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    for (let i = 0; i < 3; i += 1) trigger();
  });
  await page.waitForTimeout(2200);
  await page.evaluate(pick, 'reward');
  await page.waitForTimeout(250);
  for (let i = 0; i < 3; i += 1) {
    await page.locator('[data-reward-box="true"]').click();
    await page.waitForTimeout(i === 2 ? 1450 : 260);
  }
  await page.waitForTimeout(600);
  const metrics = await page.evaluate(() => {
    const panel = document.querySelector('.reward-reveal');
    const stage = document.querySelector('.reward-reveal__stage');
    const launch = document.querySelector('.reward-reveal__launch');
    const card = document.querySelector('.reward-reveal__card--showcase .detail-card');
    const spin = document.querySelector('.reward-reveal__spin');
    const rect = (el) => el ? el.getBoundingClientRect().toJSON() : null;
    const style = (el) => el ? getComputedStyle(el).transform : null;
    return {
      panel: rect(panel),
      stage: rect(stage),
      launch: rect(launch),
      spin: rect(spin),
      card: rect(card),
      launchTransform: style(launch),
      cardTransform: style(card),
      word: card?.querySelector('.detail-card__word')?.textContent?.trim() ?? null,
    };
  });
  await page.screenshot({ path: '.codex-artifacts/pronunciation-pass/reward-he-fixed-desktop-final-2.png', fullPage: true });
  console.log(JSON.stringify(metrics, null, 2));
  await browser.close();
})();
