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

import { buildLesson } from "./builders/LessonBuilder.js?v=22";
import { generateMeasureCompare } from "./generators/measureCompareGenerator.js?v=4";
import { COMPARE_OBJECTS, COMPARE_OBJECTS_WORLD } from "./data/measure.js?v=4";
import { CONSOLIDATION_LESSONS } from "./data/consolidation.js";

const INDEX_ANSWER_TYPES = new Set(["calendar", "data-chart", "solid-shape", "polygon", "length-units"]);

const WORLDS = ["postman", "racing", "football", "cooking", "animals", "space", "tram"];
const PASSES = { postman: 12, racing: 4, football: 4, cooking: 4, animals: 4, space: 4, tram: 4 };

const POLYGON_SIDES = {
    triangle: 3,
    square: 4,
    pentagon: 5,
    hexagon: 6,
    heptagon: 7,
    octagon: 8
};

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

function applyOp(op, a, b) {
    switch (op) {
        case "+": return a + b;
        case "−": return a - b;
        case "×": return a * b;
        case "÷": return a / b;
        default: return null;
    }
}

function operationOrderAnswer(step) {
    const { form, a, b, c } = step;
    switch (form) {
        case "mult-add": return a + b * c;
        case "mult-add-rev": return a * b + c;
        case "mult-sub": return a - b * c;
        case "paren-add": return (a + b) * c;
        case "paren-sub": return (a - b) * c;
        case "div-add": return a + b / c;
        default: return null;
    }
}

const UNIT_FACTORS = {
    "km-m": 1000, "m-dm": 10, "m-cm": 100, "m-mm": 1000, "dm-cm": 10, "cm-mm": 10,
    "kg-dkg": 100, "kg-g": 1000, "dkg-g": 10,
    "l-dl": 10, "l-cl": 100, "dl-cl": 10
};

