let lastAppError = null;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function serializeError(error, context = {}) {
  const stack =
    typeof error?.stack === "string"
      ? error.stack
          .split("\n")
          .slice(0, 6)
          .map((line) => line.trim())
          .filter(Boolean)
      : [];

  return {
    name: error?.name ?? "Error",
    message: error?.message ?? "Unknown error",
    stack,
    context,
    capturedAt: new Date().toISOString(),
  };
}

function setLastAppError(error, context = {}) {
  lastAppError = serializeError(error, context);
  window.__lootwordsLastError = lastAppError;
  return lastAppError;
}

function renderFallbackMarkup({ title, detail, hint, routePath, error }) {
  const safeRoute = escapeHtml(routePath ?? "unknown");
  const safeTitle = escapeHtml(title);
  const safeDetail = escapeHtml(detail);
  const safeHint = hint ? `<p class="body-copy">${escapeHtml(hint)}</p>` : "";
  const safeMessage = error?.message ? escapeHtml(error.message) : "Unknown error";

  return `
    <section class="section-panel section-panel--error">
      <div class="empty-state empty-state--error">
        <span class="small-label">Safe fallback</span>
        <h2 class="section-title">${safeTitle}</h2>
        <p class="body-copy">${safeDetail}</p>
        ${safeHint}
        <div class="pill-row">
          <span class="status-pill"><strong>Route</strong><span>${safeRoute}</span></span>
          <span class="status-pill"><strong>Error</strong><span>${safeMessage}</span></span>
        </div>
        <div class="button-row">
          <a class="primary-button" href="#/home">Go Home</a>
          <button class="ghost-button" type="button" data-error-reload="true">Reload App</button>
        </div>
      </div>
    </section>
  `;
}

export function clearLastAppError() {
  lastAppError = null;
  window.__lootwordsLastError = null;
}

export function getLastAppError() {
  return lastAppError;
}

export function safeDestroyScreen(screen, context = {}) {
  if (!screen?.destroy) {
    return;
  }

  try {
    screen.destroy();
  } catch (error) {
    setLastAppError(error, { phase: "destroy", ...context });
    console.warn("LootWords screen destroy failed.", error);
  }
}

export function renderScreenSafely({ container, renderer, context, routePath }) {
  try {
    return renderer(container, context) ?? null;
  } catch (error) {
    const serialized = setLastAppError(error, {
      phase: "screen-render",
      routePath,
    });
    console.error("LootWords screen render failed.", error);
    container.innerHTML = renderFallbackMarkup({
      title: "This screen hit a snag",
      detail: "The app stayed running, but this screen could not finish rendering.",
      hint: "You can go back home or reload safely.",
      routePath,
      error,
    });
    container.querySelector("[data-error-reload='true']")?.addEventListener("click", () => {
      window.location.reload();
    });

    return {
      destroy() {},
      getDebugState() {
        return {
          screen: "error-fallback",
          error: serialized,
        };
      },
    };
  }
}

export function renderAppSafely({ root, routePath, error }) {
  const serialized = setLastAppError(error, {
    phase: "app-render",
    routePath,
  });
  console.error("LootWords app render failed.", error);
  root.innerHTML = `
    <div class="app-shell app-shell--error">
      <main class="shell-main shell-main--same">
        ${renderFallbackMarkup({
          title: "LootWords needs a quick reset",
          detail: "A rendering error was caught before the app could finish loading this view.",
          hint: "Your saved progress is still preserved in browser storage.",
          routePath,
          error,
        })}
      </main>
    </div>
  `;
  root.querySelector("[data-error-reload='true']")?.addEventListener("click", () => {
    window.location.reload();
  });
  return serialized;
}
