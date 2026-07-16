export function generateNeighbor(options = {}) {

    const { count = 10, max = 20 } = options;

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const a = Math.floor(Math.random() * (max - 1)) + 2;

        tasks.push({
            type: "neighbor",
            a,
            left: a - 1,
            right: a + 1,
            answer: a
        });
    }

    return tasks;
}
