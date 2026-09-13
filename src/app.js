import { Game } from "./engine/Game.js?v=59";
import { loadLesson } from "./engine/LessonLoader.js";
import { buildLesson } from "./builders/LessonBuilder.js?v=16";
import { renderLessonMenu } from "./components/lessonMenu.js?v=38";
import { renderSkillMap } from "./components/skillMap.js?v=11";
import { renderHelp } from "./components/help.js?v=3";
import { renderProfilePage } from "./components/profilePage.js?v=7";
import { renderStatsPage } from "./components/statsPage.js?v=8";
import { getNextPracticeLesson } from "./components/practicePage.js?v=8";
import { renderWelcomeScreen } from "./components/welcomeScreen.js?v=2";
import { renderParentDashboard } from "./components/parentDashboard.js?v=5";
import { getActiveId, listPlayers } from "./profile/UserManager.js";
import { getActiveGrade, getFavoriteLessons, getLessonStats, recordLessonSkip, getSkippedLessons, getActiveWorld } from "./profile/Profile.js";
import { CONSOLIDATION_LESSONS } from "./data/consolidation.js";
import { createCard } from "./components/ui/card.js";
import { createButton } from "./components/ui/button.js";

const root = document.getElementById("app");

const lessonIndex = await loadLesson("./data/lessons/index.json");

if (getActiveId() && listPlayers().length > 0) {
    showMenu();
} else {
    showWelcome();
}

function setWorldBackground() {
    const worldId = getActiveWorld();
    if (worldId) {
        document.body.dataset.world = worldId;
    }
}

function setTipVisible(visible) {
    document.body.classList.toggle("hide-tip", !visible);
}

function clearWorldBackground() {
    delete document.body.dataset.world;
}

function showWelcome() {
    clearWorldBackground();
    setTipVisible(true);
    renderWelcomeScreen(root, () => {
        showMenu();
    }, showParentDashboard);
}

function showParentDashboard() {
    clearWorldBackground();
    setTipVisible(true);
    renderParentDashboard(root, () => {
        showWelcome();
    }, lessonIndex);
}

function showMenu() {

    setWorldBackground();
    setTipVisible(true);

    renderLessonMenu(
        lessonIndex,
        root,
        startLesson,
        showProfile,
        showWelcome,
        showSkillMap,
        () => showHelp(),
        showStats
    );

}

function navFor() {
    return {
        onLessons: showMenu,
        onProfile: showProfile,
        onStats: showStats,
        onHelp: () => showHelp(),
        onSwitch: showWelcome
    };
}

function showSkillMap() {
    clearWorldBackground();
    setTipVisible(true);
    renderSkillMap(root, navFor());
}

function showHelp() {
    clearWorldBackground();
    setTipVisible(true);
    renderHelp(root, navFor());
}

function showProfile() {
    setWorldBackground();
    setTipVisible(true);
    renderProfilePage(lessonIndex, root, showMenu, showStats, () => showHelp(), showWelcome);
}

function showStats() {
    clearWorldBackground();
    setTipVisible(true);
    renderStatsPage(root, navFor(), lessonIndex);
}

async function startLesson(path, opts = {}) {
    clearWorldBackground();
    setTipVisible(false);

    const rawLesson = await loadLesson(path);

    const lesson = buildLesson(rawLesson);

    let skill = null;
    const allLessons = lessonIndex.lessons || [];
    const found = allLessons.find(l => l.file === path);
    if (found) {
        skill = found.skill;
    }

    const game = new Game(
        lesson,
        root,
        {
            onRestart: () => startLesson(path, opts),
            onExit: showMenu,
            onProfile: showProfile,
            onNext: () => continueToNext(path, opts),
            onSkipNext: !opts.from && getSkippedLessons().includes(path) ? null : () => {
                if (!opts.from) {
                    recordLessonSkip(path);
                }
                continueToNext(path, opts);
            }
        },
        path,
        skill,
        lessonIndex,
        opts.from || null
    );

    game.start();

}

function continueToNext(path, opts = {}) {

    if (opts.from === "practice") {
        const next = getNextPracticeLesson(lessonIndex, path);
        if (next) {
            startLesson(next.file, { from: "practice" });
            return;
        }
        showMenu();
        return;
    }

    if (opts.from === "consolidation" || opts.from === "favorites") {
        const files = opts.from === "consolidation" ? getConsolidationFiles() : getFavoriteFiles();
        const idx = files.indexOf(path);
        if (idx !== -1) {
            const next = files[idx + 1];
            if (next) {
                startLesson(next, opts);
                return;
            }
        }
        showMenu();
        return;
    }

    const next = getNextLesson(path);
    if (next) {
        startLesson(next.file);
        return;
    }
    const nextGrade = getNextGradeStart(path);
    if (nextGrade) {
        showGradeChange(path, nextGrade);
        return;
    }
    showMenu();

}

