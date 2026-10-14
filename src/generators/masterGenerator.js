function randInt(min, max) {
    if (max < min) return min;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

const ALL_OPERATORS = ["+", "−", "×", "÷"];

const INSTRUMENTAL = {
    2: "2-vel",
    3: "3-mal",
    4: "4-gyel",
    5: "5-tel",
    6: "6-tal",
    7: "7-tel",
    8: "8-cal",
    9: "9-cel"
};

const ACCUSATIVE = {
    1: "1-et",
    2: "2-t",
    3: "3-at",
    4: "4-et",
    5: "5-öt",
    6: "6-ot",
    7: "7-et",
    8: "8-at",
    9: "9-et"
};

const MUL_KINDS = ["mul-add", "add-mul", "mul-sub", "sub-mul"];
const ADDSUB_KINDS = ["add-add", "add-sub", "sub-add", "sub-sub"];

const GRADE_PRESETS = {
    1: {
        max: 20,
        missingOp: { addSubMax: 20, mulA: 5, mulB: 5, operators: ["+", "−"] },
        think: { kinds: ADDSUB_KINDS, startMax: 9, factorMax: 5, constMax: 9 }
    },
    2: {
        max: 100,
        missingOp: { addSubMax: 99, mulA: 10, mulB: 5, operators: ["+", "−", "×"] },
        think: { kinds: [...MUL_KINDS, ...ADDSUB_KINDS], startMax: 9, factorMax: 5, constMax: 9 }
    },
    3: {
        max: 99,
        missingOp: { addSubMax: 99, mulA: 9, mulB: 9, operators: ALL_OPERATORS },
        think: { kinds: MUL_KINDS, startMax: 9, factorMax: 5, constMax: 9 }
    },
    4: {
        max: 1000,
        missingOp: { addSubMax: 999, mulA: 99, mulB: 9, operators: ALL_OPERATORS },
        think: { kinds: MUL_KINDS, startMax: 9, factorMax: 9, constMax: 9 }
    },
    5: {
        max: 1000,
        missingOp: { addSubMax: 999, mulA: 99, mulB: 9, operators: ALL_OPERATORS },
        think: { kinds: MUL_KINDS, startMax: 9, factorMax: 9, constMax: 9 }
    },
    6: {
        max: 1000,
        missingOp: { addSubMax: 999, mulA: 99, mulB: 9, operators: ALL_OPERATORS },
        think: { kinds: MUL_KINDS, startMax: 9, factorMax: 9, constMax: 9 }
    }
};

const DEFAULT_PRESET = GRADE_PRESETS[3];

function resolvePreset(grade) {
    return GRADE_PRESETS[grade] ?? DEFAULT_PRESET;
}

function applyOperation(operator, a, b) {
    if (operator === "+") return a + b;
    if (operator === "−") return a - b;
    if (operator === "×") return a * b;
    if (operator === "÷") return b !== 0 && a % b === 0 ? a / b : null;
    return null;
}

function validOperators(a, b, result) {
    return ALL_OPERATORS.filter(operator => applyOperation(operator, a, b) === result);
}

function operatorOptions(answer, operators) {
    return shuffle(operators.map(operator => ({ text: operator, correct: operator === answer })));
}

function missingOperatorFallback(preset) {
    const a = 7;
    const b = 8;
    const result = 15;
    return {
        mode: "missing-op",
        a,
        b,
        result,
        answer: "+",
        display: `${a} ? ${b} = ${result}`,
        question: "Melyik műveleti jel hiányzik? Válaszd ki!",
        options: operatorOptions("+", preset.missingOp.operators)
    };
}

function buildMissingOperator(preset) {
    const { max, missingOp } = preset;
    const { addSubMax, mulA, mulB, operators } = missingOp;

    for (let attempt = 0; attempt < 800; attempt++) {
        const operator = pick(operators);
        let a;
        let b;
        let result;

        if (operator === "+") {
            a = randInt(2, addSubMax - 2);
            b = randInt(2, addSubMax - a);
            result = a + b;
        } else if (operator === "−") {
            a = randInt(4, addSubMax);
            b = randInt(2, a - 2);
            result = a - b;
        } else if (operator === "×") {
            a = randInt(2, mulA);
            b = randInt(2, mulB);
            result = a * b;
        } else {
            b = randInt(2, mulB);
            a = b * randInt(2, mulA);
            result = a / b;
        }

        if (result < 2 || result > max) continue;

        const matches = validOperators(a, b, result);
        if (matches.length !== 1) continue;

        const answer = matches[0];

        return {
            mode: "missing-op",
            a,
            b,
            result,
            answer,
            display: `${a} ? ${b} = ${result}`,
            question: "Melyik műveleti jel hiányzik? Válaszd ki!",
            options: operatorOptions(answer, operators)
        };
    }

    return missingOperatorFallback(preset);
}

function applyChain(start, ops) {
    let value = start;
    for (const step of ops) {
        if (step.op === "×") value *= step.value;
        else if (step.op === "+") value += step.value;
        else if (step.op === "−") value -= step.value;
    }
    return value;
}

function describeOps(ops) {
    const phrases = ops.map(step => {
        if (step.op === "×") return `megszoroztam ${INSTRUMENTAL[step.value]}`;
        if (step.op === "+") return `hozzáadtam ${ACCUSATIVE[step.value]}`;
        return `kivontam ${ACCUSATIVE[step.value]}`;
    });
    const joined = phrases.join(", majd ");
    return joined.charAt(0).toUpperCase() + joined.slice(1) + ".";
}

function chainText(ops, result) {
    let expression = "?";
    let previousOperator = null;
    for (const step of ops) {
        const needsParentheses = (previousOperator === "+" || previousOperator === "−") && step.op === "×";
        expression = needsParentheses
            ? `(${expression}) ${step.op} ${step.value}`
            : `${expression} ${step.op} ${step.value}`;
        previousOperator = step.op;
    }
    return `${expression} = ${result}`;
}

function thinkNumberFallback(preset) {
    const start = 5;
    const ops = preset.think.kinds.includes("mul-add")
        ? [{ op: "×", value: 3 }, { op: "+", value: 4 }]
        : [{ op: "+", value: 3 }, { op: "−", value: 2 }];
    const result = applyChain(start, ops);
    return {
        mode: "think-number",
        start,
        ops,
        result,
        answer: start,
        question: `Gondoltam egy számra. ${describeOps(ops)} Az eredmény ${result} lett. Melyik számra gondoltam?`,
        chain: chainText(ops, result)
    };
}

function buildOps(kind, factorMax, constMax) {
    if (kind === "mul-add") {
        return [{ op: "×", value: randInt(2, factorMax) }, { op: "+", value: randInt(1, constMax) }];
    }
    if (kind === "add-mul") {
        return [{ op: "+", value: randInt(1, constMax) }, { op: "×", value: randInt(2, factorMax) }];
    }
    if (kind === "mul-sub") {
        return [{ op: "×", value: randInt(2, factorMax) }, { op: "−", value: randInt(1, constMax) }];
    }
    if (kind === "sub-mul") {
        return [{ op: "−", value: randInt(1, constMax) }, { op: "×", value: randInt(2, factorMax) }];
    }
    if (kind === "add-add") {
        return [{ op: "+", value: randInt(1, constMax) }, { op: "+", value: randInt(1, constMax) }];
    }
    if (kind === "add-sub") {
        return [{ op: "+", value: randInt(1, constMax) }, { op: "−", value: randInt(1, constMax) }];
    }
    if (kind === "sub-add") {
        return [{ op: "−", value: randInt(1, constMax) }, { op: "+", value: randInt(1, constMax) }];
    }
    return [{ op: "−", value: randInt(1, constMax) }, { op: "−", value: randInt(1, constMax) }];
}

function buildThinkNumber(preset) {
    const { max, think } = preset;
    const { kinds, startMax, factorMax, constMax } = think;

    for (let attempt = 0; attempt < 800; attempt++) {
        const start = randInt(2, startMax);
        const kind = pick(kinds);
        const ops = buildOps(kind, factorMax, constMax);

        let value = start;
        let ok = true;
        for (const step of ops) {
            if (step.op === "×") value *= step.value;
            else if (step.op === "+") value += step.value;
            else value -= step.value;
            if (value < 1) {
                ok = false;
                break;
            }
        }
        if (!ok) continue;

        const result = value;
        if (result < 2 || result > max) continue;
        if (result === start) continue;

        return {
            mode: "think-number",
            start,
            ops,
            result,
            answer: start,
            question: `Gondoltam egy számra. ${describeOps(ops)} Az eredmény ${result} lett. Melyik számra gondoltam?`,
            chain: chainText(ops, result)
        };
    }

    return thinkNumberFallback(preset);
}

export function generateMaster(options = {}) {

    const { count = 4, mode = "mixed", grade } = options;

    const preset = resolvePreset(grade);

    const builders = {
        "missing-op": () => buildMissingOperator(preset),
        "think-number": () => buildThinkNumber(preset)
    };

    if (mode !== "mixed" && !builders[mode]) {
        throw new Error(`Ismeretlen mester mód: ${mode}`);
    }

    const tasks = [];
    const seen = new Set();

    let guard = 0;
    while (tasks.length < count && guard < count * 200) {
        guard++;
        const chosen = mode === "mixed" ? pick(Object.keys(builders)) : mode;
        const task = builders[chosen]();
        const key = `${task.mode}|${task.question}|${task.display ?? task.chain}`;
        if (seen.has(key)) continue;
        seen.add(key);
        tasks.push({
            type: "master",
            ...task
        });
    }

    return tasks;
}
