import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createNavBar } from "./ui/navbar.js";
import { loadJSON, loadRaw, removeKeys } from "../storage.js";
import { listPlayers, getActiveId } from "../profile/UserManager.js";
import { getLessonStats, getActiveWorld, getActiveGrade, setActiveGrade, getFavoriteLessons, getSkippedLessons, isFavoriteLesson, toggleFavoriteLesson, getCustomDoneLessons, getMenuPrefs, saveMenuPrefs } from "../profile/Profile.js";
import { CATEGORIES, SKILLS } from "../data/skills.js";
import { HINT_LESSON_FILES } from "../data/hintLessons.js";
import { TYPE_EMOJI, TYPE_LABEL } from "../data/types.js";
import { CONSOLIDATION_LESSONS } from "../data/consolidation.js";
import { getWorld } from "../world/WorldRegistry.js";

const CHILD_FRIENDLY_LABELS = {
    sets: "Válogatás",
    "set-match": "Válogatás"
};

const FILTER_STORAGE_KEY = "matekido-lesson-filters";
const FILTER_OPEN_KEY = "matekido-lesson-filters-open";
const LIST_HIDDEN_KEY = "matekido-lesson-list-hidden";
const VIEW_STORAGE_KEY = "matekido-lesson-view";
const CUSTOM_UNLOCKED_KEY = "matekido-custom-unlocked";

function saveListHidden(hidden) {
    const prefs = getMenuPrefs();
    prefs.listHidden = hidden;
    saveMenuPrefs(prefs);
}

function loadListHidden() {
    const prefs = getMenuPrefs();
    if ("listHidden" in prefs && (prefs.listHidden === true || prefs.listHidden === false)) {
        return prefs.listHidden;
    }
    const val = loadRaw(LIST_HIDDEN_KEY);
    if (val === "1") return true;
    if (val === "0") return false;
    return null;
}

function normalizeFilters(parsed) {
    return {
        difficulty: parsed.difficulty || [],
        skills: parsed.skills || [],
        types: (parsed.types || []).map(t => t === "decomposition-find-wrong" ? "decomposition" : t),
        ranges: parsed.ranges || [],
        categories: (parsed.categories || []).map(c => ["time", "money", "measurement"].includes(c) ? "practical" : c),
        grades: parsed.grades || []
    };
}

function saveFilters(filters) {
    const prefs = getMenuPrefs();
    prefs.filters = filters;
    saveMenuPrefs(prefs);
}

function saveFilterOpen(open) {
    const prefs = getMenuPrefs();
    prefs.filterOpen = open;
    saveMenuPrefs(prefs);
}

function loadFilterOpen() {
    const prefs = getMenuPrefs();
    if ("filterOpen" in prefs && (prefs.filterOpen === true || prefs.filterOpen === false)) {
        return prefs.filterOpen;
    }
    const val = loadRaw(FILTER_OPEN_KEY);
    if (val === "1") return true;
    if (val === "0") return false;
    return null;
}

export function resetMenuPrefs() {
    removeKeys(FILTER_STORAGE_KEY, FILTER_OPEN_KEY, VIEW_STORAGE_KEY, LIST_HIDDEN_KEY);
}

function loadSelectedGrade() {
    return getActiveGrade();
}

function saveSelectedGrade(grade) {
    setActiveGrade(grade);
}

function setUpgradesMode(custom) {
    const prefs = getMenuPrefs();
    prefs.view = custom ? "custom" : null;
    saveMenuPrefs(prefs);
}

function loadCustomMode() {
    const prefs = getMenuPrefs();
    if ("view" in prefs) {
        return prefs.view === "custom";
    }
    return loadRaw(VIEW_STORAGE_KEY) === "custom";
}

function loadFilters() {
    const prefs = getMenuPrefs();
    if (prefs.filters) {
        return normalizeFilters(prefs.filters);
    }
    const parsed = loadJSON(FILTER_STORAGE_KEY);
    if (parsed) {
        return normalizeFilters(parsed);
    }
    return { difficulty: [], skills: [], types: [], ranges: [], categories: [], grades: [] };
}

