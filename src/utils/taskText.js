// Szülői PDF-hez: a feladat nyomtatható szövege és megoldása, a játék
// komponensei nélkül. A szabályok a generátorok mezőire és a testLessons
// validációra épülnek (INDEX_ANSWER_TYPES: a válasz ott index az opciókban).
import { TYPE_EMOJI, TYPE_LABEL } from "../data/types.js";

const INDEX_ANSWER_TYPES = new Set(["calendar", "data-chart", "solid-shape", "polygon", "length-units"]);

const OP_SIGNS = { add: "+", sub: "−", mul: "×", div: "÷", "+": "+", "−": "−", "×": "×", "÷": "÷" };

const SOLID_SHAPE_QUESTIONS = {
    name: "Mi ez a test?",
    face: "Hány lapja van ennek a testnek?",
    edge: "Hány éle van ennek a testnek?",
    vertex: "Hány csúcsa van ennek a testnek?",
    net: "Melyik test hálója ez?"
};

// Nem nyomtatható feladatok: a kép (óra, törtes rajz) nélkül nem megoldhatók,
// az egyperces játékok pedig a képernyőn játszandók – a PDF-ben csak a nevük jelenik meg.
const NAME_ONLY_TYPES = new Set([
    "time",
    "fraction",
    "fraction-divide",
    "fraction-equal",
    "fraction-equal-den",
    "fraction-common-den",
    "fraction-times-int"
]);

export function isNameOnlyStep(step) {
    return !!step && (NAME_ONLY_TYPES.has(step.type) || step.type.endsWith("-play"));
}

function nameFor(type) {
    const isPlay = type.endsWith("-play");
    return `${TYPE_EMOJI[type] ?? (isPlay ? "🎲" : "•")} ${TYPE_LABEL[type] ?? (isPlay ? "Egyperces játék" : "Feladat")}`;
}

export function isTaskStep(step) {
    return !!step && step.type !== "scene" && step.type !== "celebration";
}

function expressionFor(step) {

    if (step.type === "exercise") {
        const { kind, a, b, op } = step;
        if (kind === "addition") return `${a} + ${b} = ?`;
        if (kind === "subtraction") return `${a} − ${b} = ?`;
        if (kind === "mixed") {
            const sign = op ?? "?";
            const result = op === "+" ? a + b : a - b;
            if (step.inputPos === "left") return `? ${sign} ${b} = ${result}`;
            if (step.inputPos === "right") return `${a} ${sign} ? = ${result}`;
            return `${a} ${sign} ${b} = ?`;
        }
        return null;
    }

    switch (step.type) {
        case "missing-number": return `${step.a} + ? = ${step.sum}`;
        case "comparison": return `${step.leftExpr} ? ${step.rightExpr}`;
        case "neighbor": return `${step.left} ? ${step.right}`;
        case "neighbor-round": return `${step.number} – kisebb és nagyobb szomszéd`;
        case "place-value": return `${step.tens} tízes + ${step.ones} egyes = ?`;
        case "place-value-hundreds": return `${step.hundreds} százas + ${step.tens} tízes + ${step.ones} egyes = ?`;
        case "place-value-two-input": return `${step.answer} = ? tízes + ? egyes`;
        case "sequence": return `${(step.terms ?? []).join(", ")}, ?`;
        case "order": return `Rendezd ${step.direction === "asc" ? "növekvő" : "csökkenő"} sorrendbe: ${(step.values ?? []).join(", ")}`;
        case "even-odd": return `Melyik ${step.question === "even" ? "páros" : "páratlan"}? ${(step.numbers ?? []).join(", ")}`;
        case "pattern": return `${(step.terms ?? []).join(" ")} ?`;
        case "bridge-ten": return `${step.a} + ${step.b} = ?`;
        case "estimate": return step.expression ? `${step.expression} – melyik a legjobb becslés?` : null;
        case "true-false": return `${step.statement} – igaz vagy hamis?`;
        case "find-error": return Array.isArray(step.items)
            ? `${step.items.join(" / ")} – melyik hibás?`
            : `${step.statement} – hibás a számolás?`;
        case "table": return step.tfAnswer != null ? `${step.statement} – igaz vagy hamis?` : `${step.a} × ${step.b} = ?`;
        case "division-table": return step.tfAnswer != null ? `${step.statement} – igaz vagy hamis?` : `${step.a} ÷ ${step.b} = ?`;
        case "sharing": return `${step.total} ${step.emoji} szétosztva ${step.groups} csoportba. Hány van csoportonként?`;
        case "grouping": return `${step.total} ${step.emoji}, csoportonként ${step.groupSize}. Hány csoport?`;
        case "equal-groups": return `${step.groups} csoport, csoportonként ${step.perGroup} ${step.emoji}. Hány van összesen?`;
        case "repeated-addition": return step.expression ? `${step.expression} = ?` : null;
        case "skip-counting": return `${(step.terms ?? []).map((t, i) => (i === step.missingIndex ? "?" : t)).join(", ")}`;
        case "money-pay": return `${step.emoji} ${step.name} – ${step.price} Ft. Fizesd ki pontosan!`;
        case "money-compare": return `Melyik a több: ${(step.leftCoins ?? []).join(" + ")} vagy ${(step.rightCoins ?? []).join(" + ")}?`;
        case "money-enough": return `${step.emoji} ${step.name} – ${step.price} Ft. Van elég pénz?`;
        case "money-change": return `${step.emoji} ${step.name} – ${step.price} Ft, fizettél ${step.paid} Ft-tal. Mennyi a visszajáró?`;
        case "measure-compare": return `Melyik hosszabb: ${step.objectA?.emoji ?? ""} ${step.objectA?.name ?? ""} vagy ${step.objectB?.emoji ?? ""} ${step.objectB?.name ?? ""}?`;
        case "time": return `Mennyi az idő? (${step.hour}:${String(step.minute ?? 0).padStart(2, "0")})`;
        case "solid-shape": return SOLID_SHAPE_QUESTIONS[step.mode] ?? null;
        case "written-operation": return `${step.a} ${OP_SIGNS[step.op] ?? step.op} ${step.b} = ?`;
        case "written-division": return `${step.a} ÷ ${step.b} = ?`;
        case "remainder-division": return `${step.a} ÷ ${step.b} = ? (hányados és maradék)`;
        case "missing-operand":
        case "missing-factor":
        case "link": return step.expression ?? null;
        case "operation-order": return step.expression ? `${step.expression} = ?` : null;
        default: return null;
    }

}

