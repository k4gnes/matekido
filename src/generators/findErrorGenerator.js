function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeCalculation(max) {
    if (Math.random() < 0.5) {
        const a = randint(11, max - 11);
        const b = randint(4, max - a);
        return { text: `${a} + ${b}`, correct: a + b, op: "addition" };
    }
    const a = randint(15, max);
    const b = randint(6, a - 5);
    return { text: `${a} − ${b}`, correct: a - b, op: "subtraction" };
}

function makeWrongResult(calc) {
    if (calc.op === "addition") {
        return calc.correct + pick([-10, -1, 1]);
    }
    return calc.correct + pick([10, -1, 1]);
}

function buildSingle(max) {
    const calc = makeCalculation(max);
    const hasError = Math.random() < 0.5;
    const shown = hasError ? makeWrongResult(calc) : calc.correct;

    return {
        type: "find-error",
        mode: "single",
        statement: `${calc.text} = ${shown}`,
        hasError,
        correctResult: calc.correct,
        answer: hasError
    };
}

function buildPick(max) {
    const calcs = [];
    const usedTexts = new Set();
    while (calcs.length < 3) {
        const calc = makeCalculation(max);
        if (usedTexts.has(calc.text)) continue;
        usedTexts.add(calc.text);
        calcs.push(calc);
    }

    const errorIndex = randint(0, 2);
    const items = calcs.map((calc, i) => {
        const hasError = i === errorIndex;
        const shown = hasError ? makeWrongResult(calc) : calc.correct;
        return { statement: `${calc.text} = ${shown}`, hasError };
    });

    return {
        type: "find-error",
        mode: "pick",
        items,
        answer: errorIndex
    };
}

export function generateFindError(options = {}) {
    const { count = 8, max = 50, mode = "mixed" } = options;

    const tasks = [];
    for (let i = 0; i < count; i++) {
        const m = mode === "mixed"
            ? (Math.random() < 0.5 ? "single" : "pick")
            : mode;
        tasks.push(m === "pick" ? buildPick(max) : buildSingle(max));
    }
    return tasks;
}