function getConsolidationFiles() {

    const grade = getActiveGrade();
    const ids = CONSOLIDATION_LESSONS[grade] || [];
    const byId = new Map((lessonIndex.lessons || []).map(l => [l.id, l]));
    const files = ids.map(id => byId.get(id)).filter(l => l && l.grades?.includes(grade));
    return files.map(l => l.file);

}

function getFavoriteFiles() {

    const grade = getActiveGrade();
    const files = new Set((lessonIndex.lessons || [])
        .filter(l => l.grades?.includes(grade))
        .map(l => l.file));
    return getFavoriteLessons().filter(f => files.has(f));

}

function getNextLesson(path) {

    const allLessons = lessonIndex.lessons || [];
    const idx = allLessons.findIndex(l => l.file === path);
    if (idx === -1) return null;

    const grade = allLessons[idx].grades?.[0];

    const gradeLessons = allLessons.filter(l => l.grades?.includes(grade));
    const pos = gradeLessons.findIndex(l => l.file === path);
    if (pos === -1) return null;

    const skippedSet = new Set(getSkippedLessons().filter(file =>
        gradeLessons.some(l => l.file === file)
    ));

    for (let i = pos + 1; i < gradeLessons.length; i++) {
        const candidate = gradeLessons[i];
        if (!skippedSet.has(candidate.file) && !getLessonStats(candidate.file)) {
            return candidate;
        }
    }

    for (let i = 0; i < pos; i++) {
        const candidate = gradeLessons[i];
        if (!skippedSet.has(candidate.file) && !getLessonStats(candidate.file)) {
            return candidate;
        }
    }

    const undoneSkipped = gradeLessons.find(l => skippedSet.has(l.file) && !getLessonStats(l.file));
    if (undoneSkipped) {
        return undoneSkipped;
    }

    return gradeLessons[(pos + 1) % gradeLessons.length];

}

function gradeLabel(grade) {
    if (grade === 1) return "az 1. osztállyal";
    if (grade === 2) return "a 2. osztállyal";
    return "a 3. osztállyal";
}

function nextGradeLabel(grade) {
    if (grade === 1) return "az 1. osztály";
    if (grade === 2) return "a 2. osztály";
    return "a 3. osztály";
}

function showGradeChange(path, next) {

    const allLessons = lessonIndex.lessons || [];
    const idx = allLessons.findIndex(l => l.file === path);
    const grade = idx !== -1 ? allLessons[idx].grades?.[0] : null;

    if (grade) {
        const skippedCount = getSkippedLessons().filter(file =>
            allLessons.some(l => l.grades?.includes(grade) && l.file === file)
        ).length;

        if (skippedCount > 0) {
            root.replaceChildren();
            setTipVisible(true);

            const card = createCard();

            const title = document.createElement("h1");
            title.textContent = "⏭️ Van még kihagyott feladatod";

            const text = document.createElement("p");
            text.textContent = `Minden feladatot megoldottál, de ${skippedCount} feladatot kihagytál a feladatlistán. Ha szeretnéd, előbb pótolhatod őket – az osztályváltóval viszont bármikor továbbléphetsz a ${nextGradeLabel(grade + 1)}ra.`;

            const button = createButton("🔙 Vissza a feladatokhoz", {
                className: "nav-bar-btn",
                onClick: showMenu
            });

            card.append(title, text, button);
            root.append(card);

            button.focus();

            return;
        }
    }

    root.replaceChildren();
    setTipVisible(true);

    const card = createCard();

    const title = document.createElement("h1");
    title.textContent = grade ? `🎉 Elkészültél ${gradeLabel(grade)}!` : "🎉 Elkészültél!";

    const text = document.createElement("p");
    text.textContent = grade
        ? "Ügyes vagy, minden feladatot teljesítettél! Ha szeretnél, az osztályválasztóval továbbléphetsz a következőre."
        : "Ügyes vagy, minden feladatot teljesítettél!";

    const button = createButton("📚 Vissza a feladatokhoz", {
        className: "nav-bar-btn",
        onClick: showMenu
    });

    card.append(title, text, button);
    root.append(card);

    button.focus();

}

function getNextGradeStart(path) {

    const allLessons = lessonIndex.lessons || [];
    const idx = allLessons.findIndex(l => l.file === path);
    if (idx === -1) return null;

    const grade = allLessons[idx].grades?.[0];

    for (let i = 0; i < allLessons.length; i++) {
        const candidate = allLessons[i];
        if (candidate.grades?.[0] === grade + 1) {
            return candidate;
        }
    }

    return null;

}
