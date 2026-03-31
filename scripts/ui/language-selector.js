import { t } from "../core/i18n.js";
import { LANGUAGE_META, SUPPORTED_LANGUAGES } from "../data/translations.js";

export function renderLanguageSelector(currentLanguage) {
  const active = LANGUAGE_META[currentLanguage];

  return `
    <div class="language-selector" data-language-selector="true">
      <button
        class="language-selector__trigger"
        type="button"
        data-language-trigger="true"
        aria-haspopup="menu"
        aria-expanded="false"
        aria-label="${t("languageSelector.aria")}"
      >
        <span class="language-selector__flag" aria-hidden="true">${active.flag}</span>
        <span class="language-selector__label" lang="${active.id}">${active.nativeLabel}</span>
        <span class="language-selector__caret" aria-hidden="true">▾</span>
      </button>
      <div class="language-selector__menu" data-language-menu="true" role="menu" hidden>
        ${SUPPORTED_LANGUAGES.map((languageId) => {
          const option = LANGUAGE_META[languageId];
          return `
            <button
              class="language-option ${languageId === currentLanguage ? "is-active" : ""}"
              type="button"
              role="menuitemradio"
              aria-checked="${languageId === currentLanguage ? "true" : "false"}"
              data-language-option="${languageId}"
            >
              <span class="language-option__flag" aria-hidden="true">${option.flag}</span>
              <span class="language-option__label" lang="${option.id}">${option.nativeLabel}</span>
            </button>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

export function wireLanguageSelector(root, { currentLanguage, onSelect, onOpen }) {
  const host = root.querySelector("[data-language-selector='true']");
  if (!host) {
    return () => {};
  }

  const trigger = host.querySelector("[data-language-trigger='true']");
  const menu = host.querySelector("[data-language-menu='true']");

  const closeMenu = () => {
    trigger?.setAttribute("aria-expanded", "false");
    menu?.setAttribute("hidden", "");
  };

  const openMenu = () => {
    trigger?.setAttribute("aria-expanded", "true");
    menu?.removeAttribute("hidden");
    onOpen?.();
  };

  const toggleMenu = (event) => {
    event.stopPropagation();
    if (menu?.hasAttribute("hidden")) {
      openMenu();
      return;
    }

    closeMenu();
  };

  const handleOutsideClick = (event) => {
    if (!host.contains(event.target)) {
      closeMenu();
    }
  };

  const handleEscape = (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  };

  trigger?.addEventListener("click", toggleMenu);
  document.addEventListener("click", handleOutsideClick);
  document.addEventListener("keydown", handleEscape);

  host.querySelectorAll("[data-language-option]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const nextLanguage = button.dataset.languageOption;
      closeMenu();
      if (nextLanguage && nextLanguage !== currentLanguage) {
        onSelect(nextLanguage);
      }
    });
  });

  return () => {
    trigger?.removeEventListener("click", toggleMenu);
    document.removeEventListener("click", handleOutsideClick);
    document.removeEventListener("keydown", handleEscape);
  };
}
