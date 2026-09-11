import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { loadJSON, saveJSON, loadRaw, saveRaw } from "../storage.js";
import { listPlayers, getActiveId } from "../profile/UserManager.js";
import { getLessonStats, getActiveWorld, getActiveGrade, setActiveGrade, getFavoriteLessons, getSkippedLessons, isFavoriteLesson, toggleFavoriteLesson } from "../profile/Profile.js";
import { CATEGORIES, SKILLS } from "../data/skills.js";
import { CONSOLIDATION_LESSONS } from "../data/consolidation.js";
import { getWorld } from "../world/WorldRegistry.js";

const FILTER_STORAGE_KEY = "matekido-lesson-filters";
const FILTER_OPEN_KEY = "matekido-lesson-filters-open";
const LIST_HIDDEN_KEY = "matekido-lesson-list-hidden";

function saveListHidden(hidden) {
    saveRaw(LIST_HIDDEN_KEY, hidden ? "1" : "0");
}

function loadListHidden() {
    const val = loadRaw(LIST_HIDDEN_KEY);
    if (val === "1") return true;
    if (val === "0") return false;
    return null;
}

function saveFilters(filters) {
    saveJSON(FILTER_STORAGE_KEY, filters);
}

function saveFilterOpen(open) {
    saveRaw(FILTER_OPEN_KEY, open ? "1" : "0");
}

function loadFilterOpen() {
    const val = loadRaw(FILTER_OPEN_KEY);
    if (val === "1") return true;
    if (val === "0") return false;
    return null;
}

function loadSelectedGrade() {
    return getActiveGrade();
}

function saveSelectedGrade(grade) {
    setActiveGrade(grade);
}

function loadFilters() {
    const parsed = loadJSON(FILTER_STORAGE_KEY);
    if (parsed) {
        return {
            difficulty: parsed.difficulty || [],
            skills: parsed.skills || [],
            types: (parsed.types || []).map(t => t === "decomposition-find-wrong" ? "decomposition" : t),
            ranges: parsed.ranges || [],
            categories: (parsed.categories || []).map(c => ["time", "money", "measurement"].includes(c) ? "practical" : c)
        };
    }
    return { difficulty: [], skills: [], types: [], ranges: [], categories: [] };
}

const TYPE_EMOJI = {
    addition: "➕",
    subtraction: "➖",
    mixed: "🔀",
    "missing-number": "❓",
    comparison: "⚖️",
    neighbor: "🔍",
    decomposition: "🧩",
    "decomposition-find-wrong": "🔍",
    "place-value": "🔢",
    "place-value-two-input": "🔢",
    sequence: "🔢",
    order: "↕️",
    "even-odd": "🎯",
    pattern: "🔁",
    "shape-sort": "🟦",
    "shape-compare": "📐",
    "solid-shape": "🧊",
    time: "🕐",
    spatial: "🧭",
    "money-pay": "💰",
    "money-compare": "⚖️",
    "money-enough": "🛒",
    "measure-compare": "📏",
    "measure-squares": "🧮",
    "word-problem": "📝",
    estimate: "🧮",
    "true-false": "✅",
    "find-error": "🕵️",
    table: "✖️",
    "division-table": "➗",
    sharing: "🍕",
    "equal-groups": "🍅",
    "repeated-addition": "➕",
    "skip-counting": "🔢",
    link: "🔗",
    "missing-operand": "❓",
    "missing-factor": "❓",
    "place-value-hundreds": "🔢",
    "number-name": "🔤",
    rounding: "🎯",
    roman: "🏛️",
    fraction: "🍕",
    "measure-units": "📏"
};

const TYPE_GROUPS = {
    decomposition: ["decomposition", "decomposition-find-wrong", "bridge-ten"]
};

