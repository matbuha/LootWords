const COUNT_FORMATTERS = {
  integer: new Intl.NumberFormat("en-US"),
  points: new Intl.NumberFormat("en-US"),
};

const PRESSABLE_SELECTOR = [
  "button:not([disabled])",
  "a.nav-link",
  "a.parent-entry-button",
  ".collection-card-button",
  ".game-choice",
  ".parent-nav__button",
  ".parent-toggle",
].join(", ");

function formatCount(value, format = "integer") {
  const formatter = COUNT_FORMATTERS[format] ?? COUNT_FORMATTERS.integer;
  return formatter.format(Math.round(value));
}

export function createUiEffects() {
  const counterMemory = new Map();
  let applyToken = 0;

  function animateCount(element) {
    const target = Number.parseInt(element.dataset.countTo ?? "", 10);
    if (!Number.isFinite(target)) {
      return;
    }

    const key = element.dataset.countKey ?? element.textContent.trim();
    const format = element.dataset.countFormat ?? "integer";
    const duration = Number.parseInt(element.dataset.countDuration ?? "720", 10);
    const start = counterMemory.get(key) ?? 0;
    const delta = target - start;

    if (!delta) {
      element.textContent = formatCount(target, format);
      return;
    }

    const startedAt = window.performance.now();

    const step = (now) => {
      if (!document.body.contains(element)) {
        return;
      }

      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = start + delta * eased;

      element.textContent = formatCount(nextValue, format);

      if (progress < 1) {
        window.requestAnimationFrame(step);
        return;
      }

      counterMemory.set(key, target);
      element.textContent = formatCount(target, format);
    };

    window.requestAnimationFrame(step);
  }

  function animateProgressFill(fill) {
    fill.classList.remove("is-animated");
    fill.style.setProperty("--progress-current", "0");
    window.requestAnimationFrame(() => {
      if (!document.body.contains(fill)) {
        return;
      }
      fill.classList.add("is-animated");
      fill.style.setProperty("--progress-current", fill.dataset.progressFill ?? "0");
    });
  }

  function wirePressable(element) {
    const release = () => {
      if (!element.classList.contains("is-pressing")) {
        return;
      }

      element.classList.remove("is-pressing");
      element.classList.remove("is-rebounding");
      void element.offsetWidth;
      element.classList.add("is-rebounding");
    };

    element.addEventListener("pointerdown", () => {
      element.classList.remove("is-rebounding");
      element.classList.add("is-pressing");
    });
    element.addEventListener("pointerup", release);
    element.addEventListener("pointercancel", release);
    element.addEventListener("mouseleave", release);
    element.addEventListener("blur", release);
    element.addEventListener("animationend", () => {
      element.classList.remove("is-rebounding");
    });
  }

  return {
    apply(root) {
      applyToken += 1;
      const token = applyToken;

      root.querySelectorAll(PRESSABLE_SELECTOR).forEach((element) => {
        wirePressable(element);
      });

      window.requestAnimationFrame(() => {
        if (token !== applyToken) {
          return;
        }

        root.querySelectorAll("[data-progress-fill]").forEach((fill) => {
          animateProgressFill(fill);
        });

        root.querySelectorAll("[data-count-to]").forEach((element) => {
          animateCount(element);
        });
      });
    },
    destroy() {
      applyToken += 1;
    },
  };
}
