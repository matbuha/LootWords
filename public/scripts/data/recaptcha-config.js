function normalizeProvider(value) {
  return value === "v3" ? "v3" : "enterprise";
}

export function loadRecaptchaRuntimeConfig() {
  const rawConfig = window.__LOOTWORDS_RECAPTCHA_CONFIG;
  if (!rawConfig || typeof rawConfig !== "object") {
    return {
      enabled: false,
      configured: false,
      provider: "enterprise",
      siteKey: "",
      actionPrefix: "lootwords_auth",
    };
  }

  const siteKey = typeof rawConfig.siteKey === "string" ? rawConfig.siteKey.trim() : "";
  const actionPrefix =
    typeof rawConfig.actionPrefix === "string" && rawConfig.actionPrefix.trim()
      ? rawConfig.actionPrefix.trim()
      : "lootwords_auth";
  const enabled = Boolean(rawConfig.enabled && siteKey);

  return {
    enabled,
    configured: Boolean(siteKey),
    provider: normalizeProvider(rawConfig.provider),
    siteKey,
    actionPrefix,
  };
}
