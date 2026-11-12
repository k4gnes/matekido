import { createCard } from "./ui/card.js";
import { createNavBar } from "./ui/navbar.js";
import { loadProfile, getNextGoal, getActiveWorld, setActiveWorld, getLessonStats, getActiveGrade, getDailyStats, getAssessments } from "../profile/Profile.js";
import { formatDuration } from "../utils/assessment.js?v=6";
import { ACHIEVEMENTS, getUnlockedAchievements } from "../profile/Achievements.js";
import { listPlayers, getActiveId } from "../profile/UserManager.js";
import { getAllWorlds } from "../world/WorldRegistry.js";

function getGradeProgress(lessonIndex, grade) {
    const lessons = (lessonIndex?.lessons || []).filter(l => l.grades?.includes(grade) && !l.practice && !l.master);
    const total = lessons.length;
    let done = 0;

    lessons.forEach(l => {
        const stats = getLessonStats(l.file);
        if (stats && (stats.practice || stats.total > 0)) {
            done++;
        }
    });

    return { total, done, completed: total > 0 && done === total };
}

export function renderProfilePage({ lessonIndex, root, onBack, onStats, onHelp, onSwitch, onParent, onAssessments }) {

    root.replaceChildren();

    const profile = loadProfile();
    const goal = getNextGoal();

    const card = createCard();
    card.classList.add("profile-page");

    const allPlayers = listPlayers();
    const activeId = getActiveId();
    const activePlayer = allPlayers.find(p => p.id === activeId);

    const title = document.createElement("h1");
    const currentWorld = getAllWorlds().find(w => w.id === getActiveWorld());
    title.textContent = `${currentWorld?.icon ?? "📮"} ${currentWorld?.name ?? "postahivatal"}`;

    const stats = document.createElement("div");
    stats.className = "profile-page-stats";

    const lessons = document.createElement("div");
    lessons.className = "profile-page-stat";
    lessons.innerHTML = `<span class="stat-icon">📚</span><span class="stat-value">${profile.lessonsCompleted}</span><span class="stat-label">lecke</span>`;

    const stars = document.createElement("div");
    stars.className = "profile-page-stat";
    stars.innerHTML = `<span class="stat-icon">⭐</span><span class="stat-value">${profile.stars}</span><span class="stat-label">csillag</span>`;

    const dailyStats = getDailyStats();
    let totalCorrect = 0;
    let totalWrong = 0;
    Object.values(dailyStats).forEach(day => {
        totalCorrect += day.correct || 0;
        totalWrong += day.wrong || 0;
    });
    const accuracy = totalCorrect + totalWrong > 0
        ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100)
        : null;

    const accuracyTile = document.createElement("div");
    accuracyTile.className = "profile-page-stat";
    accuracyTile.innerHTML = `<span class="stat-icon">🎯</span><span class="stat-value">${accuracy === null ? "–" : accuracy + "%"}</span><span class="stat-label">pontosság</span>`;

    const perfect = document.createElement("div");
    perfect.className = "profile-page-stat";
    perfect.innerHTML = `<span class="stat-icon">✨</span><span class="stat-value">${profile.perfectLessons || 0}</span><span class="stat-label">hibátlan lecke</span>`;

    stats.append(lessons, stars, accuracyTile, perfect);

    const activeGrade = getActiveGrade();
    const gradeCard = document.createElement("div");
    gradeCard.className = "profile-page-grade";

    const gradeLabel = document.createElement("span");
    gradeLabel.className = "profile-page-grade-label";
    gradeLabel.textContent = `${activeGrade ?? "–"}. osztály`;

    const gradeInfo = document.createElement("span");
    gradeInfo.className = "profile-page-grade-info";

    const gradeStats = activeGrade != null ? getGradeProgress(lessonIndex, activeGrade) : { total: 0, done: 0, completed: false };

    if (activeGrade != null && gradeStats.total > 0) {
        if (gradeStats.completed) {
            gradeLabel.textContent = `${activeGrade}. osztály`;
            gradeInfo.textContent = "✅ Kész!";
            gradeCard.classList.add("done");
        } else {
            gradeInfo.textContent = `${gradeStats.done}/${gradeStats.total} lecke`;
        }
    } else {
        gradeInfo.textContent = "Még nem kezdted.";
    }

    gradeCard.append(gradeLabel, gradeInfo);

    // Világjelvények sáva: 7 slot, 7 napocska felett élesedik.
    const badgeSection = document.createElement("div");
    badgeSection.className = "profile-page-badges";

    const badgeTitle = document.createElement("p");
    badgeTitle.className = "profile-page-badges-title";
    badgeTitle.textContent = "🏅 Világjelvények · 7 napocska";

    const badgeRow = document.createElement("div");
    badgeRow.className = "badge-row";

    getAllWorlds().forEach(world => {
        const suns = Math.min(profile.napocskak?.[world.id] ?? 0, 7);
        const slot = document.createElement("span");
        slot.className = suns >= 7 ? "world-badge earned" : "world-badge";
        slot.style.setProperty("--badge-color", `var(--world-${world.id})`);
        slot.textContent = world.icon;
        slot.title = suns >= 7
            ? `${world.name} jelvény: megszerezve ✓`
            : `${world.name}: ${suns}/7 napocska`;
        badgeRow.append(slot);
    });

    badgeSection.append(badgeTitle, badgeRow);

    const progressSection = document.createElement("div");
    progressSection.className = "profile-page-progress";

    const progressLabel = document.createElement("p");
    progressLabel.className = "profile-goal";
    progressLabel.innerHTML = `<span>🎯 Következő cél: ${goal.current} / ${goal.target}</span><span class="profile-streak">🔥 ${profile.streak} nap</span>`;

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
        const sun = document.createElement("span");
        sun.className = i < profile.dailyQuest.progress ? "quest-sun done" : "quest-sun";
        sun.setAttribute("aria-hidden", "true");
        questBar.append(sun);
    }

    const questText = document.createElement("p");
    questText.className = "profile-quest";
    questText.textContent = `${profile.dailyQuest.progress}/3 lecke teljesítve`;

    questSection.append(questTitle, questBar, questText);

    // --- Achievements + Worlds side by side ---
    const achWorldRow = document.createElement("div");
    achWorldRow.className = "profile-page-bottom";
    const achievementSection = document.createElement("div");
    achievementSection.className = "profile-page-achievements";

    const achievementTitle = document.createElement("h2");
    achievementTitle.textContent = "🏆 Teljesítmények";

    achievementSection.append(achievementTitle);

    const unlockedIds = new Set(getUnlockedAchievements(profile).map(a => a.id));
    const activeWorldForAch = getActiveWorld();

    ACHIEVEMENTS.forEach(ach => {
        const unlocked = unlockedIds.has(ach.id);
        const achTitle = ach.worldTitles?.[activeWorldForAch] ?? ach.title;
        const achIcon = ach.worldIcons?.[activeWorldForAch] ?? ach.icon;
        const reqText = ach.category === "lessons"
            ? `${ach.target} lecke`
            : ach.category === "napocska"
                ? `${ach.target} világ`
                : `${ach.target} tökéletes lecke`;

        const item = document.createElement("div");
        item.className = unlocked ? "achievement-item unlocked" : "achievement-item locked";
        item.innerHTML = `
            <span class="achievement-icon">${achIcon}</span>
            <div class="achievement-info">
                <span class="achievement-name">${achTitle}</span>
                <span class="achievement-req">${reqText}${unlocked ? " ✓" : ""}</span>
            </div>
        `;
        achievementSection.append(item);
    });

    // --- Worlds ---
    const worldSection = document.createElement("div");
    worldSection.className = "profile-page-worlds";

    const worldTitle = document.createElement("h2");
    worldTitle.textContent = "🌍 Világok";

    worldSection.append(worldTitle);

    const allWorlds = getAllWorlds();
    const activeWorldId = getActiveWorld();

    allWorlds.forEach(world => {
        const isUnlocked = profile.stars >= world.requiredStars;
        const isActive = world.id === activeWorldId;

        const item = document.createElement("div");
        item.className = "world-item" + (isUnlocked ? " unlocked" : " locked") + (isActive ? " active" : "");

        const icon = document.createElement("span");
        icon.className = "world-icon";
        icon.textContent = world.icon;

        const info = document.createElement("div");
        info.className = "world-info";

        const name = document.createElement("span");
        name.className = "world-name";
        name.textContent = world.name;

        const desc = document.createElement("span");
        desc.className = "world-desc";
        if (isUnlocked) {
            desc.textContent = isActive ? "✅ Aktív" : "Kattints a váltáshoz";
        } else {
            desc.textContent = `⭐ ${world.requiredStars} szükséges (${profile.stars}/${world.requiredStars})`;
        }

        info.append(name, desc);

        const sunCount = document.createElement("span");
        sunCount.className = "world-sun";
        const sunIcon = document.createElement("span");
        sunIcon.className = "napocska-sun";
        sunIcon.style.background = `var(--world-${world.id})`;
        // Math.min: régi mentésben is 7/7-nél több nem jelenik meg.
        sunCount.append(sunIcon, `${Math.min(profile.napocskak?.[world.id] ?? 0, 7)}/7`);

        item.append(icon, info, sunCount);

        if (isUnlocked && !isActive) {
            item.style.cursor = "pointer";
            item.addEventListener("click", () => {
                setActiveWorld(world.id);
                document.body.dataset.world = world.id;
                document.body.dataset.worldTheme = world.id;
                renderProfilePage({ lessonIndex, root, onBack, onStats, onHelp, onSwitch, onParent, onAssessments });
            });
        }

        worldSection.append(item);
    });

    achWorldRow.append(achievementSection, worldSection);

    // 📝 Felmérések: a táblázat külön oldalon van, itt csak egy kattintható sor
    // visz oda – így a profil nem nyomódik el a sok sorral.
    const assessments = getAssessments();

    if (assessments.length > 0) {

        const link = document.createElement("button");
        link.type = "button";
        link.className = "profile-assessments profile-assessments-link";

        const icon = document.createElement("span");
        icon.className = "world-icon";
        icon.textContent = "📝";

        const info = document.createElement("div");
        info.className = "world-info";

        const name = document.createElement("span");
        name.className = "world-name";
        name.textContent = "Felmérések";

        // a legfrissebb futás áll elől (a mentés unshift-tel teszi az élére)
        const lastDate = assessments[0]?.startedAt
            ? new Date(assessments[0].startedAt).toLocaleString("hu-HU")
            : "";
        const totalSeconds = assessments.reduce((sum, run) => sum + (run.seconds ?? 0), 0);

        const desc = document.createElement("span");
        desc.className = "world-desc";
        desc.textContent = `${assessments.length} futás${lastDate ? ` · legutóbb: ${lastDate}` : ""} · ⏱ ${formatDuration(totalSeconds)}`;

        info.append(name, desc);

        const arrow = document.createElement("span");
        arrow.className = "world-sun";
        arrow.textContent = "›";

        link.append(icon, info, arrow);
        link.addEventListener("click", () => onAssessments());

        achWorldRow.append(link);

    }

    const navbar = createNavBar({
        current: "profile",
        player: activePlayer,
        onLessons: onBack,
        onStats,
        onHelp,
        onSwitch,
        onParent
    });

    card.append(navbar, title, stats, gradeCard, badgeSection, progressSection, questSection, achWorldRow);

    root.append(card);
}
