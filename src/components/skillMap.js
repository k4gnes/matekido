import { createButton } from "./ui/button.js";
import { createCard } from "./ui/card.js";
import { renderMarkdown } from "../utils/markdown.js?v=16";
import { getAssessmentLists, createAssessmentList, removeAssessmentList, isInAssessmentList, toggleAssessmentLesson } from "../profile/AssessmentLists.js?v=1";

// Az évfolyamok sorrendje 1-től 8-ig: az index+1 az évfolyamszám.
export const DOCS = [
    { id: "elso-osztaly", emoji: "🌱", label: "1. osztály", desc: "45 lecke – számfogalom, válogatás, valószínűség, naptár, mérések, geometria, mester kihívás" },
    { id: "masodik-osztaly", emoji: "🚀", label: "2. osztály", desc: "59 lecke – számok 100-ig, szorzás és osztás, kombinatorika, valószínűség, mester kihívás" },
    { id: "harmadik-osztaly", emoji: "🪐", label: "3. osztály", desc: "49 lecke – számok 1000-ig, írásbeli műveletek, szorzás, osztás, szöveges feladatok, geometria, mester kihívás" },
    { id: "negyedik-osztaly", emoji: "🍀", label: "4. osztály", desc: "36 lecke – 10 000-ig, írásbeli műveletek, törtek, geometria, mester kihívás" },
    { id: "otodik-osztaly", emoji: "🌌", label: "5. osztály", desc: "33 lecke – 1 000 000-ig, oszthatóság, törtek, tizedes törtek, százalék, nagy számok műveletei, geometria, adatok, szöveges feladatok, mester kihívás" },
    { id: "hatodik-osztaly", emoji: "🧊", label: "6. osztály", desc: "39 lecke – egész számok, oszthatóság, hatványok, törtek és tizedes törtek, nyitott mondatok, egyenletek, egyenlőtlenségek, arány és százalék, geometria, kombinatorika, adatok és valószínűség, szöveges feladatok, mester kihívás" },
    { id: "hetedik-osztaly", emoji: "🛰️", label: "7. osztály", desc: "40 lecke – racionális számok, algebrai kifejezések, egyenletek és egyenlőtlenségek, függvények, arányosság, százalék, háromszögek, sokszögek, kör, hasonlóság, transzformációk, adatok, statisztika, valószínűség, szöveges feladatok, összefoglalók, mester kihívás" },
    { id: "nyolcadik-osztaly", emoji: "🎓", label: "8. osztály", desc: "36 lecke + 1 mester + 2 egyperces – halmazok, számelmélet, hatvány, négyzetgyök, logika, kombinatorika, gráfok, algebra, egyenletek, arány, százalék, függvények, síkgeometria, transzformációk, szerkesztések, térgeometria, statisztika, valószínűség, összefoglalás" }
];

