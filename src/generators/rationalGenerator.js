const MINUS = "−";

function randInt(min, max) {
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

function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
}

function fmtInt(n) {
    return n < 0 ? `${MINUS}${-n}` : String(n);
}

function fractionDesc(num, den) {
    return { kind: "fraction", num, den };
}

function mixedDesc(neg, whole, num, den) {
    return { kind: "mixed", neg, whole, num, den };
}

function decimalDesc(text) {
    return { kind: "decimal", text };
}

function descText(d) {
    if (d.kind === "fraction") return `${fmtInt(d.num)}/${d.den}`;
    if (d.kind === "mixed") return `${d.neg ? MINUS : ""}${d.whole} ${d.num}/${d.den}`;
    return d.text;
}

function descValue(d) {
    if (d.kind === "fraction") return d.num / d.den;
    if (d.kind === "mixed") return (d.neg ? -1 : 1) * (d.whole + d.num / d.den);
    return parseFloat(d.text.replace(/−/g, "-").replace(",", "."));
}

function flipSign(text) {
    return text.startsWith(MINUS) ? text.slice(1) : `${MINUS}${text}`;
}

function negateDesc(d) {
    if (d.kind === "fraction") return fractionDesc(-d.num, d.den);
    if (d.kind === "mixed") return mixedDesc(!d.neg, d.whole, d.num, d.den);
    return decimalDesc(flipSign(d.text));
}

function absDesc(d) {
    if (d.kind === "fraction") return fractionDesc(Math.abs(d.num), d.den);
    if (d.kind === "mixed") return mixedDesc(false, d.whole, d.num, d.den);
    return decimalDesc(d.text.startsWith(MINUS) ? d.text.slice(1) : d.text);
}

function decimalFromNumber(value) {
    let s = value.toFixed(3);
    s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s.replace(".", ",").replace(/-/g, MINUS);
}

function decimalText(num, den) {
    return decimalFromNumber(num / den);
}

function buildRationalOptions(correct, candidates, count = 4) {
    const options = [correct];
    const seen = new Set([descValue(correct)]);
    for (const cand of shuffle(candidates.slice())) {
        if (options.length >= count) break;
        const v = descValue(cand);
        if (seen.has(v)) continue;
        seen.add(v);
        options.push(cand);
    }
    return shuffle(options).map(d => ({ ...d, text: descText(d), correct: d === correct }));
}

const SIGN_DECIMALS = ["0,25", "0,5", "0,75", "0,2", "0,4", "0,6", "0,8", "1,5", "2,25", "0,1", "0,3", "0,9"];

function buildSign() {
    const form = pick(["fraction", "decimal", "fraction", "mixed", "decimal"]);
    let display;
    if (form === "fraction") {
        const den = pick([2, 3, 4, 5, 6, 8, 10]);
        const zero = Math.random() < 0.15;
        let num = zero ? 0 : randInt(1, den - 1);
        if (!zero && Math.random() < 0.5) num = -num;
        display = fractionDesc(num, den);
    } else if (form === "mixed") {
        const den = pick([2, 3, 4, 5, 8]);
        const whole = randInt(1, 4);
        const num = randInt(1, den - 1);
        display = mixedDesc(Math.random() < 0.5, whole, num, den);
    } else {
        const text = pick(SIGN_DECIMALS);
        display = decimalDesc(Math.random() < 0.35 ? flipSign(text) : text);
    }
    const value = descValue(display);
    const sign = value > 0 ? "positive" : value < 0 ? "negative" : "zero";
    const label = { positive: "Pozitív", negative: "Negatív", zero: "Nulla" }[sign];
    const options = ["Pozitív", "Negatív", "Nulla"].map(t => ({ text: t, correct: t === label }));
    return {
        mode: "sign",
        value,
        sign,
        question: "Pozitív, negatív vagy nulla ez a szám?",
        display,
        answer: label,
        options,
        hint: "A pozitív számok nagyobbak 0-nál, a negatívak kisebbek 0-nál. A 0 se nem pozitív, se nem negatív."
    };
}

