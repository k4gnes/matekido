import { createCard } from "./ui/card.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_EMOJI = {
    postman: null,
    racing: "🔧",
    football: "⚽",
    cooking: "🥄"
};

function createEnvelopeSVG() {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 64 48");
    svg.setAttribute("width", "48");
    svg.setAttribute("height", "36");

    const rect = document.createElementNS(ns, "rect");
    rect.setAttribute("x", "2");
    rect.setAttribute("y", "2");
    rect.setAttribute("width", "60");
    rect.setAttribute("height", "44");
    rect.setAttribute("rx", "5");
    rect.setAttribute("fill", "#ffffff");
    rect.setAttribute("stroke", "#64748b");
    rect.setAttribute("stroke-width", "2");

    const flap = document.createElementNS(ns, "polyline");
    flap.setAttribute("points", "2,4 32,25 62,4");
    flap.setAttribute("fill", "none");
    flap.setAttribute("stroke", "#64748b");
    flap.setAttribute("stroke-width", "2");

    const stamp = document.createElementNS(ns, "rect");
    stamp.setAttribute("x", "43");
    stamp.setAttribute("y", "5");
    stamp.setAttribute("width", "16");
    stamp.setAttribute("height", "16");
    stamp.setAttribute("rx", "2");
    stamp.setAttribute("fill", "#ef4444");
    stamp.setAttribute("stroke", "#b91c1c");
    stamp.setAttribute("stroke-width", "1");

    const stampText = document.createElementNS(ns, "text");
    stampText.setAttribute("x", "51");
    stampText.setAttribute("y", "17");
    stampText.setAttribute("text-anchor", "middle");
    stampText.setAttribute("font-family", "Arial, sans-serif");
    stampText.setAttribute("font-size", "11");
    stampText.setAttribute("font-weight", "bold");
    stampText.setAttribute("fill", "white");
    stampText.textContent = "M";

    svg.append(rect, flap, stamp, stampText);
    return svg;
}

export function renderDecomposition(step, root, onNext, progress, onResult, onAttempt) {

    root.innerHTML = "";

    const world = getActiveWorld();
    const emoji = WORLD_EMOJI[world] !== undefined ? WORLD_EMOJI[world] : "🍎";

    const number = step.number ?? Math.floor(Math.random() * 10) + 1;
    const allKeys = new Set();
    for (let i = 0; i <= number; i++) allKeys.add(`${i}+${number - i}`);
    const totalNeeded = allKeys.size;

    const found = new Set();

    const card = createCard("decomposition-card");

    if (progress) {
        card.append(progress);
    }

    const titleElement = document.createElement("h1");
    titleElement.textContent = `🧩 Keresd az összes szétválogatást! (${number})`;

    const decomposition = document.createElement("div");
    decomposition.style.cssText = "font-size:1.8rem; font-weight:bold; margin:0.5rem 0; color:#1a1a2e; background:#e0f2fe; padding:0.4rem 1rem; border-radius:10px; text-align:center;";
    decomposition.textContent = `⭐ ${number} = 0 + ${number}`;

    const emojiContainer = document.createElement("div");
    emojiContainer.style.cssText = "display:flex; flex-wrap:wrap; gap:0.6rem; justify-content:center; margin:0.5rem 0; max-width:500px;";

    const hint = document.createElement("div");
    hint.style.cssText = "font-size:0.85rem; color:#888; margin-bottom:0.3rem;";
    hint.textContent = `Még ${totalNeeded} bontást kell találnod!`;

    const foundContainer = document.createElement("div");
    foundContainer.style.cssText = "display:flex; flex-wrap:wrap; gap:0.35rem; justify-content:center; margin:0.5rem 0;";
    foundContainer.className = "found-list";

    const items = [];

    for (let i = 0; i < number; i++) {
        const item = document.createElement("span");
        if (emoji) {
            item.textContent = emoji;
        } else {
            item.append(createEnvelopeSVG());
        }
        item.style.cssText = "cursor:pointer; transition: transform .15s, opacity .15s; user-select:none; display:inline-flex; align-items:center;";
        item.dataset.index = i;

        item.addEventListener("mouseenter", () => {
            if (!item.dataset.selected) item.style.transform = "scale(1.2)";
        });
        item.addEventListener("mouseleave", () => {
            if (!item.dataset.selected) item.style.transform = "";
        });

        item.addEventListener("click", () => {
            const wasSelected = item.dataset.selected === "true";
            item.dataset.selected = wasSelected ? "false" : "true";
            item.style.opacity = wasSelected ? "1" : "0.4";
            item.style.transform = wasSelected ? "" : "scale(0.9)";

            const selectedCount = items.filter(it => it.dataset.selected === "true").length;
            decomposition.textContent = `⭐ ${number} = ${selectedCount} + ${number - selectedCount}`;
        });

        items.push(item);
        emojiContainer.append(item);
    }

    const finishBtn = document.createElement("button");
    finishBtn.textContent = "✅ Kiválasztom";
    finishBtn.style.cssText = "padding:0.6rem 1.5rem; font-size:1rem; border:2px solid #4a90d9; border-radius:12px; background:#4a90d9; color:white; cursor:pointer;";
    finishBtn.addEventListener("click", () => {
        const selectedCount = items.filter(it => it.dataset.selected === "true").length;
        const key = `${selectedCount}+${number - selectedCount}`;

        if (found.has(key)) {
            hint.textContent = "🤔 Ezt már megtaláltad! Próbálj másikat!";
            hint.style.color = "#c62828";
            return;
        }

        found.add(key);

        const tag = document.createElement("span");
        tag.textContent = `${selectedCount} + ${number - selectedCount}`;
        tag.className = "found-row";
        tag.style.cssText = "padding:0.3rem 0.7rem; border-radius:8px; font-size:1rem; font-weight:bold; border:2px solid #2e7d32; background:#e8f5e9; color:#2e7d32; animation: fadeIn 0.3s;";
        foundContainer.append(tag);

        const remaining = totalNeeded - found.size;
        hint.textContent = remaining > 0
            ? `🎉 Megtaláltad: ${selectedCount} + ${number - selectedCount}! Még ${remaining} bontást kell találnod!`
            : `🎉 Megtaláltad: ${selectedCount} + ${number - selectedCount}!`;
        hint.style.color = "#2e7d32";

        items.forEach(it => {
            it.dataset.selected = "false";
            it.style.opacity = "1";
            it.style.transform = "";
        });
        decomposition.textContent = `⭐ ${number} = 0 + ${number}`;

        if (found.size === totalNeeded) {
            items.forEach(it => it.style.pointerEvents = "none");
            emojiContainer.style.display = "none";
            finishBtn.style.display = "none";

            decomposition.textContent = `🎉 Szuper! Megtaláltad az összes bontást! (${number})`;
            decomposition.style.color = "#2e7d32";
            hint.textContent = `${totalNeeded} bontás mind megtalálva!`;
            hint.style.color = "#2e7d32";

            const nextBtn = document.createElement("button");
            nextBtn.textContent = "➡️ Tovább";
            nextBtn.style.cssText = "padding:0.6rem 1.5rem; font-size:1rem; border:2px solid #4a90d9; border-radius:12px; background:#4a90d9; color:white; cursor:pointer; margin-top:1rem;";
            nextBtn.addEventListener("click", () => {
                onAttempt?.();
                onResult?.(true);
                onNext();
            });
            card.append(nextBtn);
        }
    });

    card.append(titleElement, decomposition, emojiContainer, hint, foundContainer, finishBtn);
    root.append(card);
}
