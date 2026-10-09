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

export function isPrime(n) {
    if (n < 2) return false;
    for (let d = 2; d * d <= n; d++) {
        if (n % d === 0) return false;
    }
    return true;
}

const PRIMES = [];
const COMPOSITES = [];
for (let n = 2; n <= 100; n++) {
    if (isPrime(n)) PRIMES.push(n);
    else if (n >= 4) COMPOSITES.push(n);
}

function nearPool(pool, center, spread) {
    const near = pool.filter(v => v >= center - spread && v <= center + spread);
    return near.length >= 3 ? near : pool;
}

function buildClassify() {
    const number = pick([...PRIMES, ...COMPOSITES]);
    const prime = isPrime(number);
    return {
        type: "prime",
        mode: "classify",
        number,
        prime,
        question: `Prím- vagy összetett szám a ${number}?`,
        options: shuffle([
            { text: "Prím", correct: prime },
            { text: "Összetett", correct: !prime }
        ])
    };
}

function buildWhichPrime() {
    const answer = pick(PRIMES);
    const decoys = shuffle(nearPool(COMPOSITES, answer, 12)).slice(0, 3);
    return {
        type: "prime",
        mode: "which-prime",
        answer,
        question: "Melyik a prímszám?",
        options: shuffle([
            { text: String(answer), correct: true },
            ...decoys.map(v => ({ text: String(v), correct: false }))
        ])
    };
}

function buildWhichComposite() {
    const answer = pick(COMPOSITES);
    const decoys = shuffle(nearPool(PRIMES, answer, 12)).slice(0, 3);
    return {
        type: "prime",
        mode: "which-composite",
        answer,
        question: "Melyik az összetett szám?",
        options: shuffle([
            { text: String(answer), correct: true },
            ...decoys.map(v => ({ text: String(v), correct: false }))
        ])
    };
}

export function generatePrime(options = {}) {
    const { count = 4, mode = "mixed" } = options;

    const builders = {
        classify: buildClassify,
        "which-prime": buildWhichPrime,
        "which-composite": buildWhichComposite
    };

    const tasks = [];
    const seen = new Set();

    let guard = 0;
    while (tasks.length < count && guard < count * 200) {
        guard++;
        const chosen = mode === "mixed" ? pick(Object.keys(builders)) : mode;
        const build = builders[chosen];
        if (!build) {
            throw new Error(`Ismeretlen prím mód: ${chosen}`);
        }
        const task = build();
        const key = task.mode === "classify" ? `classify|${task.number}` : `${task.mode}|${task.answer}`;
        if (seen.has(key)) continue;
        seen.add(key);
        tasks.push(task);
    }

    return tasks;
}