function buildParts() {
    const den = pick([2, 3, 4, 5, 6, 8, 10, 12]);
    let num = randInt(1, den - 1);
    if (Math.random() < 0.5) num = -num;
    const display = fractionDesc(num, den);
    const target = pick(["num", "den"]);
    const answer = target === "num" ? num : den;
    const question = target === "num" ? "Mennyi a számlálója?" : "Mennyi a nevezője?";
    const candidates = [num, den, -num, Math.abs(num), num + 1, num - 1, den + 1, den - 1, -den];
    const options = [];
    const seen = new Set();
    for (const v of [answer, ...shuffle(candidates)]) {
        if (options.length >= 4) break;
        if (seen.has(v)) continue;
        seen.add(v);
        options.push({ text: fmtInt(v), correct: v === answer, value: v });
    }
    return {
        mode: "parts",
        num,
        den,
        target,
        answer,
        question,
        display,
        options: shuffle(options),
        hint: "A törtvonal fölötti szám a számláló, az alatti a nevező. A negatív előjel a számlálóhoz tartozik: a −3/4 számlálója −3, nevezője 4."
    };
}

function randomBaseDesc() {
    if (Math.random() < 0.6) {
        const den = pick([2, 3, 4, 5, 6, 8, 10]);
        let num = randInt(1, den - 1);
        if (Math.random() < 0.5) num = -num;
        return fractionDesc(num, den);
    }
    const den = pick([2, 3, 4, 5, 8]);
    const whole = randInt(1, 4);
    const num = randInt(1, den - 1);
    return mixedDesc(Math.random() < 0.5, whole, num, den);
}

function baseCandidates(base) {
    if (base.kind === "fraction") {
        const { num, den } = base;
        return [
            fractionDesc(-num, den),
            fractionDesc(num, den + 1),
            fractionDesc(-num, den + 1),
            fractionDesc(num + 1, den),
            fractionDesc(-(num + 1), den),
            fractionDesc(den, num),
            fractionDesc(-den, num),
            fractionDesc(num, den + 2)
        ].filter(d => d.num !== 0 && d.den >= 2);
    }
    const { neg, whole, num, den } = base;
    return [
        mixedDesc(!neg, whole, num, den),
        mixedDesc(neg, whole + 1, num, den),
        mixedDesc(!neg, whole + 1, num, den),
        mixedDesc(neg, whole, num + 1 < den ? num + 1 : num, den),
        mixedDesc(neg, whole + 2, num, den),
        mixedDesc(!neg, whole + 2, num, den),
        mixedDesc(neg, whole, den - num, den),
        mixedDesc(neg, whole - 1 >= 1 ? whole - 1 : whole + 3, num, den)
    ].filter(d => d.num >= 1 && d.num < d.den && d.whole >= 1);
}

function buildOpposite() {
    const base = randomBaseDesc();
    const correct = negateDesc(base);
    const options = buildRationalOptions(correct, baseCandidates(base));
    return {
        mode: "opposite",
        baseValue: descValue(base),
        question: "Mi ennek a számnak az ellentettje?",
        display: base,
        answer: descText(correct),
        options,
        hint: "Az ellentettnél csak az előjel változik: a pozitívból negatív, a negatívból pozitív lesz. Ugyanakkora távolságra van a 0-tól, csak a másik oldalon."
    };
}

function buildAbsolute() {
    const base = randomBaseDesc();
    const correct = absDesc(base);
    const options = buildRationalOptions(correct, baseCandidates(base));
    return {
        mode: "absolute",
        baseValue: descValue(base),
        question: "Mennyi ennek a számnak az abszolút értéke?",
        display: base,
        answer: descText(correct),
        options,
        hint: "Az abszolút érték a szám 0-tól mért távolsága, ezért soha nem negatív: |−3/4| = 3/4 és |3/4| = 3/4."
    };
}

