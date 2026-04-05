import {
  DAILY_CHALLENGE_GAME_IDS,
  DAILY_CHALLENGE_REWARD_BOXES,
  DAILY_CHALLENGE_TIME_ZONE,
} from "../data/config.js";
import { FIREBASE_MODULE_URLS, loadFirebaseRuntimeConfig } from "../data/firebase-config.js";
import { createInitialProfile, normalizeProfile } from "../storage.js";

const DAILY_CHALLENGE_STATUS = Object.freeze({
  locked: "locked",
  available: "available",
  inProgress: "in_progress",
  completed: "completed",
});

const GUEST_SNAPSHOT = Object.freeze({
  status: "ready",
  access: "guest",
  backend: "firestore",
  backendReady: false,
  definition: null,
  state: null,
  canStart: false,
  canRetry: false,
  errorKey: "",
});

let firestoreApiPromise = null;

function getNowIso() {
  return new Date().toISOString();
}

function buildDateKey(value = Date.now()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: DAILY_CHALLENGE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(new Date(value));
  const partMap = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${partMap.year}-${partMap.month}-${partMap.day}`;
}

function hashDateKey(dateKey) {
  return [...dateKey].reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 7);
}

function buildDefinition(dateKey = buildDateKey()) {
  const gameId = DAILY_CHALLENGE_GAME_IDS[hashDateKey(dateKey) % DAILY_CHALLENGE_GAME_IDS.length] ?? "memory-match";

  return {
    id: `daily:${dateKey}:${gameId}:win-run`,
    dateKey,
    gameId,
    type: "win-run",
    reward: {
      rewardBoxes: DAILY_CHALLENGE_REWARD_BOXES,
    },
  };
}

function normalizeState(rawState, definition) {
  const fallback = {
    dateKey: definition.dateKey,
    challengeId: definition.id,
    gameId: definition.gameId,
    status: DAILY_CHALLENGE_STATUS.available,
    startedAt: null,
    completedAt: null,
    rewardGrantedAt: null,
    rewardBoxesGranted: 0,
    attempts: 0,
    lastAttemptAt: null,
  };

  if (!rawState || typeof rawState !== "object") {
    return fallback;
  }

  if (rawState.dateKey !== definition.dateKey || rawState.challengeId !== definition.id || rawState.gameId !== definition.gameId) {
    return fallback;
  }

  const allowedStatuses = new Set(Object.values(DAILY_CHALLENGE_STATUS));
  return {
    ...fallback,
    ...rawState,
    status: allowedStatuses.has(rawState.status) ? rawState.status : fallback.status,
    attempts: Math.max(0, Number.parseInt(rawState.attempts, 10) || 0),
    rewardBoxesGranted: Math.max(0, Number.parseInt(rawState.rewardBoxesGranted, 10) || 0),
  };
}

function buildSnapshot({ access, backendReady, definition, state, errorKey = "" }) {
  const normalizedState =
    access === "guest"
      ? {
          ...normalizeState(null, definition),
          status: DAILY_CHALLENGE_STATUS.locked,
        }
      : normalizeState(state, definition);

  return {
    status: "ready",
    access,
    backend: "firestore",
    backendReady,
    definition,
    state: normalizedState,
    canStart:
      access === "authenticated" &&
      backendReady &&
      normalizedState.status !== DAILY_CHALLENGE_STATUS.completed,
    canRetry:
      access === "authenticated" &&
      backendReady &&
      normalizedState.status !== DAILY_CHALLENGE_STATUS.completed,
    errorKey,
  };
}

async function getFirestoreApi() {
  if (firestoreApiPromise) {
    return firestoreApiPromise;
  }

  firestoreApiPromise = (async () => {
    const firebaseConfig = await loadFirebaseRuntimeConfig();
    if (!firebaseConfig) {
      return null;
    }

    const [appModule, firestoreModule] = await Promise.all([
      import(FIREBASE_MODULE_URLS.app),
      import(FIREBASE_MODULE_URLS.firestore),
    ]);
    const { getApps, initializeApp } = appModule;
    const { doc, getDoc, getFirestore, runTransaction, setDoc } = firestoreModule;

    const app = getApps().find((entry) => entry.name === "lootwords") ?? initializeApp(firebaseConfig, "lootwords");
    const db = getFirestore(app);

    return {
      db,
      doc,
      getDoc,
      runTransaction,
      setDoc,
    };
  })();

  return firestoreApiPromise;
}

function getProgressRef(firestoreApi, uid) {
  return firestoreApi.doc(firestoreApi.db, "users", uid, "progress", "main");
}

async function loadChallengeDocument(uid, definition) {
  const firestoreApi = await getFirestoreApi();
  if (!firestoreApi || !uid) {
    return null;
  }

  const snapshot = await firestoreApi.getDoc(getProgressRef(firestoreApi, uid));
  if (!snapshot.exists()) {
    return {
      state: normalizeState(null, definition),
      profile: createInitialProfile(),
    };
  }

  const data = snapshot.data();
  return {
    state: normalizeState(data?.dailyChallenge, definition),
    profile: normalizeProfile(data?.profile ?? {}),
  };
}

export function createDailyChallengeManager() {
  let snapshot = {
    ...GUEST_SNAPSHOT,
    definition: buildDefinition(),
    state: {
      ...normalizeState(null, buildDefinition()),
      status: DAILY_CHALLENGE_STATUS.locked,
    },
  };
  let currentUid = null;
  let syncToken = 0;
  const listeners = new Set();

  function notify() {
    listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (error) {
        console.warn("LootWords daily challenge listener failed.", error);
      }
    });
  }

  function setSnapshot(nextSnapshot) {
    snapshot = nextSnapshot;
    notify();
  }

  async function syncAuthState(authState) {
    const definition = buildDefinition();
    const nextToken = ++syncToken;

    if (authState?.mode !== "authenticated" || !authState.user?.uid) {
      currentUid = null;
      setSnapshot({
        ...buildSnapshot({
          access: "guest",
          backendReady: false,
          definition,
          state: null,
        }),
      });
      return snapshot;
    }

    currentUid = authState.user.uid;
    setSnapshot({
      status: "loading",
      access: "authenticated",
      backend: "firestore",
      backendReady: true,
      definition,
      state: normalizeState(null, definition),
      canStart: false,
      canRetry: false,
      errorKey: "",
    });

    try {
      const loaded = await loadChallengeDocument(authState.user.uid, definition);
      if (nextToken !== syncToken) {
        return snapshot;
      }

      setSnapshot(
        buildSnapshot({
          access: "authenticated",
          backendReady: true,
          definition,
          state: loaded?.state,
        }),
      );
      return snapshot;
    } catch (error) {
      console.warn("LootWords daily challenge load failed.", error);
      if (nextToken !== syncToken) {
        return snapshot;
      }

      setSnapshot({
        status: "ready",
        access: "authenticated",
        backend: "firestore",
        backendReady: false,
        definition,
        state: normalizeState(null, definition),
        canStart: false,
        canRetry: false,
        errorKey: "dailyChallenge.errors.unavailable",
      });
      return snapshot;
    }
  }

  async function startCurrentChallenge(authState) {
    const definition = buildDefinition();
    if (authState?.mode !== "authenticated" || !authState.user?.uid) {
      return syncAuthState(authState);
    }

    try {
      const firestoreApi = await getFirestoreApi();
      if (!firestoreApi) {
        setSnapshot({
          status: "ready",
          access: "authenticated",
          backend: "firestore",
          backendReady: false,
          definition,
          state: normalizeState(null, definition),
          canStart: false,
          canRetry: false,
          errorKey: "dailyChallenge.errors.unavailable",
        });
        return snapshot;
      }

      const docRef = getProgressRef(firestoreApi, authState.user.uid);
      const result = await firestoreApi.runTransaction(firestoreApi.db, async (transaction) => {
        const docSnapshot = await transaction.get(docRef);
        const data = docSnapshot.exists() ? docSnapshot.data() : {};
        const currentState = normalizeState(data?.dailyChallenge, definition);

        if (currentState.status === DAILY_CHALLENGE_STATUS.completed) {
          return currentState;
        }

        const nextState = {
          ...currentState,
          status: DAILY_CHALLENGE_STATUS.inProgress,
          startedAt: currentState.startedAt ?? getNowIso(),
          lastAttemptAt: getNowIso(),
        };

        transaction.set(
          docRef,
          {
            dailyChallenge: nextState,
            updatedAt: getNowIso(),
          },
          { merge: true },
        );

        return nextState;
      });

      setSnapshot(
        buildSnapshot({
          access: "authenticated",
          backendReady: true,
          definition,
          state: result,
        }),
      );
      return snapshot;
    } catch (error) {
      console.warn("LootWords daily challenge start failed.", error);
      setSnapshot({
        status: "ready",
        access: "authenticated",
        backend: "firestore",
        backendReady: false,
        definition,
        state: normalizeState(null, definition),
        canStart: false,
        canRetry: false,
        errorKey: "dailyChallenge.errors.unavailable",
      });
      return snapshot;
    }
  }

  async function resolveCurrentAttempt(authState, { gameId, succeeded, profile } = {}) {
    const definition = buildDefinition();
    if (authState?.mode !== "authenticated" || !authState.user?.uid || gameId !== definition.gameId) {
      return {
        matched: false,
        rewardGranted: false,
        profile: normalizeProfile(profile ?? createInitialProfile()),
        challengeState: snapshot.state,
      };
    }

    try {
      const firestoreApi = await getFirestoreApi();
      if (!firestoreApi) {
        return {
          matched: true,
          rewardGranted: false,
          profile: normalizeProfile(profile ?? createInitialProfile()),
          challengeState: snapshot.state,
          errorKey: "dailyChallenge.errors.unavailable",
        };
      }

      const docRef = getProgressRef(firestoreApi, authState.user.uid);
      const result = await firestoreApi.runTransaction(firestoreApi.db, async (transaction) => {
        const docSnapshot = await transaction.get(docRef);
        const data = docSnapshot.exists() ? docSnapshot.data() : {};
        const currentState = normalizeState(data?.dailyChallenge, definition);
        const baseProfile = normalizeProfile(profile ?? data?.profile ?? createInitialProfile());
        const nowIso = getNowIso();

        if (!succeeded) {
          const failedState = {
            ...currentState,
            status: DAILY_CHALLENGE_STATUS.available,
            attempts: currentState.attempts + 1,
            lastAttemptAt: nowIso,
          };

          transaction.set(
            docRef,
            {
              dailyChallenge: failedState,
              updatedAt: nowIso,
            },
            { merge: true },
          );

          return {
            rewardGranted: false,
            profile: baseProfile,
            challengeState: failedState,
          };
        }

        const alreadyGranted = Boolean(currentState.rewardGrantedAt);
        const nextState = {
          ...currentState,
          status: DAILY_CHALLENGE_STATUS.completed,
          attempts: Math.max(1, currentState.attempts),
          completedAt: currentState.completedAt ?? nowIso,
          rewardGrantedAt: currentState.rewardGrantedAt ?? nowIso,
          rewardBoxesGranted: currentState.rewardBoxesGranted || DAILY_CHALLENGE_REWARD_BOXES,
          lastAttemptAt: nowIso,
        };

        const nextProfile = alreadyGranted
          ? baseProfile
          : {
              ...baseProfile,
              rewardBoxes: baseProfile.rewardBoxes + DAILY_CHALLENGE_REWARD_BOXES,
              rewardBoxesEarned: baseProfile.rewardBoxesEarned + DAILY_CHALLENGE_REWARD_BOXES,
            };

        transaction.set(
          docRef,
          {
            profile: nextProfile,
            dailyChallenge: nextState,
            updatedAt: nowIso,
          },
          { merge: true },
        );

        return {
          rewardGranted: !alreadyGranted,
          profile: nextProfile,
          challengeState: nextState,
        };
      });

      setSnapshot(
        buildSnapshot({
          access: "authenticated",
          backendReady: true,
          definition,
          state: result.challengeState,
        }),
      );

      return {
        matched: true,
        ...result,
      };
    } catch (error) {
      console.warn("LootWords daily challenge resolution failed.", error);
      return {
        matched: true,
        rewardGranted: false,
        profile: normalizeProfile(profile ?? createInitialProfile()),
        challengeState: snapshot.state,
        errorKey: "dailyChallenge.errors.unavailable",
      };
    }
  }

  return {
    getSnapshot() {
      return snapshot;
    },
    getTodayDateKey() {
      return buildDateKey();
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
    syncAuthState,
    startCurrentChallenge,
    resolveCurrentAttempt,
    async refresh(authState) {
      return syncAuthState(authState);
    },
    destroy() {
      listeners.clear();
      currentUid = null;
    },
  };
}
