const MAX_GENERATION_ATTEMPTS = 10000;

export function generateSubtraction(options = {}) {

    const {
        count = 10,
        min = 10,
        max = 20,
        subMax = 20
    } = options;

    const tasks = [];
    let attempts = 0;

    while (tasks.length < count) {
        attempts++;
        if (attempts > MAX_GENERATION_ATTEMPTS) {
            throw new Error("Nem sikerült elegendő feladatot generálni...");
        }

        const a = random(min, max);
        const b = random(1, Math.min(subMax, a));

        if (a - b < 0) continue;

        tasks.push({ a, b });
    }

    return tasks;
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