function buildToDecimal() {
    const den = pick([2, 4, 5, 8, 10, 20, 25, 50]);
    let num = randInt(1, 2 * den - 1);
    if (num % den === 0) num += 1;
    const value = num / den;
    const correct = decimalDesc(decimalText(num, den));
    const deltas = [0.1, -0.1, 0.01, -0.01, 0.2, -0.2, 1, -1, 0.5, -0.5, 0.05, -0.05];
    const candidates = [];
    for (const d of deltas) {
        const v = value + d;
        if (v <= 0) continue;
        candidates.push(decimalDesc(decimalFromNumber(v)));
    }
    const options = buildRationalOptions(correct, candidates);
    return {
        mode: "to-decimal",
        numerator: num,
        denominator: den,
        question: "Mennyi ennek a törtnek az értéke tizedes tört alakban?",
        display: fractionDesc(num, den),
        answer: descText(correct),
        options,
        hint: "A tört értéke a számláló és a nevező hányadosa. Ha a nevező 2, 4, 5, 8, 10, 20, 25 vagy 50, akkor véges tizedes törtet kapunk."
    };
}

function buildToFraction() {
    const hundredths = randInt(1, 99);
    const g = gcd(hundredths, 100);
    const num = hundredths / g;
    const den = 100 / g;
    const decimal = hundredths % 10 === 0
        ? `0,${hundredths / 10}`
        : `0,${String(hundredths).padStart(2, "0")}`;
    const correct = fractionDesc(num, den);
    const candidates = [
        fractionDesc(num + 1, den),
        fractionDesc(num - 1, den),
        fractionDesc(num, den + 1),
        fractionDesc(num, den + 2),
        fractionDesc(den, num),
        fractionDesc(num + 2, den),
        fractionDesc(num + 1, den + 1)
    ].filter(d => d.num >= 1 && d.den >= 2);
    const options = buildRationalOptions(correct, candidates);
    return {
        mode: "to-fraction",
        hundredths,
        numerator: num,
        denominator: den,
        decimal,
        question: "Melyik legegyszerűbb tört egyenlő ezzel a tizedes törttel?",
        display: decimalDesc(decimal),
        answer: descText(correct),
        options,
        hint: "A tizedes tört felírható 100 nevezőjű törtként, majd egyszerűsítjük a közös osztóval."
    };
}

function buildToMixed() {
    const den = pick([3, 4, 5, 6, 8]);
    const whole = randInt(1, 3);
    const rem = randInt(1, den - 1);
    const num = whole * den + rem;
    const correct = mixedDesc(false, whole, rem, den);
    const pool = [];
    for (const d of [2, 3, 4, 5, 6, 8]) {
        for (let w = 1; w <= 4; w++) {
            for (let r = 1; r < d; r++) {
                pool.push(mixedDesc(false, w, r, d));
            }
        }
    }
    const options = buildRationalOptions(correct, pool);
    return {
        mode: "to-mixed",
        num,
        den,
        whole,
        rem,
        question: "Írd fel vegyes szám alakban!",
        display: fractionDesc(num, den),
        answer: descText(correct),
        options,
        hint: "Az egész rész a számláló és a nevező hányadosa. A maradék lesz az új számláló, a nevező változatlan."
    };
}

function buildToImproper() {
    const den = pick([3, 4, 5, 6, 8]);
    const whole = randInt(1, 3);
    const rem = randInt(1, den - 1);
    const num = whole * den + rem;
    const correct = fractionDesc(num, den);
    const candidates = [
        fractionDesc(num + 1, den),
        fractionDesc(num - 1, den),
        fractionDesc(num, den + 1),
        fractionDesc(num, den + 2),
        fractionDesc(num + den, den),
        fractionDesc(rem, den),
        fractionDesc(num + 2, den),
        fractionDesc(num + 1, den + 1)
    ].filter(d => d.num >= 1 && d.den >= 2);
    const options = buildRationalOptions(correct, candidates);
    return {
        mode: "to-improper",
        num,
        den,
        whole,
        rem,
        question: "Írd fel törtszám (áltört) alakban!",
        display: mixedDesc(false, whole, rem, den),
        answer: descText(correct),
        options,
        hint: "A vegyes számból áltört lesz: egész × nevező + számláló adja az új számlálót, a nevező marad."
    };
}

