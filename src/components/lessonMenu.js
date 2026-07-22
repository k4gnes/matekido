import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { listPlayers, getActiveId } from "../profile/UserManager.js";
import { getLessonStats, getActiveWorld } from "../profile/Profile.js";
import { CATEGORIES } from "../data/skills.js";

const TYPE_EMOJI = {
    addition: "➕",
    subtraction: "➖",
    mixed: "🔀",
    "missing-number": "❓",
    comparison: "⚖️",
    neighbor: "🔍",
    decomposition: "🧩"
};

const DIFFICULTY_BADGE = {
    1: "🟢",
    2: "🟡",
    3: "🟠",
    4: "🔴"
};

function createLessonCard(lesson, onSelect, activeWorld) {
    const lessonCard = document.createElement("div");
    lessonCard.className = "lesson-card";

    const mission = lesson.worldTitles?.[activeWorld] ?? lesson.mission;

    const title = document.createElement("h3");
    title.className = "lesson-card-title";
    title.textContent = mission;

    const subtitle = document.createElement("p");
    subtitle.className = "lesson-card-subtitle";
    subtitle.textContent = lesson.subtitle;

    const badges = document.createElement("div");
    badges.className = "lesson-badges";

    const typeBadge = document.createElement("span");
    typeBadge.className = "lesson-type-badge";
    typeBadge.textContent = TYPE_EMOJI[lesson.type] ?? "";
    badges.append(typeBadge);

    if (lesson.difficulty) {
        const diffBadge = document.createElement("span");
        diffBadge.className = "lesson-difficulty-badge";
        diffBadge.textContent = DIFFICULTY_BADGE[lesson.difficulty] ?? "";
        badges.append(diffBadge);
    }

    lessonCard.append(badges, title, subtitle);

    const stats = getLessonStats(lesson.file);
    if (stats) {
        const statBadge = document.createElement("span");
        statBadge.className = "lesson-stat-badge";
        statBadge.textContent = `${stats.percentage}%`;
        lessonCard.append(statBadge);
    }

    lessonCard.addEventListener("click", () => {
        onSelect(lesson.file);
    });

    return lessonCard;
}

function createCategorySection(categoryKey, lessons, onSelect, activeWorld) {
    const category = CATEGORIES[categoryKey];
    if (!category || lessons.length === 0) return null;

    const section = document.createElement("div");
    section.className = "category-section";

    const categoryTitle = document.createElement("h3");
    categoryTitle.className = "category-title";
    categoryTitle.textContent = `${category.icon} ${category.title}`;
    section.append(categoryTitle);

    const lessonGrid = document.createElement("div");
    lessonGrid.className = "lesson-grid";

    lessons.forEach(lesson => {
        lessonGrid.append(createLessonCard(lesson, onSelect, activeWorld));
    });

    section.append(lessonGrid);
    return section;
}

function createGradeSection(gradeConfig, lessons, onSelect, activeWorld) {
    const card = createCard();

    const gradeTitle = document.createElement("h2");
    gradeTitle.className = "lesson-group";
    gradeTitle.textContent = gradeConfig.title;

    const separator = document.createElement("hr");
    separator.className = "lesson-separator";

    card.append(gradeTitle, separator);

    const categorized = {};
    for (const key of Object.keys(CATEGORIES)) {
        categorized[key] = [];
    }

    lessons.forEach(lesson => {
        const cat = lesson.category || "operations";
        if (!categorized[cat]) categorized[cat] = [];
        categorized[cat].push(lesson);
    });

    for (const [categoryKey, catLessons] of Object.entries(categorized)) {
        const section = createCategorySection(categoryKey, catLessons, onSelect, activeWorld);
        if (section) card.append(section);
    }

    return card;
}

export function renderLessonMenu(index, root, onSelect, onProfile, onSwitch) {

    root.replaceChildren();

    const wrapper = createCard();

    const title = document.createElement("h1");
    const worldId = getActiveWorld();
    const worldEmoji = worldId === "racing" ? "🏎️" : worldId === "football" ? "⚽" : worldId === "cooking" ? "👨‍🍳" : "📚";
    title.textContent = `${worldEmoji} Matekidő`;

    wrapper.append(title);

    const activeWorld = getActiveWorld();

    const allLessons = index.lessons || [];
    const gradeConfig = index.gradeConfig || [];

    gradeConfig.forEach(gc => {
        const gradeLessons = allLessons.filter(l => l.grades?.includes(gc.grade));
        wrapper.append(createGradeSection(gc, gradeLessons, onSelect, activeWorld));
    });

    const buttonRow = document.createElement("div");
    buttonRow.style.cssText = "display:flex; gap:.5rem; justify-content:center; margin-bottom:1rem;";

    const allPlayers = listPlayers();
    const activeId = getActiveId();
    const currentPlayer = allPlayers.find(p => p.id === activeId);

    const profileButton = createButton("👤 Profilom", {
        onClick: () => onProfile?.()
    });
    profileButton.className = "profile-page-button";

    buttonRow.append(profileButton);

    if (currentPlayer) {
        const avatar = document.createElement("span");
        avatar.textContent = `${currentPlayer.avatar} ${currentPlayer.name}`;
        avatar.style.cssText = "font-size:1.4rem; line-height:1; display:inline-flex; align-items:center;";
        buttonRow.append(avatar);
    }

    if (onSwitch) {
        const switchButton = createButton("👤 Játékos", {
            onClick: () => onSwitch?.()
        });
        switchButton.className = "profile-page-button";
        buttonRow.append(switchButton);
    }

    root.append(buttonRow, wrapper);
}
