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

import { buildLesson } from "./builders/LessonBuilder.js?v=49";
import { generateMeasureCompare } from "./generators/measureCompareGenerator.js?v=4";
import { COMPARE_OBJECTS, COMPARE_OBJECTS_WORLD } from "./data/measure.js?v=4";
import { SKILLS } from "./data/skills.js";

const INDEX_ANSWER_TYPES = new Set(["calendar", "data-chart", "solid-shape", "polygon", "length-units"]);

const WORLDS = ["postman", "racing", "football", "cooking", "animals", "space", "tram"];
const PASSES = { postman: 12, racing: 4, football: 4, cooking: 4, animals: 4, space: 4, tram: 4 };

const PLACE_LABELS = {
    millions: "millió", hundredThousands: "százezer", tenThousands: "tízezer",
    thousands: "ezres", hundreds: "százas", tens: "tízes", ones: "egyes"
};

const PLACE_ORDER = Object.keys(PLACE_LABELS);

const POLYGON_SIDES = {
    triangle: 3,
    square: 4,
    pentagon: 5,
    hexagon: 6,
    heptagon: 7,
    octagon: 8
};

const QUAD_LABELS = ["Négyzet", "Téglalap", "Rombusz", "Paralelogramma", "Trapéz", "Deltoid"];

const QUAD_TRAITS = [
    { text: "Minden oldala egyenlő", shapes: ["square", "rhombus"] },
    { text: "Minden szöge derékszög", shapes: ["square", "rectangle"] },
    { text: "Szemközti oldalai párhuzamosak", shapes: ["square", "rectangle", "rhombus", "parallelogram"] },
    { text: "Szemközti oldalai egyenlők", shapes: ["square", "rectangle", "rhombus", "parallelogram"] },
    { text: "Szemközti szögei egyenlők", shapes: ["square", "rectangle", "rhombus", "parallelogram"] },
    { text: "Átlói egyenlő hosszúak", shapes: ["square", "rectangle"] },
    { text: "Átlói merőlegesek", shapes: ["square", "rhombus", "kite"] },
    { text: "Az átlói felezik egymást", shapes: ["square", "rectangle", "rhombus", "parallelogram"] },
    { text: "Van legalább egy pár párhuzamos oldala", shapes: ["square", "rectangle", "rhombus", "parallelogram", "trapezoid"] },
    { text: "Csak az egyik pár szemközti oldala párhuzamos", shapes: ["trapezoid"] },
    { text: "Két-két szomszédos oldala egyenlő", shapes: ["square", "rhombus", "kite"] },
    { text: "Az átlói nem metszik egymást", shapes: [] },
    { text: "Pontosan három oldala egyenlő hosszú", shapes: [] }
];

const QUAD_KIND_LABELS = {
    square: "Négyzet",
    rectangle: "Téglalap",
    rhombus: "Rombusz",
    parallelogram: "Paralelogramma",
    trapezoid: "Trapéz",
    kite: "Deltoid"
};

const QUAD_SUPERSETS = {
    square: ["rectangle", "rhombus", "parallelogram"],
    rectangle: ["parallelogram"],
    rhombus: ["parallelogram"],
    parallelogram: [],
    trapezoid: [],
    kite: []
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

function evalIntegerExpr(expr) {
    const s = String(expr).replace(/−/g, "-").replace(/\s+/g, "");
    let m = s.match(/^-\|(-?\d+)\|$/);
    if (m) return -Math.abs(Number(m[1]));
    m = s.match(/^\|(-?\d+)\|$/);
    if (m) return Math.abs(Number(m[1]));
    m = s.match(/^-\((-?\d+)\)$/);
    if (m) return -Number(m[1]);
    m = s.match(/^(-?\d+)([+\-])(\d+)$/);
    if (m) {
        const a = Number(m[1]);
        const b = Number(m[3]);
        return m[2] === "+" ? a + b : a - b;
    }
    if (/^-?\d+$/.test(s)) return Number(s);
    return null;
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
        case "pow-add": return Math.pow(b, c) + a;
        case "pow-sub": return a - Math.pow(b, c);
        case "pow-mul": return Math.pow(b, c) * a;
        case "paren-pow": return Math.pow(a + b, c);
        case "paren-pow-sub": return Math.pow(a - b, c);
        default: return null;
    }
}

const UNIT_FACTORS = {
    "km-m": 1000, "m-dm": 10, "m-cm": 100, "m-mm": 1000, "dm-cm": 10, "cm-mm": 10,
    "mm-cm": 10, "cm-dm": 10, "m-km": 1000, "cm-m": 100,
    "kg-dkg": 100, "kg-g": 1000, "dkg-g": 10,
    "g-kg": 1000, "g-dkg": 10, "dkg-kg": 100, "kg-t": 1000, "t-kg": 1000,
    "l-dl": 10, "l-cl": 100, "dl-cl": 10,
    "l-ml": 1000, "dl-ml": 100, "cl-ml": 10,
    "ml-l": 1000, "ml-dl": 100, "ml-cl": 10,
    "cl-dl": 10, "cl-l": 100, "dl-l": 10,
    "hl-l": 100, "hl-dl": 1000, "l-hl": 100, "dl-hl": 1000,
    "m²-dm²": 100, "dm²-m²": 100, "dm²-cm²": 100, "cm²-dm²": 100,
    "dm³-l": 1, "l-dm³": 1
};

function measureUnitFactor(unit, target) {
    return UNIT_FACTORS[`${unit}-${target}`] ?? null;
}

const UNIT_FAMILY = {
    length: ["km", "m", "dm", "cm", "mm"],
    weight: ["t", "kg", "dkg", "g"],
    volume: ["l", "dl", "cl", "ml", "hl"],
    area: ["m²", "dm²", "cm²"],
    capacity: ["dm³", "l"]
};

const UNIT_LADDER = {
    length: { km: 1000000, m: 1000, dm: 100, cm: 10, mm: 1 },
    weight: { t: 1000000, kg: 1000, dkg: 10, g: 1 },
    volume: { hl: 100000, l: 1000, dl: 100, cl: 10, ml: 1 },
    area: { "m²": 10000, "dm²": 100, "cm²": 1 },
    capacity: { "dm³": 1000, l: 1000 }
};

function validateComparison(ctx, step) {
    if (!isInt(step.leftValue) || step.leftValue < 1) fail(ctx, `leftValue hibás: ${step.leftValue}`);
    if (!isInt(step.rightValue) || step.rightValue < 1) fail(ctx, `rightValue hibás: ${step.rightValue}`);

    const ladder = UNIT_LADDER[step.kind];
    const leftFactor = ladder?.[step.leftUnit];
    const rightFactor = ladder?.[step.rightUnit];
    if (!leftFactor || !rightFactor) {
        fail(ctx, `ismeretlen egység: ${step.leftUnit} / ${step.rightUnit}`);
        return;
    }
    if (step.leftUnit === step.rightUnit) fail(ctx, `az oldalak egysége azonos: ${step.leftUnit}`);

    if (!["<", "=", ">"].includes(step.operator)) fail(ctx, `operator hibás: ${step.operator}`);
    if (step.answer !== step.operator) fail(ctx, `answer != operator: ${step.answer}`);

    const left = step.leftValue * leftFactor;
    const right = step.rightValue * rightFactor;
    const expected = left === right ? "=" : left > right ? ">" : "<";
    if (step.operator !== expected) {
        fail(ctx, `reláció rossz: ${step.leftValue} ${step.leftUnit} ${step.operator} ${step.rightValue} ${step.rightUnit} (valójában ${expected})`);
    }
    if (step.options !== undefined) fail(ctx, "compare módban nem kell options");
    if (step.target !== undefined) fail(ctx, "compare módban nem kell target");
}

function validateUnitChoice(ctx, step) {
    if (typeof step.answer !== "string") fail(ctx, `unit módban answer szöveg kell: ${step.answer}`);
    if (step.unit !== step.answer) fail(ctx, `answer (${step.answer}) != unit (${step.unit})`);
    if (!UNIT_FAMILY[step.kind].includes(step.answer)) {
        fail(ctx, `answer nem tartozik a ${step.kind} családhoz: ${step.answer}`);
    }
    const allowedUnits = Array.isArray(step.allowedUnits) ? step.allowedUnits : null;
    const expectedOptions = allowedUnits ? Math.min(4, allowedUnits.length) : 4;
    if (!Array.isArray(step.unitOptions) || step.unitOptions.length !== expectedOptions) {
        fail(ctx, `unitOptions elemszáma hibás: ${step.unitOptions?.length} (várt ${expectedOptions})`);
    } else {
        if (new Set(step.unitOptions).size !== expectedOptions) fail(ctx, "unitOptions ismétlődik");
        if (!step.unitOptions.includes(step.answer)) fail(ctx, "unitOptions nem tartalmazza a választ");
        step.unitOptions.forEach(u => {
            if (!UNIT_FAMILY[step.kind].includes(u)) fail(ctx, `unitOptions idegen egység: ${u}`);
            if (allowedUnits && !allowedUnits.includes(u)) {
                fail(ctx, `unitOptions a lecke engedélyezett egységen kívül: ${u}`);
            }
        });
    }
    if (typeof step.context !== "string" || !step.context.includes("____")) {
        fail(ctx, "unit módban a contextnek kitöltendő vonalat kell tartalmaznia");
    }
    if (step.options !== undefined) fail(ctx, "unit módban nem kell options");
    if (step.target !== undefined) fail(ctx, "unit módban nem kell target");
}

function validateTrueFalse(ctx, step) {
    if (typeof step.tfAnswer !== "boolean") fail(ctx, `tfAnswer nem logikai: ${step.tfAnswer}`);
    if (!isInt(step.statedAnswer) || step.statedAnswer < 1) {
        fail(ctx, `statedAnswer hibás: ${step.statedAnswer}`);
    }
    if (typeof step.statement !== "string" ||
        !step.statement.includes(String(step.statedAnswer)) ||
        !step.statement.includes(step.target)) {
        fail(ctx, `statement nem egyezik: ${step.statement}`);
    }
    if (step.tfAnswer && step.statedAnswer !== step.answer) {
        fail(ctx, `igaznak jelölt állítás hibás: ${step.statedAnswer} != ${step.answer}`);
    }
    if (!step.tfAnswer && step.statedAnswer === step.answer) {
        fail(ctx, "hamisnak jelölt állítás mégis igaz");
    }
}

