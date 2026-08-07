export function generateSequence(options = {}) {

    const { count = 5, max = 100 } = options;

    const maxStep = Math.min(10, Math.floor(max / 5));

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const step = Math.floor(Math.random() * maxStep) + 1;

        const direction = Math.random() < 0.5 ? 1 : -1;

        let start;
        if (direction === 1) {
            start = Math.floor(Math.random() * (max - 5 * step + 1));
        } else {
            start = 5 * step + Math.floor(Math.random() * (max - 5 * step + 1));
        }

        const terms = [];
        for (let t = 0; t < 5; t++) {
            terms.push(start + direction * step * t);
        }

        tasks.push({
            type: "sequence",
            terms,
            answer: start + direction * step * 5,
            step,
            direction
        });
    }

    return tasks;
}
