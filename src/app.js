import { Game } from "./engine/Game.js";
import { loadLesson } from "./engine/LessonLoader.js";
import { buildLesson } from "./builders/LessonBuilder.js";
import { renderLessonMenu } from "./components/lessonMenu.js";

const root = document.getElementById("app");

const lessonIndex = await loadLesson("./src/data/lessons/index.json");

showMenu();

function showMenu() {

    renderLessonMenu(
        lessonIndex,
        root,
        startLesson
    );

}

async function startLesson(path) {

    const rawLesson = await loadLesson(path);

    const lesson = buildLesson(rawLesson);

    const game = new Game(
        lesson,
        root,
        {
            onRestart: () => startLesson(path),
            onExit: showMenu
        }
    );

    game.start();

}