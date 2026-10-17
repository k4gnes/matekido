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
const ONE_STEP_KINDS = ["mul", "add", "sub"];
const ONE_STEP_ADDSUB_KINDS = ["add", "sub"];

const DEFAULT_CHALLENGE = {
    logicColors: [2, 3],
    logicHard: false,
    combineA: [2, 4],
    combineB: [2, 4],
    orderN: [3, 4],
    pairN: [4, 8],
    sumDiffMax: 100
};

const GRADE_PRESETS = {
    1: {
        max: 20,
        missingOp: { addSubMax: 20, mulA: 5, mulB: 5, operators: ["+", "−"] },
        think: { kinds: ONE_STEP_ADDSUB_KINDS, startMax: 9, factorMax: 5, constMax: 9 },
        challenge: { logicColors: [2, 2] }
    },
    2: {
        max: 100,
        missingOp: { addSubMax: 99, mulA: 10, mulB: 5, operators: ["+", "−", "×"] },
        think: { kinds: ONE_STEP_KINDS, startMax: 9, factorMax: 5, constMax: 9 },
        challenge: { combineA: [2, 4], combineB: [2, 4] }
    },
    3: {
        max: 99,
        missingOp: { addSubMax: 99, mulA: 9, mulB: 9, operators: ALL_OPERATORS },
        think: { kinds: MUL_KINDS, startMax: 9, factorMax: 5, constMax: 9 },
        challenge: { orderN: [3, 4] }
    },
    4: {
        max: 1000,
        missingOp: { addSubMax: 999, mulA: 99, mulB: 9, operators: ALL_OPERATORS },
        think: { kinds: MUL_KINDS, startMax: 9, factorMax: 9, constMax: 9 },
        challenge: { pairN: [4, 8], logicColors: [2, 3] }
    },
    5: {
        max: 1000,
        missingOp: { addSubMax: 999, mulA: 99, mulB: 9, operators: ALL_OPERATORS },
        think: { kinds: MUL_KINDS, startMax: 9, factorMax: 9, constMax: 9 },
        challenge: { pairN: [5, 9] }
    },
    6: {
        max: 1000,
        missingOp: { addSubMax: 999, mulA: 99, mulB: 9, operators: ALL_OPERATORS },
        think: { kinds: MUL_KINDS, startMax: 9, factorMax: 9, constMax: 9 },
        challenge: { sumDiffMax: 200 }
    },
    7: {
        max: 1000,
        missingOp: { addSubMax: 999, mulA: 99, mulB: 9, operators: ALL_OPERATORS },
        think: { kinds: MUL_KINDS, startMax: 9, factorMax: 9, constMax: 9 },
        challenge: { pairN: [6, 10], logicColors: [2, 3], logicHard: true, sumDiffMax: 1000 }
    }
};

const DEFAULT_PRESET = GRADE_PRESETS[3];

function resolvePreset(grade) {
    return GRADE_PRESETS[grade] ?? DEFAULT_PRESET;
}

function challengeConfig(preset) {
    return { ...DEFAULT_CHALLENGE, ...(preset.challenge ?? {}) };
}

