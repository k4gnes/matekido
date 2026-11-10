import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { listPlayers } from "../profile/UserManager.js";
import { SKILLS, CATEGORIES } from "../data/skills.js";
import { CHILD_FRIENDLY_LABELS, DIFFICULTY_BADGE, DIFFICULTY_LABEL } from "./lessonMenu.js";
import { loadLesson } from "../engine/LessonLoader.js";
import { buildLesson } from "../builders/LessonBuilder.js?v=102";
import { isTaskStep, lessonLines } from "../utils/taskText.js";

const DAY = 24 * 60 * 60 * 1000;

const WEEKDAY_SHORT = ["V", "H", "K", "Sze", "Cs", "P", "Szo"];

const MONTH_SHORT = ["jan.", "febr.", "márc.", "ápr.", "máj.", "jún.", "júl.", "aug.", "szept.", "okt.", "nov.", "dec."];

const ACCENT_COLORS = [
    "#4F86F7",
    "#F59E0B",
    "#4caf50",
    "#E91E63",
    "#9C27B0",
    "#00BCD4"
];

function getToday() {
    return new Date().toISOString().split("T")[0];
}

function parseDate(dateStr) {
    const parts = dateStr.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
}

function formatDayLabel(dateStr) {
    const d = parseDate(dateStr);
    return `${WEEKDAY_SHORT[d.getDay()]} ${d.getDate()}`;
}

export function lastPlayedText(dateStr) {
    if (!dateStr) return "Még nem játszott";
    const diff = Math.round((new Date(getToday()) - new Date(dateStr)) / DAY);
    if (diff <= 0) return "Ma játszott";
    if (diff === 1) return "Tegnap játszott";
    return `${diff} napja játszott`;
}

// tiszta függvény, hogy tesztelhető legyen: 0 válaszból ne legyen NaN%
export function weekSummaryText(totalLessons, totalCorrect, totalWrong, playedDays) {
    if (totalLessons === 0) return "Ezen a héten még nem játszott.";
    const totalAnswers = totalCorrect + totalWrong;
    const accuracy = totalAnswers === 0 ? "–" : `${Math.round((totalCorrect / totalAnswers) * 100)}%`;
    return `📚 ${totalLessons} lecke · 🎯 ${accuracy} pontosság · 📅 ${playedDays}/7 nap`;
}

function dayAccuracy(day) {
    const correct = day?.correct ?? 0;
    const wrong = day?.wrong ?? 0;
    const total = correct + wrong;
    if (total === 0) return null;
    return Math.round((correct / total) * 100);
}

function overallAccuracy(dailyStats) {
    let correct = 0;
    let wrong = 0;
    for (const day of Object.values(dailyStats ?? {})) {
        correct += day.correct ?? 0;
        wrong += day.wrong ?? 0;
    }
    const total = correct + wrong;
    if (total === 0) return null;
    return Math.round((correct / total) * 100);
}

function accuracyColor(pct) {
    if (pct === null) return "#e0e0e0";
    if (pct >= 80) return "#4caf50";
    if (pct >= 50) return "#f59e0b";
    return "#e53935";
}

function computeWeakSkills(player) {

    const stats = player.profile?.skillStats ?? {};
    const entries = [];

    for (const [skillId, counts] of Object.entries(stats)) {
        const total = counts.correct + counts.wrong;
        if (total === 0) continue;
        const skill = SKILLS[skillId];
        if (!skill) continue;
        const percentage = Math.round((counts.correct / total) * 100);
        if (percentage < 90) {
            entries.push({
                title: skill.title,
                category: CATEGORIES[skill.category]?.title ?? "",
                percentage,
                correct: counts.correct,
                total
            });
        }
    }

    entries.sort((a, b) => a.percentage - b.percentage);

    return entries;

}

function computeWeakLessons(player, lessonIndex) {

    const stats = player.profile?.lessonStats ?? {};
    const entries = [];

    for (const lesson of lessonIndex.lessons || []) {
        const counts = stats[lesson.file];
        if (!counts) continue;
        const total = counts.correct + counts.wrong;
        if (total === 0) continue;
        const percentage = Math.round((counts.correct / total) * 100);
        if (percentage < 90) {
            entries.push({
                title: lesson.title,
                percentage,
                correct: counts.correct,
                total
            });
        }
    }

    entries.sort((a, b) => a.percentage - b.percentage);

    return entries;

}