export function taskText(step) {

    if (isNameOnlyStep(step)) return nameFor(step.type);

    const parts = [];
    if (typeof step.text === "string" && step.text) parts.push(step.text);
    if (typeof step.question === "string" && step.question) parts.push(step.question);
    if (parts.length) return parts.join(" ");

    const expr = expressionFor(step);
    if (expr) return expr;

    return nameFor(step.type === "exercise" ? step.kind : step.type);

}

function scalarText(value) {
    return typeof value === "string" || typeof value === "number" ? String(value) : null;
}

function fromOptions(step) {

    const opts = step.options;
    if (!Array.isArray(opts) || opts.length === 0) return null;

    const correct = opts.find(o => o && typeof o === "object" && o.correct === true);
    if (correct) {
        const text = scalarText(correct.text ?? correct.value ?? correct.label);
        if (text !== null) return text;
    }

    const scalars = opts.every(o => typeof o === "string" || typeof o === "number");
    if (!scalars) return "—"; // alakzat- vagy widgetopciók: szöveg nélkül

    if (INDEX_ANSWER_TYPES.has(step.type)) {
        return typeof step.answer === "number" && opts[step.answer] !== undefined
            ? String(opts[step.answer])
            : null;
    }

    if (opts.includes(step.answer)) return String(step.answer);
    if (Number.isInteger(step.answer) && step.answer >= 0 && step.answer < opts.length) {
        return String(opts[step.answer]); // index-válasz (pl. százalék, valószínűség)
    }
    return null;

}

export function taskAnswer(step) {

    // Nem nyomtatható feladatnál nincs ellenőrizhető megoldás a lapon
    if (isNameOnlyStep(step)) return "—";

    // 1) Opciók: érték vagy index (a testLessons konvenciója szerint)
    const fromOpts = fromOptions(step);
    if (fromOpts !== null) return fromOpts;

    // 2) Kész feliratok
    if (typeof step.correctLabel === "string") return step.correctLabel;
    if (typeof step.answerLabel === "string") return step.answerLabel;

    // 3) Igaz/Hamis kérdés
    if (typeof step.tfAnswer === "boolean") return step.tfAnswer ? "Igaz" : "Hamis";

    // 4) Operátor (összehasonlítás)
    if (typeof step.operator === "string") return step.operator;

    // 5) Alapműveletek
    if (step.type === "exercise") {
        if (step.kind === "addition") return String(step.a + step.b);
        if (step.kind === "subtraction") return String(step.a - step.b);
        if (step.kind === "mixed") {
            if (step.inputPos === "left") return String(step.a);
            if (step.inputPos === "right") return String(step.b);
            return String(step.op === "+" ? step.a + step.b : step.a - step.b);
        }
        return "—";
    }

    // 6) Két részmegoldású feladatok
    if (step.type === "remainder-division") return `${step.quotient} (hányados) és ${step.remainder} (maradék)`;
    if (step.type === "neighbor-round") return `${step.lower} és ${step.upper}`;

    // 7) Tömbválasz (sorba rendezés, páros-páratlan)
    if (Array.isArray(step.answer)) return step.answer.join(", ");

    // 8) Igaz/Hamis szövegesen, típus szerint
    if (typeof step.answer === "boolean") {
        if (step.type === "money-enough") return step.answer ? "Igen" : "Nem";
        if (step.type === "find-error") return step.answer ? "Hibás" : "Helyes";
        return step.answer ? "Igaz" : "Hamis";
    }

    // 9) Bal/jobb oldal
    if (step.answer === "left" || step.answer === "right") {
        const side = step[step.answer];
        if (side && typeof side === "object" && side.name) return side.name;
        return step.answer === "left" ? "bal oldal" : "jobb oldal";
    }

    // 10) Egyéb: a generátor answer mezője
    if (step.answer !== undefined && step.answer !== null) return String(step.answer);

    return "—";

}

// Egy lecke nyomtatható sorai: a nem nyomtatható feladatok összevonva
// (pl. nyolc törtfeladat → egy „🍕 Törtek ×8” sor), hogy a feladatlista és a
// megoldáslista ugyanannyi soros és egyező sorrendű legyen.
export function lessonLines(steps) {

    const lines = [];

    for (const step of steps) {
        const nameOnly = isNameOnlyStep(step);
        const text = taskText(step);
        const last = lines[lines.length - 1];
        if (nameOnly && last && last.nameOnly && last.text === text) {
            last.count++;
            continue;
        }
        lines.push({ text, answer: taskAnswer(step), nameOnly, count: 1 });
    }

    return lines;

}
