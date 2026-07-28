export function generateBridgeTo10(options = {}) {
    const { count = 5 } = options;
    const pool = [];

    for (let a = 2; a <= 9; a++) {
        const minB = Math.max(2, 11 - a);
        for (let b = minB; b <= 9; b++) {
            pool.push({ a, b });
        }
    }

    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const take = Math.min(count, pool.length);
    const tasks = [];

    for (let i = 0; i < take; i++) {
        const { a, b } = pool[i];
        const complement = 10 - a;
        const remainder = b - complement;
        const sum = a + b;

        const correctKey = `${complement}+${remainder}`;
        const all = [];
        for (let j = 0; j <= b; j++) {
            all.push(`${j}+${b - j}`);
        }

        for (let j = all.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [all[j], all[k]] = [all[k], all[j]];
        }

        const added = new Set([correctKey]);
        const options = [{ text: correctKey, correct: true }];

        for (const d of all) {
            if (options.length >= 4) break;
            if (!added.has(d)) {
                added.add(d);
                options.push({ text: d, correct: false });
            }
        }

        for (let j = options.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [options[j], options[k]] = [options[k], options[j]];
        }

        tasks.push({ a, b, complement, remainder, sum, correctDecomp: correctKey, options });
    }

    return tasks;
}
