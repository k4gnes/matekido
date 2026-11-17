import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { getLessonStats } from "../profile/Profile.js";
import { adventDateKeys, adventPool, adventStart, adventYear, pickAdventLesson, todayKey, windowState } from "../utils/advent.js?v=1";

// A díszek soronként egyre szélesebb sorban ülnek a fán, alulról felfelé.
const ROW_COUNTS = [1, 2, 3, 3, 3, 4, 4, 4];

const ORNAMENT_SLOTS = (() => {

    const slots = [];

    ROW_COUNTS.forEach((count, row) => {
        const top = 16 + row * 8.5;
        const half = ((top - 2) / 86) * 50;
        const spread = half * 0.7;
        for (let i = 0; i < count; i++) {
            const left = count === 1 ? 50 : 50 + (i - (count - 1) / 2) * (2 * spread / (count - 1));
            slots.push({ top, left });
        }
    });

    return slots;

})();

function dayLabel(dateKey) {

    const [year, month, day] = dateKey.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    try {
        return date.toLocaleDateString("hu-HU", { weekday: "long", month: "long", day: "numeric" });
    } catch {
        return `${month}. ${day}.`;
    }

}

function messageCard(text) {

    const card = createCard("advent-card");
    const note = document.createElement("p");
    note.className = "lesson-card-subtitle";
    note.textContent = text;
    card.append(note);
    return card;

}

export function renderAdventPage(container, { lessons, grade, onSelect }) {

    const year = adventYear();

    if (!year) {
        container.replaceChildren(messageCard("🎄 Az adventi naptár december 1-jén nyílik meg, és vízkereszt előtt tűnik el."));
        return;
    }

    const pool = adventPool(lessons, grade);
    const dates = adventDateKeys(year);
    const start = adventStart(year);
    const today = todayKey();
    const openDates = dates.filter(d => d <= today);
    let selected = openDates.length ? openDates[openDates.length - 1] : null;

    function isDone(dateKey) {

        const entry = pickAdventLesson(pool, dateKey);
        if (!entry) return false;
        const stats = getLessonStats(entry.file);
        return !!stats && (stats.lastDoneAt || 0) >= start;

    }

    function paint() {

        container.replaceChildren();

        if (pool.length === 0) {
            container.append(messageCard("Ehhez az évfolyamhoz még nincs lecke a naptárban."));
            return;
        }

        const doneCount = dates.filter(isDone).length;

        const card = createCard("advent-card");
        const layout = document.createElement("div");
        layout.className = "advent-layout";

        const tree = document.createElement("div");
        tree.className = "advent-tree";

        const foliage = document.createElement("div");
        foliage.className = "advent-foliage";
        ORNAMENT_SLOTS.slice(0, doneCount).forEach(slot => {
            const ball = document.createElement("span");
            ball.className = "advent-ornament";
            ball.style.top = `${slot.top}%`;
            ball.style.left = `${slot.left}%`;
            foliage.append(ball);
        });

        const trunk = document.createElement("div");
        trunk.className = "advent-trunk";
        tree.append(foliage, trunk);

        const side = document.createElement("div");
        side.className = "advent-side";

        const title = document.createElement("h2");
        title.className = "advent-title";
        title.textContent = "🎄 Adventi naptár";

        const count = document.createElement("p");
        count.className = "advent-count";
        count.textContent = `${doneCount} / ${dates.length} dísz a fán`;

        const grid = document.createElement("div");
        grid.className = "advent-grid";

        dates.forEach((dateKey, i) => {
            const state = windowState(dateKey, today, isDone(dateKey));
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = `advent-window ${state}${dateKey === selected ? " selected" : ""}`;
            btn.textContent = state === "done" ? "✔" : String(i + 1);
            btn.setAttribute("aria-label", `${dayLabel(dateKey)} – ${state === "future" ? "zárva" : state === "done" ? "kész" : "nyitva"}`);
            btn.addEventListener("click", () => {
                selected = dateKey;
                paint();
            });
            grid.append(btn);
        });

        side.append(title, count, grid, detail());
        layout.append(tree, side);
        card.append(layout);
        container.append(card);

    }

    function detail() {

        const box = document.createElement("div");
        box.className = "advent-detail";

        if (!selected) {
            box.textContent = "Még egy ablak sem nyílt ki.";
            return box;
        }

        const entry = pickAdventLesson(pool, selected);
        const state = windowState(selected, today, isDone(selected));

        const date = document.createElement("p");
        date.className = "advent-detail-date";
        date.textContent = dayLabel(selected);
        box.append(date);

        if (state === "future") {
            const locked = document.createElement("p");
            locked.className = "advent-detail-note";
            locked.textContent = "🔒 Ez az ablak még zárva van – majd akkor nyílik ki, amikor eljön a napja.";
            box.append(locked);
            return box;
        }

        const lessonTitle = document.createElement("p");
        lessonTitle.className = "advent-detail-lesson";
        lessonTitle.textContent = entry ? entry.title : "";
        box.append(lessonTitle);

        if (state === "done") {
            const done = document.createElement("p");
            done.className = "advent-detail-note";
            done.textContent = "✔ Kész – a dísz már a fán van!";
            box.append(done);
            return box;
        }

        const open = createButton("▶️ Lecke megnyitása", {
            className: "profile-page-button",
            onClick: () => onSelect(entry.file, { from: "advent" })
        });
        box.append(open);

        return box;

    }

    paint();

}