function factorial(n) {
    let value = 1;
    for (let i = 2; i <= n; i++) value *= i;
    return value;
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

function choiceOptions(answer, candidates) {
    const seen = new Set([answer]);
    const values = [answer];
    const push = (value) => {
        if (values.length >= 4) return;
        if (Number.isInteger(value) && value > 0 && !seen.has(value)) {
            seen.add(value);
            values.push(value);
        }
    };
    for (const candidate of candidates) push(candidate);
    let step = 1;
    while (values.length < 4) {
        push(answer + step);
        push(answer - step);
        step++;
    }
    return shuffle(values).map(value => ({ text: String(value), correct: value === answer }));
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

function thinkNumberFallback() {
    const start = 5;
    const ops = [{ op: "+", value: 3 }];
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
    if (kind === "mul") {
        return [{ op: "×", value: randInt(2, factorMax) }];
    }
    if (kind === "add") {
        return [{ op: "+", value: randInt(1, constMax) }];
    }
    if (kind === "sub") {
        return [{ op: "−", value: randInt(1, constMax) }];
    }
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

    return thinkNumberFallback();
}

const SOCK_COLORS = ["piros", "kék", "zöld"];

const COMBINE_CONTEXTS = [
    { a: "sapka", b: "sál", pickA: "sapkát", pickB: "sálat" },
    { a: "szendvics", b: "ital", pickA: "szendvicset", pickB: "italt" },
    { a: "fagylalt", b: "öntet", pickA: "fagylaltot", pickB: "öntetet" },
    { a: "póló", b: "nadrág", pickA: "pólót", pickB: "nadrágot" }
];

function buildPair(preset) {
    const { pairN } = challengeConfig(preset);
    const n = randInt(pairN[0], pairN[1]);
    const answer = (n * (n - 1)) / 2;
    return {
        mode: "pair",
        n,
        answer,
        question: `${n} gyerek találkozik, és mindenki kezet fog mindenkivel. Hány kézfogás lesz összesen?`,
        options: choiceOptions(answer, [n * (n - 1), n + (n - 1), n * n, answer + n, answer - n]),
        successText: `🎉 Ügyes! Mindenki ${n - 1} másikkal fog kezet, ez ${n} × ${n - 1} = ${n * (n - 1)}, de így minden kézfogást kétszer számoltunk, ezért a válasz ${answer}.`
    };
}

function buildLogic(preset) {
    const { logicColors, logicHard } = challengeConfig(preset);
    const k = randInt(logicColors[0], logicColors[1]);
    const perColor = [5, 6, 8, 10][randInt(0, 3)];
    const colors = SOCK_COLORS.slice(0, k);
    const parts = colors.map(color => `${perColor} ${color}`);
    const list = parts.slice(0, -1).join(", ") + " és " + parts[parts.length - 1];

    if (logicHard) {
        const target = colors[randInt(0, colors.length - 1)];
        const answer = (k - 1) * perColor + 2;
        return {
            mode: "logic",
            hard: true,
            colors: k,
            perColor,
            answer,
            question: `Egy fiókban ${list} zokni van. Csukott szemmel hány zoknit kell kivenni, hogy biztosan legyen ${target} színű pár?`,
            options: choiceOptions(answer, [k + 1, perColor, 2, (k - 1) * perColor + 1, perColor * k]),
            successText: `🎉 Ügyes! A legrosszabb esetben kiveszed az összes többi színt (${k - 1} × ${perColor} = ${(k - 1) * perColor} zokni), és még nincs ${target} színű pár. Utána már 2 ${target} zokni biztosan lesz, ezért ${answer} zokni kell.`
        };
    }

    const answer = k + 1;
    return {
        mode: "logic",
        colors: k,
        perColor,
        answer,
        question: `Egy fiókban ${list} zokni van. Csukott szemmel hány zoknit kell kivenni, hogy biztosan legyen köztük egyszínű pár?`,
        options: choiceOptions(answer, [k, k + 2, perColor, 2]),
        successText: `🎉 Ügyes! A legrosszabb esetben minden színből kiveszel egyet (${k} zokni), és még nincs pár. A következő zokni viszont már biztosan párt alkot valamelyikkel, ezért ${answer} zokni kell.`
    };
}

function buildCombine(preset) {
    const { combineA, combineB } = challengeConfig(preset);
    const context = pick(COMBINE_CONTEXTS);
    const a = randInt(combineA[0], combineA[1]);
    const b = randInt(combineB[0], combineB[1]);
    const answer = a * b;
    return {
        mode: "combine",
        a,
        b,
        answer,
        question: `Egy boltban ${a} különböző ${context.a} és ${b} különböző ${context.b} van. Hányféleképpen választhatsz egy ${context.pickA} és egy ${context.pickB}?`,
        options: choiceOptions(answer, [a + b, answer + a, answer - b, answer + b]),
        successText: `🎉 Ügyes! Minden ${context.a} mellé ${b} féle ${context.b} választható, ezért ${a} × ${b} = ${answer} lehetőség van.`
    };
}

function buildOrder(preset) {
    const { orderN } = challengeConfig(preset);
    const n = randInt(orderN[0], orderN[1]);
    const answer = factorial(n);
    const factors = [];
    for (let i = n; i >= 1; i--) factors.push(i);
    return {
        mode: "order",
        n,
        answer,
        question: `Hányféle sorrendben állhat sorba ${n} gyerek?`,
        options: choiceOptions(answer, [n, n * n, answer - n, answer + n]),
        successText: `🎉 Ügyes! Az első helyre ${n} gyerek állhat, a másodikra már csak ${n - 1}, aztán ${n - 2}, végül 1: ${factors.join(" × ")} = ${answer}.`
    };
}

function buildSumDiff(preset) {
    const { sumDiffMax } = challengeConfig(preset);
    const big = randInt(6, Math.max(7, Math.floor(sumDiffMax / 2)));
    const small = randInt(2, big - 2);
    const sum = big + small;
    const diff = big - small;
    return {
        mode: "sumdiff",
        big,
        small,
        sum,
        diff,
        answer: big,
        question: `Két szám összege ${sum}, a különbségük ${diff}. Mennyi a nagyobbik szám?`,
        options: choiceOptions(big, [small, sum, diff, sum + diff]),
        successText: `🎉 Ügyes! Ha a két szám összege ${sum}, a különbségük pedig ${diff}, akkor a nagyobbik szám: (${sum} + ${diff}) : 2 = ${big}, a kisebbik pedig ${small}.`
    };
}

function buildWorkWord(preset) {
    const max = preset.max;
    for (let attempt = 0; attempt < 200; attempt++) {
        const workers1 = randInt(2, 6);
        const days1 = randInt(2, 8);
        const total = workers1 * days1;
        if (total > max) continue;

        const candidates = [];
        for (let d = 2; d <= 10; d++) {
            if (d === workers1 || total % d !== 0) continue;
            const days = total / d;
            if (days >= 2 && days <= 12) candidates.push({ workers: d, days });
        }
        if (candidates.length === 0) continue;

        const chosen = pick(candidates);

        return {
            mode: "word",
            kind: "work",
            workers1,
            days1,
            workers2: chosen.workers,
            answer: chosen.days,
            question: `Egy munkát ${workers1} munkás ${days1} nap alatt végez el. Ugyanezt a munkát ${chosen.workers} munkás hány nap alatt végzi el?`,
            successText: `🎉 Ügyes! A munka összesen ${workers1} × ${days1} = ${total} munkanap. ${chosen.workers} munkásnak ez ${total} : ${chosen.workers} = ${chosen.days} nap.`
        };
    }
    return null;
}

function buildTripWord(preset) {
    const max = preset.max;
    for (let attempt = 0; attempt < 200; attempt++) {
        const speed1 = randInt(9, 15);
        const time1 = randInt(3, 6);
        const distance = speed1 * time1;
        if (distance > max) continue;

        const candidates = [];
        for (let t = 2; t < time1; t++) {
            if (distance % t !== 0) continue;
            const speed = distance / t;
            if (speed > speed1 && speed <= 90) candidates.push({ time: t, speed });
        }
        if (candidates.length === 0) continue;

        const chosen = pick(candidates);

        return {
            mode: "word",
            kind: "trip",
            speed1,
            time1,
            time2: chosen.time,
            answer: chosen.speed,
            question: `Egy kerékpáros ${speed1} km/h sebességgel ${time1} órán át tekert. Ugyanezt az utat egy autó ${chosen.time} óra alatt teszi meg. Hány km/h az autó sebessége?`,
            successText: `🎉 Ügyes! Az út hossza ${speed1} × ${time1} = ${distance} km, ezt ${chosen.time} óra alatt megtenni ${distance} : ${chosen.time} = ${chosen.speed} km/h sebesség.`
        };
    }
    return null;
}

function buildPercentWord(preset) {
    const max = preset.max;
    const percent = pick([10, 20, 25, 50, 75]);
    const total = randInt(2, Math.min(10, Math.floor(max / 100))) * 100;
    if (total < 100 || total > max) return null;

    const answer = (total * (100 - percent)) / 100;

    return {
        mode: "word",
        kind: "percent",
        total,
        percent,
        answer,
        question: `Egy iskolába ${total} tanuló jár. Közülük ${percent}% fiú. Hány lány jár az iskolába?`,
        successText: `🎉 Ügyes! A fiúk aránya ${percent}%, így a lányoké ${100 - percent}%. Ezért ${total} × ${100 - percent} : 100 = ${answer} lány jár az iskolába.`
    };
}

function buildShareWord(preset) {
    const max = preset.max;
    const ratios = [[2, 1], [3, 1], [4, 1], [3, 2], [4, 3], [5, 2]];
    const steps = [50, 100, 150, 200, 250];
    for (let attempt = 0; attempt < 100; attempt++) {
        const [ra, rb] = pick(ratios);
        const units = ra + rb;
        const options = steps.filter(k => units * k <= max);
        if (options.length === 0) continue;

        const k = pick(options);
        const total = units * k;
        const bigger = Math.max(ra, rb);
        const answer = bigger * k;

        return {
            mode: "word",
            kind: "share",
            ra,
            rb,
            total,
            answer,
            question: `Évi és Dani ${total} forintot kap együtt. Az összeget ${ra}:${rb} arányban osztják el egymás között. Hány forint jut a nagyobbik részre?`,
            successText: `🎉 Ügyes! Az arány ${ra}:${rb}, összesen ${units} rész. Egy rész ${total} : ${units} = ${k} forint, a nagyobbik rész ${bigger} × ${k} = ${answer} forint.`
        };
    }
    return null;
}

function buildWordProblem(preset) {
    const wordBuilders = [buildWorkWord, buildTripWord, buildPercentWord, buildShareWord];
    for (let attempt = 0; attempt < 60; attempt++) {
        for (const builder of shuffle(wordBuilders.slice())) {
            const task = builder(preset);
            if (task) return task;
        }
    }

    const total = 400;
    const [ra, rb] = [3, 1];
    return {
        mode: "word",
        kind: "share",
        ra,
        rb,
        total,
        answer: ra * 100,
        question: `Évi és Dani ${total} forintot kap együtt. Az összeget ${ra}:${rb} arányban osztják el egymás között. Hány forint jut a nagyobbik részre?`,
        successText: `🎉 Ügyes! Az arány ${ra}:${rb}, összesen ${ra + rb} rész. Egy rész ${total} : ${ra + rb} = 100 forint, a nagyobbik rész ${ra} × 100 = ${ra * 100} forint.`
    };
}

export function generateMaster(options = {}) {

    const { count = 4, mode = "mixed", grade } = options;

    const preset = resolvePreset(grade);

    const builders = {
        "missing-op": () => buildMissingOperator(preset),
        "think-number": () => buildThinkNumber(preset),
        "pair": () => buildPair(preset),
        "logic": () => buildLogic(preset),
        "combine": () => buildCombine(preset),
        "order": () => buildOrder(preset),
        "sumdiff": () => buildSumDiff(preset),
        "word": () => buildWordProblem(preset)
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
