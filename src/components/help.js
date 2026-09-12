import { createCard } from "./ui/card.js";
import { createNavBar } from "./ui/navbar.js";
import { renderMarkdown } from "../utils/markdown.js";

export function renderHelp(root, nav = {}) {

    root.replaceChildren();

    const wrapper = createCard("skill-map-card");

    root.append(wrapper);

    const navbar = createNavBar({ ...nav, current: "help" });

    const title = document.createElement("h1");
    title.textContent = "❓ Súgó";

    const body = document.createElement("div");
    body.className = "skill-map-body";
    body.innerHTML = "<p class='skill-map-loading'>Betöltés…</p>";

    wrapper.append(navbar, title, body);

    loadDoc(body);

    async function loadDoc(target) {
        try {
            const response = await fetch("/docs/sugo.md", { cache: "reload" });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            target.innerHTML = renderMarkdown(await response.text());
        } catch {
            target.innerHTML = "<p>A súgó most nem tölthető be. Próbáld újra később!</p>";
        }
    }

}