function buildMixedFromFraction(num, den) {
    if (num >= 0) {
        const whole = Math.floor(num / den);
        const rem = num % den;
        if (whole === 0) return fractionDesc(rem, den);
        return mixedDesc(false, whole, rem, den);
    } else {
        const whole = Math.floor(-num / den);
        const rem = (-num) % den;
        if (whole === 0) return fractionDesc(num, den);
        return mixedDesc(true, whole, rem, den);
    }
}

function simplifyFraction(num, den) {
    const g = gcd(num, den);
    let n = num / g;
    let d = den / g;
    if (d < 0) {
        n = -n;
        d = -d;
    }
    return { num: n, den: d };
}

function randomRational() {
    const sign = Math.random() < 0.4 ? -1 : 1;
    const form = Math.random() < 0.5 ? "frac" : "dec";
    if (form === "frac") {
        const den = pick([2, 3, 4, 5, 6, 8, 10, 12]);
        let num = sign * randInt(1, 2 * den);
        if (num % den === 0) num += sign;
        const s = simplifyFraction(num, den);
        if (Math.random() < 0.25) {
            return buildMixedFromFraction(s.num, s.den);
        }
        return fractionDesc(s.num, s.den);
    }
    const vals = [0.25, 0.5, 0.75, 0.2, 0.4, 0.6, 0.8, 0.125, 1.25, 1.5, 2.25, 0.1, 0.3, 0.6, 0.9];
    const v = pick(vals) * (sign >= 0 ? 1 : -1);
    return decimalDesc(decimalFromNumber(v));
}

function equalPair() {
    const den = pick([2, 4, 5, 8, 10, 20, 25, 50]);
    const num = randInt(1, den - 1);
    const sign = Math.random() < 0.4 ? -1 : 1;
    const s = simplifyFraction(sign * num, den);
    const a = fractionDesc(s.num, s.den);
    const forms = [
        decimalDesc(decimalFromNumber(s.num / s.den)),
        fractionDesc(s.num * 2, s.den * 2)
    ];
    if (Math.abs(s.num) > s.den) forms.push(buildMixedFromFraction(s.num, s.den));
    return [a, pick(forms)];
}

function buildCompare() {
    let a;
    let b;
    if (Math.random() < 0.25) {
        [a, b] = equalPair();
    } else {
        a = randomRational();
        b = randomRational();
        let guard = 0;
        while (Math.abs(descValue(a) - descValue(b)) < 1e-9 && guard < 50) {
            guard++;
            b = randomRational();
        }
    }
    const va = descValue(a);
    const vb = descValue(b);
    let answer;
    if (Math.abs(va - vb) < 1e-9) {
        answer = "=";
    } else if (va < vb) {
        answer = "<";
    } else {
        answer = ">";
    }
    const left = a;
    const right = b;
    const options = [
        { text: "<", correct: answer === "<" },
        { text: ">", correct: answer === ">" },
        { text: "=", correct: answer === "=" }
    ];
    return {
        mode: "compare",
        question: "Hasonlítsd össze a két számot!",
        left,
        right,
        answer,
        options,
        hint: "Törd a törtet tizedesre, vagy hozd közös nevezőre. Negatív számnál a 0-tól távolabb lévő (abszolút értékben nagyobb) a kisebb. Pl. −2 < −1 < 0 < 0,5 < 3/4."
    };
}

function lcm(a, b) {
    return (a * b) / gcd(a, b);
}

function valueDesc(num, den) {
    const s = simplifyFraction(num, den);
    if (s.den === 1) return decimalDesc(fmtInt(s.num));
    if (Math.abs(s.num) > s.den) return buildMixedFromFraction(s.num, s.den);
    return fractionDesc(s.num, s.den);
}

function operandFrom(num, den, desc) {
    return { desc, num, den };
}

function fractionOperand() {
    const den = pick([2, 3, 4, 5, 6, 8, 10, 12]);
    const num = randInt(1, den - 1) * (Math.random() < 0.3 ? -1 : 1);
    return operandFrom(num, den, fractionDesc(num, den));
}

function mixedOperand() {
    const den = pick([2, 3, 4, 5, 6, 8]);
    const whole = randInt(1, 4);
    const rem = randInt(1, den - 1);
    const neg = Math.random() < 0.4;
    const sign = neg ? -1 : 1;
    const num = sign * (whole * den + rem);
    return operandFrom(num, den, mixedDesc(neg, whole, rem, den));
}