const TYPE_GROUPS = {
    decomposition: ["decomposition", "decomposition-find-wrong", "bridge-ten"]
};

const RANGE_LABEL = {
    10: "10-ig",
    20: "20-ig",
    100: "100-ig",
    1000: "1000-ig",
    10000: "10 000-ig"
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


export function createLessonCard(lesson, onSelect, activeWorld, position, total, selectOpts) {
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

    if (position != null && total != null) {
        const posBadge = document.createElement("span");
        posBadge.className = "lesson-position-badge";
        posBadge.textContent = `${position} / ${total}`;
        badges.append(posBadge);
    }

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

    if (lesson.grades?.length) {
        const gradeBadge = document.createElement("span");
        gradeBadge.className = "lesson-grade-badge";
        const g = lesson.grades;
        gradeBadge.textContent = g.length === 1 ? `${g[0]}. osztály` : `${g[0]}–${g[g.length - 1]}. osztály`;
        badges.append(gradeBadge);
    }

    if (HINT_LESSON_FILES.has(lesson.file)) {
        const hintBadge = document.createElement("span");
        hintBadge.className = "lesson-hint-badge";
        hintBadge.textContent = "💡";
        hintBadge.title = "Ehhez a leckéhez van feladat-segítség";
        badges.append(hintBadge);
    }

    const isFav = isFavoriteLesson(lesson.file);
    const favBtn = document.createElement("button");
    favBtn.className = "lesson-fav-btn" + (isFav ? " active" : "");
    favBtn.textContent = isFav ? "❤️" : "🤍";
    favBtn.title = isFav ? "Kedvencekből törlés" : "Kedvencekhez adás";
    favBtn.setAttribute("aria-label", "Kedvenc váltása");
    favBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        const nowFav = toggleFavoriteLesson(lesson.file);
        favBtn.textContent = nowFav ? "❤️" : "🤍";
        favBtn.classList.toggle("active", nowFav);
        favBtn.title = nowFav ? "Kedvencekből törlés" : "Kedvencekhez adás";
    });
    badges.append(favBtn);

    lessonCard.append(badges, title, subtitle);

    const stats = getLessonStats(lesson.file);
    if (stats) {
        const mastered = stats.percentage >= 90;
        const statBadge = document.createElement("span");
        statBadge.className = "lesson-stat-badge " + (mastered ? "mastered" : "done");
        statBadge.textContent = (mastered ? "⭐ " : "✓ ") + `${stats.percentage}%`;
        lessonCard.classList.add(mastered ? "lesson-mastered" : "lesson-done");
        lessonCard.append(statBadge);
    }

    lessonCard.addEventListener("click", () => {
        onSelect(lesson.file, selectOpts);
    });

    return lessonCard;
}

function pickNextFromList(lessons) {

    const undone = lessons.find(l => !getLessonStats(l.file));
    if (undone) {
        return undone;
    }

    const withTime = lessons
        .map(l => ({ lesson: l, time: getLessonStats(l.file)?.lastDoneAt || 0 }))
        .sort((a, b) => b.time - a.time);
    const lastDone = withTime[0]?.lesson;
    if (lastDone) {
        const lastIdx = lessons.findIndex(l => l.file === lastDone.file);
        return lessons[(lastIdx + 1) % lessons.length];
    }

    return lessons[0];

}

function createPickerSection(title, lessons, onSelect, activeWorld, selectOpts) {
    const card = createCard("picker-card");

    const heading = document.createElement("h3");
    heading.className = "category-title";
    heading.textContent = title;
    card.append(heading);

    const next = pickNextFromList(lessons);
    const pos = lessons.findIndex(l => l.file === next.file);
    const grid = document.createElement("div");
    grid.className = "next-lesson-card";
    grid.append(createLessonCard(next, onSelect, activeWorld, pos + 1, lessons.length, selectOpts));
    card.append(grid);

    if (lessons.length > 1) {
        const note = document.createElement("p");
        note.className = "lesson-card-subtitle";
        note.textContent = "Folytatásként a lista következő feladata jön, a végéig.";
        card.append(note);
    }

    return card;
}

