import { getDirection, getLanguageMeta, normalizeLanguage, setLanguage } from "./i18n.js";

function applyLanguageToDocument(language) {
  const meta = getLanguageMeta(language);
  const direction = getDirection(language);

  document.documentElement.lang = meta.id;
  document.documentElement.dir = direction;
  document.body.lang = meta.id;
  document.body.dir = direction;
  document.body.dataset.language = meta.id;
  document.body.dataset.direction = direction;
}

export function createLanguageManager(initialLanguage) {
  let currentLanguage = normalizeLanguage(initialLanguage);
  setLanguage(currentLanguage);

  return {
    getLanguage() {
      return currentLanguage;
    },
    setLanguage(language) {
      currentLanguage = normalizeLanguage(language);
      setLanguage(currentLanguage);
      applyLanguageToDocument(currentLanguage);
      return currentLanguage;
    },
    apply() {
      applyLanguageToDocument(currentLanguage);
    },
    getDirection() {
      return getDirection(currentLanguage);
    },
  };
}
