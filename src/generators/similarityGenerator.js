import { formatThousands } from "../utils/formatNumbers.js";

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

function formatNumber(value) {
    return String(value).replace(".", ",");
}

// a C "cé" hangot ad, ezért előtte "az" áll
function article(name) {
    return "AEOIUÁÉÍÓÖŐÚÜC".includes(name[0]) ? "az" : "a";
}

// Az oldalak sorrendje: [BC, CA, AB] – a pozíció adja a hiányzó oldal nevét is.
const SIDE_NAMES = ["BC", "CA", "AB"];
const SIDE_NAMES2 = ["B′C′", "C′A′", "A′B′"];

const TRIANGLES = [
    [3, 4, 5],
    [4, 5, 6],
    [5, 6, 7],
    [6, 8, 10],
    [5, 12, 13],
    [8, 15, 17],
    [9, 12, 15],
    [6, 10, 14],
    [10, 15, 20],
    [12, 16, 20]
];

const SCALES = [2, 3, 4, 1.5, 0.5, 0.25];
const MODES = ["missing-side", "missing-side-small", "scale-factor", "area-ratio", "application"];
const MIXED = ["missing-side", "missing-side-small", "scale-factor", "area-ratio"];

// térképi alkalmazások: méretarány
const MAP_SCALES = [1000, 2000, 5000, 10000, 20000, 50000, 100000];

const MAP_SUBJECTS = {
    postman: "A postás kézbesítési térképe",
    racing: "A versenypálya térképe",
    football: "A stadion helyrajza",
    cooking: "A konyha berendezési rajza",
    animals: "Az állatkert térképe",
    space: "A bolygó felszíni térképe",
    tram: "A villamosvonal térképe"
};

