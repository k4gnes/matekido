import fs from "node:fs";

const store = {};

globalThis.localStorage = {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    key: () => null,
    get length() { return Object.keys(store).length; }
};

const ROOT = new URL("./", import.meta.url);

import { buildLesson } from "./builders/LessonBuilder.js?v=15";
import { generateMeasureCompare } from "./generators/measureCompareGenerator.js?v=4";
import { COMPARE_OBJECTS, COMPARE_OBJECTS_WORLD } from "./data/measure.js?v=4";
import { CONSOLIDATION_LESSONS } from "./data/consolidation.js";

const INDEX_ANSWER_TYPES = new Set(["calendar", "data-chart", "solid-shape"]);

const WORLDS = ["postman", "racing", "football", "cooking", "animals", "space"];
const PASSES = { postman: 12, racing: 4, football: 4, cooking: 4, animals: 4, space: 4 };

const errors = [];

function fail(ctx, msg) {
    errors.push(`${ctx}: ${msg}`);
}

function readJson(rel) {
    return JSON.parse(fs.readFileSync(new URL(rel, ROOT), "utf8"));
}

function seedWorld(world) {
    store["matekido-users"] = JSON.stringify({
        players: [{ id: "user-1", name: "Teszt", avatar: "🦊", profile: { activeWorld: world } }],
        activeId: "user-1"
    });
}

function isFiniteNum(x) {
    return typeof x === "number" && Number.isFinite(x);
}

function isInt(x) {
    return Number.isInteger(x);
}

function checkOptions(step, ctx) {
    if (!Array.isArray(step.options)) return;
    if (step.options.length === 0) {
        fail(ctx, "üres options");
        return;
    }
    const allCorrectObjects = step.options.every(
        o => o && typeof o === "object" && "correct" in o
    );
    if (allCorrectObjects) {
        const correctCount = step.options.filter(o => o.correct).length;
        if (correctCount !== 1) {
            fail(ctx, `options: ${correctCount} helyes találat (1 kellene)`);
        }
        return;
    }
    const allNumbers = step.options.every(o => isFiniteNum(o));
    if (
        allNumbers &&
        isFiniteNum(step.answer) &&
        !INDEX_ANSWER_TYPES.has(step.type) &&
        !step.options.includes(step.answer)
    ) {
        fail(ctx, `options nem tartalmazza a helyes választ (${step.answer})`);
    }
}

