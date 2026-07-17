const MAX_GENERATION_ATTEMPTS = 10000;

export function generateMixed(options = {}) {

    const {
        count = 10,
        max = 20
    } = options;

    const tasks = [];
    let attempts = 0;

    while (tasks.length < count) {
        attempts++;
        if (attempts > MAX_GENERATION_ATTEMPTS) {
            throw new Error("Nem sikerült elegendő feladatot generálni...");
        }

        const op = Math.random() < 0.5 ? "+" : "-";
        const inputPos = ["left", "right", "result"][Math.floor(Math.random() * 3)];

        let a, b, answer;

        if (op === "+") {
            a = random(0, max);
            b = random(0, max - a);
            answer = a + b;
        } else {
            a = random(0, max);
            b = random(0, a);
            answer = a - b;
        }

        if (answer > max || answer < 0) continue;

        tasks.push({
            op,
            a,
            b,
            answer,
            inputPos
        });
    }

    return tasks;
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
