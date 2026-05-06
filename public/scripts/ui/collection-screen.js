import { CATEGORY_META, COLLECTION_SORTS, DIFFICULTY_META, PACK_META, RARITY_META } from "../data/config.js";
import { getRewardCatalogItem } from "../data/loot.js";
import { categoryLabel, collectionSortLabel, difficultyLabel, formatDate, packLabel, rarityLabel, t } from "../core/i18n.js";
import { getCollectionSections } from "../core/progression.js";
import { renderCard, renderDetailCard, renderEmptyState, escapeHtml, formatPoints } from "./ui-kit.js";

export function renderCollectionScreen(container, { cards, filters, progress, actions, modalCard, profile }) {
  const collectionSections = getCollectionSections(cards, filters);
  const recentCardIds = new Set(progress.recentCardIds);
  const categoryCountById = new Map(progress.categoryCounts.map((entry) => [entry.id, entry]));
  const categoryOptions = progress.categoryCounts;
  const overlayRoot = document.createElement("div");
  overlayRoot.className = "detail-modal-root";
  const coinBalance = profile?.coins ?? 0;
  const stickerCount = profile?.inventory?.stickers?.length ?? 0;
  const cursorSkinCount = profile?.inventory?.cursorSkins?.length ?? 0;
  const avatarCount = profile?.inventory?.profileAvatars?.length ?? 0;
  const backgroundCount = profile?.inventory?.profileBackgrounds?.length ?? 0;
  const equippedCursorSkin = getRewardCatalogItem("cursor-skin", profile?.selectedCursorSkinId);
  const equippedAvatar = getRewardCatalogItem("profile-avatar", profile?.selectedProfileAvatarId);
  const equippedBackground = getRewardCatalogItem("profile-background", profile?.selectedProfileBackgroundId);

  container.innerHTML = `
    <section class="collection-panel">
      <div class="screen-header">
        <div>
          <span class="small-label">${t("collection.eyebrow")}</span>
          <h2 class="section-title">${t("collection.title")}</h2>
        </div>
        <p class="screen-note">${t("collection.note")}</p>
      </div>

      <div class="collection-dashboard">
        <article class="stat-card stat-card--glow">
          <span>${t("collection.unlockedCards")}</span>
          <strong>${progress.totalUnlocked}/${progress.totalCards}</strong>
          <small>${t("collection.albumComplete", { percent: progress.completionPercent })}</small>
        </article>
        <article class="stat-card">
          <span>${t("collection.freshFinds")}</span>
          <strong data-count-to="${progress.recentCardIds.length}" data-count-key="collection-recent">${progress.recentCardIds.length}</strong>
          <small>${t("collection.newestRibbon")}</small>
        </article>
        <article class="stat-card">
          <span>${t("collection.totalPoints")}</span>
          <strong data-count-to="${progress.totalPoints}" data-count-key="collection-total-points" data-count-format="points">${formatPoints(progress.totalPoints)}</strong>
          <small>${t("collection.memoryValueScore")}</small>
        </article>
        <article class="stat-card">
          <span>${t("collection.topCard")}</span>
          <strong>${progress.strongestCard ? escapeHtml(progress.strongestCard.word) : "--"}</strong>
          <small>${progress.strongestCard ? t("common.pointsValue", { value: formatPoints(progress.strongestCard.points) }) : t("collection.winToRevealMore")}</small>
        </article>
        <article class="stat-card">
          <span>${t("collection.coinBalance")}</span>
          <strong data-count-to="${coinBalance}" data-count-key="collection-coins">${coinBalance}</strong>
          <small>${t("collection.coinBalanceNote")}</small>
        </article>
        <article class="stat-card">
          <span>${t("collection.stickersOwned")}</span>
          <strong data-count-to="${stickerCount}" data-count-key="collection-stickers">${stickerCount}</strong>
          <small>${t("collection.stickerStashNote")}</small>
        </article>
        <article class="stat-card">
          <span>${t("collection.cursorSkinsOwned")}</span>
          <strong data-count-to="${cursorSkinCount}" data-count-key="collection-cursor-skins">${cursorSkinCount}</strong>
          <small>${t("collection.cursorSkinInventoryNote")}</small>
        </article>
        <article class="stat-card">
          <span>${t("collection.avatarsOwned")}</span>
          <strong data-count-to="${avatarCount}" data-count-key="collection-avatars">${avatarCount}</strong>
          <small>${t("collection.avatarInventoryNote")}</small>
        </article>
        <article class="stat-card">
          <span>${t("collection.backgroundsOwned")}</span>
          <strong data-count-to="${backgroundCount}" data-count-key="collection-backgrounds">${backgroundCount}</strong>
          <small>${t("collection.backgroundInventoryNote")}</small>
        </article>
      </div>

      <div class="collection-profile-cosmetics">
        <article class="celebration-card collection-profile-cosmetics__card">
          <span class="small-label">${t("collection.profileCosmetics")}</span>
          <h3 class="section-title">${t("collection.currentProfileStyle")}</h3>
          <div class="collection-profile-cosmetics__grid">
            <div class="collection-profile-cosmetics__slot">
              <span>${t("collection.equippedCursorSkin")}</span>
              <strong>${equippedCursorSkin ? `${equippedCursorSkin.icon ?? "🖱️"} ${escapeHtml(equippedCursorSkin.label)}` : t("collection.noneEquipped")}</strong>
            </div>
            <div class="collection-profile-cosmetics__slot">
              <span>${t("collection.equippedAvatar")}</span>
              <strong>${equippedAvatar ? `${equippedAvatar.icon ?? "🙂"} ${escapeHtml(equippedAvatar.label)}` : t("collection.noneEquipped")}</strong>
            </div>
            <div class="collection-profile-cosmetics__slot">
              <span>${t("collection.equippedBackground")}</span>
              <strong>${equippedBackground ? `${equippedBackground.icon ?? "🖼️"} ${escapeHtml(equippedBackground.label)}` : t("collection.noneEquipped")}</strong>
            </div>
          </div>
          <p class="section-copy">${t("collection.profileCosmeticsNote")}</p>
        </article>
      </div>

      <div class="pack-rack">
        ${progress.packCounts
          .map(
            (entry) => `
              <article class="pack-chip">
                <strong>${PACK_META[entry.id].icon} ${packLabel(entry.id)}</strong>
                <span>${t("collection.collected", { current: entry.unlocked, total: entry.total })}</span>
                <div class="progress-bar">
                  <div class="progress-bar__fill" data-progress-fill="${(entry.percent / 100).toFixed(3)}" style="--progress-target:${(entry.percent / 100).toFixed(3)}"></div>
                </div>
              </article>
            `,
          )
          .join("")}
      </div>

      <div class="rarity-breakdown">
        ${progress.rarityCounts
          .map(
            (entry) => `
              <article class="rarity-chip" data-rarity="${entry.id}">
                <strong>${rarityLabel(entry.id)}</strong>
                <span>${t("collection.collected", { current: entry.unlocked, total: entry.total })}</span>
              </article>
            `,
          )
          .join("")}
      </div>

      <div class="collection-toolbar">
        <label>
          <span class="small-label">${t("common.category")}</span>
          <select class="filter-select" data-filter-key="category">
            <option value="all">${t("common.allCategories")}</option>
            ${categoryOptions
              .map(
                (entry) => `
                  <option value="${entry.id}" ${filters.category === entry.id ? "selected" : ""}>${entry.label}</option>
                `,
              )
              .join("")}
          </select>
        </label>
        <label>
          <span class="small-label">${t("common.rarity")}</span>
          <select class="filter-select" data-filter-key="rarity">
            <option value="all">${t("common.allRarities")}</option>
            ${Object.entries(RARITY_META)
              .map(
                ([rarityId, meta]) => `
                  <option value="${rarityId}" ${filters.rarity === rarityId ? "selected" : ""}>${rarityLabel(rarityId)}</option>
                `,
              )
              .join("")}
          </select>
        </label>
        <label>
          <span class="small-label">${t("common.sort")}</span>
          <select class="filter-select" data-filter-key="sort">
            ${Object.entries(COLLECTION_SORTS)
              .map(
                ([sortId, label]) => `
                  <option value="${sortId}" ${filters.sort === sortId ? "selected" : ""}>${collectionSortLabel(sortId)}</option>
                `,
              )
              .join("")}
          </select>
        </label>
      </div>

      ${
        collectionSections.length
          ? `
            <div class="collection-sections">
              ${collectionSections
                .map((section) => {
                  const sectionProgress = categoryCountById.get(section.id);
                  const packMeta = PACK_META[section.meta.packId];

                  return `
                    <section class="collection-section">
                      <div class="collection-section__header">
                        <div>
                          <span class="small-label">${section.meta.icon} ${packLabel(section.meta.packId)}</span>
                          <h3 class="section-title">${categoryLabel(section.id)}</h3>
                        </div>
                        <div class="collection-section__meta">
                          <span class="card-category">${t("home.activeInView", { unlocked: sectionProgress.unlocked, total: sectionProgress.total })}</span>
                          <span class="card-scoreline">${t("collection.categoryInView", { count: section.cards.length })}</span>
                        </div>
                      </div>
                      <div class="collection-grid">
                        ${section.cards
                          .map(
                            (card) => `
                              <button class="collection-card-button" type="button" data-card-id="${card.id}">
                                ${renderCard(card, {
                                  compact: true,
                                  isNew: recentCardIds.has(card.id),
                                })}
                              </button>
                            `,
                          )
                          .join("")}
                      </div>
                    </section>
                  `;
                })
                .join("")}
            </div>
          `
          : renderEmptyState(
              progress.totalCards === 0 ? t("emptyState.noActiveCollectionTitle") : t("emptyState.noCardsMatchTitle"),
              progress.totalCards === 0
                ? t("emptyState.noActiveCollectionBody")
                : t("emptyState.noCardsMatchBody"),
            )
      }
    </section>

  `;

  if (modalCard) {
    overlayRoot.innerHTML = `
      <div class="detail-modal" data-close-modal="overlay">
        <div class="detail-modal__dialog" role="dialog" aria-modal="true" aria-label="${t("collection.cardDetail")}">
          <div class="detail-modal__top">
            <div>
              <span class="small-label">${t("collection.cardDetail")}</span>
              <h3 class="section-title">${escapeHtml(modalCard.unlocked ? modalCard.word : t("common.mysteryCard"))}</h3>
            </div>
            <button class="secondary-button" type="button" data-close-modal="button">${t("common.close")}</button>
          </div>
          <div class="detail-grid">
            ${renderDetailCard(modalCard, { isNew: recentCardIds.has(modalCard.id) })}
            <div class="detail-copy detail-copy--album">
              <p class="section-copy">
                ${
                  modalCard.unlocked
                    ? t("collection.thisCardBelongs", { category: categoryLabel(modalCard.category), pack: packLabel(modalCard.packId ?? "starter") })
                    : t("collection.silhouetteWaiting")
                }
              </p>
              <ul>
                <li>${modalCard.unlocked ? `${t("common.rarity")}: ${rarityLabel(modalCard.rarity)}` : t("collection.rarityHidden")}</li>
                <li>${modalCard.unlocked ? `${t("common.points")}: ${formatPoints(modalCard.points)}` : t("collection.pointsHidden")}</li>
                <li>${modalCard.unlocked ? `${t("common.difficulty")}: ${difficultyLabel(modalCard.difficultyLevel)}` : t("collection.difficultyHidden")}</li>
                <li>${modalCard.unlocked && modalCard.discoveredAt ? `${t("common.discovered")}: ${formatDate(modalCard.discoveredAt)}` : t("collection.playToEarnMore")}</li>
              </ul>
              ${
                modalCard.unlocked
                  ? `
                    <div class="pill-row">
                      ${modalCard.tags.slice(0, 4).map((tag) => `<span class="card-category">${escapeHtml(tag.replace(/-/g, " "))}</span>`).join("")}
                    </div>
                  `
                  : ""
              }
              <div class="cta-stack">
                <button class="primary-button" type="button" data-route="play" data-game="memory-match">${t("common.playForMoreLoot")}</button>
                <button class="ghost-button" type="button" data-route="reward">${t("common.openRewardRoom")}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlayRoot);
    document.body.classList.add("is-modal-open");
  }

  container.querySelectorAll("[data-filter-key]").forEach((select) => {
    select.addEventListener("change", () => {
      actions.updateCollectionFilters({
        [select.dataset.filterKey]: select.value,
      });
    });
  });

  container.querySelectorAll("[data-card-id]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.openCardModal(button.dataset.cardId);
    });
  });

  overlayRoot.querySelectorAll("[data-close-modal]").forEach((element) => {
    element.addEventListener("click", (event) => {
      if (element.dataset.closeModal === "button" || event.target === element) {
        actions.closeCardModal();
      }
    });
  });

  overlayRoot.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.navigate(button.dataset.route, { game: button.dataset.game });
    });
  });

  return {
    destroy() {
      overlayRoot.remove();
      document.body.classList.remove("is-modal-open");
    },
    getDebugState() {
      return {
        screen: "collection",
        visibleCards: collectionSections.reduce((sum, section) => sum + section.cards.length, 0),
        sectionCount: collectionSections.length,
        filters,
      };
    },
  };
}
