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

    const { count = 10, min = 10, max = 999, target = "mixed", interaction = "mixed" } = options;

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const useHundreds = target === "hundreds" || (target === "mixed" && Math.random() < 0.5);

        let number;
        let answer;

        if (useHundreds) {
            do {
                number = Math.floor(Math.random() * (max - 50 + 1)) + 50;
            } while (number % 100 === 0 || number % 100 === 50);
            answer = roundToHundred(number);
        } else {
            do {
                number = Math.floor(Math.random() * (max - min + 1)) + min;
            } while (number % 10 === 0);
            answer = roundToTen(number);
        }

        tasks.push({
            type: "rounding",
            number,
            target: useHundreds ? "hundreds" : "tens",
            answer,
            options: makeRoundOptions(
                answer,
                useHundreds ? 100 : 10,
                useHundreds ? Math.max(0, answer - 200) : Math.max(10, answer - 50),
                useHundreds ? Math.min(max, answer + 200) : Math.min(max, answer + 50)
            ),
            interaction: interaction === "mixed" ? pick(["input", "choice"]) : interaction
        });
    }

    return tasks;
}