function validateStep(step, ctx) {
    if (!step || typeof step !== "object") {
        fail(ctx, "lépés nem objektum");
        return;
    }
    if (typeof step.type !== "string" || step.type.length === 0) {
        fail(ctx, "nincs type");
        return;
    }

    if (step.type === "scene" || step.type === "celebration") {
        if (typeof step.title !== "string" || step.title.trim().length === 0) {
            fail(ctx, "title hiányzik");
        }
        if (step.type === "scene" && (typeof step.text !== "string" || step.text.trim().length === 0)) {
            fail(ctx, "scene text hiányzik");
        }
        return;
    }

    switch (step.type) {
        case "exercise": {
            if (!["addition", "subtraction", "mixed"].includes(step.kind)) {
                fail(ctx, `ismeretlen kind: ${step.kind}`);
            }
            if (!isInt(step.a) || !isInt(step.b) || step.a < 0 || step.b < 0) {
                fail(ctx, "a/b nem érvényes egész");
            }
            if (step.kind === "mixed") {
                if (!isInt(step.answer) || step.answer < 0) fail(ctx, "mixed answer hibás");
                if (!["+", "-"].includes(step.op)) fail(ctx, `mixed op hibás: ${step.op}`);
                if (!["left", "right", "result"].includes(step.inputPos)) fail(ctx, `mixed inputPos hibás: ${step.inputPos}`);
            }
            break;
        }
        case "missing-number": {
            if (!isInt(step.a) || !isInt(step.sum) || step.a < 0 || step.sum <= 0) {
                fail(ctx, "a/sum hibás");
            }
            if (step.a >= step.sum) fail(ctx, "a >= sum");
            if (step.answer !== step.sum - step.a) fail(ctx, `answer != sum-a (${step.answer} vs ${step.sum - step.a})`);
            break;
        }
        case "comparison": {
            if (!isInt(step.leftValue) || !isInt(step.rightValue)) fail(ctx, "értékek hibásak");
            const ok = step.operator === ">"
                ? step.leftValue > step.rightValue
                : step.operator === "<"
                    ? step.leftValue < step.rightValue
                    : step.operator === "="
                        ? step.leftValue === step.rightValue
                        : false;
            if (!ok) fail(ctx, `operator (${step.operator}) nem illik az értékekhez`);
            break;
        }
        case "neighbor": {
            if (!isInt(step.answer)) fail(ctx, "answer hibás");
            if (step.left !== step.answer - 1 || step.right !== step.answer + 1) {
                fail(ctx, `left/right nem szomszédok: ${step.left}/${step.answer}/${step.right}`);
            }
            break;
        }
        case "neighbor-single": {
            if (!isInt(step.answer)) fail(ctx, "answer hibás");
            if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
            break;
        }
        case "place-value":
        case "place-value-two-input": {
            if (!isInt(step.tens) || !isInt(step.ones) || step.tens < 0 || step.ones < 0) fail(ctx, "tens/ones hibás");
            if (step.answer !== 10 * step.tens + step.ones) fail(ctx, `answer != 10*tens+ones (${step.answer})`);
            break;
        }
        case "place-value-hundreds": {
            if (!isInt(step.hundreds) || !isInt(step.tens) || !isInt(step.ones)) fail(ctx, "h/t/o hibás");
            if (step.answer !== 100 * step.hundreds + 10 * step.tens + step.ones) fail(ctx, "answer hibás");
            break;
        }
        case "sequence": {
            if (!Array.isArray(step.terms) || step.terms.length < 3 || step.terms.some(t => !isInt(t))) fail(ctx, "terms hibás");
            if (!isInt(step.answer)) fail(ctx, "answer hibás");
            break;
        }
        case "order": {
            if (!Array.isArray(step.values) || step.values.length < 2 || step.values.some(v => !isInt(v))) fail(ctx, "values hibás");
            if (typeof step.direction !== "string") fail(ctx, "direction hiányzik");
            break;
        }
        case "even-odd": {
            if (!Array.isArray(step.numbers) || !step.numbers.every(n => isInt(n))) fail(ctx, "numbers hibás");
            if (!["even", "odd"].includes(step.question)) fail(ctx, `question hibás: ${step.question}`);
            if (!Array.isArray(step.answer)) fail(ctx, "answer nem tömb");
            break;
        }
        case "calendar":
        case "data-chart": {
            if (!Array.isArray(step.options) || step.options.length < 2) {
                fail(ctx, "options hiányos");
            }
            if (!isInt(step.answer) || step.answer < 0 || step.answer >= step.options.length) {
                fail(ctx, `answer index hibás: ${step.answer}`);
            }
            break;
        }
        case "pattern": {
            if (!Array.isArray(step.terms) || step.terms.length < 2) fail(ctx, "terms hibás");
            break;
        }
        case "bridge-ten": {
            if (!isInt(step.a) || !isInt(step.b) || !isInt(step.sum)) fail(ctx, "a/b/sum hibás");
            if (step.sum !== step.a + step.b) fail(ctx, `sum != a+b (${step.sum})`);
            if (!Array.isArray(step.steps) || step.steps.length !== 3) {
                fail(ctx, "steps nem 3 elemű");
                break;
            }
            const stepAnswers = step.steps.map(s => s.answer);
            if (stepAnswers[0] !== 10 - step.a) fail(ctx, `1. lépés answer != 10-a (${stepAnswers[0]})`);
            if (stepAnswers[1] !== step.b - (10 - step.a)) fail(ctx, `2. lépés answer != b-(10-a) (${stepAnswers[1]})`);
            if (stepAnswers[2] !== step.a + step.b) fail(ctx, `3. lépés answer != a+b (${stepAnswers[2]})`);
            if (!step.steps.every(s => Array.isArray(s.options) && s.options.includes(s.answer))) {
                fail(ctx, "egy lépés options nem tartalmazza az answer-t");
            }
            break;
        }
        case "solid-shape": {
            if (!["cube", "cuboid", "cylinder", "cone"].includes(step.solid)) fail(ctx, `solid hibás: ${step.solid}`);
            if (!["name", "faces"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            if (!Array.isArray(step.options) || step.options.length < 2) fail(ctx, "options hiányos");
            if (!isInt(step.answer) || step.answer < 0 || step.answer >= step.options.length) {
                fail(ctx, `answer index hibás: ${step.answer}`);
            }
            if (step.mode === "name") {
                if (!step.options.every(o => typeof o === "string" && o.length > 0)) fail(ctx, "name options nem stringek");
            } else {
                if (!step.options.every(o => isInt(o) && o > 0)) fail(ctx, "faces options nem pozitív egészek");
            }
            break;
        }
        case "true-false": {
            if (typeof step.statement !== "string" || step.statement.length === 0) fail(ctx, "statement hiányzik");
            if (typeof step.answer !== "boolean") fail(ctx, "answer nem boolean");
            break;
        }
        case "find-error": {
            if (Array.isArray(step.items)) {
                if (step.items.length === 0) fail(ctx, "üres items");
                if (!isInt(step.answer) || step.answer < 0 || step.answer >= step.items.length) fail(ctx, "answer index hibás");
            } else {
                if (typeof step.statement !== "string" || step.statement.length === 0) fail(ctx, "statement hiányzik");
                if (typeof step.hasError !== "boolean") fail(ctx, "hasError nem boolean");
            }
            break;
        }
        case "measure-compare": {
            for (const key of ["A", "B"]) {
                const obj = step[`object${key}`];
                if (!obj || typeof obj.emoji !== "string" || typeof obj.name !== "string" || !obj.name) {
                    fail(ctx, `object${key} hiányos`);
                }
            }
            if (!["A", "B", "equal"].includes(step.answer)) fail(ctx, `answer hibás: ${step.answer}`);
            for (const key of ["A", "B"]) {
                const len = step[`length${key}`];
                const start = step[`start${key}`];
                const end = step[`end${key}`];
                if (!isInt(len) || len < 3 || len > 6) fail(ctx, `length${key} hibás: ${len}`);
                if (!isInt(start) || !isInt(end) || end - start !== len) fail(ctx, `start/end(${key}) nem konzisztens`);
            }
            break;
        }
        case "measure-squares": {
            if (!["horizontal", "tall", "deep"].includes(step.direction)) fail(ctx, `direction hibás: ${step.direction}`);
            if (typeof step.emoji !== "string" || typeof step.name !== "string" || !isInt(step.length) || step.length <= 0) {
                fail(ctx, "emoji/name/length hiányos");
            }
            break;
        }
        case "equal-groups": {
            if (!isInt(step.groups) || !isInt(step.perGroup) || step.groups < 2 || step.perGroup < 1) fail(ctx, "groups/perGroup hibás");
            if (!isInt(step.total) || step.total !== step.perGroup * step.groups) fail(ctx, `total != perGroup*groups (${step.total})`);
            if (step.answer !== step.total) fail(ctx, "answer != total");
            break;
        }
        case "repeated-addition": {
            if (!isInt(step.addend) || !isInt(step.times) || step.addend < 1 || step.times < 2) fail(ctx, "addend/times hibás");
            if (!isInt(step.answer) || step.answer !== step.addend * step.times) fail(ctx, "answer != addend*times");
            if (typeof step.expression !== "string" || step.expression.length === 0) fail(ctx, "expression hiányzik");
            break;
        }
        case "skip-counting": {
            if (!Array.isArray(step.terms) || step.terms.length < 4 || step.terms.some(t => !isInt(t))) fail(ctx, "terms hibás");
            if (!isInt(step.missingIndex) || step.missingIndex < 0 || step.missingIndex >= step.terms.length) fail(ctx, "missingIndex hibás");
            if (step.answer !== step.terms[step.missingIndex]) fail(ctx, "answer != terms[missingIndex]");
            break;
        }
        case "money-pay": {
            if (!isInt(step.price) || step.price < 0) fail(ctx, "price hibás");
            if (step.coins !== undefined && (!Array.isArray(step.coins) || step.coins.length === 0)) {
                fail(ctx, "coins hibás");
            }
            break;
        }
        case "money-compare": {
            if (!Array.isArray(step.leftCoins) || !Array.isArray(step.rightCoins)) fail(ctx, "coin tömbök hiányoznak");
            if (![">", "<", "="].includes(step.operator)) fail(ctx, `operator hibás: ${step.operator}`);
            break;
        }
        case "money-enough": {
            if (!isInt(step.price) || step.price < 0) fail(ctx, "price hibás");
            if (!Array.isArray(step.coins) || step.coins.length === 0) fail(ctx, "coins hibás");
            if (typeof step.enough !== "boolean") fail(ctx, "enough nem boolean");
            break;
        }
    }

    checkOptions(step, ctx);
}

function validateLesson(built, ctx) {
    const counted = built.steps.filter(s => s.type !== "scene" && s.type !== "celebration");
    if (counted.length === 0) {
        fail(ctx, "nincs feladatlépés");
    }
    built.steps.forEach((step, index) => validateStep(step, `${ctx} [#${index} ${step.type ?? "?"}]`));
}

const index = readJson("data/lessons/index.json");
const lessons = index.lessons;

const indexIds = new Set(index.lessons.map(l => l.id));

for (const [grade, ids] of Object.entries(CONSOLIDATION_LESSONS)) {
    for (const id of ids) {
        const lessonMeta = index.lessons.find(l => l.id === id);
        if (!lessonMeta) {
            fail(`consolidation/grade${grade}`, `nem létező lecke: ${id}`);
            continue;
        }
        if (!lessonMeta.grades?.includes(Number(grade))) {
            fail(`consolidation/grade${grade}`, `${id} nem ${grade}. osztályos (grades: ${lessonMeta.grades})`);
        }
    }
}

let builds = 0;

for (const world of WORLDS) {
    seedWorld(world);
    for (let pass = 1; pass <= PASSES[world]; pass++) {
        for (const lesson of lessons) {
            const raw = readJson(lesson.file.replace("./", ""));
            try {
                const built = buildLesson(raw);
                validateLesson(built, `${world}/${lesson.id}`);
                JSON.stringify(built);
                builds++;
            } catch (e) {
                fail(`${world}/${lesson.id} [pass ${pass}]`, `kivétel: ${e.message}`);
            }
        }
    }
}

const WORLD_POOLS = { ...COMPARE_OBJECTS_WORLD };
const DEFAULT_POOL = COMPARE_OBJECTS;
const ALL_NAMES = Object.values(WORLD_POOLS).flat().map(o => o.name);

for (const world of Object.keys(WORLD_POOLS)) {
    const pool = WORLD_POOLS[world];
    for (let i = 0; i < 100; i++) {
        const task = generateMeasureCompare({ count: 1, world })[0];
        for (const key of ["A", "B"]) {
            const obj = task[`object${key}`];
            if (!pool.some(o => o.emoji === obj.emoji && o.name === obj.name)) {
                fail(`measure-compare/${world}`, `nem a világkészletből való: ${obj.name}`);
            }
        }
    }
}

const defaultTask = generateMeasureCompare({ count: 1 })[0];
for (const key of ["A", "B"]) {
    const obj = defaultTask[`object${key}`];
    if (!DEFAULT_POOL.some(o => o.emoji === obj.emoji && o.name === obj.name)) {
        fail("measure-compare/default", `nem az alapkészletből való: ${obj.name}`);
    }
}

const gradesCount = {};
for (const l of lessons) {
    for (const g of l.grades) {
        gradesCount[g] = (gradesCount[g] || 0) + 1;
    }
}
const gradesLabel = Object.entries(gradesCount)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([g, c]) => `${g}. osztály: ${c}`)
    .join(", ");

console.log(`Épített leckék: ${builds}/${builds} (${lessons.length} lecke — ${gradesLabel}; ${WORLDS.length} világ, több sorozat)`);
console.log(`Világ-specifikus hossz-összehasonlítások: ${(Object.keys(WORLD_POOLS).length * 100 + 1)} ellenőrzés`);

if (errors.length > 0) {
    console.error(`\n${errors.length} HIBA:`);
    for (const e of errors.slice(0, 50)) {
        console.error(" -", e);
    }
    if (errors.length > 50) {
        console.error(`... és még ${errors.length - 50}`);
    }
    process.exit(1);
}

console.log("Minden teszt OK ✔");