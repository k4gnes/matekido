import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { getDailyStats, getAllSkillStats, getActiveWorld } from "../profile/Profile.js";
import { SKILLS, CATEGORIES } from "../data/skills.js";

function formatDate(dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    const days = ["Vas", "Hé", "Ke", "Sze", "Csü", "Pé", "Szo"];
    const months = ["jan", "febr", "márc", "ápr", "máj", "jún", "júl", "aug", "szept", "okt", "nov", "dec"];
    return `${days[d.getDay()]}. ${d.getDate()} ${months[d.getMonth()]}.`;
}

function isToday(dateStr) {
    return dateStr === new Date().toISOString().split("T")[0];
}

const WORLD_STATS_TITLE = {
    postman: "📬 Postai jelentés",
    racing: "📊 Versenyjelentés",
    cooking: "👨‍🍳 Szakács jelentés",
    football: "⚽ Meccsjelentés"
};

export function renderStatsPage(root, onBack) {

    root.replaceChildren();

    const allStats = getDailyStats();
    const skillStats = getAllSkillStats();
    const today = new Date().toISOString().split("T")[0];
    let selectedDate = today;

    const card = createCard();

    const title = document.createElement("h1");
    const world = getActiveWorld();
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

    dailySection.append(nav, dailyGrid);

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
    }

    renderDailyStats();

    // --- Skill stats ---
    const skillSection = document.createElement("div");
    skillSection.className = "profile-page-daily";

    const skillTitle = document.createElement("h2");
    skillTitle.textContent = "📊 Készségek";
    skillSection.append(skillTitle);

    const skillGrid = document.createElement("div");
    skillGrid.className = "skill-grid";

    const categorized = {};
    for (const [key, cat] of Object.entries(CATEGORIES)) {
        categorized[key] = { ...cat, skills: [] };
    }

    for (const [skillId, skillData] of Object.entries(SKILLS)) {
        const raw = skillStats[skillId];
        if (raw && categorized[skillData.category]) {
            const total = raw.correct + raw.wrong;
            const percentage = total > 0 ? Math.round((raw.correct / total) * 100) : 0;
            categorized[skillData.category].skills.push({
                id: skillId,
                title: skillData.title,
                stats: { correct: raw.correct, total, percentage }
            });
        }
    }

    for (const [catKey, cat] of Object.entries(categorized)) {
        if (cat.skills.length === 0) continue;

        const catSection = document.createElement("div");
        catSection.className = "skill-category";

        const catTitle = document.createElement("h3");
        catTitle.className = "skill-category-title";
        catTitle.textContent = `${cat.icon} ${cat.title}`;
        catSection.append(catTitle);

        cat.skills.forEach(skill => {
            const row = document.createElement("div");
            row.className = "skill-row";

            const label = document.createElement("span");
            label.className = "skill-label";
            label.textContent = skill.title;

            const barWrap = document.createElement("div");
            barWrap.className = "skill-bar-wrap";

            const bar = document.createElement("div");
            bar.className = "skill-bar";
            bar.style.width = skill.stats.percentage + "%";

            barWrap.append(bar);

            const pctText = document.createElement("span");
            pctText.className = "skill-pct";
            pctText.textContent = skill.stats.percentage + "%";

            const detailText = document.createElement("span");
            detailText.className = "skill-detail";
            detailText.textContent = `${skill.stats.correct}/${skill.stats.total}`;

            row.append(label, barWrap, pctText, detailText);
            catSection.append(row);
        });

        skillGrid.append(catSection);
    }

    skillSection.append(skillGrid);

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

    card.append(title, dailySection, skillSection, summarySection, buttonRow);
    root.append(card);
}
