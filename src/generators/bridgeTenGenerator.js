function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function buildNumberOptions(answer, { min, max, count = 4 } = {}) {
    const opts = new Set([answer]);
    let guard = 0;
    while (opts.size < count && guard < 500) {
        guard++;
        const delta = 1 + Math.floor(Math.random() * 4);
        const cand = Math.random() < 0.5 ? answer + delta : answer - delta;
        if (cand >= min && cand <= max) opts.add(cand);
    }
    for (let v = answer - 1; opts.size < count && v >= min; v--) opts.add(v);
    for (let v = answer + 1; opts.size < count && v <= max; v++) opts.add(v);
    return shuffle([...opts]);
}

export function generateBridgeTo10(options = {}) {
    const { count = 5 } = options;
    const pool = [];

    for (let a = 2; a <= 9; a++) {
        const minB = Math.max(2, 11 - a);
        for (let b = minB; b <= 9; b++) {
            pool.push({ a, b });
        }
    }

    shuffle(pool);

    const take = Math.min(count, pool.length);
    const tasks = [];

    for (let i = 0; i < take; i++) {
        const { a, b } = pool[i];
        const complement = 10 - a;
        const remainder = b - complement;
        const sum = a + b;

        tasks.push({
            type: "bridge-ten",
            a,
            b,
            complement,
            remainder,
            sum,
            steps: [
                {
                    label: "Pótold tízesre!",
                    question: `${a} + ☐ = 10`,
                    answer: complement,
                    options: buildNumberOptions(complement, { min: 1, max: 9 })
                },
                {
                    label: "Bontsd fel a többit!",
                    question: `${b} = ${complement} + ☐`,
                    answer: remainder,
                    options: buildNumberOptions(remainder, { min: 1, max: 9 })
                },
                {
                    label: "Add össze!",
                    question: `10 + ${remainder} = ☐`,
                    answer: sum,
                    options: buildNumberOptions(sum, {
                        min: Math.max(2, sum - 5),
                        max: Math.min(20, sum + 5)
                    })
                }
            ]
        });
    }

    return tasks;
}