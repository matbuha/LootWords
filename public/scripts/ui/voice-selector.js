import { t } from "../core/i18n.js";

function getVoiceLabel(option) {
  return option.default ? `${option.label} (${t("speechSelector.defaultVoice")})` : option.label;
}

export function renderVoiceSelector({ selectedVoiceId, voiceOptions }) {
  const activeOption =
    voiceOptions.find((option) => option.id === selectedVoiceId) ??
    voiceOptions[0] ??
    null;

  return `
    <div class="voice-selector" data-voice-selector="true">
      <button
        class="voice-selector__trigger"
        type="button"
        data-voice-trigger="true"
        aria-haspopup="menu"
        aria-expanded="false"
        aria-label="${t("speechSelector.aria")}"
      >
        <span class="voice-selector__icon" aria-hidden="true">🗣</span>
        <span class="voice-selector__label">${activeOption ? activeOption.label : t("speechSelector.unavailable")}</span>
        <span class="voice-selector__caret" aria-hidden="true">▾</span>
      </button>
      <div class="voice-selector__menu" data-voice-menu="true" role="menu" hidden>
        ${
          voiceOptions.length
            ? voiceOptions.map((option) => `
                <button
                  class="voice-option ${option.id === activeOption?.id ? "is-active" : ""}"
                  type="button"
                  role="menuitemradio"
                  aria-checked="${option.id === activeOption?.id ? "true" : "false"}"
                  data-voice-option="${option.id}"
                >
                  <span class="voice-option__icon" aria-hidden="true">🗣</span>
                  <span class="voice-option__label">${getVoiceLabel(option)}</span>
                </button>
              `).join("")
            : `
              <div class="voice-selector__empty">
                ${t("speechSelector.unavailable")}
              </div>
            `
        }
      </div>
    </div>
  `;
}

export function wireVoiceSelector(root, { currentVoiceId, onSelect }) {
  const host = root.querySelector("[data-voice-selector='true']");
  if (!host) {
    return () => {};
  }

  const trigger = host.querySelector("[data-voice-trigger='true']");
  const menu = host.querySelector("[data-voice-menu='true']");

  const closeMenu = () => {
    trigger?.setAttribute("aria-expanded", "false");
    menu?.setAttribute("hidden", "");
  };

  const openMenu = () => {
    trigger?.setAttribute("aria-expanded", "true");
    menu?.removeAttribute("hidden");
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

  host.querySelectorAll("[data-voice-option]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const nextVoiceId = button.dataset.voiceOption;
      closeMenu();
      if (nextVoiceId && nextVoiceId !== currentVoiceId) {
        onSelect(nextVoiceId);
      }
    });
  });

  return () => {
    trigger?.removeEventListener("click", toggleMenu);
    document.removeEventListener("click", handleOutsideClick);
    document.removeEventListener("keydown", handleEscape);
  };
}
