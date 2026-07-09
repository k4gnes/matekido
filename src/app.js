import { Game } from "./engine/Game.js";
import { loadLesson } from "./engine/LessonLoader.js";

const lesson = await loadLesson("./src/data/lessons/grade1/addition-01.json");

const root = document.getElementById("app");

const game = new Game(lesson, root);

game.start();