import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { listPlayers } from "../profile/UserManager.js";
import { SKILLS, CATEGORIES } from "../data/skills.js";

const DAY = 24 * 60 * 60 * 1000;

const WEEKDAY_SHORT = ["V", "H", "K", "Sze", "Cs", "P", "Szo"];

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

function getLastNDays(n) {
    const days = [];
    const now = Date.now();
    for (let i = n - 1; i >= 0; i--) {
        days.push(new Date(now - i * DAY).toISOString().split("T")[0]);
    }
    return days;
}

function parseDate(dateStr) {
    const parts = dateStr.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
}

function formatDayLabel(dateStr) {
    const d = parseDate(dateStr);
    return `${WEEKDAY_SHORT[d.getDay()]} ${d.getDate()}`;
}

function lastPlayedText(dateStr) {
    if (!dateStr) return "Még nem játszott";
    const diff = Math.round((new Date(getToday()) - new Date(dateStr)) / DAY);
    if (diff <= 0) return "Ma játszott";
    if (diff === 1) return "Tegnap játszott";
    return `${diff} napja játszott`;
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

function createWeakRow(title, detail, percentage) {

    const row = document.createElement("div");
    row.className = "type-row";

    const label = document.createElement("span");
    label.className = "type-label";
    label.title = detail;
    label.textContent = title;

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
        empty.textContent = "🎉 Minden rendben, nincs gyakorlandó terület!";
        section.append(empty);
    } else {
        rows.forEach(row => section.append(row));
    }

    return section;

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
    lastPlayed.textContent = lastPlayedText(profile.lastPlayed);

    header.append(avatar, name, lastPlayed);

    const acc = overallAccuracy(dailyStats);

    const stats = document.createElement("div");
    stats.className = "parent-stats";

    const statItems = [
        { icon: "📚", value: profile.lessonsCompleted ?? 0, label: "lecke" },
        { icon: "⭐", value: profile.stars ?? 0, label: "csillag" },
        { icon: "🔥", value: profile.streak ?? 0, label: "nap" },
        { icon: "✨", value: profile.perfectLessons ?? 0, label: "hiba nélkül" },
        { icon: "🎯", value: acc === null ? "–" : acc + " %", label: "pontosság" }
    ];

    statItems.forEach(({ icon, value, label }) => {
        const item = document.createElement("span");
        item.className = "parent-stat";
        item.innerHTML = `<span>${icon} ${value}</span> <span style="opacity:.65">${label}</span>`;
        stats.append(item);
    });

    card.append(header, stats);

    const lastDays = getLastNDays(7);
    const weekDays = lastDays.map(date => {
        const day = dailyStats[date] ?? { correct: 0, wrong: 0, lessonsPlayed: 0 };
        return {
            date,
            lessons: day.lessonsPlayed ?? 0,
            accuracy: dayAccuracy(day)
        };
    });

    const maxLessons = Math.max(1, ...weekDays.map(d => d.lessons));
    const chartTrackMin = Math.max(...weekDays.map(d => d.accuracy !== null ? 1 : 0)) > 0;
    const chartLabel = document.createElement("p");
    chartLabel.className = "parent-chart-label";
    chartLabel.textContent = "📈 Elmúlt 7 nap";

    const chart = document.createElement("div");
    chart.className = "parent-chart";

    weekDays.forEach(day => {
        const col = document.createElement("div");
        col.className = "parent-bar-col";

        const barValue = document.createElement("span");
        barValue.className = "parent-bar-value";
        barValue.textContent = day.lessons > 0 ? day.lessons : "";

        const bar = document.createElement("div");
        bar.className = "parent-bar";
        bar.style.background = accuracyColor(day.accuracy);
        bar.title = day.accuracy === null
            ? `${day.date} – nem játszott`
            : `${day.date} – ${day.lessons} lecke, ${day.accuracy}% pontosság`;
        if (day.lessons > 0) {
            bar.style.height = Math.max(6, Math.round((day.lessons / maxLessons) * 100)) + "px";
        }

        const dayLabel = document.createElement("span");
        dayLabel.className = "parent-bar-day";
        dayLabel.textContent = formatDayLabel(day.date);

        col.append(barValue, bar, dayLabel);
        chart.append(col);
    });

    const legend = document.createElement("div");
    legend.className = "parent-legend";

    [
        { color: "#4caf50", text: "80%+" },
        { color: "#f59e0b", text: "50–79%" },
        { color: "#e53935", text: "50% alatt" },
        { color: "#e0e0e0", text: "nem játszott" }
    ].forEach(({ color, text }) => {
        const item = document.createElement("span");
        item.className = "parent-legend-item";
        item.innerHTML = `<span class="parent-legend-dot" style="background:${color}"></span>${text}`;
        legend.append(item);
    });

    const note = document.createElement("p");
    note.className = "parent-weekly-note";
    note.textContent = chartTrackMin
        ? "A sávok magassága a leckék száma, színük a napi pontosság."
        : "Nincs még heti adat ehhez a játékoshoz.";

    card.append(chartLabel, chart, legend, note, createWeakSection(player, lessonIndex));

    return card;
}

export function renderParentDashboard(root, onBack, lessonIndex) {

    root.replaceChildren();

    const wrapper = createCard("parent-page");

    const title = document.createElement("h1");
    title.className = "parent-title";
    title.textContent = "📊 Szülői összefoglaló";

    const subtitle = document.createElement("p");
    subtitle.className = "parent-subtitle";
    subtitle.textContent = "A gyerekek előrehaladása és napi játéktevékenysége egy pillantásra.";

    wrapper.append(title, subtitle);

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

    const backButton = createButton("⬅️ Vissza", {
        onClick: () => onBack()
    });
    backButton.className = "profile-page-button";
    backButton.style.marginTop = "1rem";

    wrapper.append(backButton);

    root.append(wrapper);
}