const TYPE_LABEL = {
    addition: "Összeadás",
    subtraction: "Kivonás",
    mixed: "Vegyes",
    "missing-number": "Hiányzó szám",
    comparison: "Összehasonlítás",
    neighbor: "Szomszédok",
    decomposition: "Bontás",
    "place-value": "Helyiérték",
    "place-value-two-input": "Helyiérték (2)",
    sequence: "Számsor",
    order: "Sorba rendezés",
    "even-odd": "Páros-páratlan",
    pattern: "Sorminta",
    "shape-sort": "Alakzatok",
    "shape-compare": "Alakzatok összehasonlítása",
    "solid-shape": "Térbeli alakzatok",
    time: "Idő",
    spatial: "Térbeli tájékozódás",
    "money-pay": "Pontos kifizetés",
    "money-compare": "Pénz összehasonlítás",
    "money-enough": "Elég-e a pénz?",
    "measure-compare": "Hosszúság összehasonlítás",
    "measure-squares": "Mérés négyzetekkel",
    "word-problem": "Szöveges feladat",
    estimate: "Becslés",
    "true-false": "Igaz/Hamis",
    "find-error": "Hibás számolás",
    table: "Szorzótábla",
    "division-table": "Osztás",
    sharing: "Elosztás",
    "equal-groups": "Egyenlő csoportok",
    "repeated-addition": "Ismételt összeadás",
    "skip-counting": "Lépegető számolás",
    link: "Szorzás–osztás kapcsolat",
    "missing-operand": "Hiányzó tag",
    "missing-factor": "Hiányzó tényező",
    "place-value-hundreds": "Helyiérték (1000)",
    "number-name": "Számnevek",
    rounding: "Kerekítés",
    roman: "Római számok",
    volume: "Űrtartalom",
    transform: "Forgatás",
    mirror: "Tükrözés",
    "set-match": "Halmazok és válogatás",
    "data-chart": "Adatok és diagramok",
    calendar: "Naptár",
    fraction: "Törtek",
    "measure-units": "Hosszúság-mérés"
};

