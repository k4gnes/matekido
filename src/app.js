import { Game } from "./engine/Game.js?v=47";
import { loadLesson } from "./engine/LessonLoader.js";
import { buildLesson } from "./builders/LessonBuilder.js?v=16";
import { renderLessonMenu } from "./components/lessonMenu.js?v=20";
import { renderSkillMap } from "./components/skillMap.js?v=8";
import { renderHelp } from "./components/help.js?v=2";
import { renderProfilePage } from "./components/profilePage.js";
import { renderStatsPage } from "./components/statsPage.js?v=5";
import { renderPracticePage } from "./components/practicePage.js?v=5";
import { renderWelcomeScreen } from "./components/welcomeScreen.js?v=2";
import { renderParentDashboard } from "./components/parentDashboard.js?v=3";
import { getActiveId, listPlayers } from "./profile/UserManager.js";
import { setActiveGrade, getActiveGrade, getFavoriteLessons, getLessonStats, recordLessonSkip, getSkippedLessons } from "./profile/Profile.js";
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

function showWelcome() {
    renderWelcomeScreen(root, () => {
        showMenu();
    }, showParentDashboard);
}

function showParentDashboard() {
    renderParentDashboard(root, () => {
        showWelcome();
    }, lessonIndex);
}

function showMenu() {

    renderLessonMenu(
        lessonIndex,
        root,
        startLesson,
        showProfile,
        showWelcome,
        showSkillMap,
        () => showHelp(showMenu)
    );

}

function showSkillMap() {
    renderSkillMap(root, showMenu);
}

function showHelp(onBack) {
    renderHelp(root, onBack ?? showMenu);
}

function showProfile() {
    renderProfilePage(lessonIndex, root, showMenu, showStats, showPractice, () => showHelp(showProfile));
}

function showPractice() {
    renderPracticePage(lessonIndex, root, startLesson, showProfile);
}

function showStats() {
    renderStatsPage(root, (target) => {
        if (target === "lessons") {
            showMenu();
        } else {
            showProfile();
        }
    }, lessonIndex);
}

async function startLesson(path, opts = {}) {

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
            onPractice: showPractice,
            onNext: () => continueToNext(path, opts),
            onSkipNext: () => {
                if (!opts.from) {
                    recordLessonSkip(path);
                }
                continueToNext(path, opts);
            }
        },
        path,
        skill,
        lessonIndex
    );

    game.start();

}

function continueToNext(path, opts = {}) {

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

    const skipped = getSkippedLessons().filter(file =>
        file !== path && allLessons.some(l => l.grades?.includes(grade) && l.file === file)
    );
    if (skipped.length > 0) {
        const firstSkipped = allLessons.find(l => l.grades?.includes(grade) && l.file === skipped[0]);
        if (firstSkipped) {
            return firstSkipped;
        }
    }

    for (let i = idx + 1; i < allLessons.length; i++) {
        const candidate = allLessons[i];
        if (candidate.grades?.includes(grade) && !getLessonStats(candidate.file)) {
            return candidate;
        }
    }

    return null;

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

            const card = createCard();

            const title = document.createElement("h1");
            title.textContent = `🔒 Még nem léphetsz ${nextGradeLabel(grade + 1)}ra!`;

            const text = document.createElement("p");
            text.textContent = `A feladatlistán kihagytál ${skippedCount} feladatot. Előbb oldd meg őket, csak utána jöhet a ${nextGradeLabel(grade + 1)}.`;

            const button = createButton("🔙 Vissza a feladatokhoz", {
                onClick: showMenu
            });

            card.append(title, text, button);
            root.append(card);

            button.focus();

            return;
        }

        setActiveGrade(grade + 1);
    }

    root.replaceChildren();

    const card = createCard();

    const title = document.createElement("h1");
    title.textContent = grade ? `🎉 Elkészültél ${gradeLabel(grade)}!` : "🎉 Elkészültél!";

    const text = document.createElement("p");
    text.textContent = grade
        ? `Most ${nextGradeLabel(grade + 1)} tananyaga következik!`
        : "Következik a következő tananyag!";

    const button = createButton("➡️ Következő", {
        onClick: () => startLesson(next.file)
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
