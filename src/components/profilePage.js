import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { loadProfile, getNextGoal } from "../profile/Profile.js";
import { ACHIEVEMENTS } from "../profile/Achievements.js";

export function renderProfilePage(root, onBack) {

    root.replaceChildren();

    const profile = loadProfile();
    const goal = getNextGoal();

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

    const stars = document.createElement("div");
    stars.className = "profile-page-stat";
    stars.innerHTML = `<span class="stat-icon">⭐</span><span class="stat-value">${profile.stars}</span><span class="stat-label">csillag</span>`;

    const letters = document.createElement("div");
    letters.className = "profile-page-stat";
    letters.innerHTML = `<span class="stat-icon">✉️</span><span class="stat-value">${profile.lettersDelivered}</span><span class="stat-label">levél</span>`;

    stats.append(lessons, streak, stars, letters);

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

    const menuButton = createButton("📚 Leckék", {
        onClick: () => onBack()
    });

    card.append(title, stats, progressSection, questSection, achievementSection, menuButton);
    root.append(card);
}
