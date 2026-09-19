function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function makeOptions(answer, min, max) {
    const options = new Set([answer]);
    let guard = 0;
    while (options.size < 4 && guard < 40) {
        guard++;
        const delta = random(1, Math.max(2, Math.round((max - min) / 5)));
        const candidate = answer + (Math.random() < 0.5 ? -1 : 1) * delta;
        if (candidate >= min && candidate <= max) {
            options.add(candidate);
        }
    }
    return shuffle([...options]);
}

export function generateShapeFormula(options = {}) {
    const { count = 8, mode = "mixed", shape = "mixed" } = options;

    const modes = mode === "mixed" ? ["perimeter", "area"] : [mode];

    const tasks = [];

    for (let i = 0; i < count; i++) {
        const isSquare = shape === "mixed"
            ? Math.random() < 0.45
            : shape === "square";

        let a;
        let b;
        if (isSquare) {
            a = random(3, 9);
            b = a;
        } else {
            let guard = 0;
            do {
                a = random(3, 12);
                b = random(2, 10);
                if (a === b) b = Math.max(2, b - 1);
                guard++;
            } while (a * b > 100 && guard < 40);
        }

        const m = modes[i % modes.length];
        const answer = m === "perimeter"
            ? 2 * (a + b)
            : a * b;

        tasks.push({
            type: "shape-formula",
            shape: isSquare ? "square" : "rectangle",
            a,
            b,
            mode: m,
            answer,
            options: makeOptions(answer, 6, 100)
        });
    }

    return tasks;
}