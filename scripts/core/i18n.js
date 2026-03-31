import { DEFAULT_LANGUAGE, LANGUAGE_META, SUPPORTED_LANGUAGES, TRANSLATIONS } from "../data/translations.js";

let currentLanguage = DEFAULT_LANGUAGE;

function readPath(source, path) {
  return path.split(".").reduce((value, segment) => {
    if (!value || typeof value !== "object") {
      return undefined;
    }

    return value[segment];
  }, source);
}

export function normalizeLanguage(language) {
  return SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
}

export function setLanguage(language) {
  currentLanguage = normalizeLanguage(language);
  return currentLanguage;
}

export function getLanguage() {
  return currentLanguage;
}

export function getLanguageMeta(language = currentLanguage) {
  return LANGUAGE_META[normalizeLanguage(language)];
}

export function getDirection(language = currentLanguage) {
  return getLanguageMeta(language).dir;
}

export function getLocale(language = currentLanguage) {
  return getLanguageMeta(language).locale;
}

export function t(key, params = {}, language = currentLanguage) {
  const normalizedLanguage = normalizeLanguage(language);
  const template =
    readPath(TRANSLATIONS[normalizedLanguage], key) ??
    readPath(TRANSLATIONS[DEFAULT_LANGUAGE], key) ??
    key;

  if (typeof template !== "string") {
    return key;
  }

  return template.replace(/\{(\w+)\}/g, (_, token) => {
    return token in params ? String(params[token]) : `{${token}}`;
  });
}

export function formatNumber(value, language = currentLanguage) {
  return new Intl.NumberFormat(getLocale(language)).format(value);
}

export function formatPoints(value, language = currentLanguage) {
  return t("common.pointsValue", { value: formatNumber(value, language) }, language);
}

export function formatDate(value, language = currentLanguage) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(getLocale(language), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function categoryLabel(categoryId, language = currentLanguage) {
  return t(`categories.${categoryId}`, {}, language);
}

export function packLabel(packId, language = currentLanguage) {
  return t(`packs.${packId}`, {}, language);
}

export function rarityLabel(rarityId, language = currentLanguage) {
  return t(`rarities.${rarityId}`, {}, language);
}

export function difficultyLabel(level, language = currentLanguage) {
  return t(`difficulties.${level}`, {}, language);
}

export function collectionSortLabel(sortId, language = currentLanguage) {
  return t(`sorts.collection.${sortId}`, {}, language);
}

export function learnSortLabel(sortId, language = currentLanguage) {
  return t(`sorts.learn.${sortId}`, {}, language);
}

export function gameText(gameId, field, language = currentLanguage) {
  return t(`games.${gameId}.${field}`, {}, language);
}
