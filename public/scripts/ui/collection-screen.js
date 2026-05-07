import { CATEGORY_META, COLLECTION_SORTS, DIFFICULTY_META, PACK_META, RARITY_META } from "../data/config.js";
import { getRewardCatalog, getRewardCatalogItem, REWARD_TYPE_META } from "../data/loot.js";
import { categoryLabel, collectionSortLabel, difficultyLabel, formatDate, packLabel, rarityLabel, t } from "../core/i18n.js";
import { buildRewardCenterViewModel } from "../core/inventory-manager.js";
import { buildShopViewModel } from "../core/shop-manager.js";
import { getCollectionSections } from "../core/progression.js";
import { renderCard, renderDetailCard, renderEmptyState, escapeHtml, formatPoints } from "./ui-kit.js";

function getThemePreviewToken(themePack, key, fallback) {
  return themePack?.themeTokens?.[key] ?? fallback;
}

function buildThemePreviewStyle(themePack) {
  return [
    `--theme-preview-bg-0:${getThemePreviewToken(themePack, "--bg-0", "#0d0a21")}`,
    `--theme-preview-bg-1:${getThemePreviewToken(themePack, "--bg-1", "#161036")}`,
    `--theme-preview-bg-2:${getThemePreviewToken(themePack, "--bg-2", "#24145f")}`,
    `--theme-preview-panel:${getThemePreviewToken(themePack, "--panel-strong", "rgba(39, 28, 90, 0.96)")}`,
    `--theme-preview-accent:${getThemePreviewToken(themePack, "--accent-cyan", "#53c4ff")}`,
    `--theme-preview-accent-2:${getThemePreviewToken(themePack, "--accent-gold", "#ffc94f")}`,
    `--theme-preview-button-a:${getThemePreviewToken(themePack, "--button-primary-a", "#ffe077")}`,
    `--theme-preview-button-b:${getThemePreviewToken(themePack, "--button-primary-b", "#ffa04e")}`,
  ].join(";");
}

function renderThemePackCard(themePack, { owned, equipped }) {
  const actionLabel = equipped
    ? t("collection.themeEquippedAction")
    : owned
      ? t("collection.equipTheme")
      : t("collection.themeLockedAction");
  const availabilityLabel = themePack.defaultOwned
    ? t("collection.themeAlwaysReady")
    : owned
      ? t("collection.themeOwnedState")
      : t("collection.themeLockedState");

  return `
    <article class="theme-pack-card ${owned ? "" : "is-locked"} ${equipped ? "is-equipped" : ""}" data-rarity="${escapeHtml(themePack.rarity)}">
      <div class="theme-pack-card__preview" style="${buildThemePreviewStyle(themePack)}">
        <div class="theme-pack-card__preview-panel" aria-hidden="true"></div>
        <div class="theme-pack-card__preview-chip" aria-hidden="true"></div>
        <div class="theme-pack-card__preview-button" aria-hidden="true"></div>
      </div>
      <div class="theme-pack-card__topline">
        <strong>${themePack.icon ?? "✨"} ${escapeHtml(themePack.label)}</strong>
        <span class="rarity-badge">${rarityLabel(themePack.rarity)}</span>
      </div>
      <p class="section-copy">${escapeHtml(themePack.preview ?? "")}</p>
      <div class="theme-pack-card__footer">
        <span class="card-category">${availabilityLabel}</span>
        <button
          class="${equipped ? "secondary-button" : "primary-button"} theme-pack-card__action"
          type="button"
          data-equip-theme-pack="${escapeHtml(themePack.id)}"
          ${owned ? "" : "disabled"}
        >
          ${actionLabel}
        </button>
      </div>
    </article>
  `;
}

function getShopStateLabel(entry) {
  switch (entry.state) {
    case "owned":
      return t("collection.shopOwned");
    case "insufficient":
      return t("collection.shopNotEnoughCoins");
    case "unavailable":
      return t("collection.shopUnavailable");
    case "locked":
      return t("collection.shopAuthOnlyChip");
    case "purchasable":
    default:
      return t("collection.shopBuy");
  }
}