function createPickerRow(sections) {
    const row = document.createElement("div");
    row.className = "picker-row";
    sections.forEach(section => {
        const column = document.createElement("div");
        column.className = "picker-column";
        column.append(section);
        row.append(column);
    });
    return row;
}

function createCategorySection(categoryKey, lessons, onSelect, activeWorld, positionMap, selectOpts) {
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
        const pos = positionMap?.get(lesson.file);
        lessonGrid.append(createLessonCard(lesson, onSelect, activeWorld, pos?.position, pos?.total, selectOpts));
    });

    section.append(lessonGrid);
    return section;
}

function createGradeSection(gradeConfig, lessons, onSelect, activeWorld, positionMap, selectOpts) {
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

    if (!positionMap) {
        positionMap = new Map();
        lessons.forEach((lesson, index) => {
            positionMap.set(lesson.file, { position: index + 1, total: lessons.length });
        });
    }

    for (const [categoryKey, catLessons] of Object.entries(categorized)) {
        const section = createCategorySection(categoryKey, catLessons, onSelect, activeWorld, positionMap, selectOpts);
        if (section) card.append(section);
    }

    return card;
}

function createFilterPanel(filters, onFilterChange, gradeConfig, showGradeRow) {
    const panel = document.createElement("div");
    panel.className = "filter-panel";

    if (showGradeRow) {
        const gradeRow = document.createElement("div");
        gradeRow.className = "filter-row";
        const gradeLabel = document.createElement("span");
        gradeLabel.className = "filter-label";
        gradeLabel.textContent = "Évfolyam:";
        gradeRow.append(gradeLabel);

        const gradeBtns = document.createElement("div");
        gradeBtns.className = "filter-skill-btns";

        (gradeConfig || []).forEach(gc => {
            const btn = document.createElement("button");
            btn.className = "filter-btn" + (filters.grades.includes(gc.grade) ? " active" : "");
            btn.textContent = gc.title;
            btn.addEventListener("click", () => {
                if (filters.grades.includes(gc.grade)) {
                    filters.grades = filters.grades.filter(g => g !== gc.grade);
                } else {
                    filters.grades.push(gc.grade);
                }
                onFilterChange();
            });
            gradeBtns.append(btn);
        });

        gradeRow.append(gradeBtns);
        panel.append(gradeRow);

        const gradeHint = document.createElement("p");
        gradeHint.className = "filter-hint";
        gradeHint.textContent = "Ha egy évfolyam sincs kijelölve, mindegyik évfolyam feladatai látszanak.";
        panel.append(gradeHint);
    }

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

    const skillRow = document.createElement("div");
    skillRow.className = "filter-row";
    const skillLabel = document.createElement("span");
    skillLabel.className = "filter-label";
    skillLabel.textContent = "Készség:";
    skillRow.append(skillLabel);

    const skillBtns = document.createElement("div");
    skillBtns.className = "filter-skill-btns";

    const usedSkills = ["neighbours", "comparison", "missing-number", "addition", "subtraction", "mixed", "true-false", "find-error", "place-value", "number-sequence", "ordering", "even-odd", "pattern", "estimation", "shapes", "shape-compare", "solid-shapes", "hour", "minute", "position", "money", "length", "volume", "calendar", "multiplication", "division", "missing-factor", "rounding", "number-names", "roman", "transform", "sets", "data-charts", "fraction", "divisibility", "perimeter", "area", "angles", "circle", "probability", "operation-order", "one-step", "two-step"];

    usedSkills.forEach(skillId => {
        const skill = SKILLS[skillId];
        if (!skill) return;

        const btn = document.createElement("button");
        btn.className = "filter-btn" + (filters.skills.includes(skillId) ? " active" : "");
        btn.textContent = CHILD_FRIENDLY_LABELS[skillId] ?? skill.title;
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
        btn.textContent = `${TYPE_EMOJI[typeId]} ${CHILD_FRIENDLY_LABELS[typeId] ?? label}`;
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
        filters.skills = [];
        filters.types = [];
        filters.ranges = [];
        filters.categories = [];
        filters.grades = [];
        onFilterChange();
    });
    clearRow.append(clearBtn);
    panel.append(clearRow);

    return panel;
}

