import { escapeHtml } from "./ui-kit.js";
import { t } from "../core/i18n.js";

function getModeLabel(mode) {
  return mode === "signup" ? t("auth.createAccount") : t("auth.signIn");
}

function renderRecaptchaNote(recaptchaState) {
  if (!recaptchaState) {
    return "";
  }

  if (recaptchaState.enabled && recaptchaState.available) {
    return `
      <div class="auth-security-note auth-security-note--active">
        <strong>${t("auth.recaptcha.protectedTitle")}</strong>
        <span>${t("auth.recaptcha.protectedBody")}</span>
      </div>
    `;
  }

  if (recaptchaState.enabled && !recaptchaState.available) {
    return `
      <div class="auth-security-note auth-security-note--warning">
        <strong>${t("auth.recaptcha.loadingTitle")}</strong>
        <span>${t(recaptchaState.devNoteKey || "auth.recaptcha.loadFailed")}</span>
      </div>
    `;
  }

  if (!recaptchaState.configured && recaptchaState.devNoteKey) {
    return `
      <div class="auth-security-note auth-security-note--warning">
        <strong>${t("auth.recaptcha.setupTitle")}</strong>
        <span>${t(recaptchaState.devNoteKey)}</span>
      </div>
    `;
  }

  return "";
}

export function renderAuthTrigger(authState) {
  if (authState.status === "loading") {
    return `
      <button class="ghost-button auth-shell-trigger is-disabled" type="button" disabled>
        <span aria-hidden="true">⏳</span>
        <span>${t("auth.loadingAccount")}</span>
      </button>
    `;
  }

  if (authState.mode === "authenticated" && authState.user) {
    return `
      <button class="ghost-button auth-shell-trigger auth-shell-trigger--user" type="button" data-open-auth="account">
        <span aria-hidden="true">👤</span>
        <span class="auth-shell-trigger__label">${escapeHtml(authState.user.email || t("auth.account"))}</span>
      </button>
    `;
  }

  return `
    <button class="ghost-button auth-shell-trigger" type="button" data-open-auth="signin">
      <span aria-hidden="true">👤</span>
      <span class="auth-shell-trigger__label">${t("auth.account")}</span>
    </button>
  `;
}

export function renderAuthModal({ authState, recaptchaState, authUi }) {
  if (!authUi.isOpen) {
    return "";
  }

  const isAuthenticated = authState.mode === "authenticated" && Boolean(authState.user);

  if (isAuthenticated) {
    return `
      <div class="auth-modal" data-close-auth="overlay">
        <div class="auth-modal__dialog" role="dialog" aria-modal="true" aria-label="${t("auth.account")}">
          <div class="auth-modal__top">
            <div>
              <span class="small-label">${t("auth.account")}</span>
              <h3 class="section-title">${t("auth.loggedInTitle")}</h3>
              <p class="section-copy">${t("auth.loggedInBody")}</p>
            </div>
            <button class="secondary-button" type="button" data-close-auth="button">${t("common.close")}</button>
          </div>
          <div class="auth-account-card">
            <span class="auth-account-card__label">${t("auth.emailLabel")}</span>
            <strong>${escapeHtml(authState.user.email || t("auth.noEmail"))}</strong>
            <p>${t("auth.dailyChallengeReady")}</p>
          </div>
          <div class="cta-stack auth-modal__actions">
            <button class="primary-button" type="button" data-logout="true">${t("auth.signOut")}</button>
            <button class="ghost-button" type="button" data-close-auth="button">${t("common.close")}</button>
          </div>
          ${
            authState.error
              ? `<p class="auth-form__status auth-form__status--error">${t(authState.error)}</p>`
              : ""
          }
        </div>
      </div>
    `;
  }

  return `
    <div class="auth-modal" data-close-auth="overlay">
      <div class="auth-modal__dialog" role="dialog" aria-modal="true" aria-label="${t("auth.account")}">
        <div class="auth-modal__top">
          <div>
            <span class="small-label">${t("auth.account")}</span>
            <h3 class="section-title">${getModeLabel(authUi.mode)}</h3>
            <p class="section-copy">${t(authUi.mode === "signup" ? "auth.signupBody" : "auth.signinBody")}</p>
          </div>
          <button class="secondary-button" type="button" data-close-auth="button">${t("common.close")}</button>
        </div>

        <div class="auth-tabs" role="tablist" aria-label="${t("auth.account")}">
          <button class="auth-tab ${authUi.mode === "signin" ? "is-active" : ""}" type="button" data-auth-mode="signin">${t("auth.signIn")}</button>
          <button class="auth-tab ${authUi.mode === "signup" ? "is-active" : ""}" type="button" data-auth-mode="signup">${t("auth.createAccount")}</button>
        </div>

        <form class="auth-form" data-auth-submit="${authUi.mode}">
          <label class="auth-form__field">
            <span>${t("auth.emailLabel")}</span>
            <input class="auth-form__input" type="email" name="email" value="${escapeHtml(authUi.email)}" autocomplete="email" inputmode="email" />
          </label>
          <label class="auth-form__field">
            <span>${t("auth.passwordLabel")}</span>
            <input class="auth-form__input" type="password" name="password" value="${escapeHtml(authUi.password)}" autocomplete="${authUi.mode === "signup" ? "new-password" : "current-password"}" />
          </label>

          ${
            authUi.infoKey
              ? `<p class="auth-form__status auth-form__status--info">${t(authUi.infoKey)}</p>`
              : ""
          }
          ${
            authUi.errorKey
              ? `<p class="auth-form__status auth-form__status--error">${t(authUi.errorKey)}</p>`
              : ""
          }

          <div class="cta-stack auth-modal__actions">
            <button class="primary-button" type="submit" ${authUi.isSubmitting ? "disabled" : ""}>
              ${authUi.isSubmitting ? t("auth.loadingAction") : getModeLabel(authUi.mode)}
            </button>
            <button class="ghost-button" type="button" data-close-auth="button">${t("common.close")}</button>
          </div>
        </form>

        ${renderRecaptchaNote(recaptchaState)}

        <div class="auth-setup-note ${authState.needsSetup ? "is-visible" : ""}">
          <strong>${t("auth.setupNeededTitle")}</strong>
          <span>${t("auth.setupNeededBody")}</span>
        </div>
      </div>
    </div>
  `;
}