function computeSkippedLessons(player, lessonIndex) {

    const skipped = player.profile?.skippedLessons ?? [];
    if (!Array.isArray(skipped) || skipped.length === 0) return [];

    const byFile = new Map((lessonIndex.lessons || []).map(l => [l.file, l]));

    return skipped.map(file => {
        const lesson = byFile.get(file);
        return lesson ? lesson.title : file;
    });

}

// Tiszta függvény, hogy tesztelhető legyen: a játékos kedvencei az aktív évfolyamra szűrve,
// a szülői PDF-lista soraival (fájl, cím, készség, nehézség).
export function favoriteRowsFor(player, lessonIndex) {

    const favorites = player?.profile?.favorites ?? [];
    const grade = player?.profile?.grade ?? null;
    const byFile = new Map((lessonIndex?.lessons ?? []).map(l => [l.file, l]));

    return favorites
        .map(f => byFile.get(f))
        .filter(l => l && (grade == null || (l.grades ?? []).includes(grade)))
        .map(l => ({
            file: l.file,
            title: l.title,
            skill: CHILD_FRIENDLY_LABELS[l.skill] ?? SKILLS[l.skill]?.title ?? "",
            difficulty: `${DIFFICULTY_BADGE[l.difficulty] ?? ""} ${DIFFICULTY_LABEL[l.difficulty] ?? ""}`.trim()
        }));

}

function createLessonBlock(row, index) {

    const block = document.createElement("section");

    const heading = document.createElement("h3");
    const name = document.createElement("strong");
    name.textContent = `${index + 1}. ${row.title}`;
    const meta = document.createElement("span");
    meta.textContent = [row.skill, row.difficulty].filter(Boolean).join(" · ");
    heading.append(name, meta);
    block.append(heading);

    if (!row.steps) {
        const note = document.createElement("p");
        note.className = "favorites-print-note";
        note.textContent = "Nem sikerült betölteni a lecke feladatait.";
        block.append(note);
        return block;
    }

    const list = document.createElement("ol");
    list.className = "favorites-print-tasks";
    lessonLines(row.steps).forEach(line => {
        const item = document.createElement("li");
        item.append(document.createTextNode(line.count > 1 ? `${line.text} ×${line.count}` : line.text));
        if (!line.nameOnly) {
            // hely a gyerek válaszának a nyomtatott lapon
            const blank = document.createElement("span");
            blank.className = "favorites-print-answer-line";
            item.append(blank);
        }
        list.append(item);
    });
    block.append(list);

    return block;

}

// A megoldások külön szekcióban, a feladatok UTÁN következnek (a gyakorlólap
// ne árulja el válasz közben): leckénként ugyanabban a sorrendben.
function createAnswersBlock(rows) {

    const block = document.createElement("section");
    block.className = "favorites-print-answers-section";

    const heading = document.createElement("h3");
    heading.textContent = "✔ Megoldások";
    block.append(heading);

    rows.forEach((row, index) => {
        if (!row.steps) return;

        const sub = document.createElement("h4");
        sub.textContent = `${index + 1}. ${row.title}`;
        const list = document.createElement("ol");
        list.className = "favorites-print-answers";
        lessonLines(row.steps).forEach(line => {
            const item = document.createElement("li");
            item.textContent = line.answer;
            list.append(item);
        });
        block.append(sub, list);
    });

    return block;

}

function renderFavoritesPrint(area, player, rows, grade, state) {

    area.replaceChildren();

    const title = document.createElement("h2");
    title.textContent = `❤️ ${player?.name ?? "Játékos"} kedvencei${grade != null ? ` – ${grade}. osztály` : ""}`;

    const date = document.createElement("p");
    date.className = "favorites-print-date";
    date.textContent = new Date().toLocaleDateString("hu-HU");

    area.append(title, date);

    if (state.loading) {

        const note = document.createElement("p");
        note.textContent = "A feladatok betöltése…";
        area.append(note);

    } else if (rows.length === 0) {

        const empty = document.createElement("p");
        empty.textContent = "Nincs még kedvenc lecke ehhez az évfolyamhoz.";
        area.append(empty);

    } else {

        rows.forEach((row, index) => area.append(createLessonBlock(row, index)));

        const answers = createAnswersBlock(rows);
        answers.hidden = !state.answers;
        area.append(answers);

    }

    const actions = document.createElement("div");
    actions.className = "favorites-print-actions print-hide";
    actions.append(
        createButton("🖨️ Mentés PDF-ként", { className: "nav-bar-btn", onClick: () => window.print() })
    );

    // A megoldások nyomtatása választható: ha nincs kipipálva, nem jelenik meg.
    const toggle = document.createElement("label");
    toggle.className = "favorites-print-toggle";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = state.answers;
    checkbox.addEventListener("change", () => {
        state.answers = checkbox.checked;
        area.querySelector(".favorites-print-answers-section")?.toggleAttribute("hidden", !state.answers);
    });
    toggle.append(checkbox, document.createTextNode("Megoldások"));
    actions.append(toggle);

    actions.append(
        createButton("✗ Bezárás", { className: "nav-bar-btn", onClick: () => area.remove() })
    );
    area.append(actions);

}

