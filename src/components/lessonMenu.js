import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { listPlayers, getActiveId } from "../profile/UserManager.js";
import { getLessonStats, getActiveWorld } from "../profile/Profile.js";
import { CATEGORIES, SKILLS } from "../data/skills.js";

const FILTER_STORAGE_KEY = "matekido-lesson-filters";

function saveFilters(filters) {
    try {
        localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
    } catch {}
}

function loadFilters() {
    try {
        const saved = localStorage.getItem(FILTER_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                difficulty: parsed.difficulty || [],
                grade: parsed.grade || [],
                skills: parsed.skills || [],
                types: parsed.types || [],
                ranges: parsed.ranges || [],
                categories: parsed.categories || []
            };
        }
    } catch {}
    return { difficulty: [], grade: [], skills: [], types: [], ranges: [], categories: [] };
}

const TYPE_EMOJI = {
    addition: "➕",
    subtraction: "➖",
    mixed: "🔀",
    "missing-number": "❓",
    comparison: "⚖️",
    neighbor: "🔍",
    decomposition: "🧩"
};

const TYPE_LABEL = {
    addition: "Összeadás",
    subtraction: "Kivonás",
    mixed: "Vegyes",
    "missing-number": "Hiányzó szám",
    comparison: "Összehasonlítás",
    neighbor: "Szomszédok",
    decomposition: "Bontás"
};

const RANGE_LABEL = {
    10: "10-ig",
    20: "20-ig",
    100: "100-ig"
};

const DIFFICULTY_BADGE = {
    1: "🟢",
    2: "🟡",
    3: "🟠",
    4: "🔴"
};