function formatScale(scale) {
    return `1:${formatThousands(scale)}`;
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function applicationOptions(answer, candidates, unit) {
    const seen = new Set([answer]);
    const values = [answer];
    for (const value of shuffle(candidates)) {
        if (values.length >= 4) break;
        if (!Number.isInteger(value) || value <= 0 || seen.has(value)) continue;
        seen.add(value);
        values.push(value);
    }
    return shuffle(values).map(v => `${v} ${unit}`);
}

// térkép és valóság: a méretarány alkalmazása
function buildApplication(world) {
    const scale = pick(MAP_SCALES);
    const maxMap = Math.min(9, Math.floor(100000 / scale));
    const mapCm = random(1, maxMap);
    const realCm = mapCm * scale;
    const realM = realCm / 100;
    const subject = MAP_SUBJECTS[world] ?? MAP_SUBJECTS.postman;
    const scaleText = formatScale(scale);

    if (Math.random() < 0.5) {
        return {
            type: "similarity",
            mode: "application",
            direction: "map-to-real",
            scale,
            mapCm,
            realM,
            answer: realM,
            answerLabel: `${realM} m`,
            options: applicationOptions(realM, [realM - 1, realM + 1, realM - 2, realM + 2, realM * 10, realM / 10], "m"),
            question: `${subject} ${scaleText} méretarányú. A térképen ${mapCm} cm hosszú út a valóságban hány méter hosszú?`,
            successText: `😊 Ügyes! ${mapCm} cm × ${formatThousands(scale)} = ${formatThousands(realCm)} cm = ${realM} m.`
        };
    }

    return {
        type: "similarity",
        mode: "application",
        direction: "real-to-map",
        scale,
        mapCm,
        realM,
        answer: mapCm,
        answerLabel: `${mapCm} cm`,
        options: applicationOptions(mapCm, [mapCm + 1, mapCm - 1, mapCm * 2, mapCm * 10, mapCm + 2], "cm"),
        question: `${subject} ${scaleText} méretarányú. A valóságban ${realM} m hosszú út a térképen hány cm hosszú?`,
        successText: `😊 Ügyes! ${realM} m = ${formatThousands(realCm)} cm, és ${formatThousands(realCm)} ÷ ${formatThousands(scale)} = ${mapCm} cm.`
    };
}

function numberOptions(answer, candidates) {
    const seen = new Set([answer]);
    const values = [answer];
    for (const value of shuffle(candidates)) {
        if (values.length >= 4) break;
        if (!Number.isInteger(value) || value <= 0 || seen.has(value)) continue;
        seen.add(value);
        values.push(value);
    }
    for (const delta of [1, -1, 2, -2, 3, -3, 5, -5, 10, -10]) {
        if (values.length >= 4) break;
        const value = answer + delta;
        if (value > 0 && !seen.has(value)) {
            seen.add(value);
            values.push(value);
        }
    }
    return shuffle(values);
}

function sideLabels(sides, unknown) {
    return sides.map((value, index) => (index === unknown ? null : value));
}

function figure(sides, unknown) {
    return {
        sides,
        labels: sideLabels(sides, unknown),
        unknown
    };
}

function buildTask(mode, world) {
    if (mode === "application") return buildApplication(world);

    for (let attempt = 0; attempt < 60; attempt++) {
        const sides = pick(TRIANGLES);
        const k = pick(SCALES);
        const big = sides.map(s => s * k);
        if (!big.every(s => Number.isInteger(s))) continue;

        if (mode === "scale-factor") {
            const decoys = [2, 3, 4, 1.5, 0.5, 0.25, 6, 0.2].filter(v => v !== k);
            const options = shuffle([k, ...shuffle(decoys).slice(0, 3)]).map(v => formatNumber(v));
            return {
                type: "similarity",
                mode,
                k,
                first: figure(sides, -1),
                second: figure(big, -1),
                answer: k,
                answerLabel: formatNumber(k),
                options,
                question: `Az ABC és az A′B′C′ háromszög hasonló. Az ABC oldalai ${sides.map((s, i) => `${SIDE_NAMES[i]} = ${s} cm`).join(", ")}, az A′B′C′ oldalai pedig ${big.map((s, i) => `${SIDE_NAMES2[i]} = ${s} cm`).join(", ")}. Hányszorosa az A′B′C′ háromszög az ABC háromszögnek?`,
                successText: `😊 Ügyes! A hasonlítási arány ${formatNumber(k)}.`
            };
        }

        if (mode === "area-ratio") {
            const area = pick([4, 8, 12, 16, 20, 24]);
            if (!Number.isInteger(area * k * k)) continue;
            const answer = area * k * k;
            const options = numberOptions(answer, [area, area * k, area * k * 2]).map(v => `${v} cm²`);
            return {
                type: "similarity",
                mode,
                k,
                first: figure(sides, -1),
                second: figure(big, -1),
                answer,
                answerLabel: `${answer} cm²`,
                options,
                question: `Az ABC és az A′B′C′ háromszög hasonló. Az ABC háromszög területe ${area} cm², oldalai ${sides.map((s, i) => `${SIDE_NAMES[i]} = ${s} cm`).join(", ")}. Mekkora az A′B′C′ háromszög területe?`,
                successText: `😊 Ügyes! A terület a hasonlítási arány négyzetével nő: ${area} × ${formatNumber(k)}² = ${answer} cm².`
            };
        }

        const unknownInBig = mode === "missing-side";
        const unknown = Math.floor(Math.random() * 3);
        const answer = unknownInBig ? big[unknown] : sides[unknown];

        const options = numberOptions(answer, [
            unknownInBig ? sides[unknown] : big[unknown],
            answer * k,
            answer * 2,
            Math.round(answer / k)
        ]).map(v => `${v} cm`);

        const firstText = sides.map((s, i) => (unknownInBig
            ? `${SIDE_NAMES[i]} = ${s} cm`
            : `${SIDE_NAMES[i]} = ${i === unknown ? "?" : `${s} cm`}`)).join(", ");
        const secondText = big.map((s, i) => (unknownInBig
            ? `${SIDE_NAMES2[i]} = ${i === unknown ? "?" : `${s} cm`}`
            : `${SIDE_NAMES2[i]} = ${s} cm`)).join(", ");

        const bigger = k >= 1 ? "nagyított" : "kicsinyített";
        const first = unknownInBig ? figure(sides, -1) : figure(sides, unknown);
        const second = unknownInBig ? figure(big, unknown) : figure(big, -1);
        const unknownName = unknownInBig ? SIDE_NAMES2[unknown] : SIDE_NAMES[unknown];
        const unknownValue = unknownInBig ? sides[unknown] : big[unknown];

        return {
            type: "similarity",
            mode,
            k,
            first,
            second,
            answer,
            answerLabel: `${answer} cm`,
            options,
            question: `Az ABC és az A′B′C′ háromszög hasonló, az A′B′C′ a ${bigger} példány. Az ABC háromszögben ${firstText}. Az A′B′C′ háromszögben ${secondText}. Mekkora ${article(unknownName)} ${unknownName} oldal?`,
            successText: `😊 Ügyes! A hasonlítási arány ${formatNumber(k)}, ezért ${unknownName} = ${unknownValue} ${unknownInBig ? "×" : "÷"} ${formatNumber(k)} = ${answer} cm.`
        };
    }
    return null;
}

export function generateSimilarity(options = {}) {
    const { count = 4, mode = "mixed", world = "postman" } = options;
    const names = mode === "mixed" ? MIXED : [mode];
    if (!names.every(name => MODES.includes(name))) {
        throw new Error(`Ismeretlen hasonlóság mód: ${mode}`);
    }

    const tasks = [];
    let guard = 0;
    while (tasks.length < count && guard < count * 60) {
        guard++;
        const task = buildTask(pick(names), world);
        if (task) tasks.push(task);
    }
    return tasks;
}
