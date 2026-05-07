export const CARD_EVOLUTION_CONFIG = Object.freeze({
  enabled: true,
  authenticatedOnly: true,
  maxLevel: 5,
  thresholds: Object.freeze([0, 30, 80, 150, 250]),
  xpEvents: Object.freeze({
    "tap-the-word.correct": 5,
    "sequence-memory.correct": 4,
    "repeat-after-me.round-complete": 4,
    "image-reveal.correct": 6,
    "collection.listen": 1,
    "duplicate-card": 20,
  }),
  dailyCaps: Object.freeze({
    "collection.listen": 5,
    "per-card-total": 60,
  }),
  cooldownMs: Object.freeze({
    "collection.listen": 5 * 60 * 1000,
  }),
  duplicateCardBehavior: "stars",
});
