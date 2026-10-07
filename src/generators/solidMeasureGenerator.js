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

function makeOptions(answer) {
    const options = new Set([answer]);
    let guard = 0;
    while (options.size < 4 && guard < 60) {
        guard++;
        const delta = random(2, Math.max(3, Math.round(answer / 5)));
        const candidate = answer + (Math.random() < 0.5 ? -1 : 1) * delta;
        if (candidate >= 6 && candidate <= 1200) {
            options.add(candidate);
        }
    }
    let k = 1;
    while (options.size < 4 && k < 400) {
        if (answer + k <= 1200) options.add(answer + k);
        if (answer - k >= 6) options.add(answer - k);
        k++;
    }
    return shuffle([...options]);
}

function surfaceOf(a, b, c) {
    return 2 * (a * b + a * c + b * c);
}

function buildTask(mode, solid) {
    let a;
    let b;
    let c;
    if (solid === "cube") {
        a = random(3, 10);
        b = a;
        c = a;
    } else {
        do {
            a = random(3, 10);
            b = random(3, 10);
            c = random(3, 10);
        } while (a === b && b === c);
    }

    const answer = mode === "surface" ? surfaceOf(a, b, c) : a * b * c;

    return {
        type: "solid-measure",
        solid,
        mode,
        a,
        b,
        c,
        answer,
        options: makeOptions(answer)
    };
}

export function generateSolidMeasure(options = {}) {
    const { count = 8, mode = "mixed" } = options;

    const modes = mode === "mixed" ? ["surface", "volume"] : [mode];

    const tasks = [];
    for (let i = 0; i < count; i++) {
        const solid = Math.random() < 0.5 ? "cube" : "cuboid";
        tasks.push(buildTask(modes[i % modes.length], solid));
    }
    return tasks;
}
