function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function degOptions(correct, step, minV, maxV) {
    const cands = [correct - step, correct - 2 * step, correct + step, correct + 2 * step];
    const decoys = [];
    for (const v of cands) {
        if (v >= minV && v <= maxV && v !== correct && !decoys.includes(v)) {
            decoys.push(v);
        }
    }
    let guard = 0;
    const span = Math.floor((maxV - minV) / step);
    while (decoys.length < 3 && guard < 300) {
        guard++;
        const v = minV + random(0, span) * step;
        if (v !== correct && !decoys.includes(v)) {
            decoys.push(v);
        }
    }
    decoys.length = 3;
    return shuffle([correct, ...decoys]).map(v => ({ text: `${v}°`, correct: v === correct }));
}

function buildMeasureTask(step) {
    const minV = 10;
    const maxV = 180;
    const correct = step === 5 ? 15 + random(2, 32) * 5 : 10 + random(1, 16) * 10;
    return {
        type: "angle-measure",
        mode: step === 5 ? "measure5" : "measure",
        angle: correct,
        question: "Mekkora a szög? Olvasd le a szögmérőről!",
        options: degOptions(correct, step, minV, maxV)
    };
}

function buildCompareTask() {
    let a;
    let b;
    do {
        a = random(4, 35) * 5;
        b = random(4, 35) * 5;
    } while (Math.abs(a - b) < 25);
    return {
        type: "angle-measure",
        mode: "compare",
        angleA: a,
        angleB: b,
        question: "Melyik szög a nagyobb?",
        options: [
            { text: "Az A szög", correct: a > b },
            { text: "A B szög", correct: b > a }
        ]
    };
}

function buildKindTask() {
    const angle = pick([25, 45, 75, 90, 110, 135, 150, 165]);
    const category = angle === 90 ? "right" : angle < 90 ? "acute" : "obtuse";
    return {
        type: "angle-measure",
        mode: "kind",
        angle,
        category,
        question: `Milyen szög a ${angle}°-os?`,
        options: [
            { text: "Hegyes", correct: category === "acute" },
            { text: "Derékszög", correct: category === "right" },
            { text: "Tompa szög", correct: category === "obtuse" }
        ]
    };
}

export function generateAngleMeasure(options = {}) {
    const { count = 4, mode = "mixed" } = options;

    const tasks = [];
    for (let i = 0; i < count; i++) {
        if (mode === "measure") {
            tasks.push(buildMeasureTask(10));
        } else if (mode === "measure5") {
            tasks.push(buildMeasureTask(5));
        } else if (mode === "compare") {
            tasks.push(buildCompareTask());
        } else if (mode === "kind") {
            tasks.push(buildKindTask());
        } else {
            tasks.push(pick([() => buildMeasureTask(10), () => buildMeasureTask(5), buildCompareTask, buildKindTask])());
        }
    }
    return tasks;
}