const RANGE_LABEL = {
    10: "10-ig",
    20: "20-ig",
    100: "100-ig",
    1000: "1000-ig"
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

function createPickerSection(title, lessons, onSelect, activeWorld, selectOpts) {
    const card = createCard("picker-card");

    const heading = document.createElement("h3");
    heading.className = "category-title";
    heading.textContent = title;
    card.append(heading);

    const grid = document.createElement("div");
    grid.className = "next-lesson-card";
    grid.append(createLessonCard(lessons[0], onSelect, activeWorld, undefined, undefined, selectOpts));
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

function createCategorySection(categoryKey, lessons, onSelect, activeWorld, positionMap) {
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
        lessonGrid.append(createLessonCard(lesson, onSelect, activeWorld, pos?.position, pos?.total));
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

    const positionMap = new Map();
    lessons.forEach((lesson, index) => {
        positionMap.set(lesson.file, { position: index + 1, total: lessons.length });
    });

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
        const section = createCategorySection(categoryKey, catLessons, onSelect, activeWorld, positionMap);
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

    const skillRow = document.createElement("div");
    skillRow.className = "filter-row";
    const skillLabel = document.createElement("span");
    skillLabel.className = "filter-label";
    skillLabel.textContent = "Készség:";
    skillRow.append(skillLabel);

    const skillBtns = document.createElement("div");
    skillBtns.className = "filter-skill-btns";

    const usedSkills = ["neighbours", "comparison", "missing-number", "addition", "subtraction", "mixed", "true-false", "find-error", "place-value", "number-sequence", "ordering", "even-odd", "pattern", "estimation", "shapes", "shape-compare", "solid-shapes", "hour", "position", "coins", "length", "volume", "calendar", "multiplication", "division", "missing-factor", "rounding", "number-names", "roman", "transform", "sets", "data-charts", "fraction"];

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

function pickNextForGrade(gradeLessons) {

    if (gradeLessons.length === 0) return null;

    const skippedFiles = new Set(getSkippedLessons());
    const skipped = gradeLessons.find(l => skippedFiles.has(l.file));
    if (skipped) {
        return skipped;
    }

    return gradeLessons.find(l => !getLessonStats(l.file)) ?? null;

}

export function renderLessonMenu(index, root, onSelect, onProfile, onSwitch, onSkillMap, onHelp) {
    root.replaceChildren();

    const wrapper = createCard();

    const title = document.createElement("h1");
    const worldId = getActiveWorld();
    const logo = document.createElement("img");
    logo.src = "assets/icons/icon.svg";
    logo.alt = "Matekidő";
    logo.style.height = "2em";
    logo.style.width = "auto";
    logo.style.verticalAlign = "middle";
    title.append(logo, " Matekidő");

    const worldSub = document.createElement("p");
    worldSub.style.cssText = "margin:.1rem 0 0; font-size:1.1rem; color:var(--text-secondary, #666);";
    const wData = getWorld(worldId);
    worldSub.textContent = wData.tagline || `${wData.icon} ${wData.name} világ`;

    wrapper.append(title, worldSub);

    const activeWorld = getActiveWorld();
    const allLessons = index.lessons || [];
    const gradeConfig = index.gradeConfig || [];
    let selectedGrade = loadSelectedGrade();
    if (!gradeConfig.some(gc => gc.grade === selectedGrade)) {
        selectedGrade = null;
    }

    function chooseGrade(grade) {
        selectedGrade = grade;
        saveSelectedGrade(grade);
        showFilters = false;
        saveFilterOpen(false);
        filterToggle.textContent = "🔍 Szűrők ▼";
        filterPanel.style.display = "none";
        gradeBackButton.style.display = grade == null ? "none" : "inline-block";
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

    const infoButton = createButton("📚 Készségek", {
        onClick: () => onSkillMap()
    });
    infoButton.className = "filter-toggle-btn";

    const helpButton = createButton("❓ Súgó", {
        onClick: () => onHelp()
    });
    helpButton.className = "filter-toggle-btn";

    const gradeBackButton = createButton("🔙 Osztály", {
        onClick: () => chooseGrade(null)
    });
    gradeBackButton.className = "filter-toggle-btn";
    gradeBackButton.style.display = selectedGrade == null ? "none" : "inline-block";

    const menuToolbar = document.createElement("div");
    menuToolbar.className = "menu-toolbar";
    menuToolbar.append(filterToggle, infoButton, helpButton, gradeBackButton);

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

    wrapper.append(menuToolbar, filterPanel, contentArea);

    const footer = document.createElement("p");
    footer.className = "skill-map-footer";
    const footerLink = document.createElement("a");
    footerLink.href = "https://iconet.hu";
    footerLink.target = "_blank";
    footerLink.rel = "noopener";
    footerLink.textContent = "💻 Iconet Informatika 2026";
    footer.append(footerLink);
    wrapper.append(footer);

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

    function renderGradePicker() {
        const pick = createCard();

        const pickTitle = document.createElement("h2");
        pickTitle.className = "lesson-group";
        pickTitle.textContent = "Melyik osztályban játszol?";
        pick.append(pickTitle);

        const grid = document.createElement("div");
        grid.className = "lesson-grid";

        gradeConfig.forEach(gc => {
            const gradeLessons = allLessons.filter(l => l.grades?.includes(gc.grade));
            const done = gradeLessons.length > 0 && pickNextForGrade(gradeLessons) === null;
            const btn = createButton(done ? `🎉 ${gc.title} – minden feladat kész!` : gc.title, {
                onClick: () => chooseGrade(gc.grade)
            });
            btn.className = "profile-page-button";
            grid.append(btn);
        });

        pick.append(grid);
        contentArea.append(pick);
    }

    function renderGradeContent() {
        const gradeConfigEntry = gradeConfig.find(gc => gc.grade === selectedGrade);
        const gradeLessons = allLessons.filter(l => l.grades?.includes(selectedGrade));

        const gradeTitle = document.createElement("h2");
        gradeTitle.className = "lesson-group";
        gradeTitle.textContent = gradeConfigEntry ? gradeConfigEntry.title : `${selectedGrade}. osztály`;
        contentArea.append(gradeTitle);

        const next = pickNextForGrade(gradeLessons);
        const gradeFinished = gradeLessons.length > 0 && !next;
        if (next) {
            const nextCard = createCard();

            const nextHeading = document.createElement("h3");
            nextHeading.className = "category-title";
            nextHeading.textContent = "➡️ Következő feladat";
            nextCard.append(nextHeading);

            const nextIdx = gradeLessons.findIndex(l => l.file === next.file);
            const grid = document.createElement("div");
            grid.className = "next-lesson-card";
            grid.append(createLessonCard(next, onSelect, activeWorld, nextIdx + 1, gradeLessons.length));
            nextCard.append(grid);

            const nextNote = document.createElement("p");
            nextNote.className = "lesson-card-subtitle";
            nextNote.textContent = "Ez az, ami legközelebb rád vár.";
            nextCard.append(nextNote);

            contentArea.append(nextCard);
        } else {
            const doneCard = createCard();

            const doneHeading = document.createElement("h3");
            doneHeading.className = "category-title";
            doneHeading.textContent = "🎉 Mindent teljesítettél!";
            doneCard.append(doneHeading);

            const doneNote = document.createElement("p");
            doneNote.className = "lesson-card-subtitle";
            doneNote.textContent = gradeFinished
                ? "🎉 Ügyes vagy, minden feladatot teljesítettél! Ha szeretnél, az osztályválasztóval továbbléphetsz a következőre."
                : "Elkészültél az adott osztály feladataival.";
            doneCard.append(doneNote);

            contentArea.append(doneCard);
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
        listButton.className = "profile-page-button";

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

        const skippedLessonFiles = new Set(getSkippedLessons());
        const skippedLessons = allLessons.filter(l =>
            l.grades?.includes(selectedGrade) && skippedLessonFiles.has(l.file)
        );

        if (skippedLessons.length > 0) {
            pickerSections.push(createPickerSection(
                `⏭️ Átugrott feladatok (${skippedLessons.length}) – amíg itt van feladat, nem léphetsz tovább`,
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

    function renderBrowseLessons(gradeLessons) {
        const container = document.createElement("div");

        const filtered = filterLessons(gradeLessons, filters);
    const hasFilters = filters.difficulty.length > 0 || filters.skills.length > 0 || filters.types.length > 0 || filters.ranges.length > 0 || filters.categories.length > 0;

        if (hasFilters) {
            const resultInfo = document.createElement("div");
            resultInfo.className = "filter-result-info";
            resultInfo.textContent = `${filtered.length} találat`;
            container.append(resultInfo);

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
                const positionMap = new Map();
                gradeLessons.forEach((lesson, index) => {
                    positionMap.set(lesson.file, { position: index + 1, total: gradeLessons.length });
                });
                for (const [categoryKey, catLessons] of Object.entries(categorized)) {
                    const section = createCategorySection(categoryKey, catLessons, onSelect, activeWorld, positionMap);
                    if (section) flatCard.append(section);
                }
                container.append(flatCard);
            }
        } else {
            const gc = gradeConfig.find(g => g.grade === selectedGrade) || { grade: selectedGrade, title: `${selectedGrade}. osztály` };
            container.append(createGradeSection(gc, gradeLessons, onSelect, activeWorld));
        }

        return container;
    }

    function renderContent() {
        contentArea.replaceChildren();

        if (selectedGrade == null) {
            filterToggle.style.display = "none";
            filterPanel.style.display = "none";
            renderGradePicker();
        } else {
            filterToggle.style.display = "inline-block";
            renderGradeContent();
        }
    }

    renderContent();

    const buttonRow = document.createElement("div");
    buttonRow.className = "menu-player-row";

    const allPlayers = listPlayers();
    const activeId = getActiveId();
    const currentPlayer = allPlayers.find(p => p.id === activeId);

    const profileButton = createButton("👤 Profil", {
        onClick: () => onProfile?.()
    });
    profileButton.className = "profile-page-button";

    buttonRow.append(profileButton);

    if (currentPlayer) {
        const avatar = document.createElement("span");
        avatar.className = "menu-player-name";
        avatar.textContent = `${currentPlayer.avatar} ${currentPlayer.name}`;
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
