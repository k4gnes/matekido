import { createButton } from "./ui/button.js";
import { createCard } from "./ui/card.js";
import { renderMarkdown } from "../utils/markdown.js";

const DOCS = [
    { id: "elso-osztaly", emoji: "🌱", label: "1. osztály", desc: "27 lecke – számfogalom, műveletek 20-ig" },
    { id: "masodik-osztaly", emoji: "🚀", label: "2. osztály", desc: "50 lecke – számok 100-ig, szorzás és osztás" },
    { id: "harmadik-osztaly", emoji: "🪐", label: "3. osztály", desc: "tervezett – számok 1000-ig, írásbeli műveletek" }
];

export function renderSkillMap(root, onBackToLessons) {

    root.replaceChildren();

    const wrapper = createCard("skill-map-card");

    root.append(wrapper);

    showChoice();

    function showChoice() {

        wrapper.replaceChildren();

        const title = document.createElement("h1");
        title.textContent = "📚 Készségek";

        const subtitle = document.createElement("p");
        subtitle.className = "skill-map-subtitle";
        subtitle.textContent = "Nézd meg az évfolyamod készségeit!";

        const grid = document.createElement("div");
        grid.className = "skill-map-grid";

        DOCS.forEach(doc => {
            const btn = document.createElement("button");
            btn.className = "skill-map-choice";

            const emoji = document.createElement("span");
            emoji.className = "skill-map-choice-emoji";
            emoji.textContent = doc.emoji;

            const name = document.createElement("span");
            name.className = "skill-map-choice-label";
            name.textContent = doc.label;

            const desc = document.createElement("span");
            desc.className = "skill-map-choice-desc";
            desc.textContent = doc.desc;

            btn.append(emoji, name, desc);
            btn.addEventListener("click", () => showDoc(doc));
            grid.append(btn);
        });

        wrapper.append(title, subtitle, grid, createBackButton("⬅️ Leckék", onBackToLessons), createFooter());

    }

    async function showDoc(doc) {

        wrapper.replaceChildren();

        const title = document.createElement("h1");
        title.textContent = `${doc.emoji} ${doc.label} – készségek`;

        const body = document.createElement("div");
        body.className = "skill-map-body";
        body.innerHTML = "<p class='skill-map-loading'>Betöltés…</p>";

        wrapper.append(title, body, createBackButton("⬅️ Vissza", showChoice), createFooter());

        try {
            const response = await fetch(`/docs/${doc.id}.md`, { cache: "reload" });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            body.innerHTML = renderMarkdown(await response.text());
        } catch {
            body.innerHTML = "<p>A dokumentum most nem tölthető be. Próbáld újra később!</p>";
        }

    }

}

function createBackButton(text, onClick) {
    return createButton(text, { className: "skill-map-back", onClick });
}

function createFooter() {

    const footer = document.createElement("p");
    footer.className = "skill-map-footer";

    const link = document.createElement("a");
    link.href = "https://iconet.hu";
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "💻 Iconet Informatika 2026";

    footer.append(link);

    return footer;

}
