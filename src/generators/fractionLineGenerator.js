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

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const DENOMS = [2, 3, 4, 5, 6, 8];
const CONVERT_DENOMS = [3, 4, 5, 6, 8];
const MAX_NUM = 20;

function buildRead() {
    const den = pick([3, 4, 5, 6, 8]);
    const whole = randInt(0, 2);
    const max = whole + 1;

    const numerators = [];
    for (let n = 1; n < max * den; n++) {
        if (n % den === 0 || n > MAX_NUM) continue;
        numerators.push(n);
    }
    if (numerators.length < 4) return buildRead();

    const num = pick(numerators);
    const wrong = shuffle(numerators.filter(n => n !== num)).slice(0, 3);

    return {
        type: "fraction-line",
        mode: "read",
        den,
        max,
        num,
        value: num / den,
        answer: `${num}/${den}`,
        question: "Melyik törtet jelöli a nyíl a számegyenesen?",
        options: shuffle([
            { numerator: num, denominator: den, correct: true },
            ...wrong.map(n => ({ numerator: n, denominator: den, correct: false }))
        ]),
        hint: `A nevező (${den}) mutatja, hány egyenlő rész van egy egészben. A nyíl helyét a nullától indulva ${den}-onként számold meg!`
    };
}

function buildPlace() {
    const den = pick(DENOMS);
    const whole = randInt(0, 2);
    const max = whole + 1;
    const rem = randInt(1, den - 1);
    const num = whole * den + rem;

    if (num > MAX_NUM) return buildPlace();

    return {
        type: "fraction-line",
        mode: "place",
        den,
        max,
        num,
        value: num / den,
        answer: num,
        question: `Kattints a számegyenesen oda, ahol a ${num}/${den} van!`,
        hint: `Oszd az egészet ${den} egyenlő részre! A nullától ${den}-onként lépkedj, amíg eljutsz a ${num}/${den} helyéig.`
    };
}

function mixedDistance(candidate, whole, rem) {
    return Math.abs(candidate.whole - whole) + Math.abs(candidate.numerator - rem);
}

function buildToMixed() {
    const den = pick(CONVERT_DENOMS);
    const whole = randInt(1, 2);
    const rem = randInt(1, den - 1);
    const num = whole * den + rem;

    if (num > MAX_NUM) return buildToMixed();

    const candidates = [];
    for (let w = 1; w <= 3; w++) {
        for (let r = 1; r < den; r++) {
            if (w === whole && r === rem) continue;
            if (w * den + r > MAX_NUM) continue;
            candidates.push({ whole: w, numerator: r, denominator: den });
        }
    }
    candidates.sort((a, b) => mixedDistance(a, whole, rem) - mixedDistance(b, whole, rem));
    const wrong = shuffle(candidates.slice(0, 5)).slice(0, 3);
    if (wrong.length < 3) return buildToMixed();

    return {
        type: "fraction-line",
        mode: "to-mixed",
        den,
        whole,
        rem,
        num,
        value: num / den,
        answer: `${whole} ${rem}/${den}`,
        question: "Írd fel vegyes számként!",
        options: shuffle([
            { whole, numerator: rem, denominator: den, correct: true },
            ...wrong.map(c => ({ ...c, correct: false }))
        ]),
        hint: `A ${num}/${den} áltörtben a nevező ${den}. Előbb az egészeket váltjuk ki: ${den} · ${whole} = ${whole * den}, és marad ${rem}. Tehát ${whole} egész és ${rem}/${den}.`
    };
}

function buildToFraction() {
    const den = pick(CONVERT_DENOMS);
    const whole = randInt(1, 2);
    const rem = randInt(1, den - 1);
    const num = whole * den + rem;

    if (num > MAX_NUM) return buildToFraction();

    const raw = [
        whole * den,
        whole * den - rem,
        rem * den + whole,
        (whole + 1) * den + rem,
        whole + rem,
        whole * den + den - rem
    ];
    const seen = new Set([num]);
    const wrong = [];
    for (const n of shuffle(raw)) {
        if (n <= 0 || seen.has(n)) continue;
        seen.add(n);
        wrong.push({ numerator: n, denominator: den, correct: false });
        if (wrong.length >= 3) break;
    }
    if (wrong.length < 3) return buildToFraction();

    return {
        type: "fraction-line",
        mode: "to-fraction",
        den,
        whole,
        rem,
        num,
        value: num / den,
        answer: `${num}/${den}`,
        question: "Írd fel áltörtként!",
        options: shuffle([
            { numerator: num, denominator: den, correct: true },
            ...wrong
        ]),
        hint: `A ${whole} egész ${den} egyenlő részre bontva ${whole} · ${den} = ${whole * den} rész, ehhez jön a ${rem}/${den}, tehát összesen ${num}/${den}.`
    };
}

export function generateFractionLine(options = {}) {
    const { count = 3, mode = "mixed" } = options;

    const builders = {
        read: buildRead,
        place: buildPlace,
        "to-mixed": buildToMixed,
        "to-fraction": buildToFraction
    };

    const tasks = [];
    const seen = new Set();

    let guard = 0;
    while (tasks.length < count && guard < count * 300) {
        guard++;
        const chosen = mode === "mixed" ? pick(Object.keys(builders)) : mode;
        const build = builders[chosen];
        if (!build) {
            throw new Error(`Ismeretlen törtszámegyenes mód: ${chosen}`);
        }
        const task = build();
        const key = `${task.mode}|${task.question}|${task.answer}`;
        if (seen.has(key)) continue;
        seen.add(key);
        tasks.push(task);
    }

    if (tasks.length < count) {
        throw new Error("Nem sikerült elegendő feladatot generálni.");
    }

    return tasks;
}
