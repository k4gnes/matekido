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

function roundToHundred(n) {
    return Math.round(n / 100) * 100;
}

function roundToThousand(n) {
    return Math.round(n / 1000) * 1000;
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

    let pool;
    if (targets) {
        pool = targets;
    } else if (target === "tens") {
        pool = ["tens"];
    } else if (target === "hundreds") {
        pool = ["hundreds"];
    } else if (target === "thousands") {
        pool = ["thousands"];
    } else {
        pool = max >= 1000 ? ["tens", "hundreds", "thousands"] : ["tens", "hundreds"];
    }

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const useTarget = pick(pool);

        let number;
        let answer;
        let step;

        if (useTarget === "thousands") {
            do {
                number = Math.floor(Math.random() * (max - min + 1)) + min;
            } while (number % 1000 === 0 || number % 1000 === 500);
            step = 1000;
            answer = roundToThousand(number);
        } else if (useTarget === "hundreds") {
            do {
                number = Math.floor(Math.random() * (max - 100 + 1)) + 100;
            } while (number % 100 === 0 || number % 100 === 50);
            step = 100;
            answer = roundToHundred(number);
        } else {
            do {
                number = Math.floor(Math.random() * (max - min + 1)) + min;
            } while (number % 10 === 0);
            step = 10;
            answer = roundToTen(number);
        }

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