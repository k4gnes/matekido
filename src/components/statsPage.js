import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { getDailyStats, getActiveWorld } from "../profile/Profile.js";

function formatDate(dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    const days = ["Vas", "Hé", "Ke", "Sze", "Csü", "Pé", "Szo"];
    const months = ["jan", "febr", "márc", "ápr", "máj", "jún", "júl", "aug", "szept", "okt", "nov", "dec"];
    return `${days[d.getDay()]}. ${d.getDate()} ${months[d.getMonth()]}.`;
}

function isToday(dateStr) {
    return dateStr === new Date().toISOString().split("T")[0];
}

const TYPE_LABELS = {
    addition: "➕ Összeadás",
    subtraction: "➖ Kivonás",
    mixed: "🔀 Vegyes",
    "missing-number": "❓ Hiányzó szám",
    comparison: "⚖️ Összehasonlítás",
    neighbor: "🔍 Szomszéd",
    decomposition: "🧩 Bontás"
};

export function renderStatsPage(root, onBack) {

    root.replaceChildren();

    const allStats = getDailyStats();
    const today = new Date().toISOString().split("T")[0];
    let selectedDate = today;

    const card = createCard();

    const title = document.createElement("h1");
    const world = getActiveWorld();
    const WORLD_STATS_TITLE = {
        postman: "📬 Postai jelentés",
        racing: "📊 Versenyjelentés",
        football: "⚽ Meccsjelentés"
    };
    title.textContent = WORLD_STATS_TITLE[world] ?? WORLD_STATS_TITLE.postman;

    // --- Daily stats with date navigation ---
    const dailySection = document.createElement("div");
    dailySection.className = "profile-page-daily";

    const nav = document.createElement("div");
    nav.className = "daily-nav";

    const prevBtn = createButton("◀", { onClick: () => changeDate(-1) });
    prevBtn.className = "daily-nav-btn";

    const dateLabel = document.createElement("span");
    dateLabel.className = "daily-date-label";

    const nextBtn = createButton("▶", { onClick: () => changeDate(1) });
    nextBtn.className = "daily-nav-btn";

    nav.append(prevBtn, dateLabel, nextBtn);

    const dailyGrid = document.createElement("div");
    dailyGrid.className = "daily-grid";

    const typeBreakdown = document.createElement("div");
    typeBreakdown.className = "type-breakdown";

    dailySection.append(nav, dailyGrid, typeBreakdown);

    function changeDate(delta) {
        const parts = selectedDate.split("-").map(Number);
        const d = new Date(parts[0], parts[1] - 1, parts[2] + delta);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const next = `${year}-${month}-${day}`;
        if (next <= today) {
            selectedDate = next;
        }
        renderDailyStats();
    }

    function renderDailyStats() {
        const raw = allStats[selectedDate];
        const dayStats = {
            correct: raw?.correct ?? 0,
            wrong: raw?.wrong ?? 0,
            lessonsPlayed: raw?.lessonsPlayed ?? 0,
            byType: raw?.byType ?? {}
        };
        const total = dayStats.correct + dayStats.wrong;
        const accuracy = total > 0 ? Math.round((dayStats.correct / total) * 100) : 0;

        dateLabel.textContent = isToday(selectedDate)
            ? "Ma — " + formatDate(selectedDate)
            : formatDate(selectedDate);

        nextBtn.style.visibility = selectedDate >= today ? "hidden" : "visible";

        dailyGrid.replaceChildren();

        const items = [
            { icon: "✅", value: dayStats.correct, label: "helyes" },
            { icon: "❌", value: dayStats.wrong, label: "hibás" },
            { icon: "📖", value: dayStats.lessonsPlayed, label: "lecke" },
            { icon: "🎯", value: accuracy + "%", label: "pontosság" }
        ];

        items.forEach(({ icon, value, label }) => {
            const item = document.createElement("div");
            item.className = "daily-item";
            item.innerHTML = `<span class="daily-icon">${icon}</span><span class="daily-value">${value}</span><span class="daily-label">${label}</span>`;
            dailyGrid.append(item);
        });

        typeBreakdown.replaceChildren();

        const byType = dayStats.byType || {};
        const hasAny = Object.keys(byType).length > 0;
        if (!hasAny) return;

        Object.entries(byType).forEach(([type, counts]) => {
            const typeTotal = counts.correct + counts.wrong;
            const pct = typeTotal > 0 ? Math.round((counts.correct / typeTotal) * 100) : 0;

            const row = document.createElement("div");
            row.className = "type-row";

            const label = document.createElement("span");
            label.className = "type-label";
            label.textContent = TYPE_LABELS[type] || type;

            const barWrap = document.createElement("div");
            barWrap.className = "type-bar-wrap";

            const bar = document.createElement("div");
            bar.className = "type-bar";
            bar.style.width = pct + "%";

            barWrap.append(bar);

            const pctText = document.createElement("span");
            pctText.className = "type-pct";
            pctText.textContent = pct + "%";

            row.append(label, barWrap, pctText);
            typeBreakdown.append(row);
        });
    }

    renderDailyStats();

    // --- Summary ---
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalLessons = 0;
    const summaryByType = {};

    const dayCount = Object.keys(allStats).length;

    Object.values(allStats).forEach(day => {
        totalCorrect += day.correct;
        totalWrong += day.wrong;
        totalLessons += day.lessonsPlayed;

        if (day.byType) {
            Object.entries(day.byType).forEach(([type, counts]) => {
                if (!summaryByType[type]) {
                    summaryByType[type] = { correct: 0, wrong: 0 };
                }
                summaryByType[type].correct += counts.correct;
                summaryByType[type].wrong += counts.wrong;
            });
        }
    });

    const totalAll = totalCorrect + totalWrong;
    const totalAccuracy = totalAll > 0 ? Math.round((totalCorrect / totalAll) * 100) : 0;

    const summarySection = document.createElement("div");
    summarySection.className = "profile-page-daily";

    const summaryTitle = document.createElement("h2");
    const WORLD_SUMMARY_TITLE = {
        postman: "📈 Összesítés",
        racing: "📈 Összesítés",
        football: "📈 Összesítés"
    };
    summaryTitle.textContent = WORLD_SUMMARY_TITLE[world] ?? "📈 Összesítés";

    const summaryGrid = document.createElement("div");
    summaryGrid.className = "daily-grid";

    const summaryItems = [
        { icon: "✅", value: totalCorrect, label: "helyes" },
        { icon: "❌", value: totalWrong, label: "hibás" },
        { icon: "📖", value: totalLessons, label: "lecke" },
        { icon: "🎯", value: totalAccuracy + "%", label: "pontosság" }
    ];

    summaryItems.forEach(({ icon, value, label }) => {
        const item = document.createElement("div");
        item.className = "daily-item summary-item";
        item.innerHTML = `<span class="daily-icon">${icon}</span><span class="daily-value">${value}</span><span class="daily-label">${label}</span>`;
        summaryGrid.append(item);
    });

    summarySection.append(summaryTitle, summaryGrid);

    if (dayCount > 1 && Object.keys(summaryByType).length > 0) {
        const summaryTypeBreakdown = document.createElement("div");
        summaryTypeBreakdown.className = "type-breakdown";

        Object.entries(summaryByType).forEach(([type, counts]) => {
            const typeTotal = counts.correct + counts.wrong;
            const pct = typeTotal > 0 ? Math.round((counts.correct / typeTotal) * 100) : 0;

            const row = document.createElement("div");
            row.className = "type-row";

            const label = document.createElement("span");
            label.className = "type-label";
            label.textContent = TYPE_LABELS[type] || type;

            const barWrap = document.createElement("div");
            barWrap.className = "type-bar-wrap";

            const bar = document.createElement("div");
            bar.className = "type-bar";
            bar.style.width = pct + "%";

            barWrap.append(bar);

            const pctText = document.createElement("span");
            pctText.className = "type-pct";
            pctText.textContent = pct + "%";

            row.append(label, barWrap, pctText);
            summaryTypeBreakdown.append(row);
        });

        summarySection.append(summaryTypeBreakdown);
    }

    // --- Navigation buttons ---
    const buttonRow = document.createElement("div");
    buttonRow.style.cssText = "display:flex; gap:.5rem; justify-content:center; margin-top:1rem;";

    const profileButton = createButton("👤 Profil", {
        onClick: () => onBack()
    });
    profileButton.className = "profile-page-button";

    const lessonsButton = createButton("📚 Leckék", {
        onClick: () => onBack("lessons")
    });
    lessonsButton.className = "profile-page-button";

    buttonRow.append(profileButton, lessonsButton);

    card.append(title, dailySection, summarySection, buttonRow);
    root.append(card);
}
