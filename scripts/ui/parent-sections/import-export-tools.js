import { t } from "../../core/i18n.js";
import { escapeHtml } from "../ui-kit.js";

export function renderImportExportTools(container, { transferState, actions }) {
  const status = transferState.status;

  container.innerHTML = `
    <section class="parent-section">
      <div class="screen-header">
        <div>
          <span class="small-label">${t("parent.transfer.eyebrow")}</span>
          <h2 class="section-title">${t("parent.transfer.title")}</h2>
        </div>
        <p class="screen-note">${t("parent.transfer.note")}</p>
      </div>

      ${
        status
          ? `
            <div class="parent-status ${status.kind === "error" ? "is-error" : status.kind === "warning" ? "is-warning" : "is-success"}">
              <strong>${escapeHtml(status.titleKey ? t(status.titleKey) : status.title)}</strong>
              <p>${escapeHtml(status.detailKey ? t(status.detailKey) : status.detail)}</p>
              ${
                status.lines?.length
                  ? `<ul>${status.lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`
                  : ""
              }
            </div>
          `
          : ""
      }

      <div class="cta-stack cta-stack--parent">
        <button class="primary-button" type="button" data-parent-export="true">${t("parent.transfer.exportProfile")}</button>
        <button class="secondary-button" type="button" data-parent-import="true">${t("parent.transfer.importProfile")}</button>
        <button class="ghost-button" type="button" data-parent-transfer-clear="true">${t("parent.transfer.clearText")}</button>
      </div>

      <label class="parent-field">
        <span>${t("parent.transfer.jsonPayload")}</span>
        <textarea class="parent-textarea" rows="18" data-parent-transfer-text="true" placeholder="${t("parent.transfer.placeholder")}">${escapeHtml(transferState.text)}</textarea>
      </label>
    </section>
  `;

  container.querySelector("[data-parent-transfer-text]")?.addEventListener("input", (event) => {
    actions.updateParentTransferText(event.target.value);
  });

  container.querySelector("[data-parent-export]")?.addEventListener("click", () => {
    actions.exportParentData();
  });

  container.querySelector("[data-parent-import]")?.addEventListener("click", () => {
    actions.requestImportParentData();
  });

  container.querySelector("[data-parent-transfer-clear]")?.addEventListener("click", () => {
    actions.clearParentTransferText();
  });
}
