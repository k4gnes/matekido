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

const ANGLE_TYPES = {
    acute: "Hegyesszögű",
    right: "Derékszögű",
    obtuse: "Tompaszögű"
};

function buildAngleType() {
    const type = pick(["acute", "right", "obtuse"]);
    let a;
    let b;
    let c;
    if (type === "right") {
        a = 90;
        b = random(4, 14) * 5;
        c = 90 - b;
    } else if (type === "obtuse") {
        a = random(19, 30) * 5;
        b = random(1, (175 - a) / 5) * 5;
        c = 180 - a - b;
    } else {
        do {
            a = random(4, 16) * 5;
            b = random(4, 16) * 5;
            c = 180 - a - b;
        } while (c < 20 || c > 85);
    }
    const angles = shuffle([a, b, c]);
    const answer = ANGLE_TYPES[type];
    return {
        mode: "angle-type",
        question: `Egy háromszög szögei ${angles[0]}°, ${angles[1]}° és ${angles[2]}°. Milyen ez a háromszög a szögei szerint?`,
        a,
        b,
        c,
        answer,
        options: shuffle(Object.values(ANGLE_TYPES)).map(label => ({ text: label, correct: label === answer }))
    };
}

function buildIsoBase() {
    const apex = random(1, 17) * 10;
    const answer = (180 - apex) / 2;
    return {
        mode: "iso-base",
        question: `Egy egyenlőszárú háromszög szárszöge ${apex}°. Mekkora a két alapszöge?`,
        apex,
        answer,
        options: degreesOptions(answer)
    };
}

function buildExterior() {
    const a = random(5, 15) * 5;
    const b = random(5, 15) * 5;
    const answer = a + b;
    return {
        mode: "exterior",
        question: `A háromszög két szöge ${a}° és ${b}°. Mekkora a harmadik csúcsnál lévő külső szög?`,
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

function lengthOptions(answer) {
    const values = [answer];
    for (const offset of [1, -1, 2, -2, 3, -3]) {
        if (values.length >= 4) break;
        const v = answer + offset;
        if (v >= 1 && !values.includes(v)) values.push(v);
    }
    return shuffle(values).map(v => ({ text: `${v} cm`, correct: v === answer }));
}

function buildMaxSide() {
    const a = random(4, 25);
    const b = random(4, 25);
    const answer = a + b - 1;
    return {
        mode: "max-side",
        question: `Egy háromszög két oldala ${a} cm és ${b} cm. Mekkora lehet a harmadik oldal legfeljebb?`,
        a,
        b,
        answer,
        options: lengthOptions(answer)
    };
}

function buildMinSide() {
    const a = random(4, 25);
    let b = random(4, 25);
    while (b === a) b = random(4, 25);
    const answer = Math.abs(a - b) + 1;
    return {
        mode: "min-side",
        question: `Egy háromszög két oldala ${a} cm és ${b} cm. Mekkora lehet a harmadik oldal legkisebben?`,
        a,
        b,
        answer,
        options: lengthOptions(answer)
    };
}

const MODES = {
    "angle-sum": () => buildAngleSum(),
    "angle-type": () => buildAngleType(),
    "iso-base": () => buildIsoBase(),
    exterior: () => buildExterior(),
    "classify-sides": () => buildClassifySides(),
    inequality: (index) => buildInequality(index),
    "max-side": () => buildMaxSide(),
    "min-side": () => buildMinSide()
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