function renderShopItemCard(entry) {
  const typeLabel = t(REWARD_TYPE_META[entry.rewardType]?.labelKey ?? "common.locked");

  return `
    <article class="shop-item-card ${entry.state === "owned" ? "is-owned" : ""}" data-rarity="${escapeHtml(entry.rewardItem.rarity)}">
      <div class="shop-item-card__topline">
        <strong>${entry.rewardItem.icon ?? "🎁"} ${escapeHtml(entry.rewardItem.label ?? entry.rewardItem.name ?? entry.rewardItem.id)}</strong>
        <span class="rarity-badge">${rarityLabel(entry.rewardItem.rarity)}</span>
      </div>
      <p class="section-copy">${typeLabel}</p>
      <div class="shop-item-card__footer">
        <span class="card-category">${t("collection.shopPrice", { coins: entry.price })}</span>
        <button
          class="${entry.state === "purchasable" ? "primary-button" : "secondary-button"} shop-item-card__action"
          type="button"
          data-shop-item-id="${escapeHtml(entry.id)}"
          ${entry.state === "purchasable" ? "" : "disabled"}
        >
          ${getShopStateLabel(entry)}
        </button>
      </div>
    </article>
  `;
}

function renderRewardCategoryChip(categoryId, label, active) {
  return `
    <button class="reward-center-chip ${active ? "is-active" : ""}" type="button" data-reward-category="${escapeHtml(categoryId)}">
      <strong>${escapeHtml(label)}</strong>
    </button>
  `;
}

function renderRewardCenterItemCard(item, categoryLabel) {
  const badges = [];
  if (item.included) {
    badges.push(t("rewardCenter.includedBadge"));
  }
  if (item.equipped) {
    badges.push(t("rewardCenter.equippedBadge"));
  }

  return `
    <article class="reward-center-item-card" data-rarity="${escapeHtml(item.rarity)}" data-category="${escapeHtml(item.type)}">
      <div class="reward-center-item-card__art" aria-hidden="true">${escapeHtml(item.icon)}</div>
      <div class="reward-center-item-card__body">
        <div class="reward-center-item-card__topline">
          <strong>${escapeHtml(item.label)}</strong>
          <span class="rarity-badge">${rarityLabel(item.rarity)}</span>
        </div>
        <p class="section-copy">${escapeHtml(categoryLabel)}</p>
        <div class="pill-row">
          ${badges.map((badge) => `<span class="card-category">${badge}</span>`).join("")}
        </div>
      </div>
    </article>
  `;
}

