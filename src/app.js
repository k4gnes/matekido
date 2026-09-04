import { Game } from "./engine/Game.js?v=17";
import { loadLesson } from "./engine/LessonLoader.js";
import { buildLesson } from "./builders/LessonBuilder.js?v=12";
import { renderLessonMenu } from "./components/lessonMenu.js?v=7";
import { renderSkillMap } from "./components/skillMap.js?v=7";
import { renderHelp } from "./components/help.js?v=2";
import { renderProfilePage } from "./components/profilePage.js";
import { renderStatsPage } from "./components/statsPage.js?v=1";
import { renderPracticePage } from "./components/practicePage.js";
import { renderWelcomeScreen } from "./components/welcomeScreen.js?v=2";
import { renderParentDashboard } from "./components/parentDashboard.js?v=2";
import { getActiveId, listPlayers } from "./profile/UserManager.js";

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
    });
}

async function startLesson(path) {

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
            onRestart: () => startLesson(path),
            onExit: showMenu,
            onProfile: showProfile,
            onPractice: showPractice,
            onNext: () => {
                const next = getNextLesson(path);
                if (next) startLesson(next.file);
            }
        },
        path,
        skill,
        lessonIndex
    );

    game.start();

}

function getNextLesson(path) {

    const allLessons = lessonIndex.lessons || [];
    const idx = allLessons.findIndex(l => l.file === path);
    if (idx === -1) return null;

    const grade = allLessons[idx].grades?.[0];

    for (let i = idx + 1; i < allLessons.length; i++) {
        const candidate = allLessons[i];
        if (candidate.grades?.includes(grade)) {
            return candidate;
        }
    }

    return null;

}