function measureUnitFactor(unit, target) {
    return UNIT_FACTORS[`${unit}-${target}`] ?? null;
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
        case "neighbor-round": {
            if (!isInt(step.number) || !isInt(step.lower) || !isInt(step.upper)) fail(ctx, "number/lower/upper hibás");
            if (!["ten", "hundred", "thousand"].includes(step.unit)) fail(ctx, `unit hibás (${step.unit})`);
            const stepVal = step.unit === "ten" ? 10 : step.unit === "hundred" ? 100 : 1000;
            if (step.lower % stepVal !== 0 || step.upper % stepVal !== 0) fail(ctx, "lower/upper nem kerek");
            if (step.lower >= step.number || step.upper <= step.number) fail(ctx, "lower/upper nem szomszédok");
            if (step.unitLabel !== { ten: "tízes", hundred: "százas", thousand: "ezres" }[step.unit]) fail(ctx, "unitLabel hibás");
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
        case "place-value-thousands": {
            if (!isInt(step.thousands) || !isInt(step.hundreds) || !isInt(step.tens) || !isInt(step.ones)) fail(ctx, "ezres/százas/tízes/egyes hibás");
            if (step.answer !== 1000 * step.thousands + 100 * step.hundreds + 10 * step.tens + step.ones) fail(ctx, "answer hibás");
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
        case "polygon": {
            if (!["name", "sides", "vertices", "diagonals"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            if (!POLYGON_SIDES[step.kind]) fail(ctx, `kind hibás: ${step.kind}`);
            if (step.n !== POLYGON_SIDES[step.kind]) fail(ctx, `n != oldalak száma (${step.n})`);
            if (!Array.isArray(step.options) || step.options.length < 2) fail(ctx, "options hiányos");
            if (!isInt(step.answer) || step.answer < 0 || step.answer >= step.options.length) {
                fail(ctx, `answer index hibás: ${step.answer}`);
            }
            const correct = step.mode === "name"
                ? step.answer
                : step.options.indexOf(step.mode === "sides" || step.mode === "vertices" ? step.n : step.n * (step.n - 3) / 2);
            if (step.options[step.answer] !== step.options[correct]) fail(ctx, "answer nem a helyes érték");
            if (step.mode === "name") {
                if (!step.options.every(o => typeof o === "string" && o.length > 0)) fail(ctx, "name options nem stringek");
            } else {
                if (!step.options.every(o => isInt(o) && o >= 0)) fail(ctx, "számoptions nem nemnegatív egészek");
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
        case "perimeter": {
            if (!isInt(step.rows) || !isInt(step.cols) || step.rows < 2 || step.cols < 2) {
                fail(ctx, "rows/cols hibás");
            }
            if (step.answer !== 2 * (step.rows + step.cols)) {
                fail(ctx, `answer (${step.answer}) != 2*(rows+cols) (${2 * (step.rows + step.cols)})`);
            }
            break;
        }
        case "area": {
            if (!isInt(step.rows) || !isInt(step.cols) || step.rows < 2 || step.cols < 2) {
                fail(ctx, "rows/cols hibás");
            }
            if (step.answer !== step.rows * step.cols) {
                fail(ctx, `answer (${step.answer}) != rows*cols (${step.rows * step.cols})`);
            }
            break;
        }
        case "angles": {
            if (!isInt(step.angle) || step.angle <= 0 || step.angle >= 180) {
                fail(ctx, `angle tartomány hibás: ${step.angle}`);
            }
            const expected = step.angle === 90 ? "right" : step.angle < 90 ? "acute" : "obtuse";
            if (step.category !== expected) {
                fail(ctx, `category (${step.category}) nem illik a szögéhez (${step.angle})`);
            }
            if (!Array.isArray(step.options) || step.options.length !== 3) {
                fail(ctx, "options nem 3 elemű");
            }
            if (!isInt(step.answer) || step.answer < 0 || step.answer >= step.options.length) {
                fail(ctx, `answer index hibás: ${step.answer}`);
            }
            const nameByCategory = { acute: "Hegyes", right: "Derékszög", obtuse: "Tompa" };
            if (step.options[step.answer] !== nameByCategory[step.category]) {
                fail(ctx, `answer nem a helyes opcióra mutat: ${step.answer} (${step.options[step.answer]})`);
            }
            break;
        }
        case "angle-measure": {
            if (step.mode === "compare") {
                if (!isInt(step.angleA) || !isInt(step.angleB) || step.angleA === step.angleB) {
                    fail(ctx, `compare szögek hibásak: ${step.angleA}/${step.angleB}`);
                }
            } else {
                if (!isInt(step.angle) || step.angle <= 0 || step.angle >= 180) {
                    fail(ctx, `angle tartomány hibás: ${step.angle}`);
                }
                if (step.mode === "kind") {
                    const expected = step.angle === 90 ? "right" : step.angle < 90 ? "acute" : "obtuse";
                    if (step.category !== expected) {
                        fail(ctx, `category (${step.category}) nem illik a szögéhez (${step.angle})`);
                    }
                }
            }
            break;
        }
        case "circle": {
            const labels = { center: "Középpont", radius: "Sugár", diameter: "Átmérő" };
            if (!Object.keys(labels).includes(step.variant)) {
                fail(ctx, `variant hibás: ${step.variant}`);
            }
            if (!Array.isArray(step.options) || step.options.length !== 3) {
                fail(ctx, "options nem 3 elemű");
            }
            if (!isInt(step.answer) || step.answer < 0 || step.answer >= step.options.length) {
                fail(ctx, `answer index hibás: ${step.answer}`);
            }
            if (step.options[step.answer] !== labels[step.variant]) {
                fail(ctx, `answer nem a helyes opcióra mutat: ${step.answer} (${step.options[step.answer]})`);
            }
            break;
        }
        case "probability": {
            const labels = { certain: "Biztos", possible: "Lehetséges", impossible: "Lehetetlen" };
            if (!Object.keys(labels).includes(step.category)) {
                fail(ctx, `category hibás: ${step.category}`);
            }
            if (typeof step.text !== "string" || step.text.length === 0) {
                fail(ctx, "text hiányzik");
            }
            if (!Array.isArray(step.options) || step.options.length !== 3) {
                fail(ctx, "options nem 3 elemű");
            }
            if (!isInt(step.answer) || step.answer < 0 || step.answer >= step.options.length) {
                fail(ctx, `answer index hibás: ${step.answer}`);
            }
            if (step.options[step.answer] !== labels[step.category]) {
                fail(ctx, `answer nem a helyes opcióra mutat: ${step.answer} (${step.options[step.answer]})`);
            }
            break;
        }
        case "operation-order": {
            if (typeof step.expression !== "string" || step.expression.length === 0) {
                fail(ctx, "expression hiányzik");
            }
            const expected = operationOrderAnswer(step);
            if (!isFiniteNum(expected) || step.answer !== expected) {
                fail(ctx, `answer (${step.answer}) nem a helyes érték (${expected})`);
            }
            if (!Array.isArray(step.options) || step.options.length < 3) {
                fail(ctx, "options túl kevés elemű");
            }
            break;
        }
        case "measure-units": {
            if (!isInt(step.value) || step.value < 1) fail(ctx, `value hibás: ${step.value}`);
            if (!["length", "weight", "volume"].includes(step.kind)) fail(ctx, `kind hibás: ${step.kind}`);
            if (!["km", "m", "dm", "cm", "kg", "dkg", "g", "l", "dl", "cl", "mm"].includes(step.unit) ||
                !["km", "m", "dm", "cm", "kg", "dkg", "g", "l", "dl", "cl", "mm"].includes(step.target)) {
                fail(ctx, `unit/target ismeretlen: ${step.unit} → ${step.target}`);
            }
            const factor = measureUnitFactor(step.unit, step.target);
            if (!factor) fail(ctx, `nincs átszámítás: ${step.unit} → ${step.target}`);
            if (step.answer !== step.value * factor) {
                fail(ctx, `answer (${step.answer}) != ${step.value} × ${factor}`);
            }
            if (!Array.isArray(step.options) || !step.options.includes(step.answer)) {
                fail(ctx, "options nem tartalmazza a helyes választ");
            }
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
        case "written-operation": {
            if (!["add", "sub", "mul"].includes(step.op)) {
                fail(ctx, `op hibás: ${step.op}`);
            }
            const twoDigitMul = step.op === "mul" && step.b >= 10;
            if (!isInt(step.a) || !isInt(step.b) || step.a < 1 || step.b < 1) {
                fail(ctx, "a/b nem érvényes egész");
            }
            if (step.op === "mul") {
                if (step.a > 9999) fail(ctx, `a 9999 fölötti (${step.a})`);
                if (twoDigitMul) {
                    if (step.b > 99) fail(ctx, `b 99 fölötti kétjegyű szorzó (${step.b})`);
                    if (step.onesPart !== step.a * (step.b % 10)) {
                        fail(ctx, `onesPart != a*(b%10) (${step.onesPart})`);
                    }
                    if (step.tensPart !== step.a * Math.floor(step.b / 10)) {
                        fail(ctx, `tensPart != a*(b/10) (${step.tensPart})`);
                    }
                } else {
                    if (step.b < 2 || step.b > 9) fail(ctx, `b nem 2..9 szorzó (${step.b})`);
                }
                if (step.answer !== step.a * step.b) {
                    fail(ctx, `answer != a*b (${step.answer} vs ${step.a * step.b})`);
                }
                if (step.answer > 9999) {
                    fail(ctx, `answer 9999 fölötti: ${step.answer}`);
                }
            } else {
                if (step.a > 9999 || step.b > 9999) fail(ctx, "a/b 9999 fölötti");
                if (step.a < 100) fail(ctx, `a 100 alatti: ${step.a}`);
                if (step.op === "add" && step.answer !== step.a + step.b) {
                    fail(ctx, `answer != a+b (${step.answer})`);
                }
                if (step.op === "sub" && step.answer !== step.a - step.b) {
                    fail(ctx, `answer != a-b (${step.answer})`);
                }
                if (step.answer < 100 || step.answer > 9999) {
                    fail(ctx, `answer 100..9999 nélküli: ${step.answer}`);
                }
            }
            if (!["input", "choice"].includes(step.interaction)) {
                fail(ctx, `interaction hibás: ${step.interaction}`);
            }
            if (twoDigitMul && step.interaction !== "input") {
                fail(ctx, `kétjegyű szorzónál input kell (${step.interaction})`);
            }
            break;
        }
        case "written-division": {
            if (!isInt(step.a) || !isInt(step.b) || !isInt(step.quotient) || !isInt(step.remainder)) {
                fail(ctx, "a/b/quotient/remainder nem egész");
                break;
            }
            if (step.a !== step.quotient * step.b + step.remainder) {
                fail(ctx, `a != quotient*b+remainder (${step.a} != ${step.quotient}*${step.b}+${step.remainder})`);
            }
            if (step.remainder < 0 || step.remainder >= step.b) {
                fail(ctx, `remainder tartomány hibás: ${step.remainder} (b=${step.b})`);
            }
            if (!Array.isArray(step.steps) || step.steps.length === 0) {
                fail(ctx, "steps hiányzik");
            }
            const digits = String(step.a).length;
            for (let i = 0; i < digits; i++) {
                if (i >= step.steps.length) {
                    fail(ctx, `steps rövidebb, mint az osztandó jegyei (${step.steps.length} vs ${digits})`);
                    break;
                }
                const st = step.steps[i];
                const digit = Number(String(step.a)[i]);
                const expectedPartial = i === 0 ? digit : step.steps[i - 1].remainder * 10 + digit;
                if (st.partial !== expectedPartial) {
                    fail(ctx, `steps[${i}].partial hibás (${st.partial} != ${expectedPartial})`);
                }
                if (st.qd < 0 || st.qd > 9) {
                    fail(ctx, `steps[${i}].qd nem 0..9: ${st.qd}`);
                }
                if (st.product !== st.qd * step.b) {
                    fail(ctx, `steps[${i}].product != qd*b (${st.product} != ${st.qd}*${step.b})`);
                }
                if (st.remainder !== st.partial - st.product) {
                    fail(ctx, `steps[${i}].remainder != partial-product (${st.remainder} != ${st.partial}-${st.product})`);
                }
                if (st.remainder < 0 || st.remainder >= step.b) {
                    fail(ctx, `steps[${i}].remainder tartomány hibás: ${st.remainder}`);
                }
            }
            if (step.steps[step.steps.length - 1].remainder !== step.remainder) {
                fail(ctx, `utolsó steps.remainder != feladat maradéka (${step.steps[step.steps.length - 1].remainder} vs ${step.remainder})`);
            }
            if (!["input", "choice"].includes(step.interaction)) {
                fail(ctx, `interaction hibás: ${step.interaction}`);
            }
            break;
        }
        case "remainder-division": {
            if (!isInt(step.a) || !isInt(step.b) || !isInt(step.quotient) || !isInt(step.remainder)) {
                fail(ctx, "a/b/quotient/remainder nem egész");
                break;
            }
            if (step.a !== step.quotient * step.b + step.remainder) {
                fail(ctx, `a != quotient*b+remainder (${step.a} != ${step.quotient}*${step.b}+${step.remainder})`);
            }
            if (step.remainder < 0 || step.remainder >= step.b) {
                fail(ctx, `remainder tartomány hibás: ${step.remainder} (b=${step.b})`);
            }
            if (!["notation", "groups"].includes(step.mode)) {
                fail(ctx, `mode hibás: ${step.mode}`);
            }
            if (!["input", "choice"].includes(step.interaction)) {
                fail(ctx, `interaction hibás: ${step.interaction}`);
            }
            if (step.interaction === "choice") {
                if (!Array.isArray(step.quotientOptions) || step.quotientOptions.length < 2) {
                    fail(ctx, `quotientOptions hiányos (choice esetén) ${step.quotientOptions}`);
                } else {
                    step.quotientOptions.forEach((o, i) => {
                        if (!isInt(o)) fail(ctx, `quotientOptions[${i}] hibás: ${JSON.stringify(o)}`);
                    });
                    if (!step.quotientOptions.includes(step.quotient)) {
                        fail(ctx, `quotientOptions nem tartalmazza a hányadost (${step.quotient})`);
                    }
                }
                if (!Array.isArray(step.remainderOptions) || step.remainderOptions.length < 2) {
                    fail(ctx, `remainderOptions hiányos (choice esetén) ${step.remainderOptions}`);
                } else {
                    step.remainderOptions.forEach((o, i) => {
                        if (!isInt(o)) fail(ctx, `remainderOptions[${i}] hibás: ${JSON.stringify(o)}`);
                    });
                    if (!step.remainderOptions.includes(step.remainder)) {
                        fail(ctx, `remainderOptions nem tartalmazza a maradékot (${step.remainder})`);
                    }
                }
            }
            break;
        }
    case "elapsed-time": {
            if (!["duration", "start", "end"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            if (!["start", "end", "duration"].every(k => isInt(step[k]))) fail(ctx, "start/end/duration nem egész");
            if (step.start < 0 || step.end > 1439 || step.start >= step.end) fail(ctx, `start/end tartomány hibás: ${step.start} → ${step.end}`);
            if (step.duration !== step.end - step.start) fail(ctx, `duration != end-start (${step.duration})`);
            const expected = step.mode === "duration" ? step.duration : step.mode === "start" ? step.start : step.end;
            if (step.answer !== expected) fail(ctx, `answer (${step.answer}) != ${step.mode} (${expected})`);
            if (!Array.isArray(step.options) || step.options.length < 2 || !step.options.includes(step.answer)) {
                fail(ctx, "options nem tartalmazza a helyes választ");
            }
            if (!step.options.every(o => isInt(o) && o % 5 === 0 && o >= 0 && o <= 1439)) {
                fail(ctx, "options nem érvényes percek");
            }
            if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
            break;
        }
    case "length-units": {
            if (typeof step.emoji !== "string") fail(ctx, "emoji hiányzik");
            if (typeof step.name !== "string" || typeof step.text !== "string" || step.name.length === 0 || step.text.length === 0) {
                fail(ctx, "name/text hiányzik");
            }
            if (!isInt(step.number) || step.number <= 0) fail(ctx, `number hibás: ${step.number}`);
            if (!["cm", "m", "km"].includes(step.unit)) fail(ctx, `unit hibás: ${step.unit}`);
            if (!Array.isArray(step.options) || step.options.length < 2) fail(ctx, "options hiányos");
            if (!step.options.every(o => ["cm", "m", "km"].includes(o))) fail(ctx, "options nem mértékegységek");
            if (!isInt(step.answer) || step.answer < 0 || step.answer >= step.options.length) {
                fail(ctx, `answer index hibás: ${step.answer}`);
            }
            if (step.options[step.answer] !== step.unit) fail(ctx, "answer nem a helyes egység");
            break;
        }
    case "shape-formula": {
            if (!["perimeter", "area"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            if (!["square", "rectangle"].includes(step.shape)) fail(ctx, `shape hibás: ${step.shape}`);
            if (!isInt(step.a) || !isInt(step.b) || step.a < 1 || step.b < 1) fail(ctx, `a/b hibás: ${step.a} x ${step.b}`);
            if (step.shape === "square" && step.a !== step.b) fail(ctx, `négyzetnél a != b (${step.a} != ${step.b})`);
            const expectedFormula = step.mode === "perimeter"
                ? 2 * (step.a + step.b)
                : step.a * step.b;
            if (step.answer !== expectedFormula) fail(ctx, `answer (${step.answer}) != képlet (${expectedFormula})`);
            if (!Array.isArray(step.options) || !step.options.includes(step.answer)) fail(ctx, "options nem tartalmazza a választ");
            break;
        }
    case "compound-shape": {
            if (!["perimeter", "area"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            if (!["L", "stairs"].includes(step.kind)) fail(ctx, `kind hibás: ${step.kind}`);
            if (!isInt(step.rows) || !isInt(step.cols) || step.rows < 1 || step.cols < 1) fail(ctx, `rows/cols hibás: ${step.rows}x${step.cols}`);
            if (!Array.isArray(step.cells) || step.cells.length === 0) fail(ctx, "cells üres");
            const cellSet = new Set();
            for (const cell of step.cells) {
                if (!Array.isArray(cell) || cell.length !== 2 || !isInt(cell[0]) || !isInt(cell[1])) {
                    fail(ctx, `cell hibás: ${JSON.stringify(cell)}`);
                    continue;
                }
                if (cell[0] < 0 || cell[0] >= step.rows || cell[1] < 0 || cell[1] >= step.cols) {
                    fail(ctx, `cell a rácson kívül: ${cell}`);
                }
                cellSet.add(`${cell[0]},${cell[1]}`);
            }
            if (cellSet.size !== step.cells.length) fail(ctx, "cellák ismétlődnek");
            let expected;
            if (step.mode === "area") {
                expected = step.cells.length;
            } else {
                expected = 0;
                step.cells.forEach(([r, c]) => {
                    if (!cellSet.has(`${r - 1},${c}`)) expected++;
                    if (!cellSet.has(`${r + 1},${c}`)) expected++;
                    if (!cellSet.has(`${r},${c - 1}`)) expected++;
                    if (!cellSet.has(`${r},${c + 1}`)) expected++;
                });
            }
            if (step.answer !== expected) fail(ctx, `answer (${step.answer}) != számolt (${expected}, ${step.mode})`);
            if (!Array.isArray(step.options) || !step.options.includes(step.answer)) fail(ctx, "options nem tartalmazza a választ");
            if (step.seams !== undefined) {
                if (!Array.isArray(step.seams) || step.seams.length === 0) fail(ctx, "seams üres");
                for (const seam of step.seams) {
                    if (!Array.isArray(seam) || seam.length !== 2) {
                        fail(ctx, `seam hibás: ${JSON.stringify(seam)}`);
                        continue;
                    }
                    for (const [r, c] of seam) {
                        if (!isInt(r) || !isInt(c) || r < 0 || r > step.rows || c < 0 || c > step.cols) {
                            fail(ctx, `seam a rácson kívül: ${JSON.stringify(seam)}`);
                        }
                    }
                }
            }
            break;
        }
    case "word-problem": {
            if (!["join", "remove", "part-whole", "compare", "multiply", "divide", "proportion", "remainder", "two-step"].includes(step.kind)) {
                fail(ctx, `ismeretlen kind: ${step.kind}`);
            }
            if (typeof step.text !== "string" || step.text.length === 0) fail(ctx, "text hiányzik");
            if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
            if (step.kind === "remainder") {
                for (const k of ["a", "b", "quotient", "remainder"]) {
                    if (!isInt(step[k])) fail(ctx, `${k} nem egész: ${step[k]}`);
                }
                if (step.a !== step.b * step.quotient + step.remainder) {
                    fail(ctx, `a (${step.a}) != b*q+r (${step.b}*${step.quotient}+${step.remainder})`);
                }
                if (step.remainder <= 0 || step.remainder >= step.b) {
                    fail(ctx, `remainder nincs (0,${step.b}) tartományban: ${step.remainder}`);
                }
                if (!Array.isArray(step.quotientOptions) || !step.quotientOptions.includes(step.quotient)) fail(ctx, "quotientOptions nem tartalmazza a hányadost");
                if (!Array.isArray(step.remainderOptions) || !step.remainderOptions.includes(step.remainder)) fail(ctx, "remainderOptions nem tartalmazza a maradékot");
                break;
            }
            if (!isInt(step.answer)) fail(ctx, `answer nem egész: ${step.answer}`);
            if (step.kind === "two-step") {
                if (!["add-sub", "sub-add", "mult-add"].includes(step.form ?? "add-sub")) fail(ctx, `form hibás: ${step.form}`);
                for (const k of ["a", "b", "c", "intermediate"]) {
                    if (!isInt(step[k])) fail(ctx, `${k} nem egész: ${step[k]}`);
                }
                const form = step.form ?? "add-sub";
                const expected = form === "mult-add"
                    ? step.a * step.b + step.c
                    : form === "sub-add"
                        ? step.a - step.b + step.c
                        : step.a + step.b - step.c;
                if (step.intermediate !== (form === "mult-add" ? step.a * step.b : form === "sub-add" ? step.a - step.b : step.a + step.b)) {
                    fail(ctx, `intermediate (${step.intermediate}) hibás`);
                }
                if (step.answer !== expected || step.firstAnswer !== step.intermediate) {
                    fail(ctx, `answer (${step.answer}) != számolt (${expected})`);
                }
            }
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