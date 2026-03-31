export function renderResetTools(container, { pendingReset, actions }) {
  container.innerHTML = `
    <section class="parent-section">
      <div class="screen-header">
        <div>
          <span class="small-label">Reset tools</span>
          <h2 class="section-title">Use destructive tools carefully</h2>
        </div>
        <p class="screen-note">Every reset action asks for a second confirmation before changing stored progress or settings.</p>
      </div>

      ${
        pendingReset
          ? `
            <div class="parent-status is-warning">
              <strong>${pendingReset.title}</strong>
              <p>${pendingReset.detail}</p>
              <div class="cta-stack cta-stack--parent">
                <button class="primary-button" type="button" data-parent-reset-confirm="${pendingReset.id}">Confirm reset</button>
                <button class="ghost-button" type="button" data-parent-reset-cancel="true">Cancel</button>
              </div>
            </div>
          `
          : ""
      }

      <div class="parent-list">
        <article class="parent-row-card">
          <div class="parent-row-card__copy">
            <strong>Reset all child progress</strong>
            <span>Clears collection, wins, rewards, streaks, and gameplay history.</span>
          </div>
          <button class="parent-danger-button" type="button" data-parent-reset="all-progress">Arm reset</button>
        </article>
        <article class="parent-row-card">
          <div class="parent-row-card__copy">
            <strong>Reset collection only</strong>
            <span>Clears unlocked cards and discovery timestamps, but keeps wins and parent settings.</span>
          </div>
          <button class="parent-danger-button" type="button" data-parent-reset="collection">Arm reset</button>
        </article>
        <article class="parent-row-card">
          <div class="parent-row-card__copy">
            <strong>Reset rewards only</strong>
            <span>Clears the current reward-box stash and bonus stars.</span>
          </div>
          <button class="parent-danger-button" type="button" data-parent-reset="rewards">Arm reset</button>
        </article>
        <article class="parent-row-card">
          <div class="parent-row-card__copy">
            <strong>Reset settings only</strong>
            <span>Resets audio, child filters, and Parent Mode settings to defaults without deleting progress.</span>
          </div>
          <button class="parent-danger-button" type="button" data-parent-reset="settings">Arm reset</button>
        </article>
      </div>
    </section>
  `;

  container.querySelectorAll("[data-parent-reset]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.requestParentReset(button.dataset.parentReset);
    });
  });

  container.querySelector("[data-parent-reset-confirm]")?.addEventListener("click", (event) => {
    actions.confirmParentReset(event.target.dataset.parentResetConfirm);
  });

  container.querySelector("[data-parent-reset-cancel]")?.addEventListener("click", () => {
    actions.cancelParentReset();
  });
}
