import { decimalToWords } from "../math/number.js";

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

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function decimalForTenths(n) {
    return `0,${n}`;
}

function isCleanHundredths(n) {
    return n > 0 && n < 100 && n % 10 !== 0;
}

function decimalForHundredths(n) {
    return n < 10 ? `0,0${n}` : `0,${n}`;
}

function pickDecimalOptions(correct, pool) {
    const decoys = shuffle([...new Set(pool)].filter(v => v !== correct)).slice(0, 3);
    return shuffle([correct, ...decoys]).map(text => ({ text, correct: text === correct }));
}

function tenthsPool() {
    const out = [];
    for (let v = 1; v <= 9; v++) out.push(decimalForTenths(v));
    return out;
}

function tenthsDecoys(n) {
    const lower = Math.floor(n / 10);
    return [decimalForTenths(lower), decimalForTenths(Math.min(lower + 1, 9))];
}

function hundredthsPool(correct) {
    const out = [];
    const target = Number(correct.replace(",", "").padStart(3, "0"));
    for (let v = 1; v < 100; v++) {
        if (!isCleanHundredths(v)) continue;
        const d = decimalForHundredths(v);
        if (d === correct) continue;
        if (Math.abs(v - target) > 15) continue;
        out.push(d);
    }
    return out;
}

function buildTenthsTask() {
    const filled = randint(1, 9);
    const options = pickDecimalOptions(decimalForTenths(filled), tenthsPool());
    return {
        type: "decimal",
        mode: "tenths",
        total: 10,
        filled,
        question: "Mekkora részt színeztek be?",
        options
    };
}

function buildHundredthsTask() {
    const filled = pick([3, 7, 11, 14, 16, 23, 31, 42, 45, 58, 67, 71, 83, 96]);
    const correct = decimalForHundredths(filled);
    const pool = hundredthsPool(correct).concat(tenthsDecoys(filled));
    const options = pickDecimalOptions(correct, pool);
    return {
        type: "decimal",
        mode: "hundredths",
        total: 100,
        filled,
        question: "Mekkora részt színeztek be?",
        options
    };
}

function buildFractionToDecimalTask() {
    const denominator = pick([10, 100]);
    const fractionNums = denominator === 10 ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [3, 7, 11, 14, 16, 23, 31, 42, 45, 58, 67, 71, 83, 96];
    const numerator = pick(fractionNums);
    const correct = denominator === 10 ? decimalForTenths(numerator) : decimalForHundredths(numerator);
    const pool = denominator === 10
        ? tenthsPool()
        : hundredthsPool(correct).concat(tenthsDecoys(numerator));
    const options = pickDecimalOptions(correct, pool);
    return {
        type: "decimal",
        mode: "convert",
        direction: "fraction-to-decimal",
        numerator,
        denominator,
        symbol: `${numerator}/${denominator}`,
        question: "Mennyi ez tizedes törttel?",
        options
    };
}

function buildDecimalToFractionTask() {
    const denominator = pick([10, 100]);
    const fractionNums = denominator === 10 ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [3, 7, 11, 14, 16, 23, 31];
    const numerator = pick(fractionNums);
    const correct = `${numerator}/${denominator}`;
    const pool = [];
    for (const n of fractionNums) pool.push(`${n}/${denominator}`);
    for (const n of [3, 7, 11, 14, 16, 23]) pool.push(`${n}/${denominator === 10 ? 100 : 10}`);
    const options = pickDecimalOptions(correct, pool);
    return {
        type: "decimal",
        mode: "convert",
        direction: "decimal-to-fraction",
        numerator,
        denominator,
        symbol: denominator === 10 ? decimalForTenths(numerator) : decimalForHundredths(numerator),
        question: "Mennyi ez törttel?",
        options
    };
}

function buildCompareTask() {
    const k = randint(1, 9);
    const mode = pick(["equal", "cross"]);
    let left, right, relation;
    if (mode === "equal") {
        left = decimalForTenths(k);
        right = decimalForHundredths(10 * k);
        relation = "=";
    } else {
        const candidates = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 27, 28, 29, 31, 33, 35, 38, 41, 44, 47, 52, 56, 61, 67, 73, 79, 83, 91].filter(v => v !== 10 * k && Math.abs(10 * k - v) > 1);
        const m = pick(candidates);
        left = decimalForTenths(k);
        right = decimalForHundredths(m);
        relation = 10 * k > m ? ">" : "<";
    }
    if (Math.random() < 0.5) {
        [left, right] = [right, left];
        relation = relation === ">" ? "<" : relation === "<" ? ">" : "=";
    }
    const options = shuffle([">", "<", "="]).map(text => ({ text, correct: text === relation }));
    return {
        type: "decimal",
        mode: "compare",
        left,
        right,
        question: "Melyik jel illik a két szám közé?",
        options
    };
}

function parseDecimal(text) {
    return Number(text.replace(",", "."));
}

function wholeDecimal(whole, tenths, hundredths = null) {
    const base = `${whole},${tenths}`;
    return hundredths === null ? base : `${base}${hundredths}`;
}

