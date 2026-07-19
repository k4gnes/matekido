import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { loadProfile, getNextGoal, getDailyStats } from "../profile/Profile.js";
import { ACHIEVEMENTS } from "../profile/Achievements.js";

function formatDate(dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    const days = ["Vas", "Hé", "Ke", "Sze", "Csü", "Pé", "Szo"];
    const months = ["jan", "febr", "márc", "ápr", "máj", "jún", "júl", "aug", "szept", "okt", "nov", "dec"];
    return `${days[d.getDay()]}. ${d.getDate()} ${months[d.getMonth()]}.`;
}

function isToday(dateStr) {
    return dateStr === new Date().toISOString().split("T")[0];
}

export function renderProfilePage(root, onBack) {

    root.replaceChildren();

    const profile = loadProfile();
    const goal = getNextGoal();
    const allStats = getDailyStats();
    const today = new Date().toISOString().split("T")[0];
    let selectedDate = today;

    const card = createCard();
    card.classList.add("profile-page");

    const title = document.createElement("h1");
    title.textContent = "📮 Saját postahivatal";

    const stats = document.createElement("div");
    stats.className = "profile-page-stats";

    const lessons = document.createElement("div");
    lessons.className = "profile-page-stat";
    lessons.innerHTML = `<span class="stat-icon">📚</span><span class="stat-value">${profile.lessonsCompleted}</span><span class="stat-label">lecke</span>`;

    const streak = document.createElement("div");
    streak.className = "profile-page-stat";
    streak.innerHTML = `<span class="stat-icon">🔥</span><span class="stat-value">${profile.streak}</span><span class="stat-label">nap</span>`;

    stats.append(lessons, streak);

    const progressSection = document.createElement("div");
    progressSection.className = "profile-page-progress";

    const progressLabel = document.createElement("p");
    progressLabel.className = "profile-goal";
    progressLabel.textContent = `🎯 Következő cél: ${goal.current} / ${goal.target}`;

    const progress = document.createElement("progress");
    progress.max = goal.target;
    progress.value = goal.current;

    progressSection.append(progressLabel, progress);

    const questSection = document.createElement("div");
    questSection.className = "profile-page-quest";

    const questTitle = document.createElement("p");
    questTitle.className = "profile-page-quest-title";
    questTitle.textContent = "📅 Mai küldetés";

    const questBar = document.createElement("div");
    questBar.className = "quest-bar";

    for (let i = 0; i < 3; i++) {
        const dot = document.createElement("div");
        dot.className = i < profile.dailyQuest.progress ? "quest-dot done" : "quest-dot";
        questBar.append(dot);
    }

    const questText = document.createElement("p");
    questText.className = "profile-quest";
    questText.textContent = `${profile.dailyQuest.progress}/3 lecke teljesítve`;

    questSection.append(questTitle, questBar, questText);

    // --- Achievements ---
    const achievementSection = document.createElement("div");
    achievementSection.className = "profile-page-achievements";

    const achievementTitle = document.createElement("h2");
    achievementTitle.textContent = "🏆 Teljesítmények";

    achievementSection.append(achievementTitle);

    ACHIEVEMENTS.forEach(ach => {
        const unlocked = profile.lessonsCompleted >= ach.lessons;
        const item = document.createElement("div");
        item.className = unlocked ? "achievement-item unlocked" : "achievement-item locked";
        item.innerHTML = `
            <span class="achievement-icon">${ach.icon}</span>
            <div class="achievement-info">
                <span class="achievement-name">${ach.title}</span>
                <span class="achievement-req">${ach.lessons} lecke${unlocked ? " ✓" : ""}</span>
            </div>
        `;
        achievementSection.append(item);
    });

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

        const TYPE_LABELS = {
            addition: "➕ Összeadás",
            subtraction: "➖ Kivonás",
            mixed: "🔀 Vegyes",
            "missing-number": "❓ Hiányzó szám",
            comparison: "⚖️ Összehasonlítás",
            neighbor: "🔍 Szomszéd",
            decomposition: "🧩 Bontás"
        };

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

    Object.values(allStats).forEach(day => {
        totalCorrect += day.correct;
        totalWrong += day.wrong;
        totalLessons += day.lessonsPlayed;
    });

    const totalAll = totalCorrect + totalWrong;
    const totalAccuracy = totalAll > 0 ? Math.round((totalCorrect / totalAll) * 100) : 0;

    const summarySection = document.createElement("div");
    summarySection.className = "profile-page-daily";

    const summaryTitle = document.createElement("h2");
    summaryTitle.textContent = "📈 Összesítés";

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

    const menuButton = createButton("📚 Leckék", {
        onClick: () => onBack()
    });

    card.append(title, stats, progressSection, questSection, achievementSection, dailySection, summarySection, menuButton);
    root.append(card);
}
