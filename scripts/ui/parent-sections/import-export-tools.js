import { escapeHtml } from "../ui-kit.js";

export function renderImportExportTools(container, { transferState, actions }) {
  const status = transferState.status;

  container.innerHTML = `
    <section class="parent-section">
      <div class="screen-header">
        <div>
          <span class="small-label">Import / export</span>
          <h2 class="section-title">Backup or restore this browser profile</h2>
        </div>
        <p class="screen-note">Exports include progress, assigned points, audio settings, and parent content controls. Imports are validated before any state is applied.</p>
      </div>

      ${
        status
          ? `
            <div class="parent-status ${status.kind === "error" ? "is-error" : status.kind === "warning" ? "is-warning" : "is-success"}">
              <strong>${escapeHtml(status.title)}</strong>
              <p>${escapeHtml(status.detail)}</p>
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
        <button class="primary-button" type="button" data-parent-export="true">Export current profile</button>
        <button class="secondary-button" type="button" data-parent-import="true">Validate and import</button>
        <button class="ghost-button" type="button" data-parent-transfer-clear="true">Clear text</button>
      </div>

      <label class="parent-field">
        <span>JSON payload</span>
        <textarea class="parent-textarea" rows="18" data-parent-transfer-text="true" placeholder="Exported LootWords JSON will appear here, or paste a backup to import.">${escapeHtml(transferState.text)}</textarea>
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
