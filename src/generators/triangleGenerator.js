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

const SIDE_LABELS = ["Egyenlő oldalú", "Egyenlőszárú", "Általános"];

function degreesOptions(answer) {
    const values = [answer];
    for (const offset of [10, -10, 20, -20, 5, -5, 15, -15, 25, -25]) {
        if (values.length >= 4) break;
        const v = answer + offset;
        if (v >= 5 && v <= 175 && !values.includes(v)) values.push(v);
    }
    return shuffle(values).map(v => ({ text: `${v}°`, correct: v === answer }));
}

function buildAngleSum() {
    const a = random(30, 100);
    const b = random(30, Math.min(100, 150 - a));
    const answer = 180 - a - b;
    return {
        mode: "angle-sum",
        question: `A háromszög két szöge ${a}° és ${b}°. Mekkora a harmadik szög?`,
        a,
        b,
        answer,
        options: degreesOptions(answer)
    };
}

function buildClassifySides() {
    const type = pick(["equilateral", "isosceles", "scalene"]);
    let a;
    let b;
    let c;
    // Háromszög-egyenlőtlenség: különben pl. 2, 2, 9 is megjelenne.
    do {
        if (type === "equilateral") {
            a = random(2, 9);
            b = a;
            c = a;
        } else if (type === "isosceles") {
            a = random(2, 9);
            b = a;
            do {
                c = random(2, 9);
            } while (c === a);
        } else {
            a = random(2, 9);
            do {
                b = random(2, 9);
            } while (b === a);
            do {
                c = random(2, 9);
            } while (c === a || c === b);
        }
    } while (a + b <= c || a + c <= b || b + c <= a);
    const correct = a === b && b === c
        ? "Egyenlő oldalú"
        : a === b || b === c || a === c
            ? "Egyenlőszárú"
            : "Általános";
    return {
        mode: "classify-sides",
        question: `Egy háromszög oldalai ${a} cm, ${b} cm és ${c} cm. Milyen ez a háromszög az oldalai szerint?`,
        a,
        b,
        c,
        answer: correct,
        options: shuffle(SIDE_LABELS).map(label => ({ text: label, correct: label === correct }))
    };
}

function buildInequality(index) {
    const wantBuildable = index % 2 === 0;
    let a;
    let b;
    let c;
    let buildable;
    let guard = 0;
    do {
        guard++;
        a = random(2, 12);
        b = random(2, 12);
        c = random(2, 12);
        const sorted = [a, b, c].sort((x, y) => x - y);
        buildable = sorted[0] + sorted[1] > sorted[2];
    } while (buildable !== wantBuildable && guard < 200);
    return {
        mode: "inequality",
        question: `Szerkeszthető háromszög a ${a} cm, ${b} cm és ${c} cm hosszú szakaszokból?`,
        a,
        b,
        c,
        answer: buildable,
        options: [
            { text: "Igen", correct: buildable },
            { text: "Nem", correct: !buildable }
        ]
    };
}

const MODES = {
    "angle-sum": () => buildAngleSum(),
    "classify-sides": () => buildClassifySides(),
    inequality: (index) => buildInequality(index)
};

export function generateTriangle(options = {}) {
    const { count = 6, mode = "mixed" } = options;

    const mixed = ["angle-sum", "classify-sides", "inequality"];

    const tasks = [];
    for (let i = 0; i < count; i++) {
        const m = mode === "mixed" ? mixed[i % mixed.length] : mode;
        const build = MODES[m];
        if (!build) throw new Error(`Ismeretlen triangle mód: ${m}`);
        tasks.push(build(i));
    }
    return tasks;
}
