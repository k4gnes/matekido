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

function roundToTen(n) {
    return Math.round(n / 10) * 10;
}

const TARGETS = {
    tens: { step: 10, mid: 5 },
    hundreds: { step: 100, mid: 50 },
    thousands: { step: 1000, mid: 500 },
    tenThousands: { step: 10000, mid: 5000 },
    hundredThousands: { step: 100000, mid: 50000 }
};

const TARGET_KEYS = Object.keys(TARGETS);

function defaultPool(max) {
    const allowed = [];
    for (const key of TARGET_KEYS) {
        if (max < TARGETS[key].step * 2) break;
        allowed.push(key);
    }
    return allowed.length ? allowed : ["tens"];
}

function nonAligned(min, max, step, mid) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    if (num % step !== 0 && num % step !== mid) return num;
    if (num + 1 <= max) return num + 1;
    if (num - 1 >= min) return num - 1;
    return num;
}

function makeRoundOptions(answer, step, min, max) {
    const candidates = [];
    for (let v = min; v <= max; v += step) {
        if (v !== answer) {
            candidates.push(v);
        }
    }
    shuffle(candidates);
    const options = [answer];
    const near = [answer - step, answer + step];
    shuffle(near);
    for (const n of near) {
        if (n >= min && n <= max && !options.includes(n)) {
            options.push(n);
        }
    }
    let i = 0;
    while (options.length < 4 && i < candidates.length) {
        if (!options.includes(candidates[i])) {
            options.push(candidates[i]);
        }
        i++;
    }
    return shuffle(options);
}

export function generateRounding(options = {}) {

    const { count = 10, min = 10, max = 999, target = "mixed", targets = null, interaction = "mixed" } = options;

    const pool = targets ? targets : (TARGETS[target] ? [target] : defaultPool(max));

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const useTarget = pick(pool);
        const { step, mid } = TARGETS[useTarget];

        const number = nonAligned(min, max, step, mid);
        const answer = Math.round(number / step) * step;

        tasks.push({
            type: "rounding",
            number,
            target: useTarget,
            answer,
            options: makeRoundOptions(
                answer,
                step,
                Math.max(min, answer - step * 2),
                Math.min(max, answer + step * 2)
            ),
            interaction: interaction === "mixed" ? pick(["input", "choice"]) : interaction
        });
    }

    return tasks;
}