function filterLessons(lessons, filters) {
    const hasFilters = filters.difficulty.length > 0 || filters.skills.length > 0 || filters.types.length > 0 || filters.ranges.length > 0 || filters.categories.length > 0;
    if (!hasFilters) return lessons;

    const selectedTypes = new Set();
    filters.types.forEach(t => {
        (TYPE_GROUPS[t] || [t]).forEach(x => selectedTypes.add(x));
    });

    return lessons.filter(l => {
        if (filters.difficulty.length > 0 && !filters.difficulty.includes(l.difficulty)) return false;
        if (filters.skills.length > 0 && !filters.skills.includes(l.skill)) return false;
        if (selectedTypes.size > 0 && !selectedTypes.has(l.type)) return false;
        if (filters.ranges.length > 0 && !filters.ranges.includes(l.range)) return false;
        if (filters.categories.length > 0 && !filters.categories.includes(l.category)) return false;
        return true;
    });
}

function pickNextForGrade(gradeLessons, skippedFiles = new Set(getSkippedLessons())) {

    if (gradeLessons.length === 0) return null;

    const undone = gradeLessons.find(l => !skippedFiles.has(l.file) && !getLessonStats(l.file));
    if (undone) {
        return undone;
    }

    const undoneSkipped = gradeLessons.find(l => skippedFiles.has(l.file) && !getLessonStats(l.file));
    if (undoneSkipped) {
        return undoneSkipped;
    }

    const withTime = gradeLessons
        .map(l => ({ lesson: l, time: getLessonStats(l.file)?.lastDoneAt || 0 }))
        .sort((a, b) => b.time - a.time);
    const lastDone = withTime[0]?.lesson;
    if (!lastDone) {
        return gradeLessons[0];
    }

    const lastIdx = gradeLessons.findIndex(l => l.file === lastDone.file);
    return gradeLessons[(lastIdx + 1) % gradeLessons.length];

}

