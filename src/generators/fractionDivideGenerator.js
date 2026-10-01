const MAX_GENERATION_ATTEMPTS = 10000;
const MAX_ATTEMPTS = 300;

const DENOMS = [2, 3, 4, 5, 6, 8];

const MAX_RAW_NUM = 30;
const MAX_RAW_DEN = 48;
const MAX_RATIO = 3;

const MAX_DIVISOR = 9;

const KINDS = ["pizza", "torta", "csoki", "szendvics"];

const MODES = ["whole", "fraction", "mixed"];

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
        if (num > den * MAX_RATIO) return false;
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

function buildWhole() {

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const den = pick(DENOMS);
        const num = randint(1, den - 1);
        const divisor = randint(2, MAX_DIVISOR);

        const rawDen = den * divisor;

        if (rawDen > MAX_RAW_DEN) continue;

        const g = gcd(num, rawDen);
        const answerNum = num / g;
        const answerDen = rawDen / g;

        const candidates = [
            [num * divisor, den, "mulInstead"],
            [num, num, "noChange"],
            [num + divisor, den, "addInstead"],
            [num + 1, rawDen, "over"]
        ];

        if (den % divisor === 0 && den / divisor >= 2) {
            candidates.push([num, den / divisor, "denDiv"]);
        }

        const built = fractionOptions(answerNum, answerDen, candidates);

        if (!built) continue;

        const explanation = g > 1
            ? `Egésszel osztva a nevezőt kell megszorozni: ${num}/${den} ÷ ${divisor} = ${num}/${rawDen}. A ${num} és a ${rawDen} közös osztója a ${g}, így az eredmény ${answerNum}/${answerDen}.`
            : `Egésszel osztva a nevezőt kell megszorozni: ${num}/${den} ÷ ${divisor} = ${num}/${rawDen}. Ez már nem egyszerűsíthető tovább.`;

        return {
            type: "fraction-divide",
            mode: "whole",
            kind: pick(KINDS),
            num,
            den,
            divisor,
            answerNum,
            answerDen,
            options: built.options,
            tags: built.tags,
            explanation
        };
    }

    return null;
}

function buildFraction() {

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const denA = pick(DENOMS);
        const denB = pick(DENOMS);
        const numA = randint(1, denA - 1);
        const numB = randint(1, denB - 1);

        const rawNum = numA * denB;
        const rawDen = denA * numB;

        if (rawNum > MAX_RAW_NUM || rawDen > MAX_RAW_DEN) continue;
        if (rawNum > rawDen * MAX_RATIO) continue;

        const g = gcd(rawNum, rawDen);
        const answerNum = rawNum / g;
        const answerDen = rawDen / g;

        if (answerDen === 1) continue;

        const built = fractionOptions(answerNum, answerDen, [
            [numA * numB, denA * denB, "mulAnswer"],
            [numA * denB, denA, "numOnly"],
            [numA, denA * numB, "denOnly"],
            [rawNum + numA, rawDen, "over"],
            [numA + numB, denA * denB, "addNum"]
        ]);

        if (!built) continue;

        const explanation = g > 1
            ? `Törttel osztva megfordítjuk a szorzást: ${numA}/${denA} ÷ ${numB}/${denB} = ${numA}/${denA} × ${denB}/${numB} = ${rawNum}/${rawDen}. A ${rawNum} és a ${rawDen} közös osztója a ${g}, így az eredmény ${answerNum}/${answerDen}.`
            : `Törttel osztva megfordítjuk a szorzást: ${numA}/${denA} ÷ ${numB}/${denB} = ${numA}/${denA} × ${denB}/${numB} = ${rawNum}/${rawDen}. Ez már nem egyszerűsíthető tovább.`;

        return {
            type: "fraction-divide",
            mode: "fraction",
            kind: pick(KINDS),
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

function buildTask(mode) {
    if (mode === "whole") return buildWhole();
    if (mode === "fraction") return buildFraction();
    return Math.random() < 0.5 ? buildWhole() : buildFraction();
}

export function generateFractionDivide(options = {}) {

    const { count = 4, mode = "whole" } = options;

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

        const key = task.mode === "whole"
            ? `${task.num}/${task.den}:${task.divisor}`
            : `${task.numA}/${task.denA}:${task.numB}/${task.denB}`;

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