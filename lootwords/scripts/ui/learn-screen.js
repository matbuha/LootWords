import { renderCard, renderDetailCard, renderEmptyState } from "./ui-kit.js";

export function renderLearnScreen(container, { unlockedCards, selectedCard, actions }) {
  container.innerHTML = `
    <section class="learn-panel">
      <div class="screen-header">
        <div>
          <span class="small-label">Learn words</span>
          <h2 class="learn-title">Review your unlocked loot cards</h2>
        </div>
        <p class="screen-note">Use the collection you earned as your study deck.</p>
      </div>

      ${
        unlockedCards.length
          ? `
            <div class="learn-layout">
              <div class="learn-spotlight">
                ${renderDetailCard(selectedCard, { locked: false })}
                <div class="learn-guide">
                  <p class="section-copy">Say the word out loud, notice the card category, and remember its point value as a game score anchor.</p>
                  <div class="pill-row">
                    <span class="card-category">${selectedCard.category.replace("-", " ")}</span>
                    <span class="card-points">${selectedCard.points} pts</span>
                  </div>
                </div>
              </div>
              <div>
                <div class="screen-header">
                  <div>
                    <span class="small-label">Review deck</span>
                    <h3 class="section-title">Tap a card to spotlight it</h3>
                  </div>
                </div>
                <div class="learn-list">
                  ${unlockedCards
                    .map(
                      (card) => `
                        <button type="button" data-learn-card="${card.id}">
                          ${renderCard(card, { compact: true, locked: false })}
                        </button>
                      `,
                    )
                    .join("")}
                </div>
              </div>
            </div>
          `
          : renderEmptyState("No cards to review yet", "Win a mini-game, open a reward box, and your first learning card will appear here.")
      }
    </section>
  `;

  container.querySelectorAll("[data-learn-card]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.selectLearnCard(button.dataset.learnCard);
    });
  });

  return {
    destroy() {},
    getDebugState() {
      return {
        screen: "learn",
        unlockedCards: unlockedCards.length,
        selectedCard: selectedCard?.id ?? null,
      };
    },
  };
}
