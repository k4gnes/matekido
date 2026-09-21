import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { renderMarkdown } from "../utils/markdown.js";

export function renderParentDoc(root, { title, doc, onBack }) {

    root.replaceChildren();

    const wrapper = createCard("skill-map-card");

    root.append(wrapper);

    const backButton = createButton("⬅️ Vissza a szülői részhez", {
        className: "nav-bar-btn",
        onClick: () => onBack()
    });

    const backRow = document.createElement("div");
    backRow.style.cssText = "display:flex; justify-content:center; margin-bottom:1rem;";
    backRow.append(backButton);

    const titleEl = document.createElement("h1");
    titleEl.textContent = title;

    const body = document.createElement("div");
    body.className = "skill-map-body";
    body.innerHTML = "<p class='skill-map-loading'>Betöltés…</p>";

    wrapper.append(backRow, titleEl, body);

    loadDoc(body);

    async function loadDoc(target) {
        try {
            const response = await fetch(doc, { cache: "reload" });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            target.innerHTML = renderMarkdown(await response.text());
        } catch {
            target.innerHTML = "<p>A dokumentum most nem tölthető be. Próbáld újra később!</p>";
        }
    }

}