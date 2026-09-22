import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";

export function renderParentHub(root, { onBack, onDashboard, onTopics, onHelp }) {

    root.replaceChildren();

    const wrapper = createCard("parent-page parent-hub");

    const backButton = createButton("⬅️ Vissza a feladatokhoz", {
        className: "nav-bar-btn",
        onClick: () => onBack()
    });

    const backRow = document.createElement("div");
    backRow.style.cssText = "display:flex; justify-content:center; margin-bottom:1rem;";
    backRow.append(backButton);

    const title = document.createElement("h1");
    title.className = "parent-title";
    title.textContent = "👨‍👩‍👧 Szülői";

    const subtitle = document.createElement("p");
    subtitle.className = "parent-subtitle";
    subtitle.textContent = "A gyerekeknek ez az oldal játék – ebből a részből pedig a haladást és a tananyagot követheted figyelemmel.";

    wrapper.append(backRow, title, subtitle);

    const grid = document.createElement("div");
    grid.className = "parent-hub-grid";

    const dashboardItem = createHubItem(
        "📊",
        "Szülői összefoglaló",
        "Előrehaladás, pontosság és a napi játéktevékenység egy pillantásra.",
        () => onDashboard()
    );

    const topicsItem = createHubItem(
        "📚",
        "Témakörök",
        "Az évfolyamonkénti tananyag áttekintése.",
        () => onTopics()
    );

    const helpItem = createHubItem(
        "❓",
        "Súgó",
        "Gyakori kérdések, szülői összefoglaló és visszajelzés egy helyen.",
        () => onHelp()
    );

    grid.append(dashboardItem, topicsItem, helpItem);
    wrapper.append(grid);

    root.append(wrapper);
}

function createHubItem(emoji, label, desc, onClick) {

    const btn = document.createElement("button");
    btn.className = "parent-hub-choice";

    const emojiEl = document.createElement("span");
    emojiEl.className = "parent-hub-choice-emoji";
    emojiEl.textContent = emoji;

    const nameEl = document.createElement("span");
    nameEl.className = "parent-hub-choice-label";
    nameEl.textContent = label;

    const descEl = document.createElement("span");
    descEl.className = "parent-hub-choice-desc";
    descEl.textContent = desc;

    btn.append(emojiEl, nameEl, descEl);
    btn.addEventListener("click", onClick);

    return btn;
}