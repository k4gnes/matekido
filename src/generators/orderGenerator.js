function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function generateOrder(options = {}) {

    const { count = 5, min = 1, max = 20 } = options;

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const pool = [];
        for (let n = min; n <= max; n++) {
            pool.push(n);
        }
        shuffle(pool);

        const values = pool.slice(0, 5);

        const direction = Math.random() < 0.5 ? "asc" : "desc";

        const answer = [...values].sort((a, b) => direction === "asc" ? a - b : b - a);

        tasks.push({
            type: "order",
            values,
            direction,
            answer
        });
    }

    return tasks;
}
