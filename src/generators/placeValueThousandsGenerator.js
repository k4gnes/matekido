import { makeCarryParts } from "../math/placeValue.js";
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

const PLACE_VALUES = [
    { key: "millions", label: "millió", value: 1000000 },
    { key: "hundredThousands", label: "százezer", value: 100000 },
    { key: "tenThousands", label: "tízezer", value: 10000 },
    { key: "thousands", label: "ezres", value: 1000 },
    { key: "hundreds", label: "százas", value: 100 },
    { key: "tens", label: "tízes", value: 10 },
    { key: "ones", label: "egyes", value: 1 }
];

function digitsOf(num) {
    const digits = {};
    for (const place of PLACE_VALUES) {
        digits[place.key] = Math.floor(num / place.value) % 10;
    }
    return digits;
}

function makeCarryBase(parts, sum, layout, interaction, carryOn) {
    const base = {
        answer: sum,
        number: sum,
        numberText: formatThousands(sum),
        parts: parts.map(part => part.key),
        layout,
        interaction
    };

    if (carryOn) base.carryOn = carryOn;

    for (const place of PLACE_VALUES) {
        const part = parts.find(p => p.key === place.key);
        base[place.key] = part ? part.count : 0;
    }

    return base;
}

function makeValueTask(num, digits) {
    const interesting = PLACE_VALUES.filter(p => digits[p.key] > 0);
    const place = pick(interesting.length ? interesting : PLACE_VALUES);
    const digit = digits[place.key];
    const answer = digit * place.value;

    const candidates = [digit, digit * 1, place.value, place.value * digit];
    const options = [answer];
    for (const c of candidates) {
        if (options.length < 4 && !options.includes(c)) options.push(c);
    }
    for (let p = 1; options.length < 4; p *= 10) {
        for (const d of [digit, Math.max(1, digit - 1), digit + 1]) {
            const v = d * p;
            if (options.length < 4 && !options.includes(v)) options.push(v);
        }
    }

    return {
        task: "value",
        place: place.key,
        placeLabel: place.label,
        digit,
        answer,
        options: shuffle(options)
    };
}

function makeDigitTask(num, digits) {
    const place = pick(PLACE_VALUES);
    const answer = digits[place.key];

    const pool = [answer, (answer + 1) % 10, (answer + 9) % 10, (answer + 2) % 10, 0, 5];
    const options = [];
    for (const d of pool) {
        if (options.length < 4 && !options.includes(d)) options.push(d);
    }

    return {
        task: "digit",
        place: place.key,
        placeLabel: place.label,
        answer,
        options: shuffle(options)
    };
}

function makeExpandTask(num) {
    return { task: "expand", answer: num };
}

export function generatePlaceValueThousands(options = {}) {

    const {
        count = 8,
        min = 1000,
        max = 9999,
        interaction = "mixed",
        layout = "auto",
        task = "expand",
        carry = false,
        carryOn = null
    } = options;

    if (carry && task !== "expand" && task !== "mixed") {
        throw new Error("A kétjegyű darabszám csak összegbontó (expand) feladatban használható.");
    }

    const carryOnKeys = carryOn === null ? null : [].concat(carryOn);
    if (carryOnKeys && carryOnKeys.some(key => !PLACE_VALUES.some(place => place.key === key))) {
        throw new Error(`Ismeretlen carryOn helyiérték: ${carryOnKeys.join(", ")}`);
    }

    const resolvedLayout = layout === "table" || (layout === "auto" && max > 9999) ? "table" : "emoji";
    const useChoice = interaction === "mixed" ? null : interaction === "choice";

    const tasks = [];

    for (let i = 0; i < count; i++) {

        let carryTask = null;

        if (carry) {
            const forced = carryOnKeys ? carryOnKeys[i % carryOnKeys.length] : null;
            carryTask = makeCarryParts(PLACE_VALUES, min, max, { forceCarryOn: forced })
                ?? (forced ? makeCarryParts(PLACE_VALUES, min, max) : null);
        }

        if (carryTask) {
            const lead = carryTask.parts.find(part => part.count >= 10);
            tasks.push(makeCarryBase(carryTask.parts, carryTask.sum, resolvedLayout, useChoice ?? pick(["input", "choice"]), lead ? lead.key : undefined));
            continue;
        }

        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        const digits = digitsOf(num);

        const base = {
            answer: num,
            number: num,
            numberText: formatThousands(num),
            layout: resolvedLayout,
            interaction: useChoice ?? pick(["input", "choice"])
        };

        for (const place of PLACE_VALUES) {
            base[place.key] = digits[place.key];
        }

        let extra;

        if (task === "mixed") {
            extra = pick([makeValueTask, makeDigitTask, makeExpandTask])(num, digits);
        } else if (task === "value") {
            extra = makeValueTask(num, digits);
        } else if (task === "digit") {
            extra = makeDigitTask(num, digits);
        } else if (task === "expand") {
            extra = makeExpandTask(num);
        } else {
            throw new Error(`Ismeretlen helyiérték feladattípus: ${task}`);
        }

        if (extra.task !== "expand" && !extra.options) {
            throw new Error(`A(z) ${extra.task} feladattípushoz nincs opció.`);
        }

        if (extra.task === "value" || extra.task === "digit") {
            base.interaction = "choice";
        }

        Object.assign(base, extra);

        tasks.push(base);
    }

    return tasks;
}