const DIFFICULTY_LABEL = {
    1: "Alap",
    2: "Gyakorló",
    3: "Haladó",
    4: "Mester"
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

function createFilterPanel(filters, onFilterChange) {
    const panel = document.createElement("div");
    panel.className = "filter-panel";

    const diffRow = document.createElement("div");
    diffRow.className = "filter-row";
    const diffLabel = document.createElement("span");
    diffLabel.className = "filter-label";
    diffLabel.textContent = "Nehézség:";
    diffRow.append(diffLabel);

    for (const [level, emoji] of Object.entries(DIFFICULTY_BADGE)) {
        const btn = document.createElement("button");
        const levelNum = Number(level);
        btn.className = "filter-btn" + (filters.difficulty.includes(levelNum) ? " active" : "");
        btn.textContent = `${emoji} ${DIFFICULTY_LABEL[levelNum]}`;
        btn.addEventListener("click", () => {
            if (filters.difficulty.includes(levelNum)) {
                filters.difficulty = filters.difficulty.filter(d => d !== levelNum);
            } else {
                filters.difficulty.push(levelNum);
            }
            onFilterChange();
        });
        diffRow.append(btn);
    }
    panel.append(diffRow);

    const catRow = document.createElement("div");
    catRow.className = "filter-row";
    const catLabel = document.createElement("span");
    catLabel.className = "filter-label";
    catLabel.textContent = "Feladat:";
    catRow.append(catLabel);

    const catBtns = document.createElement("div");
    catBtns.className = "filter-skill-btns";

    Object.entries(CATEGORIES).forEach(([catId, cat]) => {
        const btn = document.createElement("button");
        btn.className = "filter-btn" + (filters.categories.includes(catId) ? " active" : "");
        btn.textContent = `${cat.icon} ${cat.title}`;
        btn.addEventListener("click", () => {
            if (filters.categories.includes(catId)) {
                filters.categories = filters.categories.filter(c => c !== catId);
            } else {
                filters.categories.push(catId);
            }
            onFilterChange();
        });
        catBtns.append(btn);
    });

    catRow.append(catBtns);
    panel.append(catRow);

    const gradeRow = document.createElement("div");
    gradeRow.className = "filter-row";
    const gradeLabel = document.createElement("span");
    gradeLabel.className = "filter-label";
    gradeLabel.textContent = "Évfolyam:";
    gradeRow.append(gradeLabel);

    [1, 2].forEach(g => {
        const btn = document.createElement("button");
        btn.className = "filter-btn" + (filters.grade.includes(g) ? " active" : "");
        btn.textContent = `${g}. osztály`;
        btn.addEventListener("click", () => {
            if (filters.grade.includes(g)) {
                filters.grade = filters.grade.filter(gr => gr !== g);
            } else {
                filters.grade.push(g);
            }
            onFilterChange();
        });
        gradeRow.append(btn);
    });
    panel.append(gradeRow);

    const skillRow = document.createElement("div");
    skillRow.className = "filter-row";
    const skillLabel = document.createElement("span");
    skillLabel.className = "filter-label";
    skillLabel.textContent = "Készség:";
    skillRow.append(skillLabel);

    const skillBtns = document.createElement("div");
    skillBtns.className = "filter-skill-btns";

    const usedSkills = ["neighbours", "comparison", "missing-number", "addition", "subtraction", "mixed"];

    usedSkills.forEach(skillId => {
        const skill = SKILLS[skillId];
        if (!skill) return;

        const btn = document.createElement("button");
        btn.className = "filter-btn" + (filters.skills.includes(skillId) ? " active" : "");
        btn.textContent = skill.title;
        btn.addEventListener("click", () => {
            if (filters.skills.includes(skillId)) {
                filters.skills = filters.skills.filter(s => s !== skillId);
            } else {
                filters.skills.push(skillId);
            }
            onFilterChange();
        });
        skillBtns.append(btn);
    });

    skillRow.append(skillBtns);
    panel.append(skillRow);

    const typeRow = document.createElement("div");
    typeRow.className = "filter-row";
    const typeLabel = document.createElement("span");
    typeLabel.className = "filter-label";
    typeLabel.textContent = "Típus:";
    typeRow.append(typeLabel);

    const typeBtns = document.createElement("div");
    typeBtns.className = "filter-skill-btns";

    Object.entries(TYPE_LABEL).forEach(([typeId, label]) => {
        const btn = document.createElement("button");
        btn.className = "filter-btn" + (filters.types.includes(typeId) ? " active" : "");
        btn.textContent = `${TYPE_EMOJI[typeId]} ${label}`;
        btn.addEventListener("click", () => {
            if (filters.types.includes(typeId)) {
                filters.types = filters.types.filter(t => t !== typeId);
            } else {
                filters.types.push(typeId);
            }
            onFilterChange();
        });
        typeBtns.append(btn);
    });

    typeRow.append(typeBtns);
    panel.append(typeRow);

    const rangeRow = document.createElement("div");
    rangeRow.className = "filter-row";
    const rangeLabel = document.createElement("span");
    rangeLabel.className = "filter-label";
    rangeLabel.textContent = "Számkör:";
    rangeRow.append(rangeLabel);

    const rangeBtns = document.createElement("div");
    rangeBtns.className = "filter-skill-btns";

    Object.entries(RANGE_LABEL).forEach(([range, label]) => {
        const rangeNum = Number(range);
        const btn = document.createElement("button");
        btn.className = "filter-btn" + (filters.ranges.includes(rangeNum) ? " active" : "");
        btn.textContent = label;
        btn.addEventListener("click", () => {
            if (filters.ranges.includes(rangeNum)) {
                filters.ranges = filters.ranges.filter(r => r !== rangeNum);
            } else {
                filters.ranges.push(rangeNum);
            }
            onFilterChange();
        });
        rangeBtns.append(btn);
    });

    rangeRow.append(rangeBtns);
    panel.append(rangeRow);

    const clearRow = document.createElement("div");
    clearRow.className = "filter-row filter-clear";
    const clearBtn = document.createElement("button");
    clearBtn.className = "filter-btn filter-clear-btn";
    clearBtn.textContent = "✕ Szűrők törlése";
    clearBtn.addEventListener("click", () => {
        filters.difficulty = [];
        filters.grade = [];
        filters.skills = [];
        filters.types = [];
        filters.ranges = [];
        filters.categories = [];
        onFilterChange();
    });
    clearRow.append(clearBtn);
    panel.append(clearRow);

    return panel;
}

function filterLessons(lessons, filters) {
    const hasFilters = filters.difficulty.length > 0 || filters.grade.length > 0 || filters.skills.length > 0 || filters.types.length > 0 || filters.ranges.length > 0 || filters.categories.length > 0;
    if (!hasFilters) return lessons;

    return lessons.filter(l => {
        if (filters.difficulty.length > 0 && !filters.difficulty.includes(l.difficulty)) return false;
        if (filters.grade.length > 0 && !l.grades?.some(g => filters.grade.includes(g))) return false;
        if (filters.skills.length > 0 && !filters.skills.includes(l.skill)) return false;
        if (filters.types.length > 0 && !filters.types.includes(l.type)) return false;
        if (filters.ranges.length > 0 && !filters.ranges.includes(l.range)) return false;
        if (filters.categories.length > 0 && !filters.categories.includes(l.category)) return false;
        return true;
    });
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

    const filters = loadFilters();
    let showFilters = filters.difficulty.length > 0 || filters.grade.length > 0 || filters.skills.length > 0 || filters.types.length > 0 || filters.ranges.length > 0 || filters.categories.length > 0;

    const filterToggle = createButton("🔍 Szűrők", {
        onClick: () => {
            showFilters = !showFilters;
            rebuildFilterPanel();
            filterPanel.style.display = showFilters ? "flex" : "none";
            filterToggle.textContent = showFilters ? "🔍 Szűrők ▲" : "🔍 Szűrők ▼";
        }
    });
    filterToggle.className = "filter-toggle-btn";

    const filterPanel = document.createElement("div");
    filterPanel.className = "filter-panel";
    filterPanel.style.display = "none";

    function rebuildFilterPanel() {
        filterPanel.replaceChildren();
        const newPanel = createFilterPanel(filters, rebuildAndRender);
        filterPanel.append(...newPanel.childNodes);
    }

    const contentArea = document.createElement("div");
    contentArea.className = "content-area";

    wrapper.append(filterToggle, filterPanel, contentArea);

    if (showFilters) {
        rebuildFilterPanel();
        filterPanel.style.display = "flex";
        filterToggle.textContent = "🔍 Szűrők ▲";
    }

    function rebuildAndRender() {
        saveFilters(filters);
        rebuildFilterPanel();
        renderContent();
    }

    function renderContent() {
        contentArea.replaceChildren();

        const filtered = filterLessons(allLessons, filters);
        const hasFilters = filters.difficulty.length > 0 || filters.grade.length > 0 || filters.skills.length > 0 || filters.types.length > 0 || filters.ranges.length > 0 || filters.categories.length > 0;

        if (hasFilters) {
            const resultInfo = document.createElement("div");
            resultInfo.className = "filter-result-info";
            resultInfo.textContent = `${filtered.length} találat`;
            contentArea.append(resultInfo);

            if (filtered.length > 0) {
                const categorized = {};
                for (const key of Object.keys(CATEGORIES)) {
                    categorized[key] = [];
                }
                filtered.forEach(l => {
                    const cat = l.category || "operations";
                    if (!categorized[cat]) categorized[cat] = [];
                    categorized[cat].push(l);
                });

                const flatCard = createCard();
                for (const [categoryKey, catLessons] of Object.entries(categorized)) {
                    const section = createCategorySection(categoryKey, catLessons, onSelect, activeWorld);
                    if (section) flatCard.append(section);
                }
                contentArea.append(flatCard);
            }
        } else {
            gradeConfig.forEach(gc => {
                const gradeLessons = allLessons.filter(l => l.grades?.includes(gc.grade));
                contentArea.append(createGradeSection(gc, gradeLessons, onSelect, activeWorld));
            });
        }
    }

    renderContent();

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