function renderRewardCenterSection(container, { cards, profile, authState, actions }) {
  const rewardCenter = buildRewardCenterViewModel({ profile, cards, authState });
  const loading = authState?.mode === "loading" || !authState;
  const initialCategory = "card";
  const categoryLabels = {
    card: t("rewardCenter.categoryLabels.card"),
    coins: t("rewardCenter.categoryLabels.coins"),
    sticker: t("rewardCenter.categoryLabels.sticker"),
    "cursor-skin": t("rewardCenter.categoryLabels.cursorSkin"),
    "ui-theme-pack": t("rewardCenter.categoryLabels.uiThemePack"),
    "profile-background": t("rewardCenter.categoryLabels.profileBackground"),
    "profile-avatar": t("rewardCenter.categoryLabels.profileAvatar"),
  };

  const categoryOrder = rewardCenter.categories;

  if (loading) {
    container.innerHTML = `
      <section class="collection-panel reward-center-panel">
        <div class="screen-header">
          <div>
            <span class="small-label">${t("rewardCenter.eyebrow")}</span>
            <h2 class="section-title">${t("rewardCenter.title")}</h2>
          </div>
          <p class="screen-note">${t("rewardCenter.loadingBody")}</p>
        </div>
        ${renderEmptyState(t("rewardCenter.loadingTitle"), t("rewardCenter.loadingBody"))}
      </section>
    `;
    return;
  }

  if (rewardCenter.isLocked) {
    container.innerHTML = `
      <section class="collection-panel reward-center-panel">
        <div class="screen-header">
          <div>
            <span class="small-label">${t("rewardCenter.eyebrow")}</span>
            <h2 class="section-title">${t("rewardCenter.title")}</h2>
          </div>
          <p class="screen-note">${t("rewardCenter.lockedBody")}</p>
        </div>
        <div class="reward-center-locked">
          <div>
            <strong>${t("rewardCenter.lockedTitle")}</strong>
            <p class="section-copy">${t("rewardCenter.lockedBody")}</p>
          </div>
          <div class="button-row button-row--wrap">
            <button class="primary-button" type="button" data-open-auth="signup">${t("rewardCenter.signupAction")}</button>
            <button class="ghost-button" type="button" data-open-auth="signin">${t("rewardCenter.signinAction")}</button>
          </div>
        </div>
      </section>
    `;
    return;
  }

  const ownedItems = {
    card: rewardCenter.cards,
    coins: [],
    sticker: rewardCenter.itemsByCategory.sticker ?? [],
    "cursor-skin": rewardCenter.itemsByCategory["cursor-skin"] ?? [],
    "ui-theme-pack": rewardCenter.itemsByCategory["ui-theme-pack"] ?? [],
    "profile-background": rewardCenter.itemsByCategory["profile-background"] ?? [],
    "profile-avatar": rewardCenter.itemsByCategory["profile-avatar"] ?? [],
  };

  const categoryKey = container.dataset.rewardCategory ?? initialCategory;

  container.innerHTML = `
    <section class="collection-panel reward-center-panel">
      <div class="screen-header">
        <div>
          <span class="small-label">${t("rewardCenter.eyebrow")}</span>
          <h2 class="section-title">${t("rewardCenter.title")}</h2>
        </div>
        <p class="screen-note">${t("rewardCenter.note")}</p>
      </div>

      <div class="collection-dashboard reward-center-dashboard">
        <article class="stat-card stat-card--glow reward-center-coin-card">
          <span>${t("rewardCenter.coins")}</span>
          <strong>${rewardCenter.coins}</strong>
          <small>${t("rewardCenter.coinsNote")}</small>
        </article>
        <article class="stat-card">
          <span>${t("rewardCenter.cardsOwned")}</span>
          <strong>${rewardCenter.cards.length}</strong>
          <small>${t("rewardCenter.cardsNote")}</small>
        </article>
        <article class="stat-card">
          <span>${t("rewardCenter.inventoryCategories")}</span>
          <strong>${categoryOrder.length}</strong>
          <small>${t("rewardCenter.inventoryNote")}</small>
        </article>
      </div>

      <div class="reward-center-chips">
        ${categoryOrder.map((id) => renderRewardCategoryChip(id, categoryLabels[id], categoryKey === id)).join("")}
      </div>

      <div class="reward-center-section">
        ${
          categoryKey === "coins"
            ? `
              <div class="reward-center-empty reward-center-empty--coins">
                <strong>${t("rewardCenter.coins")}</strong>
                <p class="section-copy">${t("rewardCenter.coinsBody", { count: rewardCenter.coins })}</p>
                <button class="ghost-button" type="button" data-route="reward">${t("rewardCenter.openRewardRoom")}</button>
              </div>
            `
            : ownedItems[categoryKey]?.length
              ? `
                <div class="reward-center-grid">
                  ${
                    categoryKey === "card"
                      ? ownedItems[categoryKey]
                          .map(
                            (card) => `
                              <button class="collection-card-button" type="button" data-card-id="${card.id}">
                                ${renderCard(card, { compact: true })}
                              </button>
                            `,
                          )
                          .join("")
                      : ownedItems[categoryKey]
                          .map((item) => renderRewardCenterItemCard(item, categoryLabels[categoryKey]))
                          .join("")
                  }
                </div>
              `
              : renderEmptyState(
                  t("rewardCenter.emptyTitle", { category: categoryLabels[categoryKey] }),
                  t("rewardCenter.emptyBody", { category: categoryLabels[categoryKey] }),
                  `<button class="ghost-button" type="button" data-route="reward">${t("rewardCenter.openRewardRoom")}</button>`,
                )
        }
      </div>
    </section>
  `;

  container.querySelectorAll("[data-reward-category]").forEach((button) => {
    button.addEventListener("click", () => {
      container.dataset.rewardCategory = button.dataset.rewardCategory;
      renderRewardCenterSection(container, { cards, profile, authState, actions });
    });
  });

  container.querySelectorAll("[data-card-id]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.openCardModal(button.dataset.cardId);
    });
  });
}