export function renderLessonMenu(index, root, onSelect, onProfile, onSwitch, onParent, onHelp, onStats) {
    root.replaceChildren();

    const wrapper = createCard();

    const worldId = getActiveWorld();
    const worldSub = document.createElement("p");
    worldSub.style.cssText = "margin:.1rem 0 0; font-size:1.1rem; color:var(--text-secondary, #666);";
    const wData = getWorld(worldId);
    worldSub.textContent = wData.tagline || `${wData.icon} ${wData.name} világ`;

    const allPlayers = listPlayers();
    const activeId = getActiveId();
    const currentPlayer = allPlayers.find(p => p.id === activeId);

    const navbar = createNavBar({
        current: "lessons",
        player: currentPlayer,
        onLessons: () => window.scrollTo({ top: 0, behavior: "smooth" }),
        onProfile,
        onStats,
        onHelp,
        onSwitch,
        onParent
    });

    wrapper.append(navbar, worldSub);

    const activeWorld = getActiveWorld();
    const allLessons = index.lessons || [];
    const gradeConfig = index.gradeConfig || [];
    let selectedGrade = loadSelectedGrade();
    if (!gradeConfig.some(gc => gc.grade === selectedGrade)) {
        selectedGrade = gradeConfig.length > 0 ? gradeConfig[0].grade : null;
    }
    let customMode = loadCustomMode();

    function chooseGrade(grade) {
        selectedGrade = grade;
        customMode = false;
        setUpgradesMode(false);
        saveSelectedGrade(grade);
        gradePickerPanel.style.display = "none";
        renderContent();
    }

    let ctrlLastGrade = null;

    if (customMode) {
        ctrlLastGrade = selectedGrade;
        selectedGrade = null;
    }

    function toggleGradePicker() {
        if (customMode) {
            customMode = false;
            setUpgradesMode(false);
            selectedGrade = ctrlLastGrade;
            if (!gradeConfig.some(gc => gc.grade === selectedGrade)) {
                selectedGrade = gradeConfig.length > 0 ? gradeConfig[0].grade : null;
            }
            gradePickerPanel.style.display = "none";
            renderContent();
            return;
        }
        gradePickerPanel.style.display = gradePickerPanel.style.display !== "none" ? "none" : "flex";
    }

    function enterCustomMode() {
        ctrlLastGrade = selectedGrade;
        selectedGrade = null;
        customMode = true;
        setUpgradesMode(true);
        showFilters = true;
        saveFilterOpen(true);
        gradePickerPanel.style.display = "none";
        renderContent();
    }

    const filters = loadFilters();
    const hasActiveFilters = filters.difficulty.length > 0 || filters.skills.length > 0 || filters.types.length > 0 || filters.ranges.length > 0 || filters.categories.length > 0;
    const savedOpen = loadFilterOpen();
    let showFilters = savedOpen !== null ? savedOpen : hasActiveFilters;

    const filterToggle = createButton("🔍 Szűrők", {
        onClick: () => {
            showFilters = !showFilters;
            saveFilterOpen(showFilters);
            rebuildFilterPanel();
            filterPanel.style.display = showFilters ? "flex" : "none";
            filterToggle.textContent = showFilters ? "🔍 Szűrők ▲" : "🔍 Szűrők ▼";
        }
    });
    filterToggle.className = "filter-toggle-btn";

    const gradeTab = createButton("🎓 Évfolyam", {
        onClick: () => toggleGradePicker()
    });
    gradeTab.className = "mode-tab";

    const customTab = createButton("⚽ Válogatott", {
        onClick: () => enterCustomMode()
    });
    customTab.className = "mode-tab";

    const menuToolbar = document.createElement("div");
    menuToolbar.className = "menu-toolbar";
    menuToolbar.append(gradeTab, customTab);

    const filterPanel = document.createElement("div");
    filterPanel.className = "filter-panel";
    filterPanel.style.display = "none";

    function rebuildFilterPanel() {
        filterPanel.replaceChildren();
        const newPanel = createFilterPanel(filters, rebuildAndRender, gradeConfig, customMode);
        filterPanel.append(...newPanel.childNodes);
    }

    const contentArea = document.createElement("div");
    contentArea.className = "content-area";

    const gradePickerPanel = document.createElement("div");
    gradePickerPanel.className = "grade-picker-panel";
    gradePickerPanel.style.display = "none";

    function rebuildGradePickerPanel() {
        gradePickerPanel.replaceChildren();

        const pickTitle = document.createElement("h3");
        pickTitle.className = "grade-picker-title";
        pickTitle.textContent = "Melyik osztályban játszol?";
        gradePickerPanel.append(pickTitle);

        const grid = document.createElement("div");
        grid.className = "lesson-grid";

        gradeConfig.forEach(gc => {
            const gradeLessons = allLessons.filter(l => l.grades?.includes(gc.grade));
            const done = gradeLessons.length > 0 && gradeLessons.every(l => getLessonStats(l.file));
            const btn = createButton(done ? `✅ ${gc.title} – kész!` : gc.title, {
                onClick: () => chooseGrade(gc.grade)
            });
            btn.className = "profile-page-button" + (done ? " grade-done" : "");
            grid.append(btn);
        });

        gradePickerPanel.append(grid);
    }

    wrapper.append(menuToolbar, gradePickerPanel, contentArea);

    const footer = document.createElement("p");
    footer.className = "skill-map-footer";
    const footerLink = document.createElement("a");
    footerLink.href = "https://iconet.hu";
    footerLink.target = "_blank";
    footerLink.rel = "noopener";
    footerLink.textContent = "💻 Iconet Informatika 2026";
    footer.append(footerLink);
    wrapper.append(footer);

    function rebuildAndRender() {
        saveFilters(filters);
        rebuildFilterPanel();
        renderContent();
    }

    function renderGradeContent() {
        const gradeConfigEntry = gradeConfig.find(gc => gc.grade === selectedGrade);
        const gradeLessons = allLessons.filter(l => l.grades?.includes(selectedGrade));

        const gradeTitle = document.createElement("h2");
        gradeTitle.className = "lesson-group";
        gradeTitle.textContent = gradeConfigEntry ? gradeConfigEntry.title : `${selectedGrade}. osztály`;
        contentArea.append(gradeTitle);

        const next = pickNextForGrade(gradeLessons);
        const gradeFinished = gradeLessons.length > 0 && gradeLessons.every(l => getLessonStats(l.file));

        if (gradeFinished) {
            const doneCard = createCard();

            const doneHeading = document.createElement("h3");
            doneHeading.className = "category-title";
            doneHeading.textContent = "🎉 Mindent teljesítettél!";
            doneCard.append(doneHeading);

            const doneNote = document.createElement("p");
            doneNote.className = "lesson-card-subtitle";
            doneNote.textContent = "🎉 Ügyes vagy, minden feladatot teljesítettél! Ha szeretnél, az osztályválasztóval továbbléphetsz a következőre.";
            doneCard.append(doneNote);

            contentArea.append(doneCard);
        }

        if (next) {
            const nextCard = createCard();

            const nextIdx = gradeLessons.findIndex(l => l.file === next.file);
            const nextHeading = document.createElement("h3");
            nextHeading.className = "category-title";
            const remaining = gradeLessons.filter(l => !getLessonStats(l.file)).length;
            nextHeading.textContent = remaining > 0
                ? `➡️ Következő feladat (még ${remaining} van hátra)`
                : "➡️ Következő feladat";
            nextCard.append(nextHeading);

            const grid = document.createElement("div");
            grid.className = "next-lesson-card";
            grid.append(createLessonCard(next, onSelect, activeWorld, nextIdx + 1, gradeLessons.length));
            nextCard.append(grid);

            const nextNote = document.createElement("p");
            nextNote.className = "lesson-card-subtitle";
            nextNote.textContent = gradeFinished
                ? "Az összes feladaton túl vagy – kezdheted elölről az elsővel."
                : "Ez az, ami legközelebb rád vár.";
            nextCard.append(nextNote);

            contentArea.append(nextCard);
        }

        const browseWrap = document.createElement("div");
        const savedHidden = loadListHidden();
        const browseHidden = savedHidden !== null ? savedHidden : !gradeFinished;
        browseWrap.hidden = browseHidden;

        const listButton = createButton(
            browseHidden
                ? `📚 Feladatok listája (${gradeLessons.length})`
                : "🔽 Elrejtés",
            {
                onClick: () => {
                    const showing = !browseWrap.hidden;
                    browseWrap.hidden = showing;
                    saveListHidden(showing);
                    listButton.textContent = showing
                        ? `📚 Feladatok listája (${gradeLessons.length})`
                        : "🔽 Elrejtés";
                }
            }
        );
        listButton.className = "filter-toggle-btn";

        const listButtonRow = document.createElement("div");
        listButtonRow.style.cssText = "display:flex; gap:.5rem; justify-content:center; margin-top:1rem;";
        listButtonRow.append(listButton);
        contentArea.append(listButtonRow);

        browseWrap.append(renderBrowseLessons(gradeLessons));
        contentArea.append(browseWrap);

        const byId = new Map(allLessons.map(l => [l.id, l]));
        const consolidationIds = CONSOLIDATION_LESSONS[selectedGrade] || [];
        const consolidationLessons = consolidationIds.map(id => byId.get(id)).filter(l => l && l.grades?.includes(selectedGrade));

        const byFile = new Map(allLessons.map(l => [l.file, l]));
        const favoriteLessons = getFavoriteLessons().map(f => byFile.get(f)).filter(l => l && l.grades?.includes(selectedGrade));

        const pickerSections = [];

        const weakLessons = allLessons.filter(l => {
            if (!l.grades?.includes(selectedGrade)) return false;
            const stats = getLessonStats(l.file);
            return stats !== null && stats.percentage < 90;
        });

        if (weakLessons.length > 0) {
            pickerSections.push(createPickerSection(
                `🎯 Gyakorlásra javasolt (${weakLessons.length}) – 90% alatt vannak`,
                weakLessons,
                onSelect,
                activeWorld,
                { from: "practice" }
            ));
        }

        const skippedLessonFiles = new Set(getSkippedLessons());
        const skippedLessons = allLessons.filter(l =>
            l.grades?.includes(selectedGrade) && skippedLessonFiles.has(l.file) && !getLessonStats(l.file)
        );

        if (skippedLessons.length > 0) {
            pickerSections.push(createPickerSection(
                `⏭️ Átugrott feladatok (${skippedLessons.length}) – érdemes pótolni, a végén úgyis visszajönnek`,
                skippedLessons,
                onSelect,
                activeWorld
            ));
        }

        if (consolidationLessons.length > 0) {
            pickerSections.push(createPickerSection(
                `🔁 Erősítő feladatok (${consolidationLessons.length}) – ezeket érdemes ismételni`,
                consolidationLessons,
                onSelect,
                activeWorld,
                { from: "consolidation" }
            ));
        }

        if (favoriteLessons.length > 0) {
            pickerSections.push(createPickerSection(
                `❤️ Kedvenceim (${favoriteLessons.length})`,
                favoriteLessons,
                onSelect,
                activeWorld,
                { from: "favorites" }
            ));
        }

        if (pickerSections.length > 0) {
            contentArea.append(createPickerRow(pickerSections));
        }
    }

    function createPositionMap(lessons) {
        const positionMap = new Map();
        lessons.forEach((lesson, index) => {
            positionMap.set(lesson.file, { position: index + 1, total: lessons.length });
        });
        return positionMap;
    }

    function createFilterResult(filteredLessons, positionMap, selectOpts) {
        const container = document.createElement("div");
        const resultInfo = document.createElement("div");
        resultInfo.className = "filter-result-info";
        resultInfo.textContent = `${filteredLessons.length} találat`;
        container.append(resultInfo);

        if (filteredLessons.length > 0) {
            const categorized = {};
            for (const key of Object.keys(CATEGORIES)) {
                categorized[key] = [];
            }
            filteredLessons.forEach(l => {
                const cat = l.category || "operations";
                if (!categorized[cat]) categorized[cat] = [];
                categorized[cat].push(l);
            });

            const flatCard = createCard();
            for (const [categoryKey, catLessons] of Object.entries(categorized)) {
                const section = createCategorySection(categoryKey, catLessons, onSelect, activeWorld, positionMap, selectOpts);
                if (section) flatCard.append(section);
            }
            container.append(flatCard);
        }

        return container;
    }

    function hasNonGradeFilters(f) {
        return f.difficulty.length > 0 || f.skills.length > 0 || f.types.length > 0 || f.ranges.length > 0 || f.categories.length > 0;
    }

    function renderCustomContent() {
        rebuildFilterPanel();

        const filterWrap = document.createElement("div");
        filterWrap.style.cssText = "display:flex; flex-direction:column; gap:.5rem; margin-bottom:1rem;";
        filterToggle.textContent = showFilters ? "🔍 Szűrők ▲" : "🔍 Szűrők ▼";
        filterPanel.style.display = showFilters ? "flex" : "none";
        filterWrap.append(filterToggle, filterPanel);
        contentArea.append(filterWrap);

        const customGrades = filters.grades.length > 0
            ? filters.grades.slice().sort((a, b) => a - b)
            : gradeConfig.map(gc => gc.grade);

        let pool = allLessons.filter(l => l.grades?.some(g => customGrades.includes(g)));
        pool = filterLessons(pool, filters);

        const title = document.createElement("h2");
        title.className = "lesson-group";
        title.textContent = filters.grades.length > 0
            ? `⚽ Válogatott (${customGrades.map(g => `${g}.`).join(" ")} évfolyam)`
            : "⚽ Válogatott (minden évfolyam)";
        contentArea.append(title);

        const poolOpts = { from: "custom", list: pool.map(l => l.file) };

        const doneSet = new Set(getCustomDoneLessons());
        const undone = pool.filter(l => !doneSet.has(l.file));
        const next = undone.length > 0 ? undone[0] : pool[0];
        if (next) {
            const nextCard = createCard();

            const nextIdx = pool.findIndex(l => l.file === next.file);
            const nextHeading = document.createElement("h3");
            nextHeading.className = "category-title";
            const remaining = undone.length;
            nextHeading.textContent = remaining > 0
                ? `➡️ Következő feladat (még ${remaining} van hátra)`
                : "➡️ Következő feladat";
            nextCard.append(nextHeading);

            const grid = document.createElement("div");
            grid.className = "next-lesson-card";
            grid.append(createLessonCard(next, onSelect, activeWorld, nextIdx + 1, pool.length, poolOpts));
            nextCard.append(grid);

            const nextNote = document.createElement("p");
            nextNote.className = "lesson-card-subtitle";
            nextNote.textContent = remaining > 0
                ? "Ez az, ami legközelebb rád vár."
                : "Az összes feladaton túl vagy – a ➡️ Tovább gombbal innen folytathatod a listát.";
            nextCard.append(nextNote);

            contentArea.append(nextCard);
        }

        const browseWrap = document.createElement("div");
        const savedHidden = loadListHidden();
        const browseHidden = savedHidden !== null ? savedHidden : false;
        browseWrap.hidden = browseHidden;

        const listButton = createButton(
            browseHidden
                ? `📚 Feladatok listája (${pool.length})`
                : "🔽 Elrejtés",
            {
                onClick: () => {
                    const showing = !browseWrap.hidden;
                    browseWrap.hidden = showing;
                    saveListHidden(showing);
                    listButton.textContent = showing
                        ? `📚 Feladatok listája (${pool.length})`
                        : "🔽 Elrejtés";
                }
            }
        );
        listButton.className = "filter-toggle-btn";

        const listButtonRow = document.createElement("div");
        listButtonRow.style.cssText = "display:flex; gap:.5rem; justify-content:center; margin-top:1rem;";
        listButtonRow.append(listButton);
        contentArea.append(listButtonRow);

        if (hasNonGradeFilters(filters)) {
            browseWrap.append(createFilterResult(pool, createPositionMap(pool), poolOpts));
        } else {
            const positionMap = createPositionMap(pool);
            const flatCard = createCard();
            const grid = document.createElement("div");
            grid.className = "lesson-grid";
            pool.forEach(lesson => {
                const pos = positionMap.get(lesson.file);
                grid.append(createLessonCard(lesson, onSelect, activeWorld, pos.position, pos.total, poolOpts));
            });
            flatCard.append(grid);
            browseWrap.append(flatCard);
        }

        contentArea.append(browseWrap);

        const weakLessons = pool.filter(l => {
            const stats = getLessonStats(l.file);
            return stats !== null && stats.percentage < 90;
        });

        const favoriteLessons = pool.filter(l => isFavoriteLesson(l.file));

        const pickerSections = [];

        if (weakLessons.length > 0) {
            pickerSections.push(createPickerSection(
                `🎯 Gyakorlásra javasolt (${weakLessons.length}) – 90% alatt vannak`,
                weakLessons,
                onSelect,
                activeWorld,
                { from: "custom", list: weakLessons.map(l => l.file) }
            ));
        }

        if (favoriteLessons.length > 0) {
            pickerSections.push(createPickerSection(
                `❤️ Kedvenceim (${favoriteLessons.length})`,
                favoriteLessons,
                onSelect,
                activeWorld,
                { from: "custom", list: favoriteLessons.map(l => l.file) }
            ));
        }

        if (pickerSections.length > 0) {
            contentArea.append(createPickerRow(pickerSections));
        }
    }

    function renderBrowseLessons(gradeLessons) {
        const container = document.createElement("div");

        const gc = gradeConfig.find(g => g.grade === selectedGrade) || { grade: selectedGrade, title: `${selectedGrade}. osztály` };
        container.append(createGradeSection(gc, gradeLessons, onSelect, activeWorld));

        return container;
    }

    function renderContent() {
        contentArea.replaceChildren();

        const gc = gradeConfig.find(g => g.grade === selectedGrade);
        gradeTab.textContent = gc ? `🎓 ${gc.title}` : "🎓 Évfolyam";
        gradeTab.classList.toggle("active", !customMode);
        customTab.classList.toggle("active", customMode);

        if (customMode) {
            renderCustomContent();
        } else {
            renderGradeContent();
        }
    }

    rebuildGradePickerPanel();
    renderContent();

    root.append(wrapper);
}
