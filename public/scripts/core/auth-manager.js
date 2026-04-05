import { FIREBASE_MODULE_URLS, loadFirebaseRuntimeConfig } from "../data/firebase-config.js";

const GUEST_SNAPSHOT = Object.freeze({
  status: "loading",
  available: false,
  configured: false,
  mode: "guest",
  user: null,
  profile: null,
  error: null,
  needsSetup: false,
});

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function mapAuthError(error) {
  const code = typeof error?.code === "string" ? error.code : "";

  switch (code) {
    case "auth/email-already-in-use":
      return "auth.errors.emailInUse";
    case "auth/invalid-email":
      return "auth.errors.invalidEmail";
    case "auth/weak-password":
      return "auth.errors.weakPassword";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "auth.errors.invalidCredentials";
    case "auth/network-request-failed":
      return "auth.errors.network";
    case "auth/too-many-requests":
      return "auth.errors.tooManyRequests";
    case "auth/configuration-not-found":
    case "auth/operation-not-allowed":
      return "auth.errors.notAvailable";
    default:
      return "auth.errors.generic";
  }
}

function buildUserSummary(user) {
  if (!user) {
    return null;
  }

  return {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? "",
    isAnonymous: Boolean(user.isAnonymous),
    providerIds: Array.isArray(user.providerData) ? user.providerData.map((entry) => entry?.providerId).filter(Boolean) : [],
  };
}

function withTimeout(promise, timeoutMs, timeoutError) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => {
        reject(timeoutError);
      }, timeoutMs);
    }),
  ]);
}

async function importFirebaseModules() {
  const [appModule, authModule] = await Promise.all([
    import(FIREBASE_MODULE_URLS.app),
    import(FIREBASE_MODULE_URLS.auth),
  ]);

  return { appModule, authModule };
}

export function createAuthManager() {
  let snapshot = { ...GUEST_SNAPSHOT };
  let authApi = null;
  let authStateUnsubscribe = () => {};
  let initPromise = null;
  let initialized = false;
  let initialAuthStateResolved = false;
  const listeners = new Set();

  function notify() {
    listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (error) {
        console.warn("LootWords auth listener failed.", error);
      }
    });
  }

  function setSnapshot(partialSnapshot) {
    snapshot = {
      ...snapshot,
      ...partialSnapshot,
    };
    notify();
  }

  async function initialize() {
    if (initPromise) {
      return initPromise;
    }

    initPromise = (async () => {
      const firebaseConfig = await loadFirebaseRuntimeConfig();
      if (!firebaseConfig) {
        initialized = true;
        initialAuthStateResolved = true;
        setSnapshot({
          status: "ready",
          available: false,
          configured: false,
          mode: "guest",
          user: null,
          profile: null,
          error: null,
          needsSetup: true,
        });
        return snapshot;
      }

      try {
        const { appModule, authModule } = await importFirebaseModules();
        const { getApps, initializeApp } = appModule;
        const {
          browserLocalPersistence,
          createUserWithEmailAndPassword,
          getAuth,
          onAuthStateChanged,
          setPersistence,
          signInWithEmailAndPassword,
          signOut,
        } = authModule;

        const app = getApps().find((entry) => entry.name === "lootwords") ?? initializeApp(firebaseConfig, "lootwords");
        const auth = getAuth(app);

        authApi = {
          auth,
          createUserWithEmailAndPassword,
          signInWithEmailAndPassword,
          signOut,
        };

        await setPersistence(auth, browserLocalPersistence);

        await new Promise((resolve) => {
          authStateUnsubscribe = onAuthStateChanged(auth, async (user) => {
            setSnapshot({
              status: "ready",
              available: true,
              configured: true,
              mode: user ? "authenticated" : "guest",
              user: buildUserSummary(user),
              profile: null,
              error: null,
              needsSetup: false,
            });

            if (!initialAuthStateResolved) {
              initialAuthStateResolved = true;
              resolve();
            }
          });
        });

        initialized = true;
        return snapshot;
      } catch (error) {
        initialized = true;
        initialAuthStateResolved = true;
        setSnapshot({
          status: "ready",
          available: false,
          configured: true,
          mode: "guest",
          user: null,
          profile: null,
          error: "auth.errors.initFailed",
          needsSetup: false,
        });
        return snapshot;
      }
    })();

    return initPromise;
  }

  async function ensureReady() {
    if (!initialized) {
      await initialize();
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
    isAuthenticated() {
      return snapshot.mode === "authenticated" && Boolean(snapshot.user?.uid);
    },
    async signUp(email, password) {
      await ensureReady();
      const normalizedEmail = normalizeEmail(email);

      if (!snapshot.available || !authApi) {
        return { ok: false, messageKey: "auth.errors.notAvailable" };
      }

      try {
        const credential = await withTimeout(
          authApi.createUserWithEmailAndPassword(authApi.auth, normalizedEmail, password),
          15000,
          { code: "auth/network-request-failed" },
        );
        setSnapshot({
          status: "ready",
          available: true,
          configured: true,
          mode: credential.user ? "authenticated" : "guest",
          user: buildUserSummary(credential.user),
          profile: null,
          error: null,
          needsSetup: false,
        });
        return { ok: true };
      } catch (error) {
        return {
          ok: false,
          messageKey: mapAuthError(error),
        };
      }
    },
    async signIn(email, password) {
      await ensureReady();
      const normalizedEmail = normalizeEmail(email);

      if (!snapshot.available || !authApi) {
        return { ok: false, messageKey: "auth.errors.notAvailable" };
      }

      try {
        const credential = await withTimeout(
          authApi.signInWithEmailAndPassword(authApi.auth, normalizedEmail, password),
          15000,
          { code: "auth/network-request-failed" },
        );
        setSnapshot({
          status: "ready",
          available: true,
          configured: true,
          mode: credential.user ? "authenticated" : "guest",
          user: buildUserSummary(credential.user),
          profile: null,
          error: null,
          needsSetup: false,
        });
        return { ok: true };
      } catch (error) {
        return {
          ok: false,
          messageKey: mapAuthError(error),
        };
      }
    },
    async signOut() {
      await ensureReady();

      if (!snapshot.available || !authApi) {
        return { ok: false, messageKey: "auth.errors.notAvailable" };
      }

      try {
        await withTimeout(authApi.signOut(authApi.auth), 15000, { code: "auth/network-request-failed" });
        setSnapshot({
          status: "ready",
          available: true,
          configured: true,
          mode: "guest",
          user: null,
          profile: null,
          error: null,
          needsSetup: false,
        });
        return { ok: true };
      } catch (error) {
        return {
          ok: false,
          messageKey: mapAuthError(error),
        };
      }
    },
    destroy() {
      authStateUnsubscribe();
      listeners.clear();
    },
  };
}
