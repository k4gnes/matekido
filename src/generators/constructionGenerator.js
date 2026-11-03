function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function makeOptions(correct, distractors) {
    const options = shuffle([
        { text: correct, correct: true },
        ...distractors.map(text => ({ text, correct: false }))
    ]);
    return { options, answer: options.findIndex(o => o.correct) };
}

const NEXT_STEPS = [
    {
        kind: "perpendicular-bisector",
        figure: "segment",
        question: "Az AB szakasz felezőmerőlegesét szeretnéd megszerkeszteni. Mi az első lépés?",
        correct: "Körzővel egyenlő sugarú köríveket húzunk A és B körül, amelyek metszik egymást.",
        distractors: [
            "Az A és B pontot összekötjük, és a kapott szakaszt megfelezzük.",
            "A B pontból az A ponton át húzunk egy kört, és kész a felezőmerőleges."
        ],
        hint: "A felezőmerőlegeshez először mindkét végpont körül ugyanakkora sugarú körívet kell húzni."
    },
    {
        kind: "angle-bisector",
        figure: "angle",
        question: "Az AOB szöget szeretnéd kettéosztani. Mi az első lépés?",
        correct: "Az O csúcs körül körívet húzunk, amely mindkét szögszárat metszi.",
        distractors: [
            "Az A és B pontot összekötjük, majd az AB szakasz felezőmerőlegesét szerkesztjük.",
            "A két szögszárra merőleges egyeneseket húzunk az O pontban."
        ],
        hint: "A szögfelező szerkesztéséhez először az O csúcs körül húzunk egy körívet."
    },
    {
        kind: "perpendicular",
        figure: "line-point",
        question: "Az e egyenesre a P ponton át merőlegest szeretnéd szerkeszteni. Mi az első lépés?",
        correct: "A P pont körül körívet húzunk, amely két pontban metszi az e egyenest.",
        distractors: [
            "Az e egyenes két végpontjából köríveket húzunk.",
            "A P pontot összekötjük az e egyenes egyik végpontjával."
        ],
        hint: "A P ponton át menő merőlegeshez először a P körül húzunk körívet, hogy két metszéspontot kapjunk."
    },
    {
        kind: "parallel",
        figure: "line-point",
        question: "A P ponton át az e egyenessel párhuzamos egyenest szeretnéd szerkeszteni. Mi az első lépés?",
        correct: "A P ponton át merőlegest szerkesztünk az e egyenesre.",
        distractors: [
            "A P ponton át az e egyenessel egyenlő hosszú szakaszt húzunk.",
            "Az e egyenes két végpontjából köríveket húzunk, és azokat összekötjük."
        ],
        hint: "A párhuzamoshoz először a P ponton át merőlegest szerkesztünk az e egyenesre, majd arra még egy merőlegest."
    }
];

const RESULTS = [
    {
        kind: "perpendicular-bisector",
        figure: "bisector-result",
        correct: "Szakaszfelező merőleges",
        distractors: ["Szögfelező", "Párhuzamos egyenes"],
        hint: "A szakaszfelező merőleges a szakaszt két egyenlő részre osztja, és merőleges a szakaszra."
    },
    {
        kind: "angle-bisector",
        figure: "angle-bisector-result",
        correct: "Szögfelező",
        distractors: ["Szakaszfelező merőleges", "Párhuzamos egyenes"],
        hint: "A szögfelező a szöget két egyenlő részre osztja."
    },
    {
        kind: "parallel",
        figure: "parallel-result",
        correct: "Párhuzamos egyenes",
        distractors: ["Szakaszfelező merőleges", "Szögfelező"],
        hint: "A párhuzamos egyenesek soha nem metszik egymást, és mindig ugyanolyan távolságra vannak."
    },
    {
        kind: "perpendicular",
        figure: "perpendicular-result",
        correct: "Merőleges egyenes",
        distractors: ["Szakaszfelező merőleges", "Párhuzamos egyenes"],
        hint: "A merőleges egyenes derékszögben metszi az adott egyenest."
    }
];