/**
 * Tévesztő lehetőségek egy tizedes számhoz: tized/század csere, helyre
 * csúsztatás, egészrész eltolás. Ugyanazt az értéket soha nem adja vissza,
 * és kétszeresét sem, mert az nem lenne téves válasz.
 */
function decimalDistractors(correct) {
    const [w, f = ""] = correct.split(",");
    const whole = Number(w);
    const digits = f.padEnd(2, "0");
    const tenths = Number(digits[0]);
    const hundredths = Number(digits[1]);
    const pool = new Set();

    const add = value => {
        if (!value || value === correct || pool.has(value)) return;
        if (parseDecimal(value) === parseDecimal(correct)) return;
        pool.add(value);
    };

    if (f.length === 1) {
        add(wholeDecimal(whole, `0${tenths}`));
        add(wholeDecimal(whole === 1 ? 2 : whole - 1, tenths));
        add(wholeDecimal(whole + 1, tenths));
        add(wholeDecimal(whole, tenths === 9 ? 8 : tenths + 1));
    } else {
        add(wholeDecimal(whole, tenths));
        add(wholeDecimal(whole, tenths, hundredths === 9 ? 8 : hundredths + 1));
        add(wholeDecimal(whole === 1 ? 2 : whole - 1, tenths, hundredths));
        add(wholeDecimal(whole + 1, tenths, hundredths));
    }

    return shuffle([...pool]);
}

function buildWordTask(direction) {
    const whole = randint(1, 30);
    const useHundredths = Math.random() < 0.5;
    const correct = useHundredths
        ? wholeDecimal(whole, randint(1, 9), randint(1, 9))
        : wholeDecimal(whole, randint(1, 9));

    const alternatives = decimalDistractors(correct).slice(0, 3);
    const values = shuffle([correct, ...alternatives]);
    const words = values.map(v => decimalToWords(v));
    const answer = decimalToWords(correct);

    if (direction === "read") {
        return {
            type: "decimal",
            mode: "read",
            direction,
            symbol: answer,
            question: "Mennyi ez tizedes törttel?",
            options: values.map(text => ({ text, correct: text === correct }))
        };
    }

    return {
        type: "decimal",
        mode: "write",
        direction,
        symbol: correct,
        question: "Hogyan mondjuk ezt szóval?",
        options: words.map((text, i) => ({ text, correct: values[i] === correct }))
    };
}

function buildCompareWholeTask() {
    const kind = pick(["pad", "pad", "same", "whole", "equal"]);
    const whole = randint(2, 30);
    let left;
    let right;

    if (kind === "pad") {
        left = wholeDecimal(whole, randint(1, 9));
        right = wholeDecimal(whole, randint(1, 9), randint(0, 9));
    } else if (kind === "same") {
        const base = randint(11, 98);
        let other = randint(11, 99);
        if (other === base) other = base === 99 ? 11 : base + 1;
        left = wholeDecimal(whole, Math.floor(base / 10), base % 10);
        right = wholeDecimal(whole, Math.floor(other / 10), other % 10);
    } else if (kind === "whole") {
        left = wholeDecimal(whole, randint(0, 9), randint(1, 9));
        right = wholeDecimal(whole + 1, randint(0, 9), randint(1, 9));
    } else {
        const tenths = randint(1, 9);
        left = wholeDecimal(whole, tenths);
        right = wholeDecimal(whole, tenths, 0);
    }

    const leftValue = parseDecimal(left);
    const rightValue = parseDecimal(right);
    let relation = leftValue < rightValue ? "<" : leftValue > rightValue ? ">" : "=";
    if (Math.random() < 0.5) {
        [left, right] = [right, left];
        relation = relation === ">" ? "<" : relation === "<" ? ">" : "=";
    }

    const options = shuffle([">", "<", "="]).map(text => ({ text, correct: text === relation }));
    return {
        type: "decimal",
        mode: "compare-whole",
        left,
        right,
        question: "Melyik jel illik a két szám közé?",
        options
    };
}

const POWER_LABEL = { 10: "10-zel", 100: "100-zal", 1000: "1000-rel" };

function fmtHundredths(h) {
    const abs = Math.abs(h);
    const whole = Math.floor(abs / 100);
    const rest = abs % 100;
    let text;
    if (rest === 0) text = String(whole);
    else if (rest % 10 === 0) text = `${whole},${rest / 10}`;
    else text = `${whole},${String(rest).padStart(2, "0")}`;
    return h < 0 ? `-${text}` : text;
}

function valueOptions(correctH, candidates) {
    const pool = new Set();
    const add = v => {
        if (Number.isInteger(v) && v > 0 && v !== correctH) pool.add(v);
    };
    for (const v of candidates) add(v);
    add(correctH + 1);
    add(correctH - 1);
    add(correctH + 10);
    add(correctH - 10);
    add(correctH + 100);
    add(correctH - 100);
    add(correctH * 10);
    const distractors = shuffle([...pool]).slice(0, 3);
    return shuffle([correctH, ...distractors]).map(v => ({ text: fmtHundredths(v), correct: v === correctH }));
}

