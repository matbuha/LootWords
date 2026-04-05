import { loadRecaptchaRuntimeConfig } from "../data/recaptcha-config.js";

const BASE_SNAPSHOT = Object.freeze({
  status: "loading",
  enabled: false,
  configured: false,
  available: false,
  provider: "enterprise",
  siteKey: "",
  actionPrefix: "lootwords_auth",
  errorKey: "",
  devNoteKey: "",
});

function isLocalHost() {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

function getScriptUrl(provider, siteKey) {
  const base =
    provider === "enterprise"
      ? "https://www.google.com/recaptcha/enterprise.js"
      : "https://www.google.com/recaptcha/api.js";
  return `${base}?render=${encodeURIComponent(siteKey)}`;
}

function getRecaptchaApi(provider) {
  if (!window.grecaptcha) {
    return null;
  }

  return provider === "enterprise" ? window.grecaptcha.enterprise ?? null : window.grecaptcha;
}

function sanitizeActionName(actionPrefix, action) {
  return `${actionPrefix}_${action}`.replace(/[^a-zA-Z0-9/_-]+/g, "_");
}

export function createRecaptchaManager() {
  let snapshot = { ...BASE_SNAPSHOT };
  let initPromise = null;
  const listeners = new Set();

  function notify() {
    listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (error) {
        console.warn("LootWords reCAPTCHA listener failed.", error);
      }
    });
  }

  function setSnapshot(partial) {
    snapshot = {
      ...snapshot,
      ...partial,
    };
    notify();
  }

  async function loadScript(config) {
    const existingScript = document.querySelector('script[data-lootwords-recaptcha="true"]');
    if (!existingScript) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = getScriptUrl(config.provider, config.siteKey);
        script.async = true;
        script.defer = true;
        script.dataset.lootwordsRecaptcha = "true";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("recaptcha-script-load-failed"));
        document.head.append(script);
      });
    }

    await new Promise((resolve, reject) => {
      const api = getRecaptchaApi(config.provider);
      if (!api || typeof api.ready !== "function") {
        reject(new Error("recaptcha-api-missing"));
        return;
      }

      api.ready(resolve);
    });
  }

  async function initialize() {
    if (initPromise) {
      return initPromise;
    }

    initPromise = (async () => {
      const config = loadRecaptchaRuntimeConfig();
      if (!config.enabled) {
        setSnapshot({
          status: "ready",
          enabled: false,
          configured: config.configured,
          available: false,
          provider: config.provider,
          siteKey: config.siteKey,
          actionPrefix: config.actionPrefix,
          errorKey: "",
          devNoteKey: !config.configured && isLocalHost() ? "auth.recaptcha.setupBody" : "",
        });
        return snapshot;
      }

      try {
        await loadScript(config);
        setSnapshot({
          status: "ready",
          enabled: true,
          configured: true,
          available: true,
          provider: config.provider,
          siteKey: config.siteKey,
          actionPrefix: config.actionPrefix,
          errorKey: "",
          devNoteKey: "",
        });
      } catch (error) {
        console.warn("LootWords reCAPTCHA failed to initialize.", error);
        setSnapshot({
          status: "ready",
          enabled: true,
          configured: true,
          available: false,
          provider: config.provider,
          siteKey: config.siteKey,
          actionPrefix: config.actionPrefix,
          errorKey: "auth.errors.recaptchaUnavailable",
          devNoteKey: "auth.recaptcha.loadFailed",
        });
      }

      return snapshot;
    })();

    return initPromise;
  }

  async function ensureReady() {
    if (!initPromise) {
      await initialize();
    } else {
      await initPromise;
    }
    return snapshot;
  }

  return {
    getSnapshot() {
      return snapshot;
    },
    subscribe(listener) {
      if (typeof listener !== "function") {
        return () => {};
      }

      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    init() {
      return initialize();
    },
    async getToken(action) {
      const currentSnapshot = await ensureReady();
      if (!currentSnapshot.enabled) {
        return {
          ok: true,
          token: null,
          bypassed: true,
        };
      }

      if (!currentSnapshot.available) {
        return {
          ok: false,
          messageKey: currentSnapshot.errorKey || "auth.errors.recaptchaUnavailable",
        };
      }

      try {
        const api = getRecaptchaApi(currentSnapshot.provider);
        const token = await api.execute(currentSnapshot.siteKey, {
          action: sanitizeActionName(currentSnapshot.actionPrefix, action),
        });

        if (!token || typeof token !== "string") {
          return {
            ok: false,
            messageKey: "auth.errors.recaptchaUnavailable",
          };
        }

        return {
          ok: true,
          token,
          bypassed: false,
        };
      } catch (error) {
        console.warn("LootWords reCAPTCHA execute failed.", error);
        return {
          ok: false,
          messageKey: "auth.errors.recaptchaUnavailable",
        };
      }
    },
  };
}
