import { Game } from "./engine/Game.js";
import { loadLesson } from "./engine/LessonLoader.js";
import { buildLesson } from "./builders/LessonBuilder.js";


const rawLesson = await loadLesson(
    "./src/data/lessons/grade1/addition-01.json"
);


const lesson = buildLesson(rawLesson);


const root = document.getElementById("app");


const game = new Game(
    lesson,
    root
);


game.start();