function integerOperand() {
    const v = randInt(1, 6) * (Math.random() < 0.3 ? -1 : 1);
    return operandFrom(v, 1, decimalDesc(fmtInt(v)));
}

function sameDenPair(op) {
    const den = pick([2, 3, 4, 5, 6, 8, 10, 12]);
    let an = randInt(1, den - 1);
    let bn = randInt(1, den - 1);
    if (op === "sub") {
        if (Math.random() < 0.5) {
            const t = an;
            an = bn;
            bn = t;
        }
        if (an === bn) bn = an === 1 ? 2 : an - 1;
    }
    if (Math.random() < 0.3) an = -an;
    if (Math.random() < 0.25) bn = -bn;
    return [
        operandFrom(an, den, fractionDesc(an, den)),
        operandFrom(bn, den, fractionDesc(bn, den))
    ];
}

function diffDenPair() {
    const dens = [2, 3, 4, 5, 6, 8, 9, 10, 12];
    const d1 = pick(dens);
    let d2 = pick(dens);
    let guard = 0;
    while ((d2 === d1 || ((d1 % d2 === 0 || d2 % d1 === 0) && Math.random() < 0.6)) && guard < 40) {
        d2 = pick(dens);
        guard++;
    }
    let an = randInt(1, d1 - 1);
    let bn = randInt(1, d2 - 1);
    if (Math.random() < 0.3) an = -an;
    if (Math.random() < 0.3) bn = -bn;
    return [
        operandFrom(an, d1, fractionDesc(an, d1)),
        operandFrom(bn, d2, fractionDesc(bn, d2))
    ];
}

function mixedPair() {
    const r = Math.random();
    if (r < 0.5) return [mixedOperand(), mixedOperand()];
    if (r < 0.8) return [mixedOperand(), fractionOperand()];
    return [integerOperand(), mixedOperand()];
}

function resultCandidates(a, b, op, rn, den, an, bn) {
    const wrongNumerator = op === "add"
        ? a.num * b.den + b.num * a.den
        : a.num * b.den - b.num * a.den;
    const list = [
        [wrongNumerator, a.den * b.den],
        [a.num + b.num, a.den + b.den],
        [a.num - b.num, a.den - b.den],
        [rn + 1, den],
        [rn - 1, den],
        [rn + 2, den],
        [rn - 2, den],
        [rn, den + 1],
        [rn, den + 2],
        [-rn, den],
        [rn + den, den],
        [rn - den, den],
        [rn * 2, den],
        [an + bn, den],
        [wrongNumerator, a.den + b.den]
    ];
    const out = [];
    for (const [num, d] of list) {
        if (!Number.isInteger(num) || !Number.isInteger(d) || d === 0) continue;
        if (!Number.isFinite(num / d)) continue;
        out.push(valueDesc(num, d));
    }
    let k = 3;
    while (out.length < 10 && k < 30) {
        out.push(valueDesc(rn + k, den));
        out.push(valueDesc(rn - k, den));
        out.push(valueDesc(rn, den + k));
        k++;
    }
    return out;
}

function buildAddSub(op, level) {
    let a;
    let b;
    let den;
    let an;
    let bn;
    let rn;
    let correct;
    for (let attempt = 0; attempt < 30; attempt++) {
        if (level === "same") {
            [a, b] = sameDenPair(op);
        } else if (level === "diff") {
            [a, b] = diffDenPair();
        } else {
            [a, b] = mixedPair();
        }
        den = lcm(a.den, b.den);
        an = a.num * (den / a.den);
        bn = b.num * (den / b.den);
        rn = op === "add" ? an + bn : an - bn;
        correct = valueDesc(rn, den);
        if (Math.abs(descValue(correct)) > 1e-9) break;
    }
    const options = buildRationalOptions(correct, resultCandidates(a, b, op, rn, den, an, bn));
    return {
        mode: op,
        level,
        question: op === "add" ? "Mennyi az összeg?" : "Mennyi a különbség?",
        left: a.desc,
        right: b.desc,
        op: op === "add" ? "+" : MINUS,
        answer: descText(correct),
        options,
        hint: op === "add"
            ? "Előbb hozd közös nevezőre a törteket, aztán a számlálókat add össze (a nevező nem változik). Az eredményt egyszerűsítsd, és ha áltört, írd fel vegyes számként."
            : "Előbb hozd közös nevezőre a törteket, aztán a számlálókat vond ki (a nevező nem változik). Ha negatív számot vonsz ki, az hozzáadást jelent. Az eredményt egyszerűsítsd."
    };
}