function randomHundredthsValue() {
    const whole = randint(1, 40);
    const frac = Math.random() < 0.4 ? randint(1, 99) : randint(1, 9) * 10;
    return whole * 100 + frac;
}

function buildAddSubTask(opOption) {
    const op = opOption === "+" || opOption === "-" ? opOption : pick(["+", "-"]);
    let a = randomHundredthsValue();
    let b = randomHundredthsValue();
    if (op === "-") {
        if (b > a) [a, b] = [b, a];
        if (b === a) b = Math.max(10, Math.floor(b / 2));
    } else if (Math.random() < 0.5) {
        [a, b] = [b, a];
    }
    const resultH = op === "+" ? a + b : a - b;
    return {
        type: "decimal",
        mode: "addsub",
        op,
        title: "Összeadás és kivonás",
        symbol: `${fmtHundredths(a)} ${op} ${fmtHundredths(b)}`,
        question: "Mennyi az eredmény?",
        options: valueOptions(resultH, [resultH + 1, resultH - 1, resultH + 10, resultH - 10, resultH + 100, resultH - 100])
    };
}

function powerTitle(power) {
    if (power === 10) return "Szorzás 10-zel";
    if (power === 100) return "Szorzás 100-zal";
    if (power === 1000) return "Szorzás 1000-rel";
    return "Szorzás 10-zel, 100-zal, 1000-rel";
}

function buildTimesPowerTask(powerOption) {
    const power = [10, 100, 1000].includes(powerOption) ? powerOption : pick([10, 100, 1000]);
    let valueH;
    if (power === 10) {
        valueH = randint(1, 99) * 100 + randint(0, 9) * 10;
    } else if (power === 100) {
        valueH = randint(1, 9) * 100 + pick([0, 50]);
    } else {
        valueH = pick([5, 10, 15, 20, 25, 50, 75, 100]);
    }
    const resultH = valueH * power;
    return {
        type: "decimal",
        mode: "times-power",
        power,
        title: powerTitle(power),
        symbol: `${fmtHundredths(valueH)} × ${power}`,
        question: `Mennyi ez szorozva ${POWER_LABEL[power]}?`,
        options: valueOptions(resultH, [valueH, resultH * 10, resultH / 10, resultH + power, resultH - power])
    };
}

function buildDivPowerTask(kindOption, divisorOption) {
    const kind = ["power", "whole"].includes(kindOption) ? kindOption : pick(["power", "power", "whole"]);
    if (kind === "whole") {
        const divisor = randint(2, 9);
        const resultH = randint(5, 300) * 10;
        const valueH = resultH * divisor;
        return {
            type: "decimal",
            mode: "div-power",
            kind,
            divisor,
            title: "Osztás egésszel",
            symbol: `${fmtHundredths(valueH)} ÷ ${divisor}`,
            question: "Mennyi az eredmény?",
            options: valueOptions(resultH, [valueH, resultH * 10, resultH / 10, resultH + divisor * 10, resultH - divisor * 10])
        };
    }
    const divisor = [10, 100].includes(divisorOption) ? divisorOption : pick([10, 100]);
    const valueH = divisor === 10
        ? randint(1, 999) * 100 + randint(0, 9) * 10
        : randint(1, 999) * 100;
    const resultH = valueH / divisor;
    const label = divisor === 10 ? "10-zel" : "100-zal";
    return {
        type: "decimal",
        mode: "div-power",
        kind,
        divisor,
        title: `Osztás ${label}`,
        symbol: `${fmtHundredths(valueH)} ÷ ${divisor}`,
        question: `Mennyi ez osztva ${label}?`,
        options: valueOptions(resultH, [valueH, resultH * 10, resultH / 10, resultH + 10, resultH - 10])
    };
}

export function generateDecimalPrep(options = {}) {
    const { count = 4, mode = "mixed" } = options;

    const tasks = [];
    for (let i = 0; i < count; i++) {
        if (mode === "tenths") {
            tasks.push(buildTenthsTask());
        } else if (mode === "hundredths") {
            tasks.push(buildHundredthsTask());
        } else if (mode === "convert") {
            tasks.push(Math.random() < 0.5 ? buildFractionToDecimalTask() : buildDecimalToFractionTask());
        } else if (mode === "compare") {
            tasks.push(buildCompareTask());
        } else if (mode === "read") {
            tasks.push(buildWordTask("read"));
        } else if (mode === "write") {
            tasks.push(buildWordTask("write"));
        } else if (mode === "compare-whole") {
            tasks.push(buildCompareWholeTask());
        } else if (mode === "addsub") {
            tasks.push(buildAddSubTask(options.op));
        } else if (mode === "times-power") {
            tasks.push(buildTimesPowerTask(options.power));
        } else if (mode === "div-power") {
            tasks.push(buildDivPowerTask(options.kind, options.divisor));
        } else {
            tasks.push(pick([buildTenthsTask, buildHundredthsTask, buildFractionToDecimalTask, buildDecimalToFractionTask, buildCompareTask])());
        }
    }
    return tasks;
}