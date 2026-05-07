import { CARD_EVOLUTION_CONFIG } from "../data/card-evolution.js";

function clampInteger(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function getEvolutionLevel(xp) {
  const safeXp = clampInteger(xp);
  let level = 1;
  CARD_EVOLUTION_CONFIG.thresholds.forEach((threshold, index) => {
    if (safeXp >= threshold) {
      level = index + 1;
    }
  });
  return Math.min(level, CARD_EVOLUTION_CONFIG.maxLevel);
}

export function getEvolutionProgress(xp) {
  const safeXp = clampInteger(xp);
  const level = getEvolutionLevel(safeXp);
  const nextThreshold = CARD_EVOLUTION_CONFIG.thresholds[Math.min(level, CARD_EVOLUTION_CONFIG.thresholds.length - 1)] ?? safeXp;
  const currentThreshold = CARD_EVOLUTION_CONFIG.thresholds[level - 1] ?? 0;
  return {
    level,
    xp: safeXp,
    current: safeXp,
    target: level >= CARD_EVOLUTION_CONFIG.maxLevel ? safeXp : nextThreshold,
    progress: level >= CARD_EVOLUTION_CONFIG.maxLevel ? 1 : Math.min(1, (safeXp - currentThreshold) / Math.max(1, nextThreshold - currentThreshold)),
    maxLevel: CARD_EVOLUTION_CONFIG.maxLevel,
  };
}

export function getEvolutionVisualState(level) {
  if (level >= 5) return "mastered";
  if (level >= 4) return "star";
  if (level >= 3) return "glow";
  if (level >= 2) return "shine";
  return "sprout";
}

export function createEmptyCardEvolutionState() {
  return {};
}

export function normalizeCardEvolution(raw, unlockedCardIds = []) {
  const unlocked = new Set(Array.isArray(unlockedCardIds) ? unlockedCardIds : []);
  const source = raw && typeof raw === "object" ? raw : {};
  return Object.entries(source).reduce((accumulator, [cardId, entry]) => {
    if (!unlocked.has(cardId) || !entry || typeof entry !== "object") {
      return accumulator;
    }
    const xp = clampInteger(entry.xp);
    const progress = getEvolutionProgress(xp);
    accumulator[cardId] = {
      xp,
      level: progress.level,
      lastXpAt: typeof entry.lastXpAt === "string" && !Number.isNaN(Date.parse(entry.lastXpAt)) ? entry.lastXpAt : null,
      sourceCounts: {
        ...(entry.sourceCounts && typeof entry.sourceCounts === "object" ? entry.sourceCounts : {}),
      },
      cooldowns: {
        ...(entry.cooldowns && typeof entry.cooldowns === "object" ? entry.cooldowns : {}),
      },
    };
    return accumulator;
  }, {});
}

export function getCardEvolution(cardId, profile) {
  const entry = profile?.cardEvolutionByCardId?.[cardId] ?? null;
  return entry ? { ...entry, ...getEvolutionProgress(entry.xp) } : { xp: 0, level: 1, current: 0, target: CARD_EVOLUTION_CONFIG.thresholds[1] ?? 30, progress: 0, maxLevel: CARD_EVOLUTION_CONFIG.maxLevel };
}

export function awardCardXp(profile, authState, events = []) {
  if (CARD_EVOLUTION_CONFIG.authenticatedOnly && (authState?.mode !== "authenticated" || !authState.user?.uid)) {
    return profile;
  }
  const next = { ...profile, cardEvolutionByCardId: { ...(profile.cardEvolutionByCardId ?? {}) } };
  const nowIso = new Date().toISOString();
  for (const event of Array.isArray(events) ? events : [events]) {
    if (!event?.cardId || !event?.source) continue;
    if (!profile.unlockedCardIds?.includes(event.cardId)) continue;
    const amount = CARD_EVOLUTION_CONFIG.xpEvents[event.source] ?? 0;
    if (amount <= 0) continue;
    const current = next.cardEvolutionByCardId[event.cardId] ?? { xp: 0, level: 1, lastXpAt: null, sourceCounts: {}, cooldowns: {} };
    const perCardXp = current.xp ?? 0;
    if (perCardXp >= CARD_EVOLUTION_CONFIG.dailyCaps["per-card-total"]) continue;
    if (event.source === "collection.listen") {
      const lastAt = current.cooldowns?.[event.source];
      if (lastAt && Date.now() - Date.parse(lastAt) < CARD_EVOLUTION_CONFIG.cooldownMs[event.source]) continue;
    }
    const nextXp = Math.min(CARD_EVOLUTION_CONFIG.dailyCaps["per-card-total"], perCardXp + amount);
    next.cardEvolutionByCardId[event.cardId] = {
      ...current,
      xp: nextXp,
      level: getEvolutionLevel(nextXp),
      lastXpAt: nowIso,
      sourceCounts: {
        ...(current.sourceCounts ?? {}),
        [event.source]: (current.sourceCounts?.[event.source] ?? 0) + 1,
      },
      cooldowns: event.source === "collection.listen" ? { ...(current.cooldowns ?? {}), [event.source]: nowIso } : { ...(current.cooldowns ?? {}) },
    };
  }
  return next;
}

export function applyDuplicateCardEvolution(profile, cardId, rarity, context = {}) {
  return awardCardXp(profile, context.authState, [{ source: "duplicate-card", cardId, rarity }]);
}