function buildNextStep() {
    const task = pick(NEXT_STEPS);
    const { options, answer } = makeOptions(task.correct, task.distractors);
    return {
        type: "construction",
        mode: "next-step",
        kind: task.kind,
        figure: { kind: task.figure },
        question: task.question,
        options,
        answer,
        hint: task.hint
    };
}

function buildWhichResult() {
    const task = pick(RESULTS);
    const { options, answer } = makeOptions(task.correct, task.distractors);
    return {
        type: "construction",
        mode: "which",
        kind: task.kind,
        figure: { kind: task.figure },
        question: "Melyik szerkesztés eredménye látható az ábrán?",
        options,
        answer,
        hint: task.hint
    };
}

function buildTriangleSides() {
    const c = randomInt(3, 14);
    const a = randomInt(2, c);
    const b = randomInt(2, c);
    const sum = a + b;
    const constructible = sum > c;
    const correct = constructible
        ? `Igen, mert ${a} + ${b} > ${c}.`
        : sum === c
            ? `Nem, mert ${a} + ${b} = ${c}.`
            : `Nem, mert ${a} + ${b} < ${c}.`;
    const { options, answer } = makeOptions(correct, [
        constructible ? `Nem, mert ${a} + ${b} < ${c}.` : `Igen, mert ${a} + ${b} > ${c}.`,
        sum === c ? `Nem, mert ${a} + ${b} < ${c}.` : `Nem, mert ${a} + ${b} = ${c}.`
    ]);
    return {
        type: "construction",
        mode: "triangle",
        kind: "sss",
        sides: { a, b, c },
        constructible,
        question: `Szerkeszthető-e háromszög, ha az oldalai ${a} cm, ${b} cm és ${c} cm?`,
        options,
        answer,
        hint: "Három oldalból akkor szerkeszthető háromszög, ha bármely két oldal összege nagyobb a harmadiknál."
    };
}

function buildTriangleAngles() {
    const a = randomInt(30, 80);
    const b = randomInt(30, 80);
    const c = randomInt(30, 100);
    const sum = a + b + c;
    const { options, answer } = makeOptions(
        sum === 180 ? "Igen, mert a szögek összege 180°." : `Nem, mert a szögek összege ${sum}°, nem 180°.`,
        [
            sum === 180 ? "Nem, mert a szögek összege nem 180°." : `Igen, mert a szögek összege ${sum}°.`,
            "Nem, mert a háromszög szögeinek összege 360°."
        ]
    );
    return {
        type: "construction",
        mode: "triangle",
        kind: "angles",
        angles: { a, b, c },
        constructible: sum === 180,
        question: `Szerkeszthető-e háromszög, ha a szögei ${a}°, ${b}° és ${c}°?`,
        options,
        answer,
        hint: "A háromszög szögeinek összege mindig 180°."
    };
}

function buildTriangleSas() {
    const a = randomInt(3, 8);
    const b = randomInt(3, 8);
    const angle = pick([45, 60, 65, 75]);
    const { options, answer } = makeOptions(
        "Igen, mert a két oldal és a közbezárt szög egyértelműen meghatározza a háromszöget.",
        [
            "Nem, mert hiányzik a harmadik oldal hossza.",
            "Nem, mert a szög nem 90°."
        ]
    );
    return {
        type: "construction",
        mode: "triangle",
        kind: "sas",
        sides: { a, b },
        angle,
        constructible: true,
        question: `Két oldal és a közbezárt szög: ${a} cm, ${b} cm és ${angle}°. Szerkeszthető-e háromszög?`,
        options,
        answer,
        hint: "Két oldalból és a közbezárt szögből (SAS) egyértelműen szerkeszthető a háromszög."
    };
}

function buildTriangle() {
    return pick([buildTriangleSides, buildTriangleSides, buildTriangleAngles, buildTriangleSas])();
}

export function generateConstruction(options = {}) {
    const { count = 4, mode = "next-step" } = options;
    const build = mode === "which" ? buildWhichResult : mode === "triangle" ? buildTriangle : buildNextStep;
    const tasks = [];
    const seen = new Set();

    for (let i = 0; i < count; i++) {
        let task = build();
        let tries = 0;
        while (seen.has(task.question) && tries < 20) {
            task = build();
            tries++;
        }
        seen.add(task.question);
        tasks.push(task);
    }
    return tasks;
}
