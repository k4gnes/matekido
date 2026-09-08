function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateSequence(options = {}) {

    const { count = 5, max = 100, interaction = "mixed" } = options;

    const maxStep = Math.min(10, Math.max(1, Math.floor((max - 1) / 5)));

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const step = randint(1, maxStep);

        const direction = Math.random() < 0.5 ? 1 : -1;

        let start;
        if (direction === 1) {
            start = randint(1, max - 5 * step);
        } else {
            start = randint(5 * step + 1, max);
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
            direction,
            interaction: interaction === "mixed" ? pick(["input", "choice"]) : interaction
        });
    }

    return tasks;
}
