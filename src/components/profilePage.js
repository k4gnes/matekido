import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { loadProfile, getNextGoal } from "../profile/Profile.js";
import { ACHIEVEMENTS, getUnlockedAchievements } from "../profile/Achievements.js";
import { listPlayers, getActiveId } from "../profile/UserManager.js";

export function renderProfilePage(root, onBack, onStats) {

    root.replaceChildren();

    const profile = loadProfile();
    const goal = getNextGoal();

    const card = createCard();
    card.classList.add("profile-page");

    const avatarDisplay = document.createElement("div");
    avatarDisplay.style.cssText = "font-size:3rem; text-align:center; margin-bottom:.2rem;";

    const allPlayers = listPlayers();
    const activeId = getActiveId();
    const activePlayer = allPlayers.find(p => p.id === activeId);
    avatarDisplay.textContent = activePlayer?.avatar ?? "🦊";

    const title = document.createElement("h1");
    title.textContent = "📮 Saját postahivatal";

    const nameDisplay = document.createElement("p");
    nameDisplay.style.cssText = "font-size:1.1rem; font-weight:600; margin:0 0 .6rem; text-align:center;";
    nameDisplay.textContent = activePlayer?.name ?? "Játékos";

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

    const unlockedIds = new Set(getUnlockedAchievements(profile).map(a => a.id));

    ACHIEVEMENTS.forEach(ach => {
        const unlocked = unlockedIds.has(ach.id);
        const reqText = ach.category === "lessons"
            ? `${ach.target} lecke`
            : `${ach.target} tökéletes lecke`;

        const item = document.createElement("div");
        item.className = unlocked ? "achievement-item unlocked" : "achievement-item locked";
        item.innerHTML = `
            <span class="achievement-icon">${ach.icon}</span>
            <div class="achievement-info">
                <span class="achievement-name">${ach.title}</span>
                <span class="achievement-req">${reqText}${unlocked ? " ✓" : ""}</span>
            </div>
        `;
        achievementSection.append(item);
    });

    // --- Navigation buttons ---
    const buttonRow = document.createElement("div");
    buttonRow.style.cssText = "display:flex; gap:.5rem; justify-content:center; margin-top:1rem;";

    const statsButton = createButton("📋 Eredményeim", {
        onClick: () => onStats?.()
    });
    statsButton.className = "profile-page-button";

    const menuButton = createButton("📚 Leckék", {
        onClick: () => onBack()
    });
    menuButton.className = "profile-page-button";

    buttonRow.append(statsButton, menuButton);

    card.append(avatarDisplay, title, nameDisplay, stats, progressSection, questSection, achievementSection, buttonRow);
    root.append(card);
}
