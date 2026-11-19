import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { getLessonStats } from "../profile/Profile.js";
import { adventDateKeys, adventPool, adventStart, adventYear, ORNAMENT_SLOTS, pickAdventLesson, todayKey, windowState } from "../utils/advent.js?v=4";

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

        const entry = pickAdventLesson(pool, dateKey, grade);
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

        const done = dates.map(isDone);
        const doneCount = done.filter(Boolean).length;

        const card = createCard("advent-card");
        const layout = document.createElement("div");
        layout.className = "advent-layout";

        const tree = document.createElement("div");
        tree.className = "advent-tree";

        const foliage = document.createElement("div");
        foliage.className = "advent-foliage";
        ORNAMENT_SLOTS.forEach((slot, i) => {
            if (!done[i]) return;
            const ball = document.createElement("span");
            ball.className = `advent-ornament ornament-${(i % 3) + 1}`;
            ball.style.top = `${slot.top}%`;
            ball.style.left = `${slot.left}%`;
            ball.textContent = String(i + 1);
            foliage.append(ball);
        });

        const trunk = document.createElement("div");
        trunk.className = "advent-trunk";
        tree.append(foliage, trunk);

        // A 24. ablak csúcsdísz: a fa tetejére kerül, kívül a vágáson,
        // hogy a clip-path ne metélje le a csillag hegyét.
        if (done[ORNAMENT_SLOTS.length]) {
            const star = document.createElement("span");
            star.className = "advent-star";
            star.textContent = String(dates.length);
            tree.append(star);
        }

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

        const detailBox = document.createElement("div");
        detailBox.className = "advent-detail";

        // A fa érintetlen marad: kattintáskor csak a részlet doboz frissül,
        // különben a teljes újrarajzolás miatt ugrál az egész kártya.
        function fillDetail() {
            detailBox.replaceChildren(...detailNodes());
        }

        dates.forEach((dateKey, i) => {
            const state = windowState(dateKey, today, done[i]);
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = `advent-window ${state}${dateKey === selected ? " selected" : ""}`;
            btn.textContent = state === "done" ? "✔" : String(i + 1);
            btn.setAttribute("aria-label", `${dayLabel(dateKey)} – ${state === "future" ? "zárva" : state === "done" ? "kész" : "nyitva"}`);
            btn.addEventListener("click", () => {
                selected = dateKey;
                grid.querySelector(".advent-window.selected")?.classList.remove("selected");
                btn.classList.add("selected");
                fillDetail();
            });
            grid.append(btn);
        });

        fillDetail();
        side.append(title, count, grid, detailBox);
        layout.append(tree, side);
        card.append(layout);
        container.append(card);

    }

    function detailNodes() {

        if (!selected) {
            return [document.createTextNode("Még egy ablak sem nyílt ki.")];
        }

        const entry = pickAdventLesson(pool, selected, grade);
        const state = windowState(selected, today, isDone(selected));

        const date = document.createElement("p");
        date.className = "advent-detail-date";
        date.textContent = dayLabel(selected);

        if (state === "future") {
            const locked = document.createElement("p");
            locked.className = "advent-detail-note";
            locked.textContent = "🔒 Ez az ablak még zárva van – majd akkor nyílik ki, amikor eljön a napja.";
            return [date, locked];
        }

        const lessonTitle = document.createElement("p");
        lessonTitle.className = "advent-detail-lesson";
        lessonTitle.textContent = entry ? entry.title : "";

        if (state === "done") {
            const note = document.createElement("p");
            note.className = "advent-detail-note";
            note.textContent = "✔ Kész – a dísz már a fán van!";
            return [date, lessonTitle, note];
        }

        const open = createButton("▶️ Lecke megnyitása", {
            className: "profile-page-button",
            onClick: () => onSelect(entry.file, { from: "advent" })
        });

        return [date, lessonTitle, open];

    }

    paint();

}
