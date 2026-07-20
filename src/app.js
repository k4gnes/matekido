import { Game } from "./engine/Game.js?v=3";
import { loadLesson } from "./engine/LessonLoader.js";
import { buildLesson } from "./builders/LessonBuilder.js?v=3";
import { renderLessonMenu } from "./components/lessonMenu.js";
import { renderProfilePage } from "./components/profilePage.js";
import { renderWelcomeScreen } from "./components/welcomeScreen.js";
import { getActiveId, listPlayers } from "./profile/UserManager.js";

const root = document.getElementById("app");

const lessonIndex = await loadLesson("./src/data/lessons/index.json");

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
        showWelcome
    );

}

function showProfile() {
    renderProfilePage(root, showMenu);
}

async function startLesson(path) {

    const rawLesson = await loadLesson(path);

    const lesson = buildLesson(rawLesson);

    const game = new Game(
        lesson,
        root,
        {
            onRestart: () => startLesson(path),
            onExit: showMenu,
            onProfile: showProfile
        }
    );

    game.start();

}
