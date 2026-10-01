const MAX_GENERATION_ATTEMPTS = 10000;
const MAX_ATTEMPTS = 300;

const DENOMS = [2, 3, 4, 5, 6, 8, 9, 10, 12];

const DENOMS_WHOLE = [2, 3, 4, 5, 6, 8, 9];

const KINDS = ["pizza", "torta", "csoki", "szendvics"];

const MAX_WHOLE = 9;
const MAX_FACTOR = 9;
const MAX_RATIO = 3;

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gcd(a, b) {
    return b ? gcd(b, a % b) : a;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function wholeOptions(answer, candidates) {
    const values = new Set([answer]);
    const options = [];

    for (const value of candidates) {
        if (options.length >= 3) break;
        if (!Number.isInteger(value) || value < 1 || value > 20) continue;
        if (values.has(value)) continue;
        values.add(value);
        options.push({ value, correct: false });
    }

    for (let step = 1; options.length < 3 && step <= 4; step++) {
        for (const value of [answer + step, answer - step]) {
            if (options.length >= 3) break;
            if (value < 1 || value > 20 || values.has(value)) continue;
            values.add(value);
            options.push({ value, correct: false });
        }
    }

    if (options.length < 3) return null;

    return shuffle([{ value: answer, correct: true }, ...options]);
}

function sameValue(aNum, aDen, bNum, bDen) {
    return aNum * bDen === bNum * aDen;
}

function fractionOptions(answerNum, answerDen, candidates) {
    const values = [[answerNum, answerDen]];
    const options = [];

    const addable = (num, den) => {
        if (!Number.isInteger(num) || !Number.isInteger(den)) return false;
        if (num < 1 || den < 2) return false;
        if (num > den * MAX_RATIO) return false;
        if (values.some(([vn, vd]) => sameValue(num, den, vn, vd))) return false;
        values.push([num, den]);
        return true;
    };

    for (const [num, den] of candidates) {
        if (options.length >= 3) break;
        if (!addable(num, den)) continue;
        options.push({ numerator: num, denominator: den, correct: false });
    }

    for (let step = 1; options.length < 3 && step <= 3; step++) {
        for (const [num, den] of [[answerNum + step, answerDen], [answerNum - step, answerDen]]) {
            if (options.length >= 3) break;
            if (!addable(num, den)) continue;
            options.push({ numerator: num, denominator: den, correct: false });
        }
    }

    if (options.length < 3) return null;

    return shuffle([
        { numerator: answerNum, denominator: answerDen, correct: true },
        ...options
    ]);
}

function buildWhole() {
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const den = pick(DENOMS_WHOLE);
        const times = randint(1, 4);
        const factor = den * times;
        const num = randint(1, den - 1);
        const result = num * times;

        if (factor > MAX_FACTOR || result < 2 || result > MAX_WHOLE) continue;

        const options = wholeOptions(result, [
            num * factor,
            result + factor,
            result - 1,
            den,
            factor,
            num,
            result + 1
        ]);

        if (!options) continue;

        return {
            type: "fraction-times-int",
            mode: "whole",
            kind: pick(KINDS),
            num,
            den,
            factor,
            answer: result,
            options,
            explanation: `A nevezővel szorozva egy teljes adag: ${num}/${den} × ${den} = ${num}. Mivel ${factor} = ${den} × ${times}, ezért ${num}/${den} × ${factor} = ${result} teljes adag.`
        };
    }

    return null;
}

function buildFraction() {
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const den = pick(DENOMS);
        const num = randint(1, den - 1);
        const factor = randint(2, MAX_FACTOR);

        const rawNum = num * factor;
        if (rawNum % den === 0) continue;
        if (rawNum / den > MAX_RATIO) continue;

        const g = gcd(rawNum, den);
        const answerNum = rawNum / g;
        const answerDen = den / g;

        const options = fractionOptions(answerNum, answerDen, [
            [rawNum, den],
            [num, den],
            [rawNum + den, den],
            [rawNum - den, den],
            [num * (factor + 1), den],
            [num * (factor - 1), den]
        ]);

        if (!options) continue;

        const simplifyText = g > 1
            ? ` A ${rawNum}/${den} még egyszerűsíthető ${g}-nel: ${answerNum}/${answerDen}.`
            : "";

        return {
            type: "fraction-times-int",
            mode: "fraction",
            kind: pick(KINDS),
            num,
            den,
            factor,
            answerNum,
            answerDen,
            options,
            explanation: `Egész számmal szorozva csak a számláló változik: ${num}/${den} × ${factor} = ${rawNum}/${den}.${simplifyText}`
        };
    }

    return null;
}

function buildTask(mode) {
    if (mode === "whole") return buildWhole();
    if (mode === "fraction") return buildFraction();
    return Math.random() < 0.5 ? buildWhole() : buildFraction();
}

export function generateFractionTimesInt(options = {}) {

    const { count = 4, mode = "whole" } = options;

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

        const key = `${task.mode}:${task.num}/${task.den}*${task.factor}`;
        if (seen.has(key)) continue;
        seen.add(key);
        tasks.push(task);
    }

    return tasks;
}