export function renderCollectionScreen(container, { cards, filters, progress, actions, modalCard, profile, authState, route }) {
  if (route?.section === "inventory") {
    renderRewardCenterSection(container, { cards, profile, authState, actions });
    return {
      destroy() {},
      getDebugState() {
        return {
          screen: "collection",
          section: "inventory",
        };
      },
    };
  }

  const collectionSections = getCollectionSections(cards, filters);
  const recentCardIds = new Set(progress.recentCardIds);
  const categoryCountById = new Map(progress.categoryCounts.map((entry) => [entry.id, entry]));
  const categoryOptions = progress.categoryCounts;
  const overlayRoot = document.createElement("div");
  overlayRoot.className = "detail-modal-root";
  const coinBalance = profile?.coins ?? 0;
  const stickerCount = profile?.inventory?.stickers?.length ?? 0;
  const cursorSkinCount = profile?.inventory?.cursorSkins?.length ?? 0;
  const themePackCount = profile?.inventory?.uiThemePacks?.length ?? 0;
  const themePacks = getRewardCatalog("ui-theme-pack");
  const ownedThemeIds = new Set(profile?.inventory?.uiThemePacks ?? []);
  const avatarCount = profile?.inventory?.profileAvatars?.length ?? 0;
  const backgroundCount = profile?.inventory?.profileBackgrounds?.length ?? 0;
  const equippedThemePack = getRewardCatalogItem("ui-theme-pack", profile?.selectedUiThemePackId ?? "default");
  const equippedCursorSkin = getRewardCatalogItem("cursor-skin", profile?.selectedCursorSkinId);
  const equippedAvatar = getRewardCatalogItem("profile-avatar", profile?.selectedProfileAvatarId);
  const equippedBackground = getRewardCatalogItem("profile-background", profile?.selectedProfileBackgroundId);
  const shopEntries = buildShopViewModel(profile, authState);
  const shopIsLocked = authState?.mode !== "authenticated";

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
          <span>${t("collection.themePacksOwned")}</span>
          <strong data-count-to="${themePackCount}" data-count-key="collection-theme-packs">${themePackCount}</strong>
          <small>${t("collection.themePackInventoryNote")}</small>
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

      <div class="collection-mode-switch">
        <a class="ghost-button" href="#/collection" data-ui-click="true">${t("collection.cardsMode")}</a>
        <a class="primary-button" href="#/collection?section=inventory" data-ui-click="true">${t("collection.rewardCenterMode")}</a>
      </div>

      <div class="collection-profile-cosmetics">
        <article class="celebration-card collection-profile-cosmetics__card">
          <span class="small-label">${t("collection.profileCosmetics")}</span>
          <h3 class="section-title">${t("collection.currentProfileStyle")}</h3>
          <div class="collection-profile-cosmetics__grid">
            <div class="collection-profile-cosmetics__slot">
              <span>${t("collection.equippedThemePack")}</span>
              <strong>${equippedThemePack ? `${equippedThemePack.icon ?? "✨"} ${escapeHtml(equippedThemePack.label)}` : t("collection.noneEquipped")}</strong>
            </div>
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

      <section class="theme-pack-gallery-panel celebration-card">
        <div class="screen-header screen-header--compact">
          <div>
            <span class="small-label">${t("collection.themeGalleryEyebrow")}</span>
            <h3 class="section-title">${t("collection.themeGalleryTitle")}</h3>
          </div>
          <p class="screen-note">${t("collection.themeGalleryBody")}</p>
        </div>
        <div class="theme-pack-gallery">
          ${themePacks
            .map((themePack) =>
              renderThemePackCard(themePack, {
                owned: themePack.defaultOwned || ownedThemeIds.has(themePack.id),
                equipped: equippedThemePack?.id === themePack.id,
              }))
            .join("")}
        </div>
      </section>

      <section class="shop-panel celebration-card">
        <div class="screen-header screen-header--compact">
          <div>
            <span class="small-label">${t("collection.shopEyebrow")}</span>
            <h3 class="section-title">${t("collection.shopTitle")}</h3>
          </div>
          <p class="screen-note">${t("collection.shopBody")}</p>
        </div>
        ${
          shopIsLocked
            ? `
              <div class="shop-locked-state">
                <div>
                  <strong>${t("collection.shopLockedTitle")}</strong>
                  <p class="section-copy">${t("collection.shopLockedBody")}</p>
                </div>
                <button class="primary-button" type="button" data-open-auth="signin">${t("collection.shopOpenAuth")}</button>
              </div>
            `
            : `
              <div class="shop-grid">
                ${shopEntries.map((entry) => renderShopItemCard(entry)).join("")}
              </div>
            `
        }
      </section>

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

  container.querySelectorAll("[data-equip-theme-pack]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!button.disabled) {
        actions.equipUiThemePack(button.dataset.equipThemePack);
      }
    });
  });

  container.querySelectorAll("[data-shop-item-id]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!button.disabled) {
        actions.purchaseShopItem(button.dataset.shopItemId);
      }
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
        shopLocked: shopIsLocked,
        shopItemCount: shopEntries.length,
      };
    },
  };
}
