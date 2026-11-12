// A leckék feladatszámának kiírása az index.json `tasks` mezőjébe: minden leckét
// megépítünk, és a bevezető/celebrációs lépéseken kívüliek számát tároljuk.
// A szám világonként nem változik – a világ csak a szöveget módosítja.
// Futtatás: node src/generateLessonTasks.js (új vagy módosított lecke után)

import fs from "node:fs";
import { buildLesson } from "./builders/LessonBuilder.js?v=50";

const store = {};

globalThis.localStorage = {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; }
};

const INDEX = new URL("./data/lessons/index.json", import.meta.url);

const index = JSON.parse(fs.readFileSync(INDEX, "utf8"));

index.lessons.forEach(lesson => {
    const raw = JSON.parse(fs.readFileSync(new URL(lesson.file.replace("./", ""), import.meta.url), "utf8"));
    lesson.tasks = buildLesson(raw).steps.filter(s => s.type !== "scene" && s.type !== "celebration").length;
});

fs.writeFileSync(INDEX, JSON.stringify(index, null, 2));
console.log(`feladatszám kiírva: ${index.lessons.length} lecke`);