function signedFractionOperand(negProb) {
    const den = pick([2, 3, 4, 5, 6, 8, 10, 12]);
    const num = randInt(1, den - 1) * (Math.random() < negProb ? -1 : 1);
    return operandFrom(num, den, fractionDesc(num, den));
}

function positiveIntOperand() {
    const v = randInt(2, 6);
    return operandFrom(v, 1, decimalDesc(fmtInt(v)));
}

function mulDivPair(level) {
    if (level === "basic") {
        if (Math.random() < 0.8) return [signedFractionOperand(0), signedFractionOperand(0)];
        return [positiveIntOperand(), signedFractionOperand(0)];
    }
    if (level === "sign") {
        return [signedFractionOperand(0.5), signedFractionOperand(0.5)];
    }
    const r = Math.random();
    if (r < 0.5) return [mixedOperand(), fractionOperand()];
    if (r < 0.8) return [mixedOperand(), mixedOperand()];
    return [integerOperand(), mixedOperand()];
}

function mulDivCandidates(a, b, op, rn, den) {
    const addN = a.num * b.den + b.num * a.den;
    const addD = a.den * b.den;
    const mulN = a.num * b.num;
    const mulD = a.den * b.den;
    const divN = a.num * b.den;
    const divD = a.den * b.num;
    const list = [
        [addN, addD],
        [mulN, mulD],
        [divN, divD],
        [b.num, a.num],
        [b.den, a.den],
        [rn + 1, den],
        [rn - 1, den],
        [rn + 2, den],
        [rn - 2, den],
        [rn, den + 1],
        [rn, den + 2],
        [-rn, den],
        [den, rn],
        [rn + den, den],
        [rn - den, den],
        [rn * 2, den]
    ];
    const out = [];
    for (const [num, d] of list) {
        if (!Number.isInteger(num) || !Number.isInteger(d) || d === 0) continue;
        if (!Number.isFinite(num / d)) continue;
        out.push(valueDesc(num, d));
    }
    let k = 3;
    while (out.length < 10 && k < 30) {
        out.push(valueDesc(rn + k, den));
        out.push(valueDesc(rn - k, den));
        out.push(valueDesc(rn, den + k));
        k++;
    }
    return out;
}

function buildMulDiv(op, level) {
    let a;
    let b;
    let rn;
    let den;
    let correct;
    for (let attempt = 0; attempt < 30; attempt++) {
        [a, b] = mulDivPair(level);
        const s = op === "mul"
            ? simplifyFraction(a.num * b.num, a.den * b.den)
            : simplifyFraction(a.num * b.den, a.den * b.num);
        rn = s.num;
        den = s.den;
        correct = valueDesc(rn, den);
        if (Math.abs(descValue(correct)) > 1e-9) break;
    }
    const options = buildRationalOptions(correct, mulDivCandidates(a, b, op, rn, den));
    return {
        mode: op,
        level,
        question: op === "mul" ? "Mennyi a szorzat?" : "Mennyi a hányados?",
        left: a.desc,
        right: b.desc,
        op: op === "mul" ? "×" : "÷",
        answer: descText(correct),
        options,
        hint: op === "mul"
            ? "A törtek szorzásakor a számlálókat szorozzuk, a nevezőket is. Ezután egyszerűsítsd az eredményt. Az előjelvonal: (+)·(+)=+, (−)·(−)=+, (+)·(−)=−."
            : "Az osztás a szorzás fordítottja: szorozz a második tag reciprokjával (megcseréljük a számlálót és a nevezőt). Ezután egyszerűsítsd. Az előjel itt is ugyanaz, mint a szorzásnál."
    };
}

