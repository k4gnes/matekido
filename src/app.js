import { Game } from "./engine/Game.js?v=12";
import { loadLesson } from "./engine/LessonLoader.js";
import { buildLesson } from "./builders/LessonBuilder.js?v=10";
import { renderLessonMenu } from "./components/lessonMenu.js?v=4";
import { renderSkillMap } from "./components/skillMap.js?v=4";
import { renderHelp } from "./components/help.js?v=1";
import { renderProfilePage } from "./components/profilePage.js";
import { renderStatsPage } from "./components/statsPage.js";
import { renderPracticePage } from "./components/practicePage.js";
import { renderWelcomeScreen } from "./components/welcomeScreen.js";
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
    });
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
    renderProfilePage(root, showMenu, showStats, showPractice, () => showHelp(showProfile));
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
            onPractice: showPractice
        },
        path,
        skill
    );

    game.start();

}
