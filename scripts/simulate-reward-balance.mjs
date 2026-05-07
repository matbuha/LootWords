import { CARD_LIBRARY } from "../public/scripts/data/cards.js";
import { createInitialProfile } from "../public/scripts/storage.js";
import { beginBoxOpeningSession, advanceBoxOpeningSession } from "../public/scripts/core/box-opening-manager.js";
import { getRewardCatalog } from "../public/scripts/data/loot.js";

function mulberry32(seed) {
  let t = seed >>> 0;
  return function random() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function makeRandom(seed) {
  return mulberry32(seed);
}

function parseArgs(argv) {
  const out = { seed: 12345, boxes: 100000 };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--seed") out.seed = Number.parseInt(argv[++index], 10);
    if (value === "--boxes") out.boxes = Number.parseInt(argv[++index], 10);
  }
  return out;
}

function createProfile({ opened = 0, unlockedCardCount = 0, allCosmeticsOwned = false, guest = false, duplicateRewardsEnabled = false } = {}) {
  const profile = createInitialProfile();
  profile.rewardBoxes = 999999;
  profile.rewardBoxesOpened = opened;
  profile.parentMode.rewards.duplicateRewardsEnabled = duplicateRewardsEnabled;
  profile.unlockedCardIds = CARD_LIBRARY.slice(0, unlockedCardCount).map((card) => card.id);
  profile.inventory.stickers = allCosmeticsOwned ? getRewardCatalog("sticker").filter((item) => !item.defaultOwned).map((item) => item.id) : [];
  profile.inventory.cursorSkins = allCosmeticsOwned ? getRewardCatalog("cursor-skin").filter((item) => !item.defaultOwned).map((item) => item.id) : [];
  profile.inventory.uiThemePacks = allCosmeticsOwned ? getRewardCatalog("ui-theme-pack").filter((item) => !item.defaultOwned).map((item) => item.id) : [];
  profile.inventory.profileBackgrounds = allCosmeticsOwned ? getRewardCatalog("profile-background").filter((item) => !item.defaultOwned).map((item) => item.id) : [];
  profile.inventory.profileAvatars = allCosmeticsOwned ? getRewardCatalog("profile-avatar").filter((item) => !item.defaultOwned).map((item) => item.id) : [];
  if (guest) {
    profile.rewardBoxesOpened = 0;
  }
  return profile;
}

function createAuthState(kind = "authenticated") {
  return kind === "authenticated"
    ? { mode: "authenticated", user: { uid: "sim-user" } }
    : { mode: "guest", user: null };
}

function createScenario(name, options) {
  return { name, profile: createProfile(options), authState: createAuthState(options.guest ? "guest" : "authenticated"), allowAccountInventoryRewards: !options.guest };
}

function runOpening(profile, authState, random, allowAccountInventoryRewards) {
  let openingResult = beginBoxOpeningSession({ profile, cards: CARD_LIBRARY, random, allowAccountInventoryRewards });
  if (openingResult.status !== "started") {
    return openingResult;
  }

  let opening = openingResult.opening;
  for (;;) {
    const next = advanceBoxOpeningSession({
      profile,
      cards: CARD_LIBRARY,
      opening,
      random,
      allowAccountInventoryRewards,
    });

    if (next.status === "progress" || next.status === "upgraded") {
      opening = next.opening;
      continue;
    }

    return next;
  }
}

function increment(map, key, amount = 1) {
  map.set(key, (map.get(key) ?? 0) + amount);
}

function formatPercent(value) {
  return `${(value * 100).toFixed(2)}%`;
}

function summarizeScenario({ name, profile, authState, allowAccountInventoryRewards }, boxes, seed) {
  const random = makeRandom(seed);
  const rarityCounts = new Map();
  const rewardTypeCounts = new Map();
  const upgradeCounts = new Map();
  const tapsCounts = new Map();
  let coins = 0;
  let duplicateCoins = 0;
  let firstLegendOpen = null;

  for (let index = 0; index < boxes; index += 1) {
    const snapshot = {
      ...profile,
      rewardBoxesOpened: profile.rewardBoxesOpened + index,
      rewardBoxes: 999999,
    };
    const result = runOpening(snapshot, authState, random, allowAccountInventoryRewards);
    const reward = result.reward ?? result.reveal ?? result.opening?.finalReward;
    if (!reward) continue;

    increment(rarityCounts, reward.rarity ?? "blocked");
    increment(rewardTypeCounts, reward.rewardType ?? reward.type ?? "unknown");
    increment(upgradeCounts, result.opening?.upgradeHistory?.length ?? 0);
    increment(tapsCounts, result.opening?.totalClicks ?? 0);

    if (reward.type === "coins" || reward.type === "duplicate" || reward.type === "sticker-duplicate") {
      coins += reward.amount ?? 0;
      if (reward.type !== "coins") {
        duplicateCoins += reward.amount ?? 0;
      }
    }

    if (!firstLegendOpen && reward.rarity === "legend") {
      firstLegendOpen = index + 1;
    }
  }

  const total = boxes;
  const rarityOrder = ["common", "uncommon", "rare", "mythic", "epic", "legend"];
  const rewardTypes = ["card", "coins", "sticker", "cursor-skin", "ui-theme-pack", "profile-background", "profile-avatar", "duplicate", "sticker-duplicate"];

  console.log(`\n## ${name}`);
  console.log(`boxes: ${total} seed: ${seed}`);
  console.log("rarity distribution:");
  for (const rarity of rarityOrder) {
    const count = rarityCounts.get(rarity) ?? 0;
    console.log(`  ${rarity}: ${count} (${formatPercent(count / total)})`);
  }
  console.log("reward type distribution:");
  for (const type of rewardTypes) {
    const count = rewardTypeCounts.get(type) ?? 0;
    if (count) {
      console.log(`  ${type}: ${count} (${formatPercent(count / total)})`);
    }
  }
  console.log("upgrade counts:");
  for (const [count, hits] of [...upgradeCounts.entries()].sort((a, b) => Number(a[0]) - Number(b[0]))) {
    console.log(`  ${count}: ${hits}`);
  }
  console.log("taps:");
  for (const [count, hits] of [...tapsCounts.entries()].sort((a, b) => Number(a[0]) - Number(b[0]))) {
    console.log(`  ${count}: ${hits}`);
  }
  console.log(`coins total: ${coins} expected per box: ${(coins / total).toFixed(2)}`);
  console.log(`duplicate coins total: ${duplicateCoins}`);
  console.log(`first legend open index: ${firstLegendOpen ?? "none"}`);
}

const { seed, boxes } = parseArgs(process.argv.slice(2));

const scenarios = [
  createScenario("fresh authenticated account", { opened: 0, unlockedCardCount: 0 }),
  createScenario("after 10 opened boxes", { opened: 10, unlockedCardCount: 4 }),
  createScenario("after 50 opened boxes", { opened: 50, unlockedCardCount: 12 }),
  createScenario("near-complete card collection", { opened: 50, unlockedCardCount: Math.max(0, CARD_LIBRARY.length - 4) }),
  createScenario("all cosmetics owned", { opened: 50, unlockedCardCount: 12, allCosmeticsOwned: true }),
  createScenario("guest account", { opened: 0, unlockedCardCount: 0, guest: true }),
  createScenario("duplicate rewards enabled", { opened: 50, unlockedCardCount: Math.floor(CARD_LIBRARY.length / 2), duplicateRewardsEnabled: true }),
];

for (let index = 0; index < scenarios.length; index += 1) {
  summarizeScenario(scenarios[index], boxes, seed + index * 101);
}
