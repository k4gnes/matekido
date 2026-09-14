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

const SHAPES = ["square", "rectangle"];

function buildPerimeter() {
    const rows = random(2, 5);
    const cols = Math.random() < 0.5 ? rows : random(2, 5);
    const answer = 2 * (rows + cols);

    return {
        type: "perimeter",
        rows,
        cols,
        answer,
        options: makeOptions(answer, 2 * (2 + 2) - 2, 2 * (5 + 5) + 2)
    };
}

export function generatePerimeter(options = {}) {
    const { count = 6, shape = "mixed" } = options;

    const tasks = [];
    for (let i = 0; i < count; i++) {
        const mode = shape === "mixed"
            ? SHAPES[Math.floor(Math.random() * SHAPES.length)]
            : shape;
        if (mode === "square") {
            const side = random(2, 5);
            const answer = 4 * side;
            tasks.push({
                type: "perimeter",
                rows: side,
                cols: side,
                answer,
                options: makeOptions(answer, 2 * 2 + 2, 4 * 5 + 2)
            });
        } else {
            tasks.push(buildPerimeter());
        }
    }
    return tasks;
}