export function renderSkillMap(root, onBack, lessonIndex) {

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

    function createChoiceCard(emoji, label, desc, onClick) {
        const btn = document.createElement("button");
        btn.className = "skill-map-choice";

        const emojiSpan = document.createElement("span");
        emojiSpan.className = "skill-map-choice-emoji";
        emojiSpan.textContent = emoji;

        const name = document.createElement("span");
        name.className = "skill-map-choice-label";
        name.textContent = label;

        const hint = document.createElement("span");
        hint.className = "skill-map-choice-desc";
        hint.textContent = desc;

        btn.append(emojiSpan, name, hint);
        btn.addEventListener("click", onClick);
        return btn;
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
            grid.append(createChoiceCard(doc.emoji, doc.label, doc.desc, () => showGradeChoice(doc)));
        });

        wrapper.append(title, subtitle, grid, createFooter());

    }

    // Az évfolyam-kártya után két út: a tanmenet (olvasás) és a felmérők (pipálás).
    function showGradeChoice(doc) {

        wrapper.replaceChildren(createBackRow(createBackButton("⬅️ Vissza", showChoice)));

        const title = document.createElement("h1");
        title.textContent = `${doc.emoji} ${doc.label}`;

        const subtitle = document.createElement("p");
        subtitle.className = "skill-map-subtitle";
        subtitle.textContent = "Mit szeretnél megnyitni?";

        const grid = document.createElement("div");
        grid.className = "skill-map-grid";

        grid.append(
            createChoiceCard("📚", "Tanmenet lista", "Az évfolyam teljes tananyaga, olvasható formában.", () => showDoc(doc)),
            createChoiceCard("📝", "Felmérők megadása", "Nevet adni a felmérőknek, és kipipálni a hozzájuk tartozó leckéket.", () => showAssessments(doc))
        );

        wrapper.append(title, subtitle, grid);

    }

    async function showDoc(doc) {

        wrapper.replaceChildren(createBackRow(
            createBackButton("⬅️ Vissza", () => showGradeChoice(doc))
        ));

        const title = document.createElement("h1");
        title.textContent = `${doc.emoji} ${doc.label} – tanmenet`;

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

    async function showAssessments(doc) {

        // a DOCS az 1–8. osztály sorrendjében van
        const grade = DOCS.indexOf(doc) + 1;

        wrapper.replaceChildren(createBackRow(
            createBackButton("⬅️ Vissza", () => showGradeChoice(doc))
        ));

        const title = document.createElement("h1");
        title.textContent = `${doc.emoji} ${doc.label} – felmérő listák`;

        const listBar = document.createElement("div");
        listBar.className = "felmero-lists";

        const note = document.createElement("p");
        note.className = "felmero-note";

        const body = document.createElement("div");
        body.className = "skill-map-body";
        body.innerHTML = "<p class='skill-map-loading'>Betöltés…</p>";

        wrapper.append(title, listBar, note, body);

        let activeId = getAssessmentLists(grade)[0]?.id ?? null;
        const boxes = new Map();
        const entries = [];

        function currentList() {
            return getAssessmentLists(grade).find(list => list.id === activeId) ?? null;
        }

        function refreshNote() {
            const list = currentList();
            note.textContent = list
                ? `📝 ${list.name}: ${list.lessons.length} lecke kijelölve`
                : "Előbb hozz létre egy listát a „＋ Új lista” gombbal, utána pipáld ki a leckéket.";
        }

        function syncBoxes() {
            entries.forEach(({ id }) => {
                const checked = isInAssessmentList(grade, activeId, id);
                (boxes.get(id) ?? []).forEach(box => {
                    box.checked = checked;
                    box.disabled = !activeId;
                });
            });
        }

        function showNewListForm() {

            if (wrapper.querySelector(".felmero-new")) return;

            const form = document.createElement("div");
            form.className = "felmero-new";

            const input = document.createElement("input");
            input.type = "text";
            input.className = "felmero-new-input";
            input.maxLength = 40;
            input.placeholder = "Lista neve, pl. Írásbeli számolás";
            input.setAttribute("aria-label", "Új felmérő lista neve");

            const save = createButton("Mentés", {
                className: "nav-bar-btn",
                onClick: () => {
                    const list = createAssessmentList(grade, input.value);
                    if (!list) {
                        input.focus();
                        return;
                    }
                    activeId = list.id;
                    form.remove();
                    renderListBar();
                    syncBoxes();
                    refreshNote();
                }
            });

            const cancel = createButton("Mégse", {
                className: "nav-bar-btn",
                onClick: () => form.remove()
            });

            input.addEventListener("keydown", event => {
                if (event.key === "Enter") save.click();
            });

            form.append(input, save, cancel);
            listBar.after(form);
            input.focus();

        }

        function renderListBar() {

            listBar.replaceChildren();

            const lists = getAssessmentLists(grade);
            if (!lists.some(list => list.id === activeId)) {
                activeId = lists[0]?.id ?? null;
            }

            lists.forEach(list => {
                const chip = document.createElement("button");
                chip.type = "button";
                chip.className = "felmero-list-choice" + (list.id === activeId ? " active" : "");
                chip.textContent = `📝 ${list.name} (${list.lessons.length})`;
                chip.addEventListener("click", () => {
                    activeId = list.id;
                    renderListBar();
                    syncBoxes();
                    refreshNote();
                });
                listBar.append(chip);
            });

            listBar.append(createButton("＋ Új lista", {
                className: "nav-bar-btn",
                onClick: showNewListForm
            }));

            if (activeId) {
                listBar.append(createButton("🗑 Törlés", {
                    className: "nav-bar-btn",
                    onClick: () => {
                        const list = currentList();
                        if (!list) return;
                        if (!window.confirm(`Biztosan törlöd a „${list.name}” listát? A benne lévő ${list.lessons.length} kijelölés is eltűnik.`)) {
                            return;
                        }
                        removeAssessmentList(grade, activeId);
                        activeId = null;
                        renderListBar();
                        syncBoxes();
                        refreshNote();
                    }
                }));
            }

        }

        renderListBar();
        refreshNote();

        try {
            const response = await fetch(`/docs/${doc.id}.md`, { cache: "reload" });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            body.innerHTML = renderMarkdown(await response.text());
        } catch {
            body.innerHTML = "<p>A dokumentum most nem tölthető be. Próbáld újra később!</p>";
            return;
        }

        body.querySelectorAll("a.lesson-link[href^='?lesson=']").forEach(link => {
            const cell = link.closest("td");
            if (!cell) return;
            entries.push({ link, cell, id: link.getAttribute("href").slice("?lesson=".length) });
        });

        const tasksById = new Map((lessonIndex?.lessons ?? []).map(l => [l.id, l.tasks]));

        entries.forEach(({ link, cell, id }) => {

            const box = document.createElement("input");
            box.type = "checkbox";
            box.className = "felmero-check";
            box.checked = isInAssessmentList(grade, activeId, id);
            box.disabled = !activeId;
            box.setAttribute("aria-label", `Felmérő: ${link.textContent}`);

            box.addEventListener("change", () => {
                if (!activeId) {
                    box.checked = false;
                    return;
                }
                const on = toggleAssessmentLesson(grade, activeId, id);
                // ugyanaz a lecke több sorban is szerepelhet: a pipák együtt mozdulnak
                (boxes.get(id) ?? []).forEach(other => { other.checked = on; });
                renderListBar();
                refreshNote();
            });

            boxes.set(id, [...(boxes.get(id) ?? []), box]);
            cell.prepend(box);

            // hány feladatból áll a lecke (az index.json `tasks` mezője)
            const tasks = tasksById.get(id);
            if (tasks) {
                const badge = document.createElement("span");
                badge.className = "felmero-tasks";
                badge.textContent = `· ${tasks} feladat`;
                link.after(badge);
            }

        });

        refreshNote();

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
