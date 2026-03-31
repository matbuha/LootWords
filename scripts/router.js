import { DEFAULT_ROUTE, ROUTES } from "./data/config.js";

export function parseRoute(hashValue = window.location.hash) {
  const cleanedHash = hashValue.replace(/^#\/?/, "");
  if (!cleanedHash) {
    return { ...DEFAULT_ROUTE };
  }

  const [pathPart, queryString = ""] = cleanedHash.split("?");
  const params = new URLSearchParams(queryString);
  const normalizedPath = Object.values(ROUTES).includes(pathPart) ? pathPart : ROUTES.home;

  return {
    path: normalizedPath,
    game: params.get("game") ?? DEFAULT_ROUTE.game,
    section: params.get("section") ?? null,
  };
}

export function buildRoute(path, params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  ).toString();

  return `#/${path}${query ? `?${query}` : ""}`;
}

export function createRouter(onChange) {
  function handleChange() {
    onChange(parseRoute());
  }

  if (!window.location.hash) {
    window.location.hash = buildRoute(DEFAULT_ROUTE.path, { game: DEFAULT_ROUTE.game });
  }

  window.addEventListener("hashchange", handleChange);
  handleChange();

  return {
    navigate(path, params = {}) {
      window.location.hash = buildRoute(path, params);
    },
    destroy() {
      window.removeEventListener("hashchange", handleChange);
    },
  };
}