async function openFavoritesPrint(player, lessonIndex) {

    document.querySelector(".favorites-print")?.remove();

    const rows = favoriteRowsFor(player, lessonIndex);
    const grade = player?.profile?.grade ?? null;

    const area = document.createElement("div");
    area.className = "favorites-print";
    document.body.append(area);

    const state = { answers: true, loading: rows.length > 0 };

    renderFavoritesPrint(area, player, rows, grade, state);

    if (rows.length === 0) return;

    for (const row of rows) {
        try {
            const built = buildLesson(await loadLesson(row.file));
            row.steps = (built.steps ?? []).filter(isTaskStep);
        } catch (e) {
            console.error("Nem sikerült betölteni a kedvenc leckét:", row.file, e);
            row.steps = null;
        }
    }

    state.loading = false;
    renderFavoritesPrint(area, player, rows, grade, state);

}

function createSkippedNote(skippedTitles) {

    const note = document.createElement("p");
    note.className = "parent-weekly-note";
    note.textContent = `⏭️ Kihagyott feladatok (${skippedTitles.length}): ${skippedTitles.join(", ")} – az osztályváltóval tovább lehet lépni, de ajánlott utóbb pótolni.`;
    return note;

}

function createWeakRow(title, detail, percentage) {

    const row = document.createElement("div");
    row.className = "type-row";

    const label = document.createElement("span");
    label.className = "type-label";
    label.title = title;
    label.textContent = title.length > 38 ? title.slice(0, 35) + "..." : title;

    const barWrap = document.createElement("div");
    barWrap.className = "type-bar-wrap";
    const bar = document.createElement("div");
    bar.className = "type-bar";
    bar.style.width = percentage + "%";
    barWrap.append(bar);

    const pctText = document.createElement("span");
    pctText.className = "type-pct";
    pctText.textContent = percentage + "%";

    const detailText = document.createElement("span");
    detailText.className = "skill-detail";
    detailText.textContent = detail;

    row.append(label, barWrap, pctText, detailText);

    return row;

}

// a gyakorlásra javasolt lista csak válaszokból áll össze:
// ahol csak játék/gyakorlás volt (lessonsPlayed > 0, correct+wrong = 0), ott sincs adat
export function hasAnswerData(profile) {
    return Object.values(profile?.dailyStats ?? {})
        .some(d => (d.correct ?? 0) + (d.wrong ?? 0) > 0);
}

function createWeakSection(player, lessonIndex) {

    const section = document.createElement("div");
    section.className = "parent-practice";

    const title = document.createElement("p");
    title.className = "parent-practice-title";
    title.textContent = "🎯 Gyakorlásra javasolt";

    section.append(title);

    const weakSkills = computeWeakSkills(player);
    const weakLessons = computeWeakLessons(player, lessonIndex);

    const rows = [];

    weakSkills.slice(0, 5).forEach(entry => {
        rows.push(createWeakRow(entry.title, `${entry.correct}/${entry.total}`, entry.percentage));
    });

    const weakBonus = weakSkills.length - 5;
    if (weakBonus > 0) {
        const catTitles = new Set();
        weakSkills.slice(5, 10).forEach(entry => {
            if (entry.category) catTitles.add(entry.category.toLowerCase());
        });
        if (catTitles.size > 0) {
            const extra = document.createElement("p");
            extra.className = "parent-weekly-note";
            extra.textContent = `+${weakBonus} további gyenge terület (${[...catTitles].join(", ")})`;
            rows.push(extra);
        }
    }

    weakLessons.slice(0, 3).forEach(entry => {
        rows.push(createWeakRow(entry.title, `${entry.correct}/${entry.total}`, entry.percentage));
    });

    if (rows.length === 0) {
        const empty = document.createElement("p");
        empty.className = "parent-practice-ok";
        empty.textContent = hasAnswerData(player.profile)
            ? "🎉 Minden rendben, nincs gyakorlandó terület!"
            : "Nincs még válaszadat – a lista a válaszok alapján készül.";
        section.append(empty);
    } else {
        rows.forEach(row => section.append(row));
    }

    return section;

}