function validateProbabilityCompare(ctx, step) {
    if (!["bag", "spinner"].includes(step.scenario)) fail(ctx, `scenario hibás: ${step.scenario}`);
    if (!["bigger", "smaller"].includes(step.ask)) fail(ctx, `ask hibás: ${step.ask}`);
    if (typeof step.equal !== "boolean") fail(ctx, "equal mező hibás");
    if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
    if (typeof step.successText !== "string" || step.successText.length === 0) fail(ctx, "successText hiányzik");
    if (!Array.isArray(step.groups) || step.groups.length !== 2) {
        fail(ctx, "groups nem 2 elemű");
        return;
    }
    let amountSum = 0;
    const labels = new Set();
    for (const group of step.groups) {
        if (typeof group.color !== "string" || group.color.length === 0) fail(ctx, "group.color hibás");
        if (typeof group.label !== "string" || group.label.length === 0) fail(ctx, "group.label hibás");
        if (typeof group.emoji !== "string" || group.emoji.length === 0) fail(ctx, "group.emoji hibás");
        if (typeof group.hex !== "string" || !/^#[0-9a-fA-F]{6}$/.test(group.hex)) fail(ctx, `group.hex hibás: ${group.hex}`);
        if (!isInt(group.amount) || group.amount < 1) fail(ctx, `group.amount hibás: ${group.amount}`);
        if (labels.has(group.label)) fail(ctx, "group.label ismétlődik");
        labels.add(group.label);
        amountSum += group.amount;
    }
    if (step.scenario === "spinner" && amountSum !== 8) fail(ctx, `spinner részek összege nem 8: ${amountSum}`);

    const sameAmount = step.groups[0].amount === step.groups[1].amount;
    if (step.equal !== sameAmount) fail(ctx, "equal jelző és a mennyiségek nem egyeznek");

    if (!Array.isArray(step.options)) {
        fail(ctx, "options hiányzik");
        return;
    }

    if (step.equal) {
        if (step.options.length !== 3) fail(ctx, `equal esetén 3 opció kell (${step.options.length})`);
        if (new Set(step.options).size !== step.options.length) fail(ctx, "options ismétlődik");
        for (const label of labels) {
            if (!step.options.includes(label)) fail(ctx, `options hiányzik a szín: ${label}`);
        }
        if (!step.options.includes("Ugyanolyan eséllyel")) fail(ctx, "options hiányzik az Ugyanolyan eséllyel");
        if (step.correctLabel !== "Ugyanolyan eséllyel") fail(ctx, `correctLabel hibás: ${step.correctLabel}`);
        if (step.correctColor !== null) fail(ctx, `equal esetén correctColor null kell: ${step.correctColor}`);
    } else {
        if (step.options.length !== 2) fail(ctx, `nem equal esetén 2 opció kell (${step.options.length})`);
        if (new Set(step.options).size !== 2) fail(ctx, "options ismétlődik");
        if (step.options.some(o => !labels.has(o))) fail(ctx, "options nem a színek nevei");

        const amounts = step.groups.map(g => g.amount);
        const correct = step.ask === "bigger"
            ? step.groups.find(g => g.amount === Math.max(...amounts))
            : step.groups.find(g => g.amount === Math.min(...amounts));
        if (step.correctLabel !== correct.label) fail(ctx, `correctLabel hibás: ${step.correctLabel} (várt ${correct.label})`);
        if (step.correctColor !== correct.color) fail(ctx, `correctColor hibás: ${step.correctColor}`);
    }

    if (!isInt(step.answer) || step.answer < 0 || step.answer >= step.options.length) {
        fail(ctx, `answer index hibás: ${step.answer}`);
    } else if (step.options[step.answer] !== step.correctLabel) {
        fail(ctx, `answer nem a helyes opcióra mutat: ${step.answer} (${step.options[step.answer]})`);
    }
}

function validateStep(step, ctx, range) {
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
            const NEIGHBOR_STEPS = { ten: 10, hundred: 100, thousand: 1000, tenThousand: 10000, hundredThousand: 100000 };
            if (!(step.unit in NEIGHBOR_STEPS)) fail(ctx, `unit hibás (${step.unit})`);
            const stepVal = NEIGHBOR_STEPS[step.unit];
            if (step.lower % stepVal !== 0 || step.upper % stepVal !== 0) fail(ctx, "lower/upper nem kerek");
            if (step.lower >= step.number || step.upper <= step.number) fail(ctx, "lower/upper nem szomszédok");
            if (step.upper - step.lower !== stepVal) fail(ctx, "lower/upper nem szomszédosak");
            if (step.unitLabel !== { ten: "tízes", hundred: "százas", thousand: "ezres", tenThousand: "tízezeres", hundredThousand: "százezres" }[step.unit]) fail(ctx, "unitLabel hibás");
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
            if (step.ones >= 10) fail(ctx, "a kétjegyű darabszám nem lehet egyes");
            break;
        }
        case "place-value-thousands": {
            const task = step.task ?? "expand";
            if (!isInt(step.millions) || !isInt(step.hundredThousands) || !isInt(step.tenThousands)
                || !isInt(step.thousands) || !isInt(step.hundreds) || !isInt(step.tens) || !isInt(step.ones)) {
                fail(ctx, "helyiérték számjegyei hibásak");
            }
            const recomposed = 1000000 * step.millions + 100000 * step.hundredThousands
                + 10000 * step.tenThousands + 1000 * step.thousands
                + 100 * step.hundreds + 10 * step.tens + step.ones;
            if (step.number !== undefined && step.number !== recomposed) fail(ctx, "number hibás");
            if (!isInt(step.answer)) fail(ctx, "answer hibás");
            if (!["expand", "value", "digit"].includes(task)) fail(ctx, `task hibás (${task})`);

            const placeValues = {
                millions: 1000000, hundredThousands: 100000, tenThousands: 10000,
                thousands: 1000, hundreds: 100, tens: 10, ones: 1
            };

            if (step.parts !== undefined) {
                if (!Array.isArray(step.parts) || step.parts.length < 2) fail(ctx, "parts hibás");
                if (task !== "expand") fail(ctx, "a kétjegyű darabszám csak expand feladatban lehet");
                const indices = step.parts.map(key => {
                    if (!placeValues[key]) fail(ctx, `parts helyiérték hibás (${key})`);
                    return PLACE_ORDER.indexOf(key);
                });
                if (indices.some(index => indices.indexOf(index) !== indices.lastIndexOf(index))) fail(ctx, "parts ismétlődik");
                if (indices.some((index, i) => i > 0 && index <= indices[i - 1])) fail(ctx, "parts nincs csökkenő sorrendben");
                if (step.parts.some(key => step[key] < 1)) fail(ctx, "parts null darabszámú helyet tartalmaz");
                if (step.parts.some(key => step[key] > 99)) fail(ctx, "parts darabszáma nem kétjegyű");
                if (Object.keys(placeValues).some(key => step[key] > 0 && !step.parts.includes(key))) fail(ctx, "parts nem tartalmaz minden nem nulla helyiértéket");
                if (!step.parts.some(key => step[key] >= 10)) fail(ctx, "nincs kétjegyű darabszám");
                const lead = step.parts.find(key => step[key] >= 10);
                if (lead === "ones") fail(ctx, "a kétjegyű darabszám nem lehet egyes");
                if (step.carryOn !== undefined) {
                    if (step.carryOn !== lead) fail(ctx, `carryOn hibás (${step.carryOn}, kétjegyű: ${lead})`);
                }
            }

            if (task === "expand") {
                if (step.answer !== recomposed) fail(ctx, "expand answer hibás");
            } else {
                if (!placeValues[step.place]) fail(ctx, `place hibás (${step.place})`);
                if (step.placeLabel !== PLACE_LABELS[step.place]) fail(ctx, "placeLabel hibás");
                const digit = step[step.place];
                if (task === "value") {
                    if (step.digit !== digit) fail(ctx, "digit hibás");
                    if (step.answer !== digit * placeValues[step.place]) fail(ctx, "value answer hibás");
                } else {
                    if (step.digit !== undefined) fail(ctx, "digit nem kell");
                    if (step.answer !== digit) fail(ctx, "digit answer hibás");
                }
                if (!Array.isArray(step.options) || step.options.length < 3) fail(ctx, "options hiányzik");
                if (new Set(step.options).size !== step.options.length) fail(ctx, "options ismétlődik");
                if (!step.options.includes(step.answer)) fail(ctx, "a helyes válasz nincs az opciók között");
                if (step.interaction !== "choice") fail(ctx, "a value/digit feladat választásos");
            }
            if (!["emoji", "table"].includes(step.layout)) fail(ctx, `layout hibás (${step.layout})`);
            break;
        }
        case "sequence": {
            if (!Array.isArray(step.terms) || step.terms.length < 3 || step.terms.some(t => !isInt(t))) fail(ctx, "terms hibás");
            if (!isInt(step.answer)) fail(ctx, "answer hibás");
            const diffs = step.terms.slice(1).map((t, i) => t - step.terms[i]);
            const pattern = [diffs[0], diffs[1] ?? diffs[0]];
            if (!diffs.every((d, i) => d === pattern[i % 2])) fail(ctx, "a lépések nem váltakoznak");
            const next = step.terms[step.terms.length - 1] + pattern[(step.terms.length - 1) % 2];
            if (next !== step.answer) fail(ctx, "answer nem folytatja a sort");
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
            if (!["cube", "cuboid", "cylinder", "cone", "sphere"].includes(step.solid)) fail(ctx, `solid hibás: ${step.solid}`);
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
            if (step.mode === "quadrilateral") {
                if (!["name", "property", "inclusion", "which"].includes(step.ask)) fail(ctx, `ask hibás: ${step.ask}`);
                if (!Object.keys(QUAD_KIND_LABELS).includes(step.kind)) fail(ctx, `kind hibás: ${step.kind}`);
                if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
                if (step.ask === "inclusion") {
                    if (!Object.keys(QUAD_KIND_LABELS).includes(step.target)) fail(ctx, `target hibás: ${step.target}`);
                    if (typeof step.truth !== "boolean") fail(ctx, "truth nem logikai");
                    if (QUAD_SUPERSETS[step.kind] && typeof step.truth === "boolean") {
                        const expected = QUAD_SUPERSETS[step.kind].includes(step.target);
                        if (step.truth !== expected) fail(ctx, `truth (${step.truth}) != valós tartalmazás (${expected})`);
                    }
                    if (!Array.isArray(step.options) || step.options.length !== 2) {
                        fail(ctx, "2 options kell");
                        break;
                    }
                    if (!step.options.every(o => o && typeof o.text === "string" && typeof o.correct === "boolean")) {
                        fail(ctx, "options mezők hibásak");
                    }
                    const igen = step.options.find(o => o.text === "Igen");
                    const nem = step.options.find(o => o.text === "Nem");
                    if (!igen || !nem) fail(ctx, "az inclusion options Igen/Nem kell legyen");
                    if (igen && igen.correct !== step.truth) fail(ctx, "az Igen option jelölése hibás");
                    if (nem && nem.correct !== !step.truth) fail(ctx, "a Nem option jelölése hibás");
                    if (step.answer !== (step.truth ? "Igen" : "Nem")) fail(ctx, "inclusion answer hibás");
                    break;
                }
                if (!Array.isArray(step.options) || step.options.length !== 4) {
                    fail(ctx, "4 options kell");
                    break;
                }
                if (!step.options.every(o => o && typeof o.text === "string" && typeof o.correct === "boolean")) {
                    fail(ctx, "options mezők hibásak");
                }
                if (new Set(step.options.map(o => o.text)).size !== 4) fail(ctx, "options ismétlődik");
                const correctOptions = step.options.filter(o => o.correct);
                if (correctOptions.length !== 1) fail(ctx, "pontosan 1 helyes kell");
                if (typeof step.answer !== "string") fail(ctx, `answer nem szöveg: ${step.answer}`);
                if (correctOptions[0] && correctOptions[0].text !== step.answer) {
                    fail(ctx, "a helyes option != answer");
                }
                if (step.ask === "name") {
                    if (!QUAD_LABELS.includes(step.answer)) fail(ctx, `name answer hibás: ${step.answer}`);
                    if (QUAD_KIND_LABELS[step.kind] !== step.answer) {
                        fail(ctx, `name answer (${step.answer}) != kind (${QUAD_KIND_LABELS[step.kind]})`);
                    }
                    if (!step.options.every(o => QUAD_LABELS.includes(o.text))) fail(ctx, "name options nem négyszögnevek");
                } else if (step.ask === "which") {
                    const trait = QUAD_TRAITS.find(t => t.text === step.trait);
                    if (!trait) {
                        fail(ctx, `which trait ismeretlen: ${step.trait}`);
                    } else if (!trait.shapes.includes(step.kind)) {
                        fail(ctx, `a tulajdonság nem igaz a ${step.kind} négyszögre: ${step.trait}`);
                    }
                    if (QUAD_KIND_LABELS[step.kind] !== step.answer) fail(ctx, "which answer != kind címke");
                    if (!step.options.every(o => QUAD_LABELS.includes(o.text))) fail(ctx, "which options nem négyszögnevek");
                    for (const o of step.options) {
                        if (o.correct) continue;
                        const k = Object.keys(QUAD_KIND_LABELS).find(key => QUAD_KIND_LABELS[key] === o.text);
                        if (trait && k && trait.shapes.includes(k)) {
                            fail(ctx, `a zavaró négyszögre is igaz a tulajdonság: ${o.text}`);
                        }
                    }
                } else {
                    const trait = QUAD_TRAITS.find(t => t.text === step.answer);
                    if (!trait) {
                        fail(ctx, `property answer ismeretlen tulajdonság: ${step.answer}`);
                    } else if (!trait.shapes.includes(step.kind)) {
                        fail(ctx, `a tulajdonság nem igaz a ${step.kind} négyszögre: ${step.answer}`);
                    }
                    for (const o of step.options) {
                        if (o.correct) continue;
                        const t = QUAD_TRAITS.find(tr => tr.text === o.text);
                        if (t && t.shapes.includes(step.kind)) {
                            fail(ctx, `a zavaró tulajdonság is igaz a ${step.kind} négyszögre: ${o.text}`);
                        }
                    }
                }
                break;
            }
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
        case "triangle": {
            if (!["angle-sum", "classify-sides", "inequality", "max-side", "min-side"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
            if (!Array.isArray(step.options) || step.options.length < 2) {
                fail(ctx, "options hiányos");
                break;
            }
            if (!step.options.every(o => o && typeof o.text === "string" && typeof o.correct === "boolean")) {
                fail(ctx, "options mezők hibásak");
            }
            if (new Set(step.options.map(o => o.text)).size !== step.options.length) fail(ctx, "options ismétlődik");
            const triangleCorrect = step.options.filter(o => o.correct);
            if (triangleCorrect.length !== 1) fail(ctx, "pontosan 1 helyes kell");
            if (step.mode === "angle-sum") {
                for (const k of ["a", "b"]) {
                    if (!isInt(step[k]) || step[k] < 1) fail(ctx, `${k} hibás: ${step[k]}`);
                }
                if (isInt(step.a) && isInt(step.b)) {
                    const expected = 180 - step.a - step.b;
                    if (expected <= 0 || expected >= 180) fail(ctx, `a harmadik szög hibás: ${expected}`);
                    if (step.answer !== expected) fail(ctx, `answer (${step.answer}) != 180-a-b (${expected})`);
                    if (triangleCorrect[0] && triangleCorrect[0].text !== `${expected}°`) {
                        fail(ctx, "a helyes option nem a harmadik szög");
                    }
                    if (isFiniteNum(range) && step.answer > range) fail(ctx, `answer kilép a tartományból: ${step.answer}`);
                }
                if (!step.options.every(o => /^\d+°$/.test(o.text))) fail(ctx, "options nem fokban");
            } else if (step.mode === "classify-sides") {
                for (const k of ["a", "b", "c"]) {
                    if (!isInt(step[k]) || step[k] < 1) fail(ctx, `${k} hibás: ${step[k]}`);
                }
                if (isInt(step.a) && isInt(step.b) && isInt(step.c)) {
                    const expected = step.a === step.b && step.b === step.c
                        ? "Egyenlő oldalú"
                        : step.a === step.b || step.b === step.c || step.a === step.c
                            ? "Egyenlőszárú"
                            : "Általános";
                    if (step.answer !== expected) fail(ctx, `answer (${step.answer}) != ${expected}`);
                    if (triangleCorrect[0] && triangleCorrect[0].text !== expected) {
                        fail(ctx, "a helyes option nem a besorolás");
                    }
                }
            } else if (step.mode === "max-side" || step.mode === "min-side") {
                for (const k of ["a", "b"]) {
                    if (!isInt(step[k]) || step[k] < 1) fail(ctx, `${k} hibás: ${step[k]}`);
                }
                if (isInt(step.a) && isInt(step.b)) {
                    const expected = step.mode === "max-side"
                        ? step.a + step.b - 1
                        : Math.abs(step.a - step.b) + 1;
                    if (step.answer !== expected) fail(ctx, `answer (${step.answer}) != számolt (${expected})`);
                    if (triangleCorrect[0] && triangleCorrect[0].text !== `${expected} cm`) {
                        fail(ctx, "a helyes option nem a számított hossz");
                    }
                    if (isFiniteNum(range) && step.answer > range) fail(ctx, "answer kilép a tartományból");
                }
            } else {
                for (const k of ["a", "b", "c"]) {
                    if (!isInt(step[k]) || step[k] < 1) fail(ctx, `${k} hibás: ${step[k]}`);
                }
                if (isInt(step.a) && isInt(step.b) && isInt(step.c)) {
                    const sorted = [step.a, step.b, step.c].sort((x, y) => x - y);
                    const buildable = sorted[0] + sorted[1] > sorted[2];
                    if (typeof step.answer !== "boolean") fail(ctx, "answer nem logikai");
                    else if (step.answer !== buildable) fail(ctx, `answer (${step.answer}) != szerkeszthető (${buildable})`);
                    const igen = step.options.find(o => o.text === "Igen");
                    const nem = step.options.find(o => o.text === "Nem");
                    if (!igen || !nem) fail(ctx, "az inequality options Igen/Nem kell legyen");
                    if (igen && igen.correct !== buildable) fail(ctx, "az Igen option jelölése hibás");
                    if (nem && nem.correct !== !buildable) fail(ctx, "a Nem option jelölése hibás");
                }
            }
            break;
        }
        case "pythagorean": {
            if (!["hypotenuse", "leg", "check"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
            if (!Array.isArray(step.options) || step.options.length < 2) {
                fail(ctx, "options hiányos");
                break;
            }
            if (!step.options.every(o => o && typeof o.text === "string" && typeof o.correct === "boolean")) {
                fail(ctx, "options mezők hibásak");
            }
            if (new Set(step.options.map(o => o.text)).size !== step.options.length) fail(ctx, "options ismétlődik");
            const pythCorrect = step.options.filter(o => o.correct);
            if (pythCorrect.length !== 1) fail(ctx, "pontosan 1 helyes kell");
            if (step.mode === "hypotenuse") {
                if (!isInt(step.a) || !isInt(step.b) || step.a < 1 || step.b < 1) fail(ctx, "a/b hibás");
                if (isInt(step.a) && isInt(step.b)) {
                    const expected = step.a * step.a + step.b * step.b;
                    if (step.answer * step.answer !== expected) {
                        fail(ctx, `answer (${step.answer}) nem elégíti ki a Pitagorasz-tételt`);
                    }
                    if (pythCorrect[0] && pythCorrect[0].text !== String(step.answer)) {
                        fail(ctx, "a helyes option nem az átfogó");
                    }
                }
            } else if (step.mode === "leg") {
                for (const k of ["known", "hypotenuse", "answer"]) {
                    if (!isInt(step[k]) || step[k] < 1) fail(ctx, `${k} hibás: ${step[k]}`);
                }
                if (isInt(step.known) && isInt(step.hypotenuse) && isInt(step.answer)) {
                    if (step.known * step.known + step.answer * step.answer !== step.hypotenuse * step.hypotenuse) {
                        fail(ctx, "a known/answer/hypotenuse nem Pitagorasz-hármas");
                    }
                    if (step.answer === step.known) fail(ctx, "a hiányzó befogó nem lehet egyenlő az ismerttel");
                    if (pythCorrect[0] && pythCorrect[0].text !== String(step.answer)) {
                        fail(ctx, "a helyes option nem a befogó");
                    }
                }
            } else {
                for (const k of ["a", "b", "c"]) {
                    if (!isInt(step[k]) || step[k] < 1) fail(ctx, `${k} hibás: ${step[k]}`);
                }
                if (typeof step.answer !== "boolean") fail(ctx, "answer nem logikai");
                if (isInt(step.a) && isInt(step.b) && isInt(step.c)) {
                    const right = step.a * step.a + step.b * step.b === step.c * step.c;
                    if (step.answer !== right) fail(ctx, `answer (${step.answer}) != derékszögű (${right})`);
                    const igen = step.options.find(o => o.text === "Igen");
                    const nem = step.options.find(o => o.text === "Nem");
                    if (!igen || !nem) fail(ctx, "a check options Igen/Nem kell legyen");
                    if (igen && igen.correct !== right) fail(ctx, "az Igen option jelölése hibás");
                    if (nem && nem.correct !== !right) fail(ctx, "a Nem option jelölése hibás");
                }
            }
            break;
        }
        case "similarity": {
            if (!["missing-side", "missing-side-small", "scale-factor", "area-ratio", "application"].includes(step.mode)) {
                fail(ctx, `mode hibás: ${step.mode}`);
            }
            if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
            if (!Array.isArray(step.options) || step.options.length !== 4) fail(ctx, "options nem 4 elemű");
            if (new Set(step.options).size !== step.options.length) fail(ctx, "options ismétlődik");
            if (!step.options.includes(step.answerLabel)) fail(ctx, "options nem tartalmazza a választ");
            if (step.mode === "application") {
                if (!isInt(step.scale) || step.scale <= 0) fail(ctx, "scale hibás");
                if (!isInt(step.mapCm) || step.mapCm <= 0) fail(ctx, "mapCm hibás");
                if (!isInt(step.realM) || step.realM <= 0) fail(ctx, "realM hibás");
                if (isInt(step.mapCm) && isInt(step.scale) && isInt(step.realM)) {
                    if (step.mapCm * step.scale !== step.realM * 100) fail(ctx, "a méretarány nem egyezik");
                }
                if (step.direction === "map-to-real") {
                    if (step.answer !== step.realM) fail(ctx, "answer hibás");
                    if (step.answerLabel !== `${step.realM} m`) fail(ctx, "answerLabel hibás");
                } else if (step.direction === "real-to-map") {
                    if (step.answer !== step.mapCm) fail(ctx, "answer hibás");
                    if (step.answerLabel !== `${step.mapCm} cm`) fail(ctx, "answerLabel hibás");
                } else {
                    fail(ctx, `direction hibás: ${step.direction}`);
                }
                if (isFiniteNum(range) && step.answer > range) fail(ctx, "answer kilép a tartományból");
                break;
            }
            for (const key of ["first", "second"]) {
                const fig = step[key];
                if (!fig || !Array.isArray(fig.sides) || fig.sides.length !== 3) {
                    fail(ctx, `${key}.sides hibás`);
                    continue;
                }
                if (!fig.sides.every(s => isInt(s) && s > 0)) fail(ctx, `${key}.sides nem pozitív egész`);
                if (!Array.isArray(fig.labels) || fig.labels.length !== 3) fail(ctx, `${key}.labels hibás`);
                if (fig.unknown < -1 || fig.unknown > 2) fail(ctx, `${key}.unknown hibás: ${fig.unknown}`);
                if (fig.unknown >= 0 && fig.labels[fig.unknown] !== null) {
                    fail(ctx, `${key}.labels[${fig.unknown}] nem null az ismeretlen oldalnál`);
                }
            }
            if (isInt(step.k) && step.k > 0) {
                const base = step.first.sides;
                const big = base.map(s => s * step.k);
                const unknown = step.second.unknown;
                if (step.mode === "missing-side" && unknown >= 0) {
                    if (step.answer !== big[unknown]) fail(ctx, `answer (${step.answer}) != ${big[unknown]}`);
                    if (step.answerLabel !== `${big[unknown]} cm`) fail(ctx, "answerLabel hibás");
                }
                if (step.mode === "missing-side-small" && step.first.unknown >= 0) {
                    if (step.answer !== base[step.first.unknown]) {
                        fail(ctx, `answer (${step.answer}) != ${base[step.first.unknown]}`);
                    }
                    if (step.answerLabel !== `${base[step.first.unknown]} cm`) fail(ctx, "answerLabel hibás");
                }
                if (step.mode === "scale-factor" && step.answer !== step.k) {
                    fail(ctx, `answer (${step.answer}) != hasonlítási arány (${step.k})`);
                }
            }
            break;
        }
        case "function": {
            if (!["plot", "extend", "rule", "read"].includes(step.mode)) {
                fail(ctx, `mode hibás: ${step.mode}`);
            }
            if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
            for (const k of ["xUnit", "yUnit"]) {
                if (typeof step[k] !== "string" || step[k].length === 0) fail(ctx, `${k} hiányzik`);
            }
            // lineáris-e a táblázat/pontok halmaza, és ha igen, mekkora a lépés
            const slopeOf = (rows) => {
                if (!Array.isArray(rows) || rows.length < 2) return null;
                let slope = null;
                for (let i = 1; i < rows.length; i++) {
                    const dx = rows[i].x - rows[i - 1].x;
                    const dy = rows[i].y - rows[i - 1].y;
                    if (!isInt(dx) || !isInt(dy) || dx === 0) return null;
                    const s = dy / dx;
                    if (slope === null) slope = s;
                    else if (slope !== s) return null;
                }
                return slope;
            };
            const checkChoices = () => {
                if (!Array.isArray(step.options) || step.options.length !== 4) fail(ctx, "options nem 4 elemű");
                else if (new Set(step.options).size !== step.options.length) fail(ctx, "options ismétlődik");
            };
            if (step.mode === "plot") {
                if (!Array.isArray(step.target) || step.target.length < 2) fail(ctx, "target hibás");
                for (const [x, y] of step.target ?? []) {
                    if (!isInt(x) || x < 0 || x > 8) fail(ctx, `target x a rácson kívül: ${x}`);
                    if (!isInt(y) || y < 0 || y > 9) fail(ctx, `target y a rácson kívül: ${y}`);
                }
                if (step.answer !== (step.target ?? []).length) fail(ctx, "answer != target hossz");
                if (!step.table || !Array.isArray(step.table.rows)) fail(ctx, "table hiányzik");
            } else if (step.mode === "extend") {
                const rows = step.table?.rows ?? [];
                const missing = rows.filter(r => r.y === null);
                if (missing.length !== 1) fail(ctx, `pontosan egy hiányzó érték kell, ennyi van: ${missing.length}`);
                if (!isInt(step.answer) || step.answer < 0) fail(ctx, "answer hibás");
                if (typeof range === "number" && step.answer > range) fail(ctx, "answer meghaladja a tartományt");
                const filled = rows.map(r => (r.y === null ? { x: r.x, y: step.answer } : r));
                if (slopeOf(filled) === null) fail(ctx, "a táblázat a kitöltött értékkel sem lineáris");
            } else if (step.mode === "rule") {
                const slope = slopeOf(step.table?.rows ?? []);
                if (slope === null) fail(ctx, "a táblázat nem lineáris");
                else if (step.answer !== Math.abs(slope)) fail(ctx, `answer (${step.answer}) != lépés (${Math.abs(slope)})`);
                checkChoices();
            } else if (step.mode === "read") {
                if (!Array.isArray(step.points) || step.points.length < 2) fail(ctx, "points hibás");
                const points = (step.points ?? []).map(([x, y]) => ({ x, y }));
                if (slopeOf(points) === null) fail(ctx, "a pontok nem lineárisak");
                const asked = points.find(p => p.x === step.askX);
                if (!asked) fail(ctx, "askX nincs a pontok között");
                else if (asked.y !== step.answer) fail(ctx, `answer (${step.answer}) != grafikon értéke (${asked.y})`);
                if (typeof range === "number" && step.answer > range) fail(ctx, "answer meghaladja a tartományt");
                checkChoices();
            }
            break;
        }
        case "shape-area": {
            if (!["triangle-perimeter", "triangle-area", "rectangle-perimeter", "rectangle-area", "parallelogram-area", "trapezoid-area", "rhombus-area"].includes(step.mode)) {
                fail(ctx, `mode hibás: ${step.mode}`);
            }
            if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
            let areaExpected = null;
            if (step.mode === "triangle-perimeter") {
                for (const k of ["a", "b", "c"]) {
                    if (!isInt(step[k]) || step[k] < 1) fail(ctx, `${k} hibás: ${step[k]}`);
                }
                if (isInt(step.a) && isInt(step.b) && isInt(step.c)) areaExpected = step.a + step.b + step.c;
            } else if (step.mode === "triangle-area") {
                if (!isInt(step.base) || step.base < 2 || step.base % 2 !== 0) fail(ctx, `base hibás: ${step.base}`);
                if (!isInt(step.height) || step.height < 1) fail(ctx, `height hibás: ${step.height}`);
                if (isInt(step.base) && isInt(step.height)) areaExpected = step.base * step.height / 2;
            } else if (step.mode === "rectangle-perimeter" || step.mode === "rectangle-area") {
                for (const k of ["a", "b"]) {
                    if (!isInt(step[k]) || step[k] < 1) fail(ctx, `${k} hibás: ${step[k]}`);
                }
                if (isInt(step.a) && isInt(step.b)) {
                    areaExpected = step.mode === "rectangle-perimeter" ? 2 * (step.a + step.b) : step.a * step.b;
                }
            } else if (step.mode === "trapezoid-area") {
                for (const k of ["a", "c", "height"]) {
                    if (!isInt(step[k]) || step[k] < 1) fail(ctx, `${k} hibás: ${step[k]}`);
                }
                if (isInt(step.a) && isInt(step.c) && step.a <= step.c) {
                    fail(ctx, `a (${step.a}) legyen nagyobb, mint c (${step.c})`);
                }
                if (isInt(step.a) && isInt(step.c) && isInt(step.height)) {
                    areaExpected = (step.a + step.c) * step.height / 2;
                }
            } else if (step.mode === "rhombus-area") {
                for (const k of ["e", "f"]) {
                    if (!isInt(step[k]) || step[k] < 1) fail(ctx, `${k} hibás: ${step[k]}`);
                }
                if (isInt(step.e) && isInt(step.f)) areaExpected = step.e * step.f / 2;
            } else {
                if (!isInt(step.base) || step.base < 1) fail(ctx, `base hibás: ${step.base}`);
                if (!isInt(step.height) || step.height < 1) fail(ctx, `height hibás: ${step.height}`);
                if (isInt(step.base) && isInt(step.height)) areaExpected = step.base * step.height;
            }
            if (areaExpected !== null && step.answer !== areaExpected) {
                fail(ctx, `answer (${step.answer}) != számolt (${areaExpected})`);
            }
            if (!isInt(step.answer) || step.answer < 1 || step.answer > 1000) fail(ctx, `answer kilép: ${step.answer}`);
            if (isFiniteNum(range) && step.answer > range) fail(ctx, `answer kilép a tartományból: ${step.answer} > ${range}`);
            if (!Array.isArray(step.options) || step.options.length !== 4) {
                fail(ctx, "4 options kell");
            } else {
                if (!step.options.every(o => isInt(o))) fail(ctx, "options nem egészek");
                if (new Set(step.options).size !== 4) fail(ctx, "options ismétlődik");
                if (!step.options.includes(step.answer)) fail(ctx, "options nem tartalmazza a választ");
            }
            break;
        }
        case "solid-measure": {
            if (!["cube", "cuboid"].includes(step.solid)) fail(ctx, `solid hibás: ${step.solid}`);
            if (!["surface", "volume"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            for (const k of ["a", "b", "c"]) {
                if (!isInt(step[k]) || step[k] < 3 || step[k] > 10) fail(ctx, `${k} hibás: ${step[k]}`);
            }
            if (step.solid === "cube" && !(step.a === step.b && step.b === step.c)) {
                fail(ctx, `kockánál az élek nem egyenlők: ${step.a}/${step.b}/${step.c}`);
            }
            if (step.solid === "cuboid" && step.a === step.b && step.b === step.c) {
                fail(ctx, `téglatestnél minden él egyenlő (kocka lenne): ${step.a}`);
            }
            const expectedSurface = 2 * (step.a * step.b + step.a * step.c + step.b * step.c);
            const expectedVolume = step.a * step.b * step.c;
            const expectedSolid = step.mode === "surface" ? expectedSurface : expectedVolume;
            if (step.answer !== expectedSolid) {
                fail(ctx, `answer (${step.answer}) != képlet (${expectedSolid})`);
            }
            if (!Array.isArray(step.options) || step.options.length !== 4) {
                fail(ctx, "options nem 4 elemű");
            } else {
                if (!step.options.every(o => isFiniteNum(o))) fail(ctx, "options nem számok");
                if (new Set(step.options).size !== 4) fail(ctx, "options ismétlődik");
                if (!step.options.includes(step.answer)) fail(ctx, "options nem tartalmazza a választ");
            }
            break;
        }
        case "coordinate": {
            if (!["read", "locate"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            if (!isInt(step.x) || !isInt(step.y) || step.x < 0 || step.x > 9 || step.y < 0 || step.y > 9) {
                fail(ctx, `x/y tartomány hibás: ${step.x}/${step.y}`);
            }
            if (step.mode === "read") {
                const correct = `(${step.x}; ${step.y})`;
                if (!Array.isArray(step.options) || step.options.length !== 4) {
                    fail(ctx, "options nem 4 elemű");
                } else {
                    if (!step.options.every(o => typeof o === "string" && /^\(\d; \d\)$/.test(o))) {
                        fail(ctx, "options nem koordináta-párok");
                    }
                    if (new Set(step.options).size !== 4) fail(ctx, "options ismétlődik");
                    if (!isInt(step.answer) || step.answer < 0 || step.answer >= step.options.length) {
                        fail(ctx, `answer index hibás: ${step.answer}`);
                    } else if (step.options[step.answer] !== correct) {
                        fail(ctx, `answer nem a helyes koordináta (${step.options[step.answer]} != ${correct})`);
                    }
                }
            } else {
                if (!Array.isArray(step.answer) || step.answer.length !== 2 ||
                    step.answer[0] !== step.x || step.answer[1] !== step.y) {
                    fail(ctx, `answer nem a koordináta: ${JSON.stringify(step.answer)}`);
                }
                if (step.options !== undefined) fail(ctx, "locate módban nem kell options");
            }
            break;
        }
        case "speed-trip": {
            if (!["distance", "time", "speed"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            if (!["road", "pace"].includes(step.family)) fail(ctx, `family hibás: ${step.family}`);
            if (!["choice", "input"].includes(step.interaction)) fail(ctx, `interaction ismeretlen: ${step.interaction}`);
            for (const k of ["speed", "time", "distance", "answer"]) {
                if (!isInt(step[k]) || step[k] < 1) fail(ctx, `${k} hibás: ${step[k]}`);
            }
            if (step.distance !== step.speed * step.time) {
                fail(ctx, `distance != speed*time (${step.distance} vs ${step.speed * step.time})`);
            }
            const expected = step.mode === "distance"
                ? step.speed * step.time
                : step.mode === "time"
                    ? step.distance / step.speed
                    : step.distance / step.time;
            if (step.answer !== expected) fail(ctx, `answer hibás: ${step.answer} != ${expected}`);
            if (isFiniteNum(range) && step.answer > range) fail(ctx, `answer kilép a tartományból: ${step.answer} > ${range}`);
            const units = step.family === "road"
                ? { speed: "km/h", time: "óra", distance: "km" }
                : { speed: "m/perc", time: "perc", distance: "m" };
            const questionUnit = step.mode === "distance" ? units.distance : step.mode === "time" ? units.time : units.speed;
            if (typeof step.question !== "string" || !step.question.includes(questionUnit)) {
                fail(ctx, `question nem tartalmazza a ${questionUnit} egységet: ${step.question}`);
            }
            const given = step.mode === "distance"
                ? [[step.speed, units.speed], [step.time, units.time]]
                : step.mode === "time"
                    ? [[step.distance, units.distance], [step.speed, units.speed]]
                    : [[step.distance, units.distance], [step.time, units.time]];
            if (typeof step.context !== "string" || step.context.length === 0) {
                fail(ctx, "context hiányzik");
            } else {
                for (const [value, unit] of given) {
                    if (!step.context.includes(String(value)) || !step.context.includes(unit)) {
                        fail(ctx, `context nem tartalmazza a ${value} ${unit} mennyiséget`);
                    }
                }
            }
            if (step.interaction === "choice") {
                if (!Array.isArray(step.options) || step.options.length !== 4) {
                    fail(ctx, "choice módban 4 options kell");
                } else {
                    if (new Set(step.options).size !== 4) fail(ctx, "options ismétlődik");
                    if (!step.options.includes(step.answer)) fail(ctx, "options nem tartalmazza a választ");
                }
            } else if (step.options !== undefined) {
                fail(ctx, "input módban nem kell options");
            }
            break;
        }
        case "average": {
            if (!["avg", "missing"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            if (!["table", "chart"].includes(step.display)) fail(ctx, `display hibás: ${step.display}`);
            if (!["choice", "input"].includes(step.interaction)) fail(ctx, `interaction ismeretlen: ${step.interaction}`);
            if (!Array.isArray(step.values) || step.values.length < 3 || step.values.length > 5) {
                fail(ctx, `values hibás: ${JSON.stringify(step.values)}`);
                break;
            }
            if (!step.values.every(v => isInt(v) && v >= 1 && v <= 1000)) {
                fail(ctx, `values nem pozitív egész 1..1000: ${JSON.stringify(step.values)}`);
            }
            if (!Array.isArray(step.labels) || step.labels.length !== step.values.length) {
                fail(ctx, `labels hossza nem egyezik a values-szal: ${JSON.stringify(step.labels)}`);
            }
            const sum = step.values.reduce((s, v) => s + v, 0);
            const size = step.values.length;
            if (sum % size !== 0) fail(ctx, `az összeg nem osztható az adatok számával: ${sum} / ${size}`);
            const avg = sum / size;
            if (step.avg !== avg) fail(ctx, `avg (${step.avg}) != összeg ÷ db (${avg})`);
            if (step.mode === "avg") {
                if (step.missingIndex !== undefined) fail(ctx, "avg módban nem kell missingIndex");
                if (step.answer !== avg) fail(ctx, `answer (${step.answer}) != átlag (${avg})`);
            } else {
                if (!isInt(step.missingIndex) || step.missingIndex < 0 || step.missingIndex >= size) {
                    fail(ctx, `missingIndex hibás: ${step.missingIndex}`);
                } else if (step.answer !== step.values[step.missingIndex]) {
                    fail(ctx, `answer (${step.answer}) != a hiányzó érték (${step.values[step.missingIndex]})`);
                }
                if (step.answer === step.avg) fail(ctx, "a hiányzó érték megegyezik a megadott átlaggal – a kérdés kiszúrja a választ");
            }
            if (isFiniteNum(range) && step.answer > range) fail(ctx, `answer kilép a tartományból: ${step.answer} > ${range}`);
            if (typeof step.question !== "string" || step.question.length === 0) {
                fail(ctx, "question hiányzik");
            } else if (step.mode === "missing" && !step.question.includes(String(step.avg))) {
                fail(ctx, `question nem tartalmazza a megadott átlagot (${step.avg}): ${step.question}`);
            }
            if (typeof step.context !== "string" || step.context.length === 0) fail(ctx, "context hiányzik");
            if (step.interaction === "choice") {
                if (!Array.isArray(step.options) || step.options.length !== 4) {
                    fail(ctx, "choice módban 4 options kell");
                } else {
                    if (new Set(step.options).size !== 4) fail(ctx, "options ismétlődik");
                    if (!step.options.includes(step.answer)) fail(ctx, "options nem tartalmazza a választ");
                }
            } else if (step.options !== undefined) {
                fail(ctx, "input módban nem kell options");
            }
            break;
        }
        case "integer": {
            if (!["opposite", "absolute", "compare"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            if (!["choice", "input"].includes(step.interaction)) fail(ctx, `interaction hibás: ${step.interaction}`);
            if (step.mode === "compare") {
                if (!isInt(step.leftValue) || !isInt(step.rightValue)) {
                    fail(ctx, `leftValue/rightValue hibás: ${step.leftValue}/${step.rightValue}`);
                }
                if (typeof step.leftExpr !== "string" || step.leftExpr.length === 0) fail(ctx, "leftExpr hiányzik");
                if (typeof step.rightExpr !== "string" || step.rightExpr.length === 0) fail(ctx, "rightExpr hiányzik");
                if (step.leftExpr === step.rightExpr) fail(ctx, "a két oldal kifejezése ugyanaz");
                const leftValue = evalIntegerExpr(step.leftExpr);
                const rightValue = evalIntegerExpr(step.rightExpr);
                if (leftValue === null || rightValue === null) {
                    fail(ctx, `nem értelmezhető kifejezés: ${step.leftExpr} / ${step.rightExpr}`);
                } else {
                    if (leftValue !== step.leftValue) fail(ctx, `leftExpr értéke hibás: ${step.leftExpr} -> ${leftValue}`);
                    if (rightValue !== step.rightValue) fail(ctx, `rightExpr értéke hibás: ${step.rightExpr} -> ${rightValue}`);
                }
                const expectedCompare = step.leftValue > step.rightValue ? ">" : step.leftValue < step.rightValue ? "<" : "=";
                if (step.operator !== expectedCompare) fail(ctx, `operator hibás: ${step.operator}`);
                if (step.answer !== step.operator) fail(ctx, "answer != operator");
                if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
                break;
            }
            if (!isInt(step.n) || step.n === 0) fail(ctx, `n hibás: ${step.n}`);
            const expectedValue = step.mode === "opposite" ? -step.n : Math.abs(step.n);
            if (step.answer !== expectedValue) fail(ctx, `answer (${step.answer}) != számolt (${expectedValue})`);
            if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
            if (step.interaction === "choice") {
                if (!Array.isArray(step.options) || step.options.length < 3) {
                    fail(ctx, "choice módban kevés options");
                } else {
                    if (!step.options.every(o => isInt(o))) fail(ctx, "options nem egészek");
                    if (new Set(step.options).size !== step.options.length) fail(ctx, "options ismétlődik");
                    if (!step.options.includes(step.answer)) fail(ctx, "options nem tartalmazza a választ");
                }
            } else if (step.options !== undefined) {
                fail(ctx, "input módban nem kell options");
            }
            break;
        }
        case "number-line": {
            if (!["read", "place"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            if (!["plain", "temperature", "debt"].includes(step.context)) fail(ctx, `context hibás: ${step.context}`);
            if (!["horizontal", "vertical"].includes(step.orientation)) fail(ctx, `orientation hibás: ${step.orientation}`);
            if (!isInt(step.min) || !isInt(step.max) || step.min >= step.max) fail(ctx, `min/max hibás: ${step.min}/${step.max}`);
            if (!isInt(step.value) || step.value < step.min || step.value > step.max) fail(ctx, `value hibás: ${step.value}`);
            if (step.answer !== step.value) fail(ctx, "answer != value");
            if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
            if (!isInt(step.gridStep) || step.gridStep < 1) fail(ctx, `gridStep hibás: ${step.gridStep}`);
            if (!isInt(step.labelStep) || step.labelStep < 1 || step.labelStep % step.gridStep !== 0) fail(ctx, `labelStep hibás: ${step.labelStep}`);
            if (step.min % step.labelStep !== 0 || step.max % step.labelStep !== 0) fail(ctx, "a min/max legyen a labelStep többszöröse");
            if (step.value % step.gridStep !== 0) fail(ctx, "a value legyen a gridStep többszöröse");
            if (step.mode === "read" && step.value % step.labelStep === 0) fail(ctx, "olvasásnál ne felirat legyen a válasz");
            if (step.context === "temperature" && step.orientation !== "vertical") fail(ctx, "a hőmérő legyen függőleges");
            if (step.mode === "place") {
                if (step.interaction !== "click") fail(ctx, "place módban click interaction kell");
            } else if (step.interaction === "choice") {
                if (!Array.isArray(step.options) || step.options.length < 3) {
                    fail(ctx, "choice módban kevés options");
                } else {
                    if (!step.options.every(o => isInt(o))) fail(ctx, "options nem egészek");
                    if (new Set(step.options).size !== step.options.length) fail(ctx, "options ismétlődik");
                    if (!step.options.includes(step.answer)) fail(ctx, "options nem tartalmazza a választ");
                }
            } else if (step.interaction === "input") {
                if (step.options !== undefined) fail(ctx, "input módban nem kell options");
            } else {
                fail(ctx, `interaction hibás: ${step.interaction}`);
            }
            break;
        }
        case "integer-ops": {
            if (!["add", "sub"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            if (!["plain", "temperature", "debt"].includes(step.context)) fail(ctx, `context hibás: ${step.context}`);
            if (step.operator !== "+" && step.operator !== "−") fail(ctx, `operator hibás: ${step.operator}`);
            if (!isInt(step.a) || !isInt(step.b) || step.a === 0 || step.b === 0) fail(ctx, `a/b hibás: ${step.a}/${step.b}`);
            const expected = step.operator === "+" ? step.a + step.b : step.a - step.b;
            if (step.answer !== expected) fail(ctx, `answer != a${step.operator}b: ${step.answer}`);
            if (typeof step.expression !== "string" || step.expression.length === 0) fail(ctx, "expression hiányzik");
            if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
            if (step.interaction === "choice") {
                if (!Array.isArray(step.options) || step.options.length < 3) {
                    fail(ctx, "choice módban kevés options");
                } else {
                    if (!step.options.every(o => isInt(o))) fail(ctx, "options nem egészek");
                    if (new Set(step.options).size !== step.options.length) fail(ctx, "options ismétlődik");
                    if (!step.options.includes(step.answer)) fail(ctx, "options nem tartalmazza a választ");
                }
            } else if (step.interaction === "input") {
                if (step.options !== undefined) fail(ctx, "input módban nem kell options");
            } else {
                fail(ctx, `interaction hibás: ${step.interaction}`);
            }
            break;
        }
        case "integer-muldiv": {
            if (!["mul", "div"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            if (!["plain", "temperature", "debt"].includes(step.context)) fail(ctx, `context hibás: ${step.context}`);
            if (step.operator !== "×" && step.operator !== "÷") fail(ctx, `operator hibás: ${step.operator}`);
            if (!isInt(step.a) || !isInt(step.b) || step.a === 0 || step.b === 0) fail(ctx, `a/b hibás: ${step.a}/${step.b}`);
            if (Math.abs(step.a) > 100 || Math.abs(step.b) > 100) fail(ctx, `tartomány hibás: ${step.a}/${step.b}`);
            const expected = step.operator === "×" ? step.a * step.b : step.a / step.b;
            if (!isInt(expected) || step.answer !== expected) fail(ctx, `answer != a${step.operator}b: ${step.answer}`);
            if (typeof step.expression !== "string" || step.expression.length === 0) fail(ctx, "expression hiányzik");
            if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
            if (step.interaction === "choice") {
                if (!Array.isArray(step.options) || step.options.length < 3) {
                    fail(ctx, "choice módban kevés options");
                } else {
                    if (!step.options.every(o => isInt(o))) fail(ctx, "options nem egészek");
                    if (new Set(step.options).size !== step.options.length) fail(ctx, "options ismétlődik");
                    if (!step.options.includes(step.answer)) fail(ctx, "options nem tartalmazza a választ");
                }
            } else if (step.interaction === "input") {
                if (step.options !== undefined) fail(ctx, "input módban nem kell options");
            } else {
                fail(ctx, `interaction hibás: ${step.interaction}`);
            }
            break;
        }
        case "divisibility-rule": {
            if (!["which", "with", "remainder"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
            const RULES = [2, 3, 4, 5, 6, 9, 10];
            if (step.mode === "which") {
                if (!RULES.includes(step.divisor)) fail(ctx, `divisor hibás: ${step.divisor}`);
                if (!isInt(step.answer) || step.answer < 100 || step.answer > 999 || step.answer % step.divisor !== 0) {
                    fail(ctx, `answer hibás: ${step.answer}`);
                }
                if (!Array.isArray(step.options) || step.options.length !== 4) {
                    fail(ctx, "which módban 4 options kell");
                } else {
                    if (!step.options.every(o => isInt(o.value) && typeof o.text === "string")) fail(ctx, "options mezők hibásak");
                    if (new Set(step.options.map(o => o.value)).size !== 4) fail(ctx, "options ismétlődik");
                    const correctOpts = step.options.filter(o => o.correct);
                    if (correctOpts.length !== 1) fail(ctx, "pontosan 1 helyes kell");
                    if (correctOpts[0].value !== step.answer) fail(ctx, "a helyes options != answer");
                    if (step.options.some(o => !o.correct && o.value % step.divisor === 0)) fail(ctx, "hiba: decoy osztható a választóval");
                }
            } else if (step.mode === "with") {
                if (!RULES.includes(step.divisor)) fail(ctx, `divisor hibás: ${step.divisor}`);
                if (!isInt(step.number) || step.number < 100 || step.number > 999 || step.number % step.divisor !== 0) {
                    fail(ctx, `number hibás: ${step.number}`);
                }
                if (step.answer !== step.divisor) fail(ctx, "answer != divisor");
                if (!Array.isArray(step.options) || step.options.length !== 4) {
                    fail(ctx, "with módban 4 options kell");
                } else {
                    if (!step.options.every(o => isInt(o.value) && typeof o.text === "string")) fail(ctx, "options mezők hibásak");
                    if (new Set(step.options.map(o => o.value)).size !== 4) fail(ctx, "options ismétlődik");
                    const correctOpts = step.options.filter(o => o.correct);
                    if (correctOpts.length !== 1) fail(ctx, "pontosan 1 helyes kell");
                    if (correctOpts[0].value !== step.answer) fail(ctx, "a helyes options != answer");
                    if (step.options.some(o => !o.correct && step.number % o.value === 0)) fail(ctx, "hiba: több osztó is osztható");
                }
            } else {
                if (![6, 7, 8, 9, 11, 12].includes(step.b)) fail(ctx, `b hibás: ${step.b}`);
                if (!isInt(step.a) || !isInt(step.quotient) || step.a < 100 || step.a > 999) fail(ctx, `a/quotient hibás: ${step.a}/${step.quotient}`);
                if (step.answer < 0 || step.answer >= step.b) fail(ctx, `answer (maradék) hibás: ${step.answer}`);
                if (step.a !== step.b * step.quotient + step.answer) fail(ctx, "a != b*q + r");
                if (!["input", "choice"].includes(step.interaction)) fail(ctx, `interaction hibás: ${step.interaction}`);
            }
            break;
        }
        case "divisibility": {
            if (!["multiple", "not-multiple", "divisor", "count"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            if (!isInt(step.base) || step.base < 2 || step.base > 30) fail(ctx, `base hibás: ${step.base}`);
            if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
            if (!Array.isArray(step.options) || step.options.length !== 4) {
                fail(ctx, "4 options kell");
            } else {
                if (!step.options.every(o => typeof o.text === "string" && typeof o.correct === "boolean" && isInt(Number(o.text)))) {
                    fail(ctx, "options mezők hibásak");
                }
                const correctOpts = step.options.filter(o => o.correct);
                if (correctOpts.length !== 1) fail(ctx, "pontosan 1 helyes kell");
                const cv = Number(correctOpts[0].text);
                if (step.mode === "multiple") {
                    if (cv <= 0 || cv % step.base !== 0) fail(ctx, `multiple rossz: ${cv}`);
                    if (step.options.some(o => !o.correct && Number(o.text) % step.base === 0)) fail(ctx, "decoy többszörös");
                } else if (step.mode === "not-multiple") {
                    if (cv % step.base === 0) fail(ctx, `not-multiple rossz: ${cv}`);
                    if (step.options.some(o => !o.correct && Number(o.text) % step.base !== 0)) fail(ctx, "decoy nem többszörös");
                } else if (step.mode === "divisor") {
                    if (cv <= 1 || cv >= step.base || step.base % cv !== 0) fail(ctx, `divisor rossz: ${cv}`);
                    if (step.options.some(o => !o.correct && step.base % Number(o.text) === 0)) fail(ctx, "decoy osztó");
                } else {
                    const divs = [];
                    for (let d = 1; d <= step.base; d++) if (step.base % d === 0) divs.push(d);
                    if (cv !== divs.length) fail(ctx, `count rossz: ${cv} != ${divs.length}`);
                    if (!Array.isArray(step.divisors) || step.divisors.length !== divs.length) fail(ctx, "divisors hiányos");
                    if (step.divisors.some(d => !isInt(d) || step.base % d !== 0)) fail(ctx, "divisors hibás");
                }
            }
            break;
        }
        case "power": {
            if (!["square", "cube", "notation", "base"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            if (!isInt(step.base) || step.base < 2 || step.base > 40) fail(ctx, `base hibás: ${step.base}`);
            if (![2, 3].includes(step.exponent)) fail(ctx, `exponent hibás: ${step.exponent}`);
            if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
            if (typeof step.display !== "string" || step.display.length === 0) fail(ctx, "display hiányzik");
            const SUP = { 2: "²", 3: "³" };
            const expected = step.base ** step.exponent;
            if (step.mode === "notation") {
                if (typeof step.answer !== "string") fail(ctx, `notation answer nem szöveg: ${step.answer}`);
                if (step.answer !== `${step.base}${SUP[step.exponent]}`) fail(ctx, `notation answer hibás: ${step.answer}`);
                if (!step.display.includes(String(step.base))) fail(ctx, "notation display nem tartalmazza az alapot");
            } else if (step.mode === "base") {
                if (step.value !== expected) fail(ctx, `value (${step.value}) != base^exp (${expected})`);
                if (step.answer !== step.base) fail(ctx, `answer (${step.answer}) != base (${step.base})`);
                if (isFiniteNum(range) && step.value > range) fail(ctx, `value kilép a tartományból: ${step.value} > ${range}`);
            } else {
                if (step.answer !== expected) fail(ctx, `answer (${step.answer}) != base^exp (${expected})`);
                if (step.display !== `${step.base}${SUP[step.exponent]}`) fail(ctx, `display nem a hatványjelölés: ${step.display}`);
                if (isFiniteNum(range) && step.answer > range) fail(ctx, `answer kilép a tartományból: ${step.answer} > ${range}`);
            }
            if (!Array.isArray(step.options) || step.options.length !== 4) {
                fail(ctx, "4 options kell");
            } else {
                if (!step.options.every(o => o && typeof o.text === "string" && typeof o.correct === "boolean")) fail(ctx, "options mezők hibásak");
                if (new Set(step.options.map(o => o.text)).size !== 4) fail(ctx, "options ismétlődik");
                const correctOptions = step.options.filter(o => o.correct);
                if (correctOptions.length !== 1) fail(ctx, "pontosan 1 helyes kell");
                else if (correctOptions[0].text !== String(step.answer)) fail(ctx, "a helyes options != answer");
            }
            break;
        }
        case "power-ten": {
            if (!["value", "zeros", "power", "name"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            if (!isInt(step.exponent) || step.exponent < 1 || step.exponent > 6) fail(ctx, `exponent hibás: ${step.exponent}`);
            if (step.value !== 10 ** step.exponent) fail(ctx, `value (${step.value}) != 10^exp (${10 ** step.exponent})`);
            if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
            const PT_SUP = { 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶" };
            const PT_NAME = { 1: "tíz", 2: "száz", 3: "ezer", 4: "tízezer", 5: "százezer", 6: "millió" };
            if (step.mode === "value") {
                if (step.answer !== step.value) fail(ctx, `answer (${step.answer}) != 10^exp (${step.value})`);
                if (isFiniteNum(range) && step.answer > range) fail(ctx, `answer kilép a tartományból: ${step.answer} > ${range}`);
            } else if (step.mode === "zeros") {
                if (step.answer !== step.exponent) fail(ctx, `answer (${step.answer}) != exponent (${step.exponent})`);
            } else if (step.mode === "power") {
                if (typeof step.answer !== "string") fail(ctx, `power answer nem szöveg: ${step.answer}`);
                if (step.answer !== `10${PT_SUP[step.exponent]}`) fail(ctx, `power answer hibás: ${step.answer}`);
            } else {
                if (step.answer !== PT_NAME[step.exponent]) fail(ctx, `name answer hibás: ${step.answer}`);
            }
            if (!Array.isArray(step.options) || step.options.length !== 4) {
                fail(ctx, "4 options kell");
            } else {
                if (!step.options.every(o => o && typeof o.text === "string" && typeof o.correct === "boolean")) fail(ctx, "options mezők hibásak");
                if (new Set(step.options.map(o => o.text)).size !== 4) fail(ctx, "options ismétlődik");
                const correctOptions = step.options.filter(o => o.correct);
                if (correctOptions.length !== 1) fail(ctx, "pontosan 1 helyes kell");
                else if (correctOptions[0].text !== String(step.answer)) fail(ctx, "a helyes options != answer");
            }
            break;
        }
        case "fraction-line": {
            if (!["read", "place", "to-mixed", "to-fraction"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            if (!isInt(step.den) || step.den < 2 || step.den > 8) fail(ctx, `den hibás: ${step.den}`);
            if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
            if (step.mode === "read" || step.mode === "place") {
                if (!isInt(step.num) || step.num < 1 || step.num > 20) fail(ctx, `num hibás: ${step.num}`);
                if (step.num % step.den === 0) fail(ctx, "num egész szám");
                if (!isInt(step.max) || step.max < Math.ceil(step.num / step.den)) fail(ctx, `max hibás: ${step.max}`);
            }
            if (step.mode !== "place") {
                if (!Array.isArray(step.options) || step.options.length !== 4) {
                    fail(ctx, "4 options kell");
                } else if (!step.options.every(o => o && isInt(o.denominator) && isInt(o.numerator))) {
                    fail(ctx, "options numerator/denominator hibás");
                } else {
                    const correct = step.options.filter(o => o.correct);
                    if (correct.length !== 1) fail(ctx, "pontosan 1 helyes kell");
                }
            }
            if (step.mode === "read") {
                const correct = step.options.find(o => o.correct);
                if (correct && (correct.numerator !== step.num || correct.denominator !== step.den)) {
                    fail(ctx, "a helyes option nem a jelölt tört");
                }
                const values = step.options.map(o => o.numerator / o.denominator);
                if (new Set(values).size !== 4) fail(ctx, "options értéke ismétlődik");
                for (const o of step.options) {
                    if (o.numerator < 1 || o.numerator >= step.max * step.den || o.numerator > 20) {
                        fail(ctx, `read option numerator kilép: ${o.numerator}`);
                    }
                }
            }
            if (step.mode === "place" && step.answer !== step.num) {
                fail(ctx, "place answer != num");
            }
            if (step.mode === "to-mixed") {
                if (!isInt(step.whole) || !isInt(step.rem)) fail(ctx, "whole/rem hiányzik");
                if (step.whole !== Math.floor(step.num / step.den)) fail(ctx, "whole hibás");
                if (step.rem !== step.num % step.den) fail(ctx, "rem hibás");
                const correct = step.options.find(o => o.correct);
                if (correct && (correct.whole !== step.whole || correct.numerator !== step.rem || correct.denominator !== step.den)) {
                    fail(ctx, "a helyes mixed option hibás");
                }
                const values = step.options.map(o => o.whole + o.numerator / o.denominator);
                if (new Set(values).size !== 4) fail(ctx, "options értéke ismétlődik");
                for (const o of step.options) {
                    if (!isInt(o.whole) || o.whole < 1) fail(ctx, `mixed egész hibás: ${JSON.stringify(o)}`);
                    if (!isInt(o.numerator) || o.numerator < 1 || o.numerator >= o.denominator) {
                        fail(ctx, `mixed tört hibás: ${JSON.stringify(o)}`);
                    }
                    if (o.whole * o.denominator + o.numerator > 20) fail(ctx, `mixed kilép 20-ból: ${JSON.stringify(o)}`);
                }
            }
            if (step.mode === "to-fraction") {
                if (!isInt(step.whole) || !isInt(step.rem)) fail(ctx, "whole/rem hiányzik");
                if (step.num !== step.whole * step.den + step.rem) fail(ctx, `num hibás: ${step.num}`);
                const correct = step.options.find(o => o.correct);
                if (correct && (correct.numerator !== step.num || correct.denominator !== step.den)) {
                    fail(ctx, "a helyes option nem az áltört");
                }
                const values = step.options.map(o => o.numerator / o.denominator);
                if (new Set(values).size !== 4) fail(ctx, "options értéke ismétlődik");
                for (const o of step.options) {
                    if (o.numerator < 1) fail(ctx, `to-fraction numerator hibás: ${o.numerator}`);
                }
            }
            break;
        }
        case "fraction-decimal": {
            if (!["fraction-to-decimal", "decimal-to-fraction"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            if (!isInt(step.hundredths) || step.hundredths < 1 || step.hundredths > 99) fail(ctx, `hundredths hibás: ${step.hundredths}`);
            const gcd = (a, b) => (b ? gcd(b, a % b) : a);
            if (!isInt(step.numerator) || !isInt(step.denominator)) {
                fail(ctx, "numerator/denominator hibás");
            } else {
                if (step.denominator < 2) fail(ctx, `denominator hibás: ${step.denominator}`);
                if (step.numerator < 1 || step.numerator >= step.denominator) fail(ctx, `numerator hibás: ${step.numerator}`);
                if (gcd(step.numerator, step.denominator) !== 1) fail(ctx, "a tört nem legegyszerűbb");
                if (step.numerator * 100 !== step.denominator * step.hundredths) {
                    fail(ctx, `a tört értéke nem ${step.hundredths}/100`);
                }
            }
            const expectedDecimal = step.hundredths % 10 === 0
                ? `0,${step.hundredths / 10}`
                : `0,${String(step.hundredths).padStart(2, "0")}`;
            if (step.decimal !== expectedDecimal) fail(ctx, `decimal hibás: ${step.decimal} != ${expectedDecimal}`);
            const expanded = step.expanded;
            if (!expanded || !isInt(expanded.numerator) || !isInt(expanded.denominator)) {
                fail(ctx, "expanded hibás");
            } else if (step.hundredths % 10 === 0) {
                if (expanded.numerator !== step.hundredths / 10 || expanded.denominator !== 10) fail(ctx, "expanded (tized) hibás");
            } else if (expanded.numerator !== step.hundredths || expanded.denominator !== 100) {
                fail(ctx, "expanded (század) hibás");
            }
            if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
            if (!Array.isArray(step.options) || step.options.length !== 4) {
                fail(ctx, "4 options kell");
            } else {
                if (step.options.filter(o => o.correct).length !== 1) fail(ctx, "pontosan 1 helyes kell");
                if (step.mode === "fraction-to-decimal") {
                    if (!step.options.every(o => o && typeof o.text === "string" && typeof o.correct === "boolean")) fail(ctx, "options mezők hibásak");
                    if (new Set(step.options.map(o => o.text)).size !== 4) fail(ctx, "options ismétlődik");
                    const correct = step.options.find(o => o.correct);
                    if (correct && correct.text !== step.decimal) fail(ctx, "a helyes option nem a tizedes tört");
                    if (step.answer !== step.decimal) fail(ctx, "answer hibás");
                } else {
                    if (!step.options.every(o => o && isInt(o.numerator) && isInt(o.denominator))) fail(ctx, "options numerator/denominator hibás");
                    const correct = step.options.find(o => o.correct);
                    if (correct && (correct.numerator !== step.numerator || correct.denominator !== step.denominator)) {
                        fail(ctx, "a helyes option nem a legegyszerűbb tört");
                    }
                    const values = step.options.map(o => o.numerator / o.denominator);
                    if (new Set(values).size !== 4) fail(ctx, "options értéke ismétlődik");
                    for (const o of step.options) {
                        if (o.numerator < 1 || o.numerator >= o.denominator) fail(ctx, `option tört kilép: ${o.text}`);
                    }
                    if (step.answer !== `${step.numerator}/${step.denominator}`) fail(ctx, "answer hibás");
                }
            }
            break;
        }
        case "fraction-muldiv": {
            if (!["times", "divide"].includes(step.op)) fail(ctx, `op hibás: ${step.op}`);
            if (!["whole", "fraction"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            const gcd = (a, b) => (b ? gcd(b, a % b) : a);

            const left = step.left;
            if (!left || !isInt(left.numerator) || !isInt(left.denominator)) {
                fail(ctx, "left hibás");
            } else if (left.denominator < 2 || left.numerator < 1 || left.numerator >= left.denominator) {
                fail(ctx, `left kilép: ${left.numerator}/${left.denominator}`);
            }

            const right = step.right;
            if (!right) {
                fail(ctx, "right hiányzik");
            } else if (step.mode === "whole") {
                if (!isInt(right.whole) || right.whole < 2) fail(ctx, `right.whole hibás: ${right.whole}`);
            } else if (!isInt(right.numerator) || !isInt(right.denominator)
                || right.denominator < 2 || right.numerator < 1 || right.numerator >= right.denominator) {
                fail(ctx, `right kilép: ${right.numerator}/${right.denominator}`);
            }

            if (left && right && isInt(left.numerator) && isInt(left.denominator)) {
                let rawNum = 0;
                let rawDen = 0;
                if (step.op === "times" && step.mode === "whole") {
                    rawNum = left.numerator * right.whole;
                    rawDen = left.denominator;
                } else if (step.op === "divide" && step.mode === "whole") {
                    rawNum = left.numerator;
                    rawDen = left.denominator * right.whole;
                } else if (step.op === "times" && step.mode === "fraction") {
                    rawNum = left.numerator * right.numerator;
                    rawDen = left.denominator * right.denominator;
                } else {
                    rawNum = left.numerator * right.denominator;
                    rawDen = left.denominator * right.numerator;
                }

                if (step.rawNum !== rawNum || step.rawDen !== rawDen) {
                    fail(ctx, `raw hibás: ${step.rawNum}/${step.rawDen} != ${rawNum}/${rawDen}`);
                }

                const g = gcd(rawNum, rawDen);
                const answerNum = rawNum / g;
                const answerDen = rawDen / g;

                if (answerDen === 1) fail(ctx, "az eredmény nem lehet egész szám");
                if (step.answerNum !== answerNum || step.answerDen !== answerDen) {
                    fail(ctx, `answer hibás: ${step.answerNum}/${step.answerDen} != ${answerNum}/${answerDen}`);
                }

                if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
                if (typeof step.hint !== "string" || step.hint.length === 0) fail(ctx, "hint hiányzik");
                if (typeof step.explanation !== "string" || step.explanation.length === 0) fail(ctx, "explanation hiányzik");

                if (!Array.isArray(step.options) || step.options.length !== 4) {
                    fail(ctx, "4 options kell");
                } else if (!step.options.every(o => o && isInt(o.numerator) && isInt(o.denominator))) {
                    fail(ctx, "options numerator/denominator hibás");
                } else {
                    if (step.options.filter(o => o.correct).length !== 1) fail(ctx, "pontosan 1 helyes kell");
                    const correct = step.options.find(o => o.correct);
                    if (correct && (correct.numerator !== answerNum || correct.denominator !== answerDen)) {
                        fail(ctx, "a helyes option nem a legegyszerűbb eredmény");
                    }
                    const values = step.options.map(o => o.numerator / o.denominator);
                    if (new Set(values).size !== 4) fail(ctx, "options értéke ismétlődik");
                    for (const o of step.options) {
                        if (o.numerator < 1 || o.denominator < 2) fail(ctx, `option kilép: ${o.numerator}/${o.denominator}`);
                        if (o.numerator > o.denominator * 3) fail(ctx, `option túl nagy: ${o.numerator}/${o.denominator}`);
                    }
                }
            }
            break;
        }
        case "fraction-percent": {
            const gcd = (a, b) => (b ? gcd(b, a % b) : a);
            const allowedDenoms = [2, 4, 5, 10, 20, 25, 50];

            if (!["to-percent", "from-percent"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            if (!["fraction", "percent", "ratio"].includes(step.given)) fail(ctx, `given hibás: ${step.given}`);
            if (!["fraction", "percent", "ratio"].includes(step.target)) fail(ctx, `target hibás: ${step.target}`);
            if (step.given === step.target) fail(ctx, "given és target nem lehet ugyanaz");

            const n = step.numerator;
            const d = step.denominator;
            if (!isInt(n) || !isInt(d)) {
                fail(ctx, "numerator/denominator hibás");
            } else {
                if (d < 2 || n < 1 || n >= d) fail(ctx, `tört kilép: ${n}/${d}`);
                if (!allowedDenoms.includes(d)) fail(ctx, `nevező kilép: ${d}`);
                if (gcd(n, d) !== 1) fail(ctx, `a tört nem legegyszerűbb: ${n}/${d}`);
            }

            const expectedPercent = 100 * n / d;
            if (!Number.isInteger(expectedPercent)) fail(ctx, `százalék nem egész: ${expectedPercent}`);
            if (step.percent !== expectedPercent) fail(ctx, `percent hibás: ${step.percent} != ${expectedPercent}`);

            if (step.mode === "to-percent") {
                if (step.target !== "percent") fail(ctx, "to-percent esetén target percent kell");
                if (!["fraction", "ratio"].includes(step.given)) fail(ctx, "to-percent esetén given fraction vagy ratio kell");
            } else {
                if (step.given !== "percent") fail(ctx, "from-percent esetén given percent kell");
                if (!["fraction", "ratio"].includes(step.target)) fail(ctx, "from-percent esetén target fraction vagy ratio kell");
            }

            if (!step.ratio || step.ratio.part !== n || step.ratio.whole !== d) fail(ctx, "ratio hibás");

            if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
            if (typeof step.hint !== "string" || step.hint.length === 0) fail(ctx, "hint hiányzik");
            if (typeof step.explanation !== "string" || step.explanation.length === 0) fail(ctx, "explanation hiányzik");

            if (!Array.isArray(step.options) || step.options.length !== 4) {
                fail(ctx, "4 options kell");
            } else if (step.options.filter(o => o.correct).length !== 1) {
                fail(ctx, "pontosan 1 helyes kell");
            } else if (step.target === "percent") {
                if (!step.options.every(o => isInt(o.percent))) fail(ctx, "options percent hibás");
                const correct = step.options.find(o => o.correct);
                if (correct && correct.percent !== step.percent) fail(ctx, "a helyes percent hibás");
                const values = step.options.map(o => o.percent);
                if (new Set(values).size !== 4) fail(ctx, "options százaléka ismétlődik");
                for (const o of step.options) {
                    if (o.percent < 1 || o.percent > 99) fail(ctx, `option kilép: ${o.percent}%`);
                    if (o.text !== `${o.percent}%`) fail(ctx, `option szöveg hibás: ${o.text}`);
                }
            } else if (step.target === "fraction") {
                if (!step.options.every(o => isInt(o.numerator) && isInt(o.denominator))) fail(ctx, "options numerator/denominator hibás");
                const correct = step.options.find(o => o.correct);
                if (correct && (correct.numerator !== n || correct.denominator !== d)) fail(ctx, "a helyes option nem a legegyszerűbb tört");
                const values = step.options.map(o => o.numerator / o.denominator);
                if (new Set(values).size !== 4) fail(ctx, "options értéke ismétlődik");
                for (const o of step.options) {
                    if (o.numerator < 1 || o.numerator >= o.denominator) fail(ctx, `option kilép: ${o.numerator}/${o.denominator}`);
                    if (gcd(o.numerator, o.denominator) !== 1) fail(ctx, `option nem legegyszerűbb: ${o.numerator}/${o.denominator}`);
                }
            } else {
                if (!step.options.every(o => isInt(o.part) && isInt(o.whole))) fail(ctx, "options part/whole hibás");
                const correct = step.options.find(o => o.correct);
                if (correct && (correct.part !== n || correct.whole !== d)) fail(ctx, "a helyes arány hibás");
                const texts = step.options.map(o => o.text);
                if (new Set(texts).size !== 4) fail(ctx, "options szövege ismétlődik");
                for (const o of step.options) {
                    if (o.part < 1 || o.whole < 2) fail(ctx, `option kilép: ${o.part} : ${o.whole}`);
                    if (o.text !== `${o.part} : ${o.whole}`) fail(ctx, `option szöveg hibás: ${o.text}`);
                }
                for (const o of step.options) {
                    if (o.correct) continue;
                    if (o.part * d === o.whole * n) fail(ctx, `option egyenértékű a helyessel: ${o.text}`);
                }
            }
            break;
        }
        case "transform": {
            if (!["turn", "translate"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            const checkCells = cells => {
                if (!Array.isArray(cells) || cells.length === 0) return false;
                const seen = new Set();
                for (const cell of cells) {
                    if (!Array.isArray(cell) || cell.length !== 2 || !isInt(cell[0]) || !isInt(cell[1])) return false;
                    if (cell[0] < 0 || cell[0] > 3 || cell[1] < 0 || cell[1] > 3) return false;
                    seen.add(`${cell[0]},${cell[1]}`);
                }
                return seen.size === cells.length;
            };
            const cellsKey = cells => JSON.stringify([...cells].sort());
            if (!checkCells(step.base)) fail(ctx, `base hibás: ${JSON.stringify(step.base)}`);
            if (!Array.isArray(step.options) || step.options.length < 2) {
                fail(ctx, "options hiányos");
            } else {
                step.options.forEach((cells, i) => {
                    if (!checkCells(cells)) fail(ctx, `options[${i}] hibás: ${JSON.stringify(cells)}`);
                });
            }
            if (!isInt(step.answer) || step.answer < 0 || step.answer >= (step.options?.length ?? 0)) {
                fail(ctx, `answer index hibás: ${step.answer}`);
            }
            if (step.mode === "translate") {
                const s = step.shift;
                if (!s || !isInt(s.dx) || !isInt(s.dy) || (s.dx === 0 && s.dy === 0)) {
                    fail(ctx, `shift hibás: ${JSON.stringify(s)}`);
                }
                if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
                if (s && isInt(s.dx) && isInt(s.dy) && Array.isArray(step.options) &&
                    isInt(step.answer) && step.answer < step.options.length) {
                    const moved = step.base.map(([x, y]) => [x + s.dx, y + s.dy]);
                    if (cellsKey(moved) !== cellsKey(step.options[step.answer])) {
                        fail(ctx, "answer nem az eltolott minta");
                    }
                    for (const [x, y] of moved) {
                        if (x < 0 || x > 3 || y < 0 || y > 3) fail(ctx, `eltolt alakzat a rácsra esik: ${x},${y}`);
                    }
                }
            }
            break;
        }
        case "true-false": {
            if (typeof step.statement !== "string" || step.statement.length === 0) fail(ctx, "statement hiányzik");
            if (typeof step.answer !== "boolean") fail(ctx, "answer nem boolean");
            break;
        }
        case "open-sentence": {
            if (!["add", "sub", "mul", "div"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            if (!isInt(step.a) || step.a < 2) fail(ctx, `a hibás: ${step.a}`);
            if (!isInt(step.value) || step.value < 1) fail(ctx, `value hibás: ${step.value}`);
            if (!isInt(step.left) || !isInt(step.right)) fail(ctx, "left/right nem egész");
            const expectedLeft = step.mode === "add"
                ? step.value + step.a
                : step.mode === "sub"
                    ? step.value - step.a
                    : step.mode === "mul"
                        ? step.a * step.value
                        : step.value / step.a;
            if (step.left !== expectedLeft) fail(ctx, `left (${step.left}) != számolt (${expectedLeft})`);
            if (typeof step.answer !== "boolean") fail(ctx, "answer nem boolean");
            if (step.answer !== (step.left === step.right)) fail(ctx, "answer != (left == right)");
            if (typeof step.sentence !== "string" || !step.sentence.includes("x")) fail(ctx, "sentence hibás");
            if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
            if (isFiniteNum(range) && (step.right > range || step.value > range || step.left > range)) {
                fail(ctx, `kilép a tartományból: left=${step.left} right=${step.right} value=${step.value}`);
            }
            break;
        }
        case "equation": {
            if (!["add", "sub", "mul", "div", "two-step", "both-sides", "paren", "fraction-add", "fraction-div"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            if (typeof step.equation !== "string" || !step.equation.includes("x")) fail(ctx, "equation hibás");
            if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
            let expected = null;
            if (step.mode === "add") {
                if (!isInt(step.a) || !isInt(step.c)) fail(ctx, "a/c hibás");
                else expected = step.c - step.a;
            } else if (step.mode === "sub") {
                if (!isInt(step.a) || !isInt(step.c)) fail(ctx, "a/c hibás");
                else expected = step.c + step.a;
            } else if (step.mode === "mul") {
                if (!isInt(step.a) || !isInt(step.c) || step.a === 0) fail(ctx, "a/c hibás");
                else expected = step.c / step.a;
            } else if (step.mode === "div") {
                if (!isInt(step.a) || !isInt(step.c)) fail(ctx, "a/c hibás");
                else expected = step.a * step.c;
            } else if (step.mode === "both-sides") {
                if (!isInt(step.a) || !isInt(step.b) || !isInt(step.c) || !isInt(step.d) || step.a === step.c) fail(ctx, "a/b/c/d hibás");
                else expected = (step.d - step.b) / (step.a - step.c);
            } else if (step.mode === "paren") {
                if (!["add", "sub"].includes(step.form)) fail(ctx, `form hibás: ${step.form}`);
                if (!isInt(step.a) || !isInt(step.b) || !isInt(step.c) || step.a === 0) fail(ctx, "a/b/c hibás");
                else expected = step.form === "add" ? step.c / step.a - step.b : step.c / step.a + step.b;
            } else if (step.mode === "fraction-add") {
                if (!isInt(step.a) || !isInt(step.b) || !isInt(step.c) || step.a === 0) fail(ctx, "a/b/c hibás");
                else expected = step.a * (step.c - step.b);
            } else if (step.mode === "fraction-div") {
                if (!isInt(step.a) || !isInt(step.b) || !isInt(step.c) || step.a === 0) fail(ctx, "a/b/c hibás");
                else expected = step.a * step.c - step.b;
            } else {
                if (!["mul-add", "mul-sub"].includes(step.form)) fail(ctx, `form hibás: ${step.form}`);
                if (!isInt(step.a) || !isInt(step.b) || !isInt(step.c) || step.a === 0) fail(ctx, "a/b/c hibás");
                else expected = step.form === "mul-add" ? (step.c - step.b) / step.a : (step.c + step.b) / step.a;
            }
            if (expected !== null && step.answer !== expected) fail(ctx, `answer (${step.answer}) != számolt (${expected})`);
            if (!isInt(step.answer) || step.answer < 1) fail(ctx, `answer nem pozitív egész: ${step.answer}`);
            if (isFiniteNum(range) && step.answer > range) fail(ctx, `answer kilép a tartományból: ${step.answer}`);
            break;
        }
        case "inequality": {
            const INEQ_OPPOSITE = { ">": "<", "<": ">", "≥": "≤", "≤": "≥" };
            if (!["read", "choose", "solve", "linear", "linear-line"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            if (![">", "<", "≥", "≤"].includes(step.relation)) fail(ctx, `relation hibás: ${step.relation}`);
            if (!isInt(step.bound) || step.bound < 1 || step.bound > 9) fail(ctx, `bound hibás: ${step.bound}`);
            if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
            if (!Array.isArray(step.options) || step.options.length !== 4) {
                fail(ctx, `options hibás: ${step.options?.length}`);
                break;
            }
            const correctCount = step.options.filter(o => o && o.correct).length;
            if (correctCount !== 1) fail(ctx, `${correctCount} helyes opció (1 kellene)`);
            const lineMode = step.mode === "choose" || step.mode === "linear-line";
            if (lineMode) {
                if (new Set(step.options.map(o => `${o.relation}|${o.bound}`)).size !== 4) fail(ctx, "a számegyenes opciók ismétlődnek");
                for (const o of step.options) {
                    if (![">", "<", "≥", "≤"].includes(o.relation)) fail(ctx, `opció relation hibás: ${o.relation}`);
                    if (!isInt(o.bound) || o.bound < 0 || o.bound > 10) fail(ctx, `opció bound hibás: ${o.bound}`);
                }
                const correct = step.options.find(o => o.correct);
                if (correct.relation !== step.relation || correct.bound !== step.bound) fail(ctx, "a helyes opció hibás");
                if (step.mode === "choose") {
                    for (const o of step.options) {
                        if (o.bound !== step.bound) fail(ctx, `opció bound hibás: ${o.bound}`);
                    }
                }
            } else {
                if (new Set(step.options.map(o => o.text)).size !== 4) fail(ctx, "a szöveges opciók ismétlődnek");
                const expectedText = `x ${step.relation} ${step.bound}`;
                const correct = step.options.find(o => o.correct);
                if (correct.text !== expectedText) fail(ctx, `a helyes opció hibás: ${correct.text} != ${expectedText}`);
            }
            if (step.mode === "solve") {
                if (!isInt(step.a) || step.a < 1) fail(ctx, `a hibás: ${step.a}`);
                if (step.expression !== `x + ${step.a} ${step.relation} ${step.bound + step.a}`) {
                    fail(ctx, `expression hibás: ${step.expression}`);
                }
            }
            if (step.mode === "linear" || step.mode === "linear-line") {
                if (!isInt(step.a) || step.a === 0 || Math.abs(step.a) < 2 || Math.abs(step.a) > 5) fail(ctx, `a hibás: ${step.a}`);
                if (!isInt(step.b) || step.b < 1) fail(ctx, `b hibás: ${step.b}`);
                if (!isInt(step.c)) fail(ctx, `c hibás: ${step.c}`);
                if (![">", "<", "≥", "≤"].includes(step.sourceRelation)) fail(ctx, `sourceRelation hibás: ${step.sourceRelation}`);
                const expectedSource = step.a > 0 ? step.relation : INEQ_OPPOSITE[step.relation];
                if (step.sourceRelation !== expectedSource) fail(ctx, `sourceRelation hibás: ${step.sourceRelation} != ${expectedSource}`);
                if (step.c !== step.a * step.bound + step.b) fail(ctx, `c (${step.c}) != a*bound+b (${step.a * step.bound + step.b})`);
                const coef = step.a > 0 ? `${step.a}x` : `−${Math.abs(step.a)}x`;
                const cText = step.c < 0 ? `−${Math.abs(step.c)}` : `${step.c}`;
                const expectedExpression = `${coef} + ${step.b} ${step.sourceRelation} ${cText}`;
                if (step.expression !== expectedExpression) fail(ctx, `expression hibás: ${step.expression} != ${expectedExpression}`);
            }
            break;
        }
        case "ratio": {
            if (!["write", "simplify", "missing"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
            if (!Array.isArray(step.options) || step.options.length !== 4) {
                fail(ctx, `4 options kell (${step.options?.length})`);
                break;
            }
            if (!step.options.every(o => o && typeof o.text === "string" && typeof o.correct === "boolean")) {
                fail(ctx, "options mezők hibásak");
            }
            if (new Set(step.options.map(o => o.text)).size !== 4) fail(ctx, "options ismétlődik");
            const correctOptions = step.options.filter(o => o.correct);
            if (correctOptions.length !== 1) fail(ctx, "pontosan 1 helyes kell");

            const gcdRatio = (a, b) => (b ? gcdRatio(b, a % b) : a);

            if (step.mode === "write") {
                if (!isInt(step.a) || !isInt(step.b) || step.a < 1 || step.b < 1) fail(ctx, `a/b hibás: ${step.a}/${step.b}`);
                if (step.a === step.b) fail(ctx, "a === b");
                if (step.answer !== `${step.a} : ${step.b}`) fail(ctx, `answer hibás: ${step.answer}`);
                if (correctOptions[0]?.text !== step.answer) fail(ctx, "a helyes option nem a felírt arány");
                if (!step.options.some(o => !o.correct && o.text === `${step.b} : ${step.a}`)) {
                    fail(ctx, "nincs megfordított arány a zavarók között");
                }
                for (const k of ["leftEmoji", "rightEmoji", "leftName", "rightName"]) {
                    if (typeof step[k] !== "string" || step[k].length === 0) fail(ctx, `${k} hiányzik`);
                }
            } else if (step.mode === "simplify") {
                if (!isInt(step.a) || !isInt(step.b) || step.a < 2 || step.b < 2) fail(ctx, `a/b hibás: ${step.a}/${step.b}`);
                const g = gcdRatio(step.a, step.b);
                if (g < 2) fail(ctx, `az arány nem egyszerűsíthető: ${step.a} : ${step.b}`);
                if (step.simpleA !== step.a / g || step.simpleB !== step.b / g) {
                    fail(ctx, `simpleA/simpleB hibás: ${step.simpleA}/${step.simpleB}`);
                }
                if (step.display !== `${step.a} : ${step.b}`) fail(ctx, `display hibás: ${step.display}`);
                const expected = `${step.a / g} : ${step.b / g}`;
                if (step.answer !== expected) fail(ctx, `answer hibás: ${step.answer} != ${expected}`);
                if (correctOptions[0]?.text !== step.answer) fail(ctx, "a helyes option nem az egyszerűsített arány");
            } else {
                if (!isInt(step.a) || !isInt(step.b) || !isInt(step.k) || step.a < 1 || step.b < 1 || step.k < 2) {
                    fail(ctx, `a/b/k hibás: ${step.a}/${step.b}/${step.k}`);
                }
                if (step.a === step.b) fail(ctx, "a === b");
                if (gcdRatio(step.a, step.b) !== 1) fail(ctx, `az arány nem legegyszerűbb: ${step.a} : ${step.b}`);
                if (!["left", "right"].includes(step.unknownSide)) fail(ctx, `unknownSide hibás: ${step.unknownSide}`);
                const expectedAnswer = step.unknownSide === "right" ? step.b * step.k : step.a * step.k;
                const expectedDisplay = step.unknownSide === "right"
                    ? `${step.a} : ${step.b} = ${step.a * step.k} : ?`
                    : `${step.a} : ${step.b} = ? : ${step.b * step.k}`;
                if (step.display !== expectedDisplay) fail(ctx, `display hibás: ${step.display} != ${expectedDisplay}`);
                if (step.answer !== expectedAnswer) fail(ctx, `answer hibás: ${step.answer} != ${expectedAnswer}`);
                if (correctOptions[0]?.text !== String(step.answer)) fail(ctx, "a helyes option nem a hiányzó tag");
                if (isFiniteNum(range) && step.answer > range) fail(ctx, `answer kilép a tartományból: ${step.answer} > ${range}`);
            }
            break;
        }
        case "master": {
            if (!["missing-op", "think-number", "pair", "logic", "combine", "order", "sumdiff", "word"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");

            if (["pair", "logic", "combine", "order", "sumdiff"].includes(step.mode)) {
                if (!Array.isArray(step.options) || step.options.length !== 4) {
                    fail(ctx, `options nem 4 elemű (${step.options?.length})`);
                    break;
                }
                if (!step.options.every(o => o && typeof o.text === "string" && typeof o.correct === "boolean")) {
                    fail(ctx, "options mezők hibásak");
                    break;
                }
                if (new Set(step.options.map(o => o.text)).size !== step.options.length) fail(ctx, "options ismétlődik");
                const correct = step.options.filter(o => o.correct);
                if (correct.length !== 1) fail(ctx, "pontosan 1 helyes kell");
                if (correct[0]?.text !== String(step.answer)) fail(ctx, "a helyes option nem a válasz");
                if (!isInt(step.answer) || step.answer < 1) fail(ctx, `answer hibás: ${step.answer}`);
                if (step.mode === "pair") {
                    if (!isInt(step.n) || step.n < 2) fail(ctx, `n hibás: ${step.n}`);
                    else if (step.answer !== (step.n * (step.n - 1)) / 2) fail(ctx, "answer nem n(n-1)/2");
                } else if (step.mode === "logic") {
                    if (!isInt(step.colors) || step.colors < 2) fail(ctx, `colors hibás: ${step.colors}`);
                    else if (step.hard) {
                        if (!isInt(step.perColor) || step.perColor < 2) fail(ctx, `perColor hibás: ${step.perColor}`);
                        else if (step.answer !== (step.colors - 1) * step.perColor + 2) fail(ctx, "answer nem (colors-1)*perColor+2");
                    } else if (step.answer !== step.colors + 1) {
                        fail(ctx, "answer nem colors+1");
                    }
                } else if (step.mode === "combine") {
                    if (!isInt(step.a) || !isInt(step.b) || step.a < 2 || step.b < 2) fail(ctx, `a/b hibás: ${step.a}/${step.b}`);
                    else if (step.answer !== step.a * step.b) fail(ctx, "answer nem a*b");
                } else if (step.mode === "order") {
                    if (!isInt(step.n) || step.n < 2 || step.n > 6) {
                        fail(ctx, `n hibás: ${step.n}`);
                    } else {
                        let fact = 1;
                        for (let i = 2; i <= step.n; i++) fact *= i;
                        if (step.answer !== fact) fail(ctx, `answer nem ${step.n}!`);
                    }
                } else {
                    if (!isInt(step.big) || !isInt(step.small) || step.small < 1 || step.big <= step.small) {
                        fail(ctx, `big/small hibás: ${step.big}/${step.small}`);
                    } else if (step.answer !== step.big) {
                        fail(ctx, "answer nem a nagyobbik szám");
                    } else if (step.sum !== step.big + step.small || step.diff !== step.big - step.small) {
                        fail(ctx, "sum/diff hibás");
                    }
                }
                break;
            }

            if (step.mode === "word") {
                if (typeof step.kind !== "string" || step.kind.length === 0) fail(ctx, `word kind hibás: ${step.kind}`);
                if (step.options !== undefined) fail(ctx, "word nem választós");
                if (!isInt(step.answer) || step.answer < 1) fail(ctx, `answer hibás: ${step.answer}`);
                if (isFiniteNum(range) && step.answer > range) fail(ctx, `answer kilép a tartományból: ${step.answer} > ${range}`);

                if (step.kind === "work") {
                    if (!isInt(step.workers1) || step.workers1 < 2 || !isInt(step.days1) || step.days1 < 1) {
                        fail(ctx, `work munkás/nap hibás: ${step.workers1}/${step.days1}`);
                    } else if (!isInt(step.workers2) || step.workers2 < 2) {
                        fail(ctx, `workers2 hibás: ${step.workers2}`);
                    } else if ((step.workers1 * step.days1) % step.workers2 !== 0 || step.answer !== (step.workers1 * step.days1) / step.workers2) {
                        fail(ctx, "work answer hibás");
                    }
                } else if (step.kind === "trip") {
                    if (!isInt(step.speed1) || step.speed1 < 1 || !isInt(step.time1) || step.time1 < 1) {
                        fail(ctx, `trip adatok hibás: ${step.speed1}/${step.time1}`);
                    } else if (!isInt(step.time2) || step.time2 < 1) {
                        fail(ctx, `time2 hibás: ${step.time2}`);
                    } else if ((step.speed1 * step.time1) % step.time2 !== 0 || step.answer !== (step.speed1 * step.time1) / step.time2) {
                        fail(ctx, "trip answer hibás");
                    }
                } else if (step.kind === "percent") {
                    if (!isInt(step.total) || step.total < 1) {
                        fail(ctx, `total hibás: ${step.total}`);
                    } else if (!isInt(step.percent) || step.percent < 1 || step.percent > 99) {
                        fail(ctx, `percent hibás: ${step.percent}`);
                    } else if ((step.total * (100 - step.percent)) % 100 !== 0 || step.answer !== (step.total * (100 - step.percent)) / 100) {
                        fail(ctx, "percent answer hibás");
                    }
                } else if (step.kind === "share") {
                    if (!isInt(step.ra) || step.ra < 1 || !isInt(step.rb) || step.rb < 1) {
                        fail(ctx, `share arány hibás: ${step.ra}/${step.rb}`);
                    } else if (!isInt(step.total) || step.total < 1) {
                        fail(ctx, `share total hibás: ${step.total}`);
                    } else if (step.answer * (step.ra + step.rb) !== Math.max(step.ra, step.rb) * step.total) {
                        fail(ctx, "share answer hibás");
                    }
                } else {
                    fail(ctx, `ismeretlen word kind: ${step.kind}`);
                }
                break;
            }

            if (step.mode === "missing-op") {
                if (!isInt(step.a) || !isInt(step.b) || !isInt(step.result)) {
                    fail(ctx, `a/b/result hibás: ${step.a}/${step.b}/${step.result}`);
                    break;
                }
                if (step.result < 1) fail(ctx, `result hibás: ${step.result}`);
                if (isFiniteNum(range) && step.result > range) fail(ctx, `result kilép a tartományból: ${step.result} > ${range}`);
                if (!["+", "−", "×", "÷"].includes(step.answer)) fail(ctx, `answer hibás: ${step.answer}`);
                if (step.display !== `${step.a} ? ${step.b} = ${step.result}`) fail(ctx, `display hibás: ${step.display}`);
                const matches = ["+", "−", "×", "÷"].filter(op => applyOp(op, step.a, step.b) === step.result);
                if (matches.length !== 1) fail(ctx, `nem egyértelmű a művelet: [${matches.join(",")}]`);
                else if (matches[0] !== step.answer) fail(ctx, `answer nem a helyes művelet: ${step.answer} != ${matches[0]}`);
                if (!Array.isArray(step.options) || step.options.length < 2) {
                    fail(ctx, `legalább 2 options kell (${step.options?.length})`);
                    break;
                }
                if (!step.options.every(o => o && typeof o.text === "string" && typeof o.correct === "boolean")) {
                    fail(ctx, "options mezők hibásak");
                }
                if (new Set(step.options.map(o => o.text)).size !== step.options.length) fail(ctx, "options ismétlődik");
                const correctOptions = step.options.filter(o => o.correct);
                if (correctOptions.length !== 1) fail(ctx, "pontosan 1 helyes kell");
                if (correctOptions[0]?.text !== step.answer) fail(ctx, "a helyes option nem a jó művelet");
            } else {
                if (!isInt(step.start) || step.start < 1) fail(ctx, `start hibás: ${step.start}`);
                if (isFiniteNum(range) && step.answer > range) fail(ctx, `answer kilép a tartományból: ${step.answer} > ${range}`);
                if (!Array.isArray(step.ops) || step.ops.length < 1 || step.ops.length > 2) {
                    fail(ctx, `ops hibás: ${JSON.stringify(step.ops)}`);
                    break;
                }
                let value = step.start;
                for (const op of step.ops) {
                    if (!["×", "+", "−"].includes(op.op) || !isInt(op.value) || op.value < 1) {
                        fail(ctx, `op hibás: ${JSON.stringify(op)}`);
                        break;
                    }
                    if (op.op === "×") value *= op.value;
                    else if (op.op === "+") value += op.value;
                    else value -= op.value;
                    if (value < 1) fail(ctx, `közbenső érték nem pozitív: ${value}`);
                }
                if (step.result !== value) fail(ctx, `result hibás: ${step.result} != ${value}`);
                if (step.answer !== step.start) fail(ctx, `answer hibás: ${step.answer} != ${step.start}`);
                if (typeof step.chain !== "string" || step.chain.length === 0) fail(ctx, "chain hiányzik");
                if (!step.chain.endsWith(`= ${step.result}`)) fail(ctx, `a lánc nem a végeredménnyel zárul: ${step.chain}`);
                const firstOp = step.ops[0].op;
                if (step.ops.length === 2) {
                    const secondOp = step.ops[1].op;
                    if ((firstOp === "+" || firstOp === "−") && secondOp === "×" && !step.chain.startsWith("(")) {
                        fail(ctx, `a láncból hiányoznak a zárójelek: ${step.chain}`);
                    }
                }
                if (step.options !== undefined) fail(ctx, "think-number nem választós");
            }
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
            } else if (step.mode === "full") {
                if (!isInt(step.angle) || step.angle <= 0 || step.angle >= 360) {
                    fail(ctx, `full angle tartomány hibás: ${step.angle}`);
                }
                if (step.answer !== 360 - step.angle) {
                    fail(ctx, `answer (${step.answer}) != 360 - angle (${360 - step.angle})`);
                }
                const correctOpt = Array.isArray(step.options)
                    ? step.options.find(o => o && typeof o === "object" && o.correct)
                    : null;
                if (correctOpt && correctOpt.text !== `${step.answer}°`) {
                    fail(ctx, `helyes opció (${correctOpt.text}) nem a válasz (${step.answer}°)`);
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
            if (step.mode === "circumference" || step.mode === "area") {
                if (!["radius", "diameter"].includes(step.variant)) fail(ctx, `variant hibás: ${step.variant}`);
                if (!Array.isArray(step.options) || step.options.length !== 4) fail(ctx, "options nem 4 elemű");
                if (new Set(step.options).size !== step.options.length) fail(ctx, "options ismétlődik");
                let expected;
                if (step.mode === "circumference") {
                    if (step.variant === "radius") {
                        if (!isInt(step.r) || step.r < 1) fail(ctx, `r hibás: ${step.r}`);
                        if (isInt(step.r)) expected = `${step.r * 2}π cm`;
                    } else {
                        if (!isInt(step.d) || step.d < 2) fail(ctx, `d hibás: ${step.d}`);
                        if (isInt(step.d)) expected = `${step.d}π cm`;
                    }
                } else {
                    if (step.variant !== "radius") fail(ctx, "area csak sugárból indulhat");
                    if (!isInt(step.r) || step.r < 1) fail(ctx, `r hibás: ${step.r}`);
                    if (isInt(step.r)) expected = `${step.r * step.r}π cm²`;
                }
                if (expected !== undefined && step.answerLabel !== expected) {
                    fail(ctx, `answerLabel (${step.answerLabel}) != várt (${expected})`);
                }
                if (!step.options.includes(step.answerLabel)) fail(ctx, "options nem tartalmazza a választ");
                if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
                break;
            }
            if (step.mode === "sector") {
                if (!["arc-radius", "arc-diameter", "sector-area"].includes(step.variant)) {
                    fail(ctx, `variant hibás: ${step.variant}`);
                }
                if (!Array.isArray(step.options) || step.options.length !== 4) fail(ctx, "options nem 4 elemű");
                if (new Set(step.options).size !== step.options.length) fail(ctx, "options ismétlődik");
                if (!isInt(step.angle) || step.angle <= 0 || step.angle >= 360) fail(ctx, `angle hibás: ${step.angle}`);
                if (!isInt(step.r) || step.r < 1) fail(ctx, `r hibás: ${step.r}`);
                if (step.variant === "arc-diameter") {
                    if (!isInt(step.d) || step.d !== step.r * 2) fail(ctx, `d hibás: ${step.d}`);
                }
                let expected;
                if (step.variant === "sector-area") {
                    expected = `${step.r * step.r * step.angle / 360}π cm²`;
                } else {
                    expected = `${step.r * step.angle / 180}π cm`;
                }
                if (!Number.isInteger(Number(expected.replace(/[^0-9]/g, "")))) {
                    fail(ctx, `nem egész együtthatós: ${expected}`);
                }
                if (step.answerLabel !== expected) {
                    fail(ctx, `answerLabel (${step.answerLabel}) != várt (${expected})`);
                }
                if (!step.options.includes(step.answerLabel)) fail(ctx, "options nem tartalmazza a választ");
                if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
                break;
            }
            if (step.mode === "convert") {
                if (!["radius-to-diameter", "diameter-to-radius"].includes(step.variant)) {
                    fail(ctx, `variant hibás: ${step.variant}`);
                }
                if (!Array.isArray(step.options) || step.options.length !== 4) {
                    fail(ctx, "options nem 4 elemű");
                }
                let expected;
                if (step.variant === "radius-to-diameter") {
                    if (!isInt(step.r) || step.r < 1) fail(ctx, `r hibás: ${step.r}`);
                    expected = step.r * 2;
                } else {
                    if (!isInt(step.d) || step.d < 2 || step.d % 2 !== 0) fail(ctx, `d hibás: ${step.d}`);
                    expected = step.d / 2;
                }
                if (step.answer !== expected) fail(ctx, `answer (${step.answer}) != számolt (${expected})`);
                if (!step.options.includes(expected)) fail(ctx, "options nem tartalmazza a választ");
                if (new Set(step.options).size !== step.options.length) fail(ctx, "options ismétlődik");
                break;
            }
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
            if (step.mode === "compare") {
                validateProbabilityCompare(ctx, step);
                break;
            }
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
        case "combinatorics": {
            if (!["order", "count", "pair", "multiply"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
            if (typeof step.question !== "string" || step.question.length === 0) {
                fail(ctx, "question hiányzik");
            }
            if (step.mode === "order") {
                if (!Array.isArray(step.items) || step.items.length !== 3) {
                    fail(ctx, "items nem 3 elemű");
                    break;
                }
                if (!step.items.every(it => typeof it === "string" && it.length > 0)) {
                    fail(ctx, "items nem szövegek");
                }
                if (new Set(step.items).size !== 3) {
                    fail(ctx, "items nem mind különböző");
                }
                if (step.total !== 6) fail(ctx, `total hibás: ${step.total}`);
            } else {
                let expected;
                if (step.mode === "count") {
                    if (!isInt(step.n) || step.n < 3 || step.n > 4) fail(ctx, `n hibás: ${step.n}`);
                    expected = [1, 1, 2, 6, 24][step.n];
                } else if (step.mode === "pair") {
                    if (!isInt(step.n) || step.n < 4 || step.n > 6) fail(ctx, `n hibás: ${step.n}`);
                    expected = (step.n * (step.n - 1)) / 2;
                } else {
                    if (!isInt(step.a) || !isInt(step.b) || step.a < 2 || step.b < 2) fail(ctx, `a/b hibás: ${step.a}/${step.b}`);
                    expected = step.a * step.b;
                }
                if (step.answer !== expected) fail(ctx, `answer (${step.answer}) != számolt (${expected})`);
                if (!Array.isArray(step.options) || step.options.length !== 4) {
                    fail(ctx, `options nem 4 elemű: ${step.options?.length}`);
                } else {
                    const correct = step.options.filter(o => o.correct);
                    if (correct.length !== 1) fail(ctx, `options: ${correct.length} helyes találat (1 kellene)`);
                    else if (correct[0].text !== String(expected)) fail(ctx, `helyes opció (${correct[0].text}) != ${expected}`);
                }
                if (typeof step.explanation !== "string" || step.explanation.length === 0) {
                    fail(ctx, "explanation hiányzik");
                }
                if (!Array.isArray(step.reasoning) || step.reasoning.length !== 4) {
                    fail(ctx, `reasoning nem 4 elemű: ${step.reasoning?.length}`);
                } else {
                    const correctReason = step.reasoning.filter(r => r.correct);
                    if (correctReason.length !== 1) {
                        fail(ctx, `reasoning: ${correctReason.length} helyes találat (1 kellene)`);
                    }
                    if (new Set(step.reasoning.map(r => r.text)).size !== step.reasoning.length) {
                        fail(ctx, "reasoning szövegek ismétlődnek");
                    }
                    if (step.reasoning.some(r => typeof r.text !== "string" || r.text.includes("="))) {
                        fail(ctx, "reasoning nem tiszta kifejezés (nem tartalmazhat eredményt)");
                    }
                }
            }
            break;
        }
        case "operation-order": {
            if (typeof step.expression !== "string" || step.expression.length === 0) {
                fail(ctx, "expression hiányzik");
            }
            const powerForms = ["pow-add", "pow-sub", "pow-mul", "paren-pow", "paren-pow-sub"];
            if (powerForms.includes(step.form)) {
                if (!isInt(step.c) || step.c < 2 || step.c > 3) fail(ctx, `hatvány kitevő hibás: ${step.c}`);
                if (step.form === "paren-pow") {
                    if (!isInt(step.a) || step.a < 2 || step.a > 9) fail(ctx, `paren-pow a hibás: ${step.a}`);
                    if (!isInt(step.b) || step.b < 2 || step.b > 9) fail(ctx, `paren-pow b hibás: ${step.b}`);
                    if (step.c === 3 && step.a + step.b > 10) fail(ctx, `paren-pow túl nagy összeg: ${step.a + step.b}`);
                } else {
                    if (!isInt(step.b) || step.b < 2 || step.b > 4) fail(ctx, `hatvány alap hibás: ${step.b}`);
                }
                if (isFiniteNum(range) && step.answer > range) fail(ctx, `answer kilép a tartományból: ${step.answer} > ${range}`);
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
            if (!["length", "weight", "volume", "area", "capacity"].includes(step.kind)) fail(ctx, `kind hibás: ${step.kind}`);
            if (step.interaction === "unit") {
                validateUnitChoice(ctx, step);
                break;
            }
            if (step.interaction === "compare") {
                validateComparison(ctx, step);
                break;
            }
            if (!isInt(step.value) || step.value < 1) fail(ctx, `value hibás: ${step.value}`);
            if (!["km", "m", "dm", "cm", "kg", "dkg", "g", "l", "dl", "cl", "ml", "mm", "t", "hl", "m²", "dm²", "cm²", "dm³"].includes(step.unit) ||
                !["km", "m", "dm", "cm", "kg", "dkg", "g", "l", "dl", "cl", "ml", "mm", "t", "hl", "m²", "dm²", "cm²", "dm³"].includes(step.target)) {
                fail(ctx, `unit/target ismeretlen: ${step.unit} → ${step.target}`);
            }
            const factor = measureUnitFactor(step.unit, step.target);
            if (!factor) fail(ctx, `nincs átszámítás: ${step.unit} → ${step.target}`);
            const expected = step.reverse ? step.value / factor : step.value * factor;
            if (step.answer !== expected) {
                fail(ctx, `answer (${step.answer}) != ${step.value} ${step.reverse ? "÷" : "×"} ${factor}`);
            }
            if (step.context !== undefined) {
                if (typeof step.context !== "string" || step.context.length === 0) {
                    fail(ctx, "context üres vagy nem szöveg");
                }
                if (!step.context.includes(String(step.value)) || !step.context.includes(step.unit)) {
                    fail(ctx, `context nem tartalmazza a ${step.value} ${step.unit} mennyiséget`);
                }
                if (!Number.isInteger(step.answer) || step.answer < 1) {
                    fail(ctx, `contextes feladat válasza nem pozitív egész: ${step.answer}`);
                }
            }
            const mode = step.interaction ?? "choice";
            if (!["choice", "input", "tf", "compare", "unit"].includes(mode)) {
                fail(ctx, `interaction ismeretlen: ${step.interaction}`);
            }
            if (mode === "tf") {
                validateTrueFalse(ctx, step);
            }
            if (mode === "choice") {
                if (!Array.isArray(step.options) || !step.options.includes(step.answer)) {
                    fail(ctx, "options nem tartalmazza a helyes választ");
                }
            } else if (step.options !== undefined) {
                fail(ctx, `${mode} módban nem kell options`);
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
            const bound = Math.max(9999, isFiniteNum(range) ? range : 0);
            if (!["add", "sub", "mul"].includes(step.op)) {
                fail(ctx, `op hibás: ${step.op}`);
            }
            const twoDigitMul = step.op === "mul" && step.b >= 10;
            if (!isInt(step.a) || !isInt(step.b) || step.a < 1 || step.b < 1) {
                fail(ctx, "a/b nem érvényes egész");
            }
            if (step.op === "mul") {
                if (step.a > bound) fail(ctx, `a ${bound} fölötti (${step.a})`);
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
                if (step.answer > bound) {
                    fail(ctx, `answer ${bound} fölötti: ${step.answer}`);
                }
            } else {
                if (step.a > bound || step.b > bound) fail(ctx, `a/b ${bound} fölötti`);
                if (step.a < 100) fail(ctx, `a 100 alatti: ${step.a}`);
                if (step.op === "add" && step.answer !== step.a + step.b) {
                    fail(ctx, `answer != a+b (${step.answer})`);
                }
                if (step.op === "sub" && step.answer !== step.a - step.b) {
                    fail(ctx, `answer != a-b (${step.answer})`);
                }
                if (step.answer < 100 || step.answer > bound) {
                    fail(ctx, `answer 100..${bound} nélküli: ${step.answer}`);
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
            if (!["join", "remove", "part-whole", "compare", "multiply", "divide", "proportion", "remainder", "two-step", "equation", "ratio-split", "direct-proportion", "inverse-proportion"].includes(step.kind)) {
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
            if (step.kind === "equation") {
                if (!["mul-add", "mul-sub", "div-add", "div-sub", "times-add"].includes(step.mode)) {
                    fail(ctx, `mode hibás: ${step.mode}`);
                }
                for (const k of ["a", "b", "c"]) {
                    if (!isInt(step[k]) || step[k] < 1) fail(ctx, `${k} hibás: ${step[k]}`);
                }
                let expectedEquation = null;
                if (step.mode === "mul-add") expectedEquation = (step.c - step.b) / step.a;
                else if (step.mode === "mul-sub") expectedEquation = (step.c + step.b) / step.a;
                else if (step.mode === "div-add") expectedEquation = step.a * (step.c - step.b);
                else if (step.mode === "div-sub") expectedEquation = step.a * (step.c + step.b);
                else expectedEquation = step.c / step.a - step.b;
                if (step.answer !== expectedEquation || step.answer < 1) {
                    fail(ctx, `answer (${step.answer}) != számolt (${expectedEquation})`);
                }
                if (typeof range === "number" && step.answer > range) {
                    fail(ctx, `answer (${step.answer}) meghaladja a tartományt (${range})`);
                }
                if (!Array.isArray(step.options) || step.options.length !== 4 || !step.options.every(o => typeof o === "string")) {
                    fail(ctx, "options hibás (4 szöveges egyenlet kell)");
                } else {
                    const correctCount = step.options.filter(o => o === step.equation).length;
                    if (correctCount !== 1) fail(ctx, `a helyes egyenlet ${correctCount}× szerepel az options-ban`);
                    if (new Set(step.options).size !== step.options.length) fail(ctx, "az options tartalmaz ismétlődést");
                }
            }
            if (step.kind === "ratio-split") {
                for (const k of ["ra", "rb", "total", "part"]) {
                    if (!isInt(step[k])) fail(ctx, `${k} nem egész: ${step[k]}`);
                }
                if (!["part", "total"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
                if (!["a", "b"].includes(step.which)) fail(ctx, `which hibás: ${step.which}`);
                if (!["choice", "input"].includes(step.interaction)) fail(ctx, `interaction hibás: ${step.interaction}`);
                if (step.ra < 1 || step.rb < 1) fail(ctx, `aránytag hibás: ${step.ra}:${step.rb}`);
                const units = step.ra + step.rb;
                if (units < 2 || step.total % units !== 0) {
                    fail(ctx, `total (${step.total}) nem osztható arányegészre (${step.ra}:${step.rb})`);
                } else {
                    const k = step.total / units;
                    const expectedPart = (step.which === "a" ? step.ra : step.rb) * k;
                    if (step.part !== expectedPart) fail(ctx, `part (${step.part}) != számolt (${expectedPart})`);
                    const expectedAnswer = step.mode === "part" ? step.part : step.total;
                    if (step.answer !== expectedAnswer) fail(ctx, `answer (${step.answer}) != számolt (${expectedAnswer})`);
                }
                if (typeof range === "number" && step.answer > range) {
                    fail(ctx, `answer (${step.answer}) meghaladja a tartományt (${range})`);
                }
                if (step.interaction === "choice" && !Array.isArray(step.options)) {
                    fail(ctx, "choice interakcióhoz hiányzik az options");
                }
            }
            if (step.kind === "direct-proportion") {
                if (!["value", "amount"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
                if (!["choice", "input"].includes(step.interaction)) fail(ctx, `interaction hibás: ${step.interaction}`);
                for (const k of ["rate", "amount1", "value1", "amount2", "value2"]) {
                    if (!isInt(step[k]) || step[k] < 1) fail(ctx, `${k} hibás: ${step[k]}`);
                }
                if (step.value1 !== step.rate * step.amount1) {
                    fail(ctx, `value1 (${step.value1}) != rate*amount1 (${step.rate * step.amount1})`);
                }
                if (step.value2 !== step.rate * step.amount2) {
                    fail(ctx, `value2 (${step.value2}) != rate*amount2 (${step.rate * step.amount2})`);
                }
                if (step.amount1 === step.amount2) fail(ctx, "amount1 == amount2");
                const expectedProportion = step.mode === "value" ? step.value2 : step.amount2;
                if (step.answer !== expectedProportion) {
                    fail(ctx, `answer (${step.answer}) != számolt (${expectedProportion})`);
                }
                if (typeof range === "number" && step.answer > range) {
                    fail(ctx, `answer (${step.answer}) meghaladja a tartományt (${range})`);
                }
                if (step.interaction === "choice" && !Array.isArray(step.options)) {
                    fail(ctx, "choice interakcióhoz hiányzik az options");
                }
            }
            if (step.kind === "inverse-proportion") {
                if (!["value", "amount"].includes(step.mode)) fail(ctx, `mode hibás: ${step.mode}`);
                if (!["choice", "input"].includes(step.interaction)) fail(ctx, `interaction hibás: ${step.interaction}`);
                for (const k of ["total", "amount1", "unit1", "amount2", "unit2"]) {
                    if (!isInt(step[k]) || step[k] < 1) fail(ctx, `${k} hibás: ${step[k]}`);
                }
                if (step.total !== step.amount1 * step.unit1) fail(ctx, `total (${step.total}) != amount1*unit1`);
                if (step.total !== step.amount2 * step.unit2) fail(ctx, `total (${step.total}) != amount2*unit2`);
                if (step.amount1 === step.amount2) fail(ctx, "amount1 == amount2");
                if (step.unit1 === step.unit2) fail(ctx, "unit1 == unit2");
                const expectedInverse = step.mode === "value" ? step.unit2 : step.amount2;
                if (step.answer !== expectedInverse) {
                    fail(ctx, `answer (${step.answer}) != számolt (${expectedInverse})`);
                }
                if (typeof range === "number" && step.answer > range) {
                    fail(ctx, `answer (${step.answer}) meghaladja a tartományt (${range})`);
                }
                if (step.interaction === "choice" && !Array.isArray(step.options)) {
                    fail(ctx, "choice interakcióhoz hiányzik az options");
                }
            }
            break;
        }
        case "rational": {
            const descValue = (d) => {
                if (!d || typeof d !== "object") return null;
                if (d.kind === "fraction") {
                    if (!isInt(d.num) || !isInt(d.den) || d.den === 0) return null;
                    return d.num / d.den;
                }
                if (d.kind === "mixed") {
                    if (!isInt(d.whole) || !isInt(d.num) || !isInt(d.den) || d.den === 0) return null;
                    return (d.neg ? -1 : 1) * (d.whole + d.num / d.den);
                }
                if (d.kind === "decimal") {
                    const v = Number(String(d.text).replace(/−/g, "-").replace(",", "."));
                    return Number.isFinite(v) ? v : null;
                }
                return null;
            };
            if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
            if (step.mode === "compare") {
                const leftValue = descValue(step.left);
                const rightValue = descValue(step.right);
                if (leftValue === null) fail(ctx, "compare bal oldal hibás");
                if (rightValue === null) fail(ctx, "compare jobb oldal hibás");
                if (leftValue !== null && rightValue !== null) {
                    const expected = Math.abs(leftValue - rightValue) < 1e-9
                        ? "="
                        : leftValue < rightValue ? "<" : ">";
                    if (step.answer !== expected) {
                        fail(ctx, `compare answer (${step.answer}) != ${expected}`);
                    }
                }
                break;
            }
            if (step.mode === "add" || step.mode === "sub" || step.mode === "mul" || step.mode === "div") {
                const leftValue = descValue(step.left);
                const rightValue = descValue(step.right);
                if (leftValue === null) fail(ctx, "művelet bal oldal hibás");
                if (rightValue === null) fail(ctx, "művelet jobb oldal hibás");
                if (leftValue !== null && rightValue !== null) {
                    let expected = null;
                    if (step.mode === "add") expected = leftValue + rightValue;
                    else if (step.mode === "sub") expected = leftValue - rightValue;
                    else if (step.mode === "mul") expected = leftValue * rightValue;
                    else if (step.mode === "div") {
                        if (Math.abs(rightValue) < 1e-9) fail(ctx, "div osztó nulla");
                        else expected = leftValue / rightValue;
                    }
                    const correctOpt = Array.isArray(step.options) ? step.options.find(o => o.correct) : null;
                    if (!correctOpt) {
                        fail(ctx, "művelet nincs helyes opció");
                    } else if (expected !== null) {
                        const correctValue = descValue(correctOpt);
                        if (correctValue === null || Math.abs(correctValue - expected) > 1e-9) {
                            fail(ctx, `művelet eredmény (${correctValue}) != ${expected}`);
                        }
                    }
                }
                break;
            }
            if (step.mode === "order" || step.mode === "paren") {
                const toFrac = (d) => {
                    if (!d || typeof d !== "object") return null;
                    if (d.kind === "fraction") {
                        if (!isInt(d.num) || !isInt(d.den) || d.den === 0) return null;
                        return [d.num, d.den];
                    }
                    if (d.kind === "mixed") {
                        if (!isInt(d.whole) || !isInt(d.num) || !isInt(d.den) || d.den === 0) return null;
                        return [(d.neg ? -1 : 1) * (d.whole * d.den + d.num), d.den];
                    }
                    if (d.kind === "decimal") {
                        const v = Number(String(d.text).replace(/−/g, "-").replace(",", "."));
                        return Number.isInteger(v) ? [v, 1] : null;
                    }
                    return null;
                };
                const fop = (op, x, y) => {
                    if (op === "+") return [x[0] * y[1] + y[0] * x[1], x[1] * y[1]];
                    if (op === "−") return [x[0] * y[1] - y[0] * x[1], x[1] * y[1]];
                    if (op === "×") return [x[0] * y[0], x[1] * y[1]];
                    if (op === "÷") return [x[0] * y[1], x[1] * y[0]];
                    return null;
                };
                const operands = Array.isArray(step.operands) ? step.operands.map(toFrac) : null;
                const ops = Array.isArray(step.ops) ? step.ops : null;
                if (!operands || operands.length !== 3 || operands.some(o => o === null) || !ops || ops.length !== 2) {
                    fail(ctx, "vegyes művelet operandus/operátor hibás");
                } else {
                    const [a, b, c] = operands;
                    let expected = null;
                    if (step.shape === "flat") {
                        const flatOps = ops.slice();
                        const vals = [a.slice(), b.slice(), c.slice()];
                        for (let i = 0; i < flatOps.length;) {
                            if (flatOps[i] === "×" || flatOps[i] === "÷") {
                                vals.splice(i, 2, fop(flatOps[i], vals[i], vals[i + 1]));
                                flatOps.splice(i, 1);
                            } else {
                                i++;
                            }
                        }
                        let acc = vals[0];
                        for (let i = 0; i < flatOps.length; i++) acc = fop(flatOps[i], acc, vals[i + 1]);
                        expected = acc;
                    } else if (step.shape === "left") {
                        expected = fop(ops[1], fop(ops[0], a, b), c);
                    } else if (step.shape === "right") {
                        expected = fop(ops[0], a, fop(ops[1], b, c));
                    } else {
                        fail(ctx, `vegyes művelet ismeretlen shape: ${step.shape}`);
                    }
                    if (expected) {
                        const correctOpt = Array.isArray(step.options) ? step.options.find(o => o.correct) : null;
                        const cf = correctOpt ? toFrac(correctOpt) : null;
                        if (!correctOpt) {
                            fail(ctx, "vegyes művelet nincs helyes opció");
                        } else if (!cf || cf[0] * expected[1] !== expected[0] * cf[1]) {
                            fail(ctx, `vegyes művelet eredmény (${correctOpt && correctOpt.text}) != ${expected[0]}/${expected[1]}`);
                        }
                    }
                }
                break;
            }
            if (step.display === undefined) fail(ctx, "display hiányzik");
            if (typeof step.answer !== "string" && !isInt(step.answer)) fail(ctx, "answer hibás");
            break;
        }
        case "algebra": {
            const evalTerms = (terms, values) => {
                if (!Array.isArray(terms)) return null;
                let s = 0;
                for (const t of terms) {
                    if (!t || typeof t !== "object" || !isInt(t.coef)) return null;
                    if (t.variable === null || t.variable === undefined) s += t.coef;
                    else if (typeof t.variable === "string") s += t.coef * (values[t.variable] ?? 0);
                    else return null;
                }
                return s;
            };
            const evalSource = (src, values) => {
                if (!src || typeof src !== "object") return null;
                if (src.kind === "terms") return evalTerms(src.terms, values);
                if (src.kind === "product") return isInt(src.factor) ? src.factor * evalTerms(src.terms, values) : null;
                if (src.kind === "groups") {
                    if (!Array.isArray(src.groups)) return null;
                    let s = 0;
                    for (const g of src.groups) {
                        if (!g || (g.sign !== 1 && g.sign !== -1)) return null;
                        const v = evalTerms(g.terms, values);
                        if (v === null) return null;
                        s += g.sign * v;
                    }
                    return s;
                }
                return null;
            };
            const evalNode = (node, values) => {
                if (!node || typeof node !== "object") return null;
                if (node.kind === "product") {
                    if (!isInt(node.factor) || !node.inner || !Array.isArray(node.inner.terms)) return null;
                    const v = evalTerms(node.inner.terms, values);
                    return v === null ? null : node.factor * v;
                }
                if (node.kind === "poly") return evalTerms(node.terms, values);
                return null;
            };
            const correctOpt = Array.isArray(step.options) ? step.options.find(o => o.correct) : null;
            if (typeof step.question !== "string" || step.question.length === 0) fail(ctx, "question hiányzik");
            if (typeof step.expression !== "string" || step.expression.length === 0) fail(ctx, "expression hiányzik");
            if (!correctOpt || correctOpt.text !== step.answer) fail(ctx, "algebra answer != helyes opció");
            if (step.mode === "substitute") {
                const value = evalTerms(step.source && step.source.terms, step.values ?? {});
                if (value === null) {
                    fail(ctx, "substitute source hibás");
                } else {
                    const shown = Number(String(correctOpt.text).replace(/−/g, "-"));
                    if (shown !== value) fail(ctx, `substitute érték (${correctOpt.text}) != ${value}`);
                }
            } else {
                const points = [-3, -1, 0, 1, 2, 5, 7];
                let ok = true;
                for (const x of points) {
                    for (const y of points) {
                        const a = evalSource(step.source, { x, y });
                        const b = evalNode(step.result, { x, y });
                        if (a === null || b === null || a !== b) {
                            ok = false;
                            break;
                        }
                    }
                    if (!ok) break;
                }
                if (!ok) fail(ctx, `algebra egyenlőség hibás: ${step.expression} => ${step.answer}`);
            }
            break;
        }
    }

    checkOptions(step, ctx);
}

function validateLesson(built, ctx, range) {
    const counted = built.steps.filter(s => s.type !== "scene" && s.type !== "celebration");
    if (counted.length === 0) {
        fail(ctx, "nincs feladatlépés");
    }
    built.steps.forEach((step, index) => validateStep(step, `${ctx} [#${index} ${step.type ?? "?"}]`, range));
}

const index = readJson("data/lessons/index.json");
const lessons = index.lessons;

const indexIds = new Set(index.lessons.map(l => l.id));

for (const lesson of lessons) {
    if (!SKILLS[lesson.skill]) {
        fail(`index/${lesson.id}`, `ismeretlen skill: ${lesson.skill}`);
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
                validateLesson(built, `${world}/${lesson.id}`, lesson.range);
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