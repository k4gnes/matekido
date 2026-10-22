const WORLDS = {
    postman: {
        x: "óra",
        y: "levél",
        story: "A postásnál az eltelt órák és a kézbesített levelek száma összefügg."
    },
    racing: {
        x: "kör",
        y: "km",
        story: "A versenyzőnél a megtett körök száma és az út hossza összefügg."
    },
    football: {
        x: "perc",
        y: "gól",
        story: "A csapatnál a játékidő és a lőtt gólok száma összefügg."
    },
    cooking: {
        x: "adag",
        y: "tojás",
        story: "A konyhában a tészta adagjai és a felhasznált tojások száma összefügg."
    },
    animals: {
        x: "nap",
        y: "étel",
        story: "Az állatkertben a napok száma és a beadott ételek száma összefügg."
    },
    space: {
        x: "óra",
        y: "km",
        story: "Az űrhajón az eltelt órák és a megtett út hossza összefügg."
    },
    tram: {
        x: "megálló",
        y: "perc",
        story: "A villamoson a megállók száma és a köztük eltelt idő összefügg."
    }
};

// A rács tartománya: x = 0..8, y = 0..9 (ezt a komponens is ugyanígy rajzolja).
const X_MAX = 8;
const Y_MAX = 9;

const MODES = ["plot", "extend", "rule", "read"];

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

function numberOptions(answer, candidates) {
    const set = new Set([answer]);
    for (const c of candidates) {
        if (set.size >= 4) break;
        if (Number.isInteger(c) && c >= 0) set.add(c);
    }
    return shuffle([...set]);
}

// y = m·x + b lineáris pontok, minden pont a rács belsejében
function buildLinear() {
    for (let attempt = 0; attempt < 200; attempt++) {
        const m = pick([1, 1, 2, 2, 3, -1, -2]);
        const b = random(0, 6);
        const x0 = random(1, 2);
        const count = pick([3, 4]);
        const rows = [];
        let ok = true;

        for (let i = 0; i < count; i++) {
            const x = x0 + i;
            const y = m * x + b;
            if (x > X_MAX || y < 0 || y > Y_MAX) {
                ok = false;
                break;
            }
            rows.push({ x, y });
        }

        if (ok) return { m, b, rows };
    }

    return { m: 2, b: 0, rows: [{ x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 6 }] };
}

function tableOf(rows, w) {
    return {
        xLabel: `x (${w.x})`,
        yLabel: `y (${w.y})`,
        rows: rows.map(r => ({ x: r.x, y: r.y }))
    };
}

function buildPlot(w) {
    const { rows } = buildLinear();

    return {
        type: "function",
        mode: "plot",
        xUnit: w.x,
        yUnit: w.y,
        question: `${w.story} Jelöld be a grafikonon az értéktáblázat összes pontját!`,
        table: tableOf(rows, w),
        target: rows.map(r => [r.x, r.y]),
        answer: rows.length
    };
}

function buildExtend(w) {
    const { rows } = buildLinear();
    const missingIndex = random(1, rows.length - 2);
    const answer = rows[missingIndex].y;

    const tableRows = rows.map((r, i) => (i === missingIndex ? { x: r.x, y: null } : { x: r.x, y: r.y }));

    return {
        type: "function",
        mode: "extend",
        xUnit: w.x,
        yUnit: w.y,
        question: `${w.story} Töltsd ki az értéktáblázatot! Mennyi a hiányzó szám?`,
        table: {
            xLabel: `x (${w.x})`,
            yLabel: `y (${w.y})`,
            rows: tableRows
        },
        answer
    };
}

function buildRule(w) {
    const { m, rows } = buildLinear();
    const step = Math.abs(m);
    const options = numberOptions(step, [step + 1, step - 1, step + 2, step + 3]);

    return {
        type: "function",
        mode: "rule",
        xUnit: w.x,
        yUnit: w.y,
        question: `${w.story} Nézd meg az értéktáblázatot! Minden újabb ${w.x} után hánnyal ${m > 0 ? "nő" : "csökken"} az y szám?`,
        table: tableOf(rows, w),
        answer: step,
        options
    };
}

function buildRead(w) {
    for (let attempt = 0; attempt < 50; attempt++) {
        const { m, rows } = buildLinear();
        const index = random(1, rows.length - 2);
        const ask = rows[index];
        if (ask.y < 1) continue;

        const options = numberOptions(ask.y, [ask.y + 1, ask.y - 1, ask.y + Math.abs(m), ask.y - Math.abs(m), ask.y + 2]);

        return {
            type: "function",
            mode: "read",
            xUnit: w.x,
            yUnit: w.y,
            question: `${w.story} Olvasd le a grafikonról: ${ask.x} ${w.x} esetén hány ${w.y}?`,
            points: rows.map(r => [r.x, r.y]),
            askX: ask.x,
            answer: ask.y,
            options
        };
    }

    return {
        type: "function",
        mode: "read",
        xUnit: w.x,
        yUnit: w.y,
        question: `${w.story} Olvasd le a grafikonról: 2 ${w.x} esetén hány ${w.y}?`,
        points: [[1, 2], [2, 4], [3, 6]],
        askX: 2,
        answer: 4,
        options: [4, 3, 5, 6]
    };
}

export function generateFunction(options = {}) {

    const { count = 6, mode = "mixed" } = options;
    const world = options.world ?? "postman";
    const w = WORLDS[world] ?? WORLDS.postman;

    const modes = mode === "mixed" ? MODES : [mode];
    const tasks = [];

    for (let i = 0; i < count; i++) {
        const m = modes[i % modes.length];

        if (m === "plot") tasks.push(buildPlot(w));
        else if (m === "extend") tasks.push(buildExtend(w));
        else if (m === "rule") tasks.push(buildRule(w));
        else tasks.push(buildRead(w));
    }

    return tasks;

}
