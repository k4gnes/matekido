import { createButton } from "./ui/button.js";
import { createCard } from "./ui/card.js";
import { renderMarkdown } from "../utils/markdown.js?v=16";

const DOCS = [
    { id: "elso-osztaly", emoji: "🌱", label: "1. osztály", desc: "45 lecke – számfogalom, válogatás, valószínűség, naptár, mérések, geometria, mester kihívás" },
    { id: "masodik-osztaly", emoji: "🚀", label: "2. osztály", desc: "59 lecke – számok 100-ig, szorzás és osztás, kombinatorika, valószínűség, mester kihívás" },
    { id: "harmadik-osztaly", emoji: "🪐", label: "3. osztály", desc: "49 lecke – számok 1000-ig, írásbeli műveletek, szorzás, osztás, szöveges feladatok, geometria, mester kihívás" },
    { id: "negyedik-osztaly", emoji: "🍀", label: "4. osztály", desc: "36 lecke – 10 000-ig, írásbeli műveletek, törtek, geometria, mester kihívás" },
    { id: "otodik-osztaly", emoji: "🌌", label: "5. osztály", desc: "33 lecke – 1 000 000-ig, oszthatóság, törtek, tizedes törtek, százalék, nagy számok műveletei, geometria, adatok, szöveges feladatok, mester kihívás" },
    { id: "hatodik-osztaly", emoji: "🧊", label: "6. osztály", desc: "39 lecke – negatív számok, ellentett és abszolút érték, egész számok összehasonlítása és műveletei, oszthatósági szabályok, osztók és többszörösök, prím- és összetett számok, prímfelbontás, LNKO és LKKT, hatványozás alapjai, tízes hatványok, hatványok a műveleti sorrendben, törtek a számegyenesen és vegyes számok, törtek és tizedes törtek átváltása, törtek szorzása és osztása, törtrész és százalék, nyitott mondat – igaz vagy hamis?, egyenlet megoldása, egyenlőtlenségek a számegyenesen, arány és aránypár, egyenes és fordított arányosság, százalékszámítás, háromszögek, négyszögek, szögek, kör, transzformációk, kerület és terület, felszín és térfogat, átlag és diagramok, valószínűség, arányossági és százalékos szöveges feladatok, többlépéses feladatok, kombinatorika, mester kihívás" },
    { id: "hetedik-osztaly", emoji: "🛰️", label: "7. osztály", desc: "13 lecke – racionális számok (5), algebrai kifejezések (5) és egyenletek/egyenlőtlenségek (3: elsőfokú egyenletek, szöveges feladatok, egyenlőtlenségek – tervezett továbbfejlesztés)" }
];

export function renderSkillMap(root, onBack) {

    root.replaceChildren();

    const wrapper = createCard("skill-map-card");

    root.append(wrapper);

    showChoice();

    function createBackRow(...buttons) {
        const row = document.createElement("div");
        row.style.cssText = "display:flex; flex-wrap:wrap; gap:.5rem; justify-content:center; margin-bottom:1rem;";
        buttons.forEach(btn => row.append(btn));
        return row;
    }

    function hubBackButton() {
        return createButton("⬅️ Vissza", {
            className: "nav-bar-btn",
            onClick: () => onBack()
        });
    }

    function showChoice() {

        wrapper.replaceChildren(createBackRow(hubBackButton()));

        const title = document.createElement("h1");
        title.textContent = "📚 Témakörök";

        const subtitle = document.createElement("p");
        subtitle.className = "skill-map-subtitle";
        subtitle.textContent = "Nézd meg az évfolyamod tananyagát!";

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

        wrapper.append(title, subtitle, grid, createFooter());

    }

    async function showDoc(doc) {

        wrapper.replaceChildren(createBackRow(
            createBackButton("⬅️ Vissza", showChoice)
        ));

        const title = document.createElement("h1");
        title.textContent = `${doc.emoji} ${doc.label} – témakörök`;

        const body = document.createElement("div");
        body.className = "skill-map-body";
        body.innerHTML = "<p class='skill-map-loading'>Betöltés…</p>";

        wrapper.append(title, body, createFooter());

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
    return createButton(text, { className: "nav-bar-btn", onClick });
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

    const facebookLink = document.createElement("a");
    facebookLink.href = "https://www.facebook.com/profile.php?id=61594289895525";
    facebookLink.target = "_blank";
    facebookLink.rel = "noopener";
    facebookLink.textContent = "📘 Kövess a Facebookon";
    footer.append(" · ", facebookLink);

    return footer;

}
