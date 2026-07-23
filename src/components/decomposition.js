import { createCard } from "./ui/card.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_EMOJI = {
    postman: "✉️",
    racing: "🔧",
    football: "⚽",
    cooking: "🥄"
};

export function renderDecomposition(step, root, onNext, progress, onResult, onAttempt) {

    root.innerHTML = "";

    const world = getActiveWorld();
    const emoji = WORLD_EMOJI[world] ?? "🍎";

    const number = step.number ?? Math.floor(Math.random() * 10) + 1;

    const card = createCard("decomposition-card");

    if (progress) {
        card.append(progress);
    }

    const titleElement = document.createElement("h1");
    titleElement.textContent = `🧩 Bontsd fel a ${number} számot!`;

    const decomposition = document.createElement("div");
    decomposition.style.cssText = "font-size:1.8rem; font-weight:bold; margin:0.5rem 0; color:#1a1a2e; background:#e0f2fe; padding:0.4rem 1rem; border-radius:10px; text-align:center;";
    decomposition.textContent = `⭐ ${number} = 0 + ${number}`;

    const emojiContainer = document.createElement("div");
    emojiContainer.style.cssText = "display:flex; flex-wrap:wrap; gap:0.4rem; justify-content:center; margin:0.5rem 0; font-size:2rem; line-height:1; max-width:400px;";

    const numberRow = document.createElement("div");
    numberRow.style.cssText = "display:flex; flex-wrap:wrap; gap:0.4rem; justify-content:center; margin:0.2rem 0 0.5rem; font-size:0.9rem; font-weight:bold; color:#1a1a2e; max-width:400px;";

    const items = [];

    for (let i = 0; i < number; i++) {

        const item = document.createElement("span");
        item.textContent = emoji;
        item.style.cssText = "cursor:pointer; transition: transform .15s, opacity .15s; user-select:none;";
        item.dataset.index = i;

        const numLabel = document.createElement("span");
        numLabel.textContent = i + 1;
        numLabel.style.cssText = "width:2rem; text-align:center;";

        item.addEventListener("mouseenter", () => {
            if (!item.dataset.selected) {
                item.style.transform = "scale(1.2)";
            }
        });
        item.addEventListener("mouseleave", () => {
            if (!item.dataset.selected) {
                item.style.transform = "";
            }
        });

        item.addEventListener("click", () => {

            const wasSelected = item.dataset.selected === "true";
            item.dataset.selected = wasSelected ? "false" : "true";
            item.style.opacity = wasSelected ? "1" : "0.4";
            item.style.transform = wasSelected ? "" : "scale(0.9)";
            numLabel.style.opacity = wasSelected ? "1" : "0.4";

            const selectedCount = items.filter(it => it.dataset.selected === "true").length;
            decomposition.textContent = `⭐ ${number} = ${selectedCount} + ${number - selectedCount}`;
        });

        items.push(item);
        emojiContainer.append(item);
        numberRow.append(numLabel);
    }

    const finishBtn = document.createElement("button");
    finishBtn.textContent = "✅ Kiválasztom";
    finishBtn.style.cssText = "padding:0.6rem 1.5rem; font-size:1rem; border:2px solid #4a90d9; border-radius:12px; background:#4a90d9; color:white; cursor:pointer;";
    finishBtn.addEventListener("click", () => {

        const selectedCount = items.filter(it => it.dataset.selected === "true").length;

        items.forEach(it => it.style.pointerEvents = "none");
        emojiContainer.style.display = "none";
        finishBtn.style.display = "none";

        const allDecomps = document.createElement("div");
        allDecomps.style.cssText = "display:flex; flex-wrap:wrap; gap:0.4rem; justify-content:center; margin:0.5rem 0;";

        for (let i = 0; i <= number; i++) {
            const tag = document.createElement("span");
            const isSelected = i === selectedCount;
            tag.textContent = `${i} + ${number - i}`;
            tag.style.cssText = `padding:0.3rem 0.7rem; border-radius:8px; font-size:1rem; font-weight:bold; border:2px solid ${isSelected ? "#2e7d32" : "#ccc"}; background:${isSelected ? "#e8f5e9" : "#f5f5f5"}; color:${isSelected ? "#2e7d32" : "#666"};`;
            allDecomps.append(tag);
        }

        decomposition.textContent = `🎉 Szuper! ${number} = ${selectedCount} + ${number - selectedCount}`;
        decomposition.style.color = "#2e7d32";

        const nextBtn = document.createElement("button");
        nextBtn.textContent = "➡️ Tovább";
        nextBtn.style.cssText = "padding:0.6rem 1.5rem; font-size:1rem; border:2px solid #4a90d9; border-radius:12px; background:#4a90d9; color:white; cursor:pointer; margin-top:1rem;";
        nextBtn.addEventListener("click", () => {
            onAttempt?.();
            onResult?.(true);
            onNext();
        });

        card.append(allDecomps, nextBtn);
    });

    card.append(titleElement, decomposition, emojiContainer, numberRow, finishBtn);
    root.append(card);

}
