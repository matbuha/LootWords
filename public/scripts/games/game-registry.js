import { GAME_CONFIG } from "../data/config.js";
import { mountFlashFindGame } from "./quick-select-game.js";
import { mountImageRevealGame } from "./image-reveal-game.js";
import { mountMatchGame } from "./match-game.js";
import { mountMemoryGame } from "./memory-game.js";
import { mountReactionGame } from "./reaction-game.js";
import { mountRepeatAfterMeGame } from "./repeat-after-me-game.js";
import { mountSequenceMemoryGame } from "./sequence-memory-game.js";
import { mountTapTheWordGame } from "./tap-the-word-game.js";

const GAME_MOUNTS = {
  "memory-match": mountMemoryGame,
  "picture-match": mountMatchGame,
  "flash-find": mountFlashFindGame,
  "image-reveal": mountImageRevealGame,
  "loot-pop": mountReactionGame,
  "repeat-after-me": mountRepeatAfterMeGame,
  "sequence-memory": mountSequenceMemoryGame,
  "tap-the-word": mountTapTheWordGame,
};

export function getGameEntries() {
  return Object.values(GAME_CONFIG).map((game) => ({
    ...game,
    mount: GAME_MOUNTS[game.id],
  }));
}

export function getGameDefinition(gameId) {
  return (
    getGameEntries().find((game) => game.id === gameId) ??
    getGameEntries().find((game) => game.id === "memory-match")
  );
}

export function getGameIds() {
  return getGameEntries().map((game) => game.id);
}

export function getRandomGameId({ excludeGameId = null } = {}) {
  const candidates = getGameIds().filter((gameId) => gameId !== excludeGameId);
  if (!candidates.length) {
    return excludeGameId ?? "memory-match";
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
}
