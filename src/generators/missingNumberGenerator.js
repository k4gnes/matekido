export function generateMissingTo10(options = {}) {

    const { count = 10, sum = 10 } = options;

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
            answer: sum - a
        });
    }

    return tasks;
}
