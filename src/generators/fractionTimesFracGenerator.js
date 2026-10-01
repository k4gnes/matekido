const MAX_GENERATION_ATTEMPTS = 10000;
const MAX_ATTEMPTS = 300;

const DENOMS = [2, 3, 4, 5, 6, 8];

const MAX_RAW_NUM = 30;
const MAX_RAW_DEN = 48;

const MODES = ["basic", "simplify", "mixed"];

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

function sameValue(aNum, aDen, bNum, bDen) {
    return aNum * bDen === bNum * aDen;
}

function fractionOptions(answerNum, answerDen, candidates) {
    const values = [[answerNum, answerDen]];
    const options = [];
    const tags = [];

    const addable = (num, den) => {
        if (!Number.isInteger(num) || !Number.isInteger(den)) return false;
        if (num < 1 || den < 2) return false;
        if (num > den) return false;
        if (num > MAX_RAW_NUM || den > MAX_RAW_DEN) return false;
        if (values.some(([vn, vd]) => sameValue(num, den, vn, vd))) return false;
        values.push([num, den]);
        return true;
    };

    for (const [num, den, tag] of candidates) {
        if (options.length >= 3) break;
        if (!addable(num, den)) continue;
        options.push({ numerator: num, denominator: den, correct: false });
        tags.push(tag);
    }

    for (let step = 1; options.length < 3 && step <= 4; step++) {
        const round = [
            [answerNum + step, answerDen],
            [answerNum - step, answerDen],
            [answerNum, answerDen - step],
            [answerNum, answerDen + step]
        ];
        for (const [num, den] of round) {
            if (options.length >= 3) break;
            if (!addable(num, den)) continue;
            options.push({ numerator: num, denominator: den, correct: false });
            tags.push("near");
        }
    }

    if (options.length < 3) return null;

    return {
        options: shuffle([
            { numerator: answerNum, denominator: answerDen, correct: true },
            ...options
        ]),
        tags
    };
}

function buildTask(mode) {

    const wantSimplify = mode === "simplify"
        || (mode === "mixed" && Math.random() < 0.6);

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const denA = pick(DENOMS);
        const denB = pick(DENOMS);
        const numA = randint(1, denA - 1);
        const numB = randint(1, denB - 1);

        const rawNum = numA * numB;
        const rawDen = denA * denB;

        if (rawNum > MAX_RAW_NUM || rawDen > MAX_RAW_DEN) continue;

        const g = gcd(rawNum, rawDen);

        if (wantSimplify && g === 1) continue;
        if (!wantSimplify && g !== 1) continue;

        const answerNum = rawNum / g;
        const answerDen = rawDen / g;

        const built = fractionOptions(answerNum, answerDen, [
            [numA * denB, denA * numB, "swap"],
            [numA + numB, denA + denB, "add"],
            [rawNum + numB, rawDen, "over"],
            [numA + numB, rawDen, "addNum"],
            [numA, rawDen, "denOnly"],
            [rawNum, denA, "numOnly"],
            [rawNum, rawDen + numB, "over"]
        ]);

        if (!built) continue;

        const explanation = g > 1
            ? `A számlálók és a nevezők összeszorzódnak: ${numA}/${denA} × ${numB}/${denB} = ${rawNum}/${rawDen}. Ezután egyszerűsítünk: a ${rawNum} és a ${rawDen} közös osztója a ${g}, így az eredmény ${answerNum}/${answerDen}.`
            : `A számlálók és a nevezők összeszorzódnak: ${numA}/${denA} × ${numB}/${denB} = ${rawNum}/${rawDen}. Ez már nem egyszerűsíthető tovább.`;

        return {
            type: "fraction-times-frac",
            mode: g > 1 ? "simplify" : "basic",
            numA,
            denA,
            numB,
            denB,
            rawNum,
            rawDen,
            answerNum,
            answerDen,
            options: built.options,
            tags: built.tags,
            explanation
        };
    }

    return null;
}

export function generateFractionTimesFrac(options = {}) {

    const { count = 4, mode = "basic" } = options;

    const modes = MODES.includes(mode) ? [mode] : MODES;

    const tasks = [];
    const spare = [];
    const seen = new Set();
    const seenTags = new Set();
    let attempts = 0;

    while (tasks.length < count && attempts <= MAX_GENERATION_ATTEMPTS) {
        attempts++;

        const task = buildTask(pick(modes));
        if (!task) continue;

        const key = `${task.numA}/${task.denA}*${task.numB}/${task.denB}`;
        if (seen.has(key)) continue;
        seen.add(key);

        if (task.tags.some(tag => !seenTags.has(tag))) {
            for (const tag of task.tags) seenTags.add(tag);
            tasks.push(task);
        } else if (spare.length < count * 3) {
            spare.push(task);
        }
    }

    for (const task of spare) {
        if (tasks.length >= count) break;
        tasks.push(task);
    }

    if (tasks.length < count) {
        throw new Error("Nem sikerült elegendő feladatot generálni...");
    }

    return tasks;
}
