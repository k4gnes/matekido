const MAX_GENERATION_ATTEMPTS = 10000;

const MAX_DEN = 12;

const KINDS = ["pizza", "torta", "csoki", "szendvics"];

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gcd(a, b) {
    return b ? gcd(b, a % b) : a;
}

function lcm(a, b) {
    return a * b / gcd(a, b);
}

function reduce(num, den) {
    const g = gcd(num, den);
    return [num / g, den / g];
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

const DENOMS = [2, 3, 4, 5, 6, 8, 10, 12];

function addPairs() {
    const pairs = [];
    for (const denA of DENOMS) {
        for (const denB of DENOMS) {
            if (denA !== denB && lcm(denA, denB) <= MAX_DEN) {
                pairs.push([denA, denB]);
            }
        }
    }
    return pairs;
}

function subPairs() {
    const pairs = [];
    for (const denA of DENOMS) {
        for (const denB of DENOMS) {
            if (denB < denA && denA % denB === 0) {
                pairs.push([denA, denB]);
            }
        }
    }
    return pairs;
}

const ADD_PAIRS = addPairs();
const SUB_PAIRS = subPairs();

function buildOptions(candidates, answerNum, answerDen) {
    const values = new Set([answerNum / answerDen]);
    const distractors = [];

    function offer(num, den) {
        if (distractors.length >= 3) return;
        if (!Number.isInteger(num) || !Number.isInteger(den)) return;
        if (num < 1 || den < 2 || den > MAX_DEN * 2) return;
        const value = num / den;
        if (value <= 0 || value >= 1 || values.has(value)) return;
        values.add(value);
        distractors.push({ numerator: num, denominator: den, correct: false });
    }

    for (const [num, den] of candidates) {
        offer(num, den);
    }

    for (let step = 1; distractors.length < 3 && step <= 4; step++) {
        offer(answerNum + step, answerDen);
        offer(answerNum - step, answerDen);
    }

    if (distractors.length < 3) return null;

    return shuffle([
        { numerator: answerNum, denominator: answerDen, correct: true },
        ...distractors
    ]);
}

function buildAdd() {
    const [denA, denB] = pick(ADD_PAIRS);
    const commonDen = lcm(denA, denB);

    for (let i = 0; i < 300; i++) {
        const numA = randint(1, denA - 1);
        const numB = randint(1, denB - 1);
        const liftA = numA * commonDen / denA;
        const liftB = numB * commonDen / denB;
        const total = liftA + liftB;
        if (total >= commonDen) continue;

        const [answerNum, answerDen] = reduce(total, commonDen);
        if (answerDen > MAX_DEN) continue;

        const options = buildOptions([
            [numA + numB, denA],
            [numA + numB, denB],
            [total, commonDen],
            [answerNum + 1, answerDen],
            [answerNum, answerDen * 2],
            [liftA, commonDen]
        ], answerNum, answerDen);

        if (!options) continue;

        return {
            type: "fraction-common-den",
            mode: "add",
            kind: pick(KINDS),
            numA,
            denA,
            numB,
            denB,
            operator: "+",
            commonDen,
            answerNum,
            answerDen,
            options,
            explanation: `A közös nevező a ${commonDen}: ${numA}/${denA} = ${liftA}/${commonDen} és ${numB}/${denB} = ${liftB}/${commonDen}, így ${liftA}/${commonDen} + ${liftB}/${commonDen} = ${answerNum}/${answerDen}`
        };
    }

    return null;
}

function buildSub() {
    const [denA, denB] = pick(SUB_PAIRS);
    const commonDen = denA;

    for (let i = 0; i < 300; i++) {
        const numA = randint(1, denA - 1);
        const numB = randint(1, denB - 1);
        const liftA = numA;
        const liftB = numB * commonDen / denB;
        const rest = liftA - liftB;
        if (rest <= 0) continue;

        const [answerNum, answerDen] = reduce(rest, commonDen);
        if (answerDen > MAX_DEN) continue;

        const options = buildOptions([
            [numA - numB, denA],
            [liftA + liftB, commonDen],
            [rest, commonDen],
            [answerNum + 1, answerDen],
            [answerNum, answerDen * 2]
        ], answerNum, answerDen);

        if (!options) continue;

        return {
            type: "fraction-common-den",
            mode: "sub",
            kind: pick(KINDS),
            numA,
            denA,
            numB,
            denB,
            operator: "−",
            commonDen,
            answerNum,
            answerDen,
            options,
            explanation: `A nagyobb nevező a közös nevező: ${numA}/${denA} = ${liftA}/${commonDen} és ${numB}/${denB} = ${liftB}/${commonDen}, így ${liftA}/${commonDen} − ${liftB}/${commonDen} = ${answerNum}/${answerDen}`
        };
    }

    return null;
}

function buildTask(mode) {
    if (mode === "add") return buildAdd();
    return buildSub();
}

export function generateFractionCommonDen(options = {}) {

    const { count = 4, mode = "add" } = options;

    const tasks = [];
    const seen = new Set();
    let attempts = 0;

    while (tasks.length < count) {
        attempts++;
        if (attempts > MAX_GENERATION_ATTEMPTS) {
            throw new Error("Nem sikerült elegendő feladatot generálni...");
        }

        const task = buildTask(mode);
        if (!task) continue;

        const key = `${task.numA}/${task.denA}${task.operator}${task.numB}/${task.denB}`;
        if (seen.has(key)) continue;
        seen.add(key);
        tasks.push(task);
    }

    return tasks;
}