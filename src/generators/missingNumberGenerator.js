function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function generateMissingTo10(options = {}) {

    const { count = 10, sum = 10, interaction = "mixed" } = options;

    const max = sum - 1;
    const tasks = [];
    const pool = [];

    for (let a = 1; a <= max; a++) {
        pool.push(a);
    }

    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const take = Math.min(count, pool.length);

    for (let i = 0; i < take; i++) {
        const a = pool[i];
        tasks.push({
            type: "missing-number",
            a,
            sum,
            answer: sum - a,
            interaction: interaction === "mixed" ? pick(["input", "choice"]) : interaction
        });
    }

    return tasks;
}

export function generateMissingRandom(options = {}) {

    const { count = 10, min = 10, max = 20, interaction = "mixed" } = options;

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const sum = Math.floor(Math.random() * (max - min + 1)) + min;
        const a = Math.floor(Math.random() * (sum - 1)) + 1;

        tasks.push({
            type: "missing-number",
            a,
            sum,
            answer: sum - a,
            interaction: interaction === "mixed" ? pick(["input", "choice"]) : interaction
        });
    }

    return tasks;
}