function mixOpsOperand(level) {
    if (level === "basic") {
        if (Math.random() < 0.25) return positiveIntOperand();
        return signedFractionOperand(0.1);
    }
    const r = Math.random();
    if (r < 0.4) return signedFractionOperand(0.4);
    if (r < 0.7) return mixedOperand();
    return integerOperand();
}

function fracApply(op, x, y) {
    if (op === "+") return simplifyFraction(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
    if (op === "−") return simplifyFraction(x[0] * y[1] - y[0] * x[1], x[1] * y[1]);
    if (op === "×") return simplifyFraction(x[0] * y[0], x[1] * y[1]);
    return simplifyFraction(x[0] * y[1], x[1] * y[0]);
}

function evalFlatPrecedence(vals, ops) {
    const vs = vals.map(v => [v.num, v.den]);
    const os = ops.slice();
    for (let i = 0; i < os.length;) {
        if (os[i] === "×" || os[i] === "÷") {
            const r = fracApply(os[i], vs[i], vs[i + 1]);
            vs.splice(i, 2, [r.num, r.den]);
            os.splice(i, 1);
        } else {
            i++;
        }
    }
    let acc = vs[0];
    for (let i = 0; i < os.length; i++) {
        const r = fracApply(os[i], acc, vs[i + 1]);
        acc = [r.num, r.den];
    }
    return { num: acc[0], den: acc[1] };
}

function pairValue(op, x, y) {
    return fracApply(op, [x.num, x.den], [y.num, y.den]);
}

function pickOps() {
    if (Math.random() < 0.25) return [pick(["×", "÷"]), pick(["×", "÷"])];
    if (Math.random() < 0.5) return [pick(["×", "÷"]), pick(["+", "−"])];
    return [pick(["+", "−"]), pick(["×", "÷"])];
}

function mulDivCandidateDescs(value, extra) {
    const pairs = [
        { num: -value.num, den: value.den },
        { num: value.num + 1, den: value.den },
        { num: value.num - 1, den: value.den },
        { num: value.num + 2, den: value.den },
        { num: value.num, den: value.den + 1 },
        { num: value.num, den: value.den + 2 },
        { num: value.num + value.den, den: value.den },
        { num: value.num * 2, den: value.den },
        ...extra
    ];
    const out = [];
    for (const p of pairs) {
        if (!Number.isInteger(p.num) || !Number.isInteger(p.den) || p.den === 0) continue;
        out.push(valueDesc(p.num, p.den));
    }
    let k = 3;
    while (out.length < 10 && k < 30) {
        out.push(valueDesc(value.num + k, value.den));
        out.push(valueDesc(value.num - k, value.den));
        out.push(valueDesc(value.num, value.den + k));
        k++;
    }
    return out;
}

function buildMixedOps(mode, level) {
    for (let attempt = 0; attempt < 80; attempt++) {
        const a = mixOpsOperand(level);
        const b = mixOpsOperand(level);
        const c = mixOpsOperand(level);
        const [op1, op2] = pickOps();
        let tokens;
        let value;
        let extras;
        if (mode === "order") {
            value = evalFlatPrecedence([a, b, c], [op1, op2]);
            const leftToRight = pairValue(op2, pairValue(op1, a, b), c);
            const rightFirst = pairValue(op1, a, pairValue(op2, b, c));
            if (value.num === leftToRight.num && value.den === leftToRight.den) continue;
            tokens = [a.desc, op1, b.desc, op2, c.desc];
            extras = [
                { num: leftToRight.num, den: leftToRight.den },
                { num: rightFirst.num, den: rightFirst.den }
            ];
        } else {
            const shape = Math.random() < 0.5 ? "left" : "right";
            let inner;
            if (shape === "left") {
                inner = pairValue(op1, a, b);
                value = pairValue(op2, { num: inner.num, den: inner.den }, c);
                tokens = ["(", a.desc, op1, b.desc, ")", op2, c.desc];
            } else {
                inner = pairValue(op2, b, c);
                if (op1 === "÷" && inner.num === 0) continue;
                value = pairValue(op1, a, { num: inner.num, den: inner.den });
                tokens = [a.desc, op1, "(", b.desc, op2, c.desc, ")"];
            }
            const ignoreParens = evalFlatPrecedence([a, b, c], [op1, op2]);
            if (value.num === ignoreParens.num && value.den === ignoreParens.den) continue;
            extras = [
                { num: ignoreParens.num, den: ignoreParens.den },
                { num: pairValue(op2, pairValue(op1, a, b), c).num, den: pairValue(op2, pairValue(op1, a, b), c).den },
                { num: pairValue(op1, a, pairValue(op2, b, c)).num, den: pairValue(op1, a, pairValue(op2, b, c)).den }
            ];
        }
        if (value.num === 0) continue;
        const correct = valueDesc(value.num, value.den);
        const options = buildRationalOptions(correct, mulDivCandidateDescs(value, extras));
        return {
            mode,
            level,
            question: "Mennyi a kifejezés értéke?",
            expr: tokens,
            operands: [a.desc, b.desc, c.desc],
            ops: [op1, op2],
            shape: mode === "order" ? "flat" : (tokens[0] === "(" ? "left" : "right"),
            answer: descText(correct),
            options,
            hint: mode === "order"
                ? "A műveleti sorrend: előbb a szorzás és az osztás, utána az összeadás és a kivonás, balról jobbra. Ha kell, hozd közös nevezőre a törteket."
                : "A zárójelben lévő műveletet mindig előbb számoljuk ki, mint a zárójelen kívülit. Utána a szokásos sorrend: előbb szorzás és osztás, aztán összeadás és kivonás."
        };
    }
    return buildMixedOps("order", level);
}

const ALL_MODES = ["parts", "sign", "opposite", "absolute", "to-decimal", "to-fraction", "to-mixed", "to-improper", "compare"];
const FORM_MODES = ["to-decimal", "to-fraction", "to-mixed", "to-improper"];

export function generateRational(options = {}) {
    const { count = 4, mode = "mixed" } = options;

    const builders = {
        parts: buildParts,
        sign: buildSign,
        opposite: buildOpposite,
        absolute: buildAbsolute,
        "to-decimal": buildToDecimal,
        "to-fraction": buildToFraction,
        "to-mixed": buildToMixed,
        "to-improper": buildToImproper,
        compare: buildCompare,
        add: (o) => buildAddSub("add", o.level),
        sub: (o) => buildAddSub("sub", o.level),
        mul: (o) => buildMulDiv("mul", o.level),
        div: (o) => buildMulDiv("div", o.level),
        order: (o) => buildMixedOps("order", o.level),
        paren: (o) => buildMixedOps("paren", o.level),
        mixops: (o) => buildMixedOps(Math.random() < 0.5 ? "order" : "paren", o.level)
    };

    const tasks = [];
    const seen = new Set();

    let guard = 0;
    while (tasks.length < count && guard < count * 200) {
        guard++;
        let chosen;
        if (mode === "mixed") {
            chosen = pick(ALL_MODES);
        } else if (mode === "forms") {
            chosen = pick(FORM_MODES);
        } else if (mode === "compare") {
            chosen = "compare";
        } else if (mode === "addsub") {
            chosen = Math.random() < 0.5 ? "add" : "sub";
        } else if (mode === "muldiv") {
            chosen = Math.random() < 0.5 ? "mul" : "div";
        } else {
            chosen = mode;
        }
        const build = builders[chosen];
        if (!build) {
            throw new Error(`Ismeretlen racionális mód: ${chosen}`);
        }
        const task = build(options);
        const key = task.mode === "compare"
            ? `${task.mode}|${descText(task.left)}|${descText(task.right)}|${task.answer}`
            : task.mode === "add" || task.mode === "sub" || task.mode === "mul" || task.mode === "div"
                ? `${task.mode}|${descText(task.left)}|${task.op}|${descText(task.right)}|${task.answer}`
                : task.expr
                    ? `${task.mode}|${task.expr.map(t => typeof t === "string" ? t : descText(t)).join(" ")}|${task.answer}`
                    : `${task.mode}|${task.answer}|${descText(task.display)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        tasks.push(task);
    }

    return tasks;
}