function getWeekDates(offset) {
    const dates = [];
    const end = Date.now() - offset * 7 * DAY;
    for (let i = 6; i >= 0; i--) {
        dates.push(new Date(end - i * DAY).toISOString().split("T")[0]);
    }
    return dates;
}

function weekRangeLabel(dates, offset) {
    const from = parseDate(dates[0]);
    const to = parseDate(dates[dates.length - 1]);
    const range = `${MONTH_SHORT[from.getMonth()]} ${from.getDate()} – ${MONTH_SHORT[to.getMonth()]} ${to.getDate()}.`;
    return offset === 0 ? `Ez a hét: ${range}` : range;
}

function firstRecordedDate(dailyStats) {
    const dates = Object.keys(dailyStats ?? {}).sort();
    return dates.length > 0 ? dates[0] : null;
}

function lastDailyDate(dailyStats) {
    const dates = Object.keys(dailyStats ?? {}).sort();
    return dates.length > 0 ? dates[dates.length - 1] : null;
}

function createPlayerCard(player, accent, lessonIndex) {

    const card = document.createElement("div");
    card.className = "parent-card";

    const profile = player.profile ?? {};
    const dailyStats = profile.dailyStats ?? {};

    const header = document.createElement("div");
    header.className = "parent-card-header";

    const avatar = document.createElement("span");
    avatar.className = "parent-card-avatar";
    avatar.textContent = player.avatar ?? "🦊";

    const name = document.createElement("span");
    name.className = "parent-card-name";
    name.textContent = player.name ?? "Játékos";

    const lastPlayed = document.createElement("span");
    lastPlayed.className = "parent-last-played";
    // régi profiloknál nincs lastPlayed, de a dailyStats dátumaiból megvan az utolsó
    lastPlayed.textContent = lastPlayedText(profile.lastPlayed ?? lastDailyDate(dailyStats));

    header.append(avatar, name, lastPlayed);

    const acc = overallAccuracy(dailyStats);

    const stats = document.createElement("div");
    stats.className = "parent-stats";

    const statItems = [
        { icon: "📚", value: profile.lessonsCompleted ?? 0, label: "lecke" },
        { icon: "⭐", value: profile.stars ?? 0, label: "csillag" },
        { icon: "🔥", value: profile.streak ?? 0, label: "nap" },
        { icon: "✨", value: profile.perfectLessons ?? 0, label: "hibátlan lecke" },
        { icon: "🎯", value: acc === null ? "–" : acc + " %", label: "pontosság" }
    ];

    statItems.forEach(({ icon, value, label }) => {
        const item = document.createElement("span");
        item.className = "parent-stat";
        item.innerHTML = `<span>${icon} ${value}</span> <span style="opacity:.65">${label}</span>`;
        stats.append(item);
    });

    card.append(header, stats);

    const earliest = firstRecordedDate(dailyStats);
    let weekOffset = 0;

    const chartTitle = document.createElement("p");
    chartTitle.className = "parent-chart-label";
    chartTitle.textContent = "📈 Heti statisztika";

    const weekNav = document.createElement("div");
    weekNav.className = "parent-week-nav";

    const prevBtn = createButton("◀", { className: "daily-nav-btn" });
    const nextBtn = createButton("▶", { className: "daily-nav-btn" });
    prevBtn.setAttribute("aria-label", "Előző hét");
    nextBtn.setAttribute("aria-label", "Következő hét");

    const weekLabel = document.createElement("span");
    weekLabel.className = "parent-week-label";

    weekNav.append(prevBtn, weekLabel, nextBtn);

    const weekSummary = document.createElement("p");
    weekSummary.className = "parent-week-summary";

    const chart = document.createElement("div");
    chart.className = "parent-chart";

    const note = document.createElement("p");
    note.className = "parent-weekly-note";

    function buildWeek(offset) {

        const dates = getWeekDates(offset);

        const days = dates.map(date => {
            const day = dailyStats[date] ?? { correct: 0, wrong: 0, lessonsPlayed: 0 };
            return {
                date,
                lessons: day.lessonsPlayed ?? 0,
                accuracy: dayAccuracy(day),
                correct: day.correct ?? 0,
                wrong: day.wrong ?? 0
            };
        });

        const maxLessons = Math.max(1, ...days.map(d => d.lessons));

        const totalLessons = days.reduce((sum, d) => sum + d.lessons, 0);
        const totalCorrect = days.reduce((sum, d) => sum + d.correct, 0);
        const totalWrong = days.reduce((sum, d) => sum + d.wrong, 0);
        const playedDays = days.filter(d => d.lessons > 0).length;

        weekLabel.textContent = weekRangeLabel(dates, offset);

        prevBtn.disabled = earliest === null || dates[0] <= earliest;
        nextBtn.disabled = offset === 0;

        weekSummary.textContent = weekSummaryText(totalLessons, totalCorrect, totalWrong, playedDays);

        note.textContent = totalLessons > 0
            ? "A sávok magassága a leckék száma, színük a napi pontosság."
            : "Nincs adat ehhez a héthez.";

        chart.replaceChildren();

        days.forEach(day => {
            const col = document.createElement("div");
            col.className = "parent-bar-col";

            const barValue = document.createElement("span");
            barValue.className = "parent-bar-value";
            barValue.textContent = day.lessons > 0 ? day.lessons : "";

            const bar = document.createElement("div");
            bar.className = "parent-bar";
            bar.style.background = accuracyColor(day.accuracy);
            bar.title = day.accuracy !== null
                ? `${day.date} – ${day.lessons} lecke, ${day.accuracy}% pontosság`
                : (day.lessons > 0
                    ? `${day.date} – ${day.lessons} lecke, nincs válaszadat`
                    : `${day.date} – nem játszott`);
            if (day.lessons > 0) {
                bar.style.height = Math.max(6, Math.round((day.lessons / maxLessons) * 100)) + "px";
            }

            const dayLabel = document.createElement("span");
            dayLabel.className = "parent-bar-day";
            dayLabel.textContent = formatDayLabel(day.date);

            col.append(barValue, bar, dayLabel);
            chart.append(col);
        });
    }

    prevBtn.addEventListener("click", () => {
        weekOffset++;
        buildWeek(weekOffset);
    });

    nextBtn.addEventListener("click", () => {
        if (weekOffset === 0) return;
        weekOffset--;
        buildWeek(weekOffset);
    });

    buildWeek(0);

    const legend = document.createElement("div");
    legend.className = "parent-legend";

    [
        { color: "#4caf50", text: "80%+" },
        { color: "#f59e0b", text: "50–79%" },
        { color: "#e53935", text: "50% alatt" },
        { color: "#e0e0e0", text: "nincs válaszadat" }
    ].forEach(({ color, text }) => {
        const item = document.createElement("span");
        item.className = "parent-legend-item";
        item.innerHTML = `<span class="parent-legend-dot" style="background:${color}"></span>${text}`;
        legend.append(item);
    });

    card.append(chartTitle, weekNav, weekSummary, chart, legend, note, createWeakSection(player, lessonIndex));

    const skippedTitles = computeSkippedLessons(player, lessonIndex);
    if (skippedTitles.length > 0) {
        card.append(createSkippedNote(skippedTitles));
    }

    // Csak akkor jelenik meg, ha az évfolyamra szűrve van mit listázni.
    const favRows = favoriteRowsFor(player, lessonIndex);
    if (favRows.length > 0) {
        const favBtn = createButton("📄 Kedvencek listája (PDF)", {
            className: "nav-bar-btn favorites-export-btn",
            onClick: () => openFavoritesPrint(player, lessonIndex)
        });
        card.append(favBtn);
    }

    return card;
}

export function renderParentDashboard(root, onBack, lessonIndex) {

    root.replaceChildren();

    const wrapper = createCard("parent-page");

    const backButton = createButton("⬅️ Vissza", {
        onClick: () => onBack()
    });
    backButton.className = "nav-bar-btn";

    const backRow = document.createElement("div");
    backRow.style.cssText = "display:flex; justify-content:center; margin-bottom:1rem;";
    backRow.append(backButton);

    const title = document.createElement("h1");
    title.className = "parent-title";
    title.textContent = "📊 Szülői összefoglaló";

    const subtitle = document.createElement("p");
    subtitle.className = "parent-subtitle";
    subtitle.textContent = "A gyerekek előrehaladása és napi játéktevékenysége egy pillantásra.";

    wrapper.append(backRow, title, subtitle);

    const players = listPlayers();

    if (players.length === 0) {
        const empty = document.createElement("p");
        empty.className = "parent-empty";
        empty.textContent = "Még nincs egyetlen játékos sem.";
        wrapper.append(empty);
    } else {
        players.forEach((player, index) => {
            wrapper.append(createPlayerCard(player, ACCENT_COLORS[index % ACCENT_COLORS.length], lessonIndex));
        });
    }

    root.append(wrapper);
}