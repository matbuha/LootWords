const FIREBASE_VERSION = "10.12.5";

export const FIREBASE_MODULE_URLS = {
  app: `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`,
  auth: `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth.js`,
  firestore: `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`,
};

function normalizeFirebaseConfig(rawConfig) {
  if (!rawConfig || typeof rawConfig !== "object") {
    return null;
  }

  const config = {
    apiKey: typeof rawConfig.apiKey === "string" ? rawConfig.apiKey.trim() : "",
    authDomain: typeof rawConfig.authDomain === "string" ? rawConfig.authDomain.trim() : "",
    projectId: typeof rawConfig.projectId === "string" ? rawConfig.projectId.trim() : "",
    appId: typeof rawConfig.appId === "string" ? rawConfig.appId.trim() : "",
    storageBucket: typeof rawConfig.storageBucket === "string" ? rawConfig.storageBucket.trim() : undefined,
    messagingSenderId:
      typeof rawConfig.messagingSenderId === "string" ? rawConfig.messagingSenderId.trim() : undefined,
  };

  if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
    return null;
  }

  return config;
}

function readMetaConfig() {
  return null;
}

export async function loadFirebaseRuntimeConfig() {
  const globalConfig = normalizeFirebaseConfig(window.__LOOTWORDS_FIREBASE_CONFIG ?? null);
  if (globalConfig) {
    return globalConfig;
  }

  return readMetaConfig();
}
