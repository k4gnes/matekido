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

function term(coef, variable) {
    return { coef, variable: variable ?? null };
}

function poly(terms) {
    return {
        kind: "poly",
        terms: terms
            .filter(t => t.coef !== 0)
            .map(t => ({ coef: t.coef, variable: t.variable ?? null }))
    };
}

function product(factor, terms) {
    return {
        kind: "product",
        factor,
        inner: poly(terms)
    };
}

function termText(t, first) {
    const abs = Math.abs(t.coef);
    let body;
    if (t.variable === null) body = String(abs);
    else if (abs === 1) body = t.variable;
    else body = `${abs}${t.variable}`;
    if (first) return (t.coef < 0 ? MINUS : "") + body;
    return (t.coef < 0 ? ` ${MINUS} ` : " + ") + body;
}

function polyText(p) {
    if (!p.terms.length) return "0";
    return p.terms.map((t, i) => termText(t, i === 0)).join("");
}

function exprText(node) {
    if (node.kind === "product") {
        const inner = polyText(node.inner);
        if (node.factor === 1) return `(${inner})`;
        if (node.factor === -1) return `${MINUS}(${inner})`;
        return `${fmtInt(node.factor)}(${inner})`;
    }
    return polyText(node);
}

function combineTerms(terms) {
    const map = new Map();
    const keys = [];
    for (const t of terms) {
        const key = t.variable ?? "const";
        if (!map.has(key)) {
            map.set(key, 0);
            keys.push(key);
        }
        map.set(key, map.get(key) + t.coef);
    }
    keys.sort((a, b) => (a === "const" ? 1 : 0) - (b === "const" ? 1 : 0) || a.localeCompare(b));
    const out = [];
    for (const key of keys) {
        const c = map.get(key);
        if (c === 0) continue;
        out.push(term(c, key === "const" ? null : key));
    }
    return poly(out);
}

function evalTerms(terms, values) {
    let sum = 0;
    for (const t of terms) {
        if (t.variable === null) sum += t.coef;
        else sum += t.coef * (values[t.variable] ?? 0);
    }
    return sum;
}

function evalNode(node, values) {
    if (node.kind === "product") {
        return node.factor * evalTerms(node.inner.terms, values);
    }
    return evalTerms(node.terms, values);
}

const SIGN_POINTS = [-3, -1, 0, 1, 2, 5];

function signature(node) {
    const pts = [];
    for (const x of SIGN_POINTS) {
        for (const y of SIGN_POINTS) {
            pts.push(evalNode(node, { x, y }));
        }
    }
    return pts.join(",");
}

function buildExprOptions(correct, candidates, count = 4) {
    const options = [correct];
    const seen = new Set([signature(correct)]);
    for (const cand of shuffle(candidates.slice())) {
        if (options.length >= count) break;
        if (!cand) continue;
        const terms = cand.kind === "product" ? cand.inner.terms : cand.terms;
        if (!terms || terms.length === 0) continue;
        const sig = signature(cand);
        if (seen.has(sig)) continue;
        seen.add(sig);
        options.push(cand);
    }
    return shuffle(options).map(node => ({ text: exprText(node), correct: node === correct }));
}

function buildNumberOptions(correct, candidates, count = 4) {
    const options = [correct];
    const seen = new Set([correct]);
    for (const cand of candidates) {
        if (options.length >= count) break;
        if (!Number.isInteger(cand) || seen.has(cand)) continue;
        seen.add(cand);
        options.push(cand);
    }
    let k = 1;
    while (options.length < count && k < 60) {
        for (const v of [correct + k, correct - k]) {
            if (options.length >= count) break;
            if (!seen.has(v)) {
                seen.add(v);
                options.push(v);
            }
        }
        k++;
    }
    return shuffle(options).map(v => ({ text: fmtInt(v), correct: v === correct }));
}

function polyDistractors(terms) {
    const cands = [];
    for (let i = 0; i < terms.length; i++) {
        cands.push(poly(terms.map((t, j) => j === i ? term(-t.coef, t.variable) : term(t.coef, t.variable))));
        cands.push(poly(terms.filter((_, j) => j !== i).map(t => term(t.coef, t.variable))));
        cands.push(poly(terms.map((t, j) => j === i ? term(t.coef + 1, t.variable) : term(t.coef, t.variable))));
        cands.push(poly(terms.map((t, j) => j === i ? term(t.coef - 1, t.variable) : term(t.coef, t.variable))));
    }
    const constSum = terms.filter(t => t.variable === null).reduce((a, t) => a + t.coef, 0);
    for (let i = 0; i < terms.length; i++) {
        if (terms[i].variable === null) continue;
        cands.push(poly(terms.map((t, j) => j === i ? term(t.coef + constSum, t.variable) : term(t.coef, t.variable))));
    }
    return cands;
}

function productDistractors(factor, innerTerms) {
    const cands = [];
    for (const g of [factor + 1, factor - 1, factor + 2, factor * 2, -factor]) {
        if (g === 0 || g === factor) continue;
        cands.push(product(g, innerTerms));
    }
    for (const inner of polyDistractors(innerTerms)) {
        if (inner.terms.length === 0) continue;
        cands.push(product(factor, inner.terms));
    }
    return cands;
}

function buildSubstitute(level) {
    const two = level === "two";
    const terms = [];
    if (two) {
        terms.push(term(randInt(1, 7) * (Math.random() < 0.4 ? -1 : 1), "x"));
        terms.push(term(randInt(1, 7) * (Math.random() < 0.4 ? -1 : 1), "y"));
        terms.push(term(randInt(1, 9) * (Math.random() < 0.5 ? -1 : 1), null));
    } else {
        terms.push(term(randInt(1, 7) * (Math.random() < 0.35 ? -1 : 1), "x"));
        terms.push(term(randInt(1, 9) * (Math.random() < 0.5 ? -1 : 1), null));
    }
    const values = { x: randInt(-4, 6) };
    if (two) values.y = randInt(-4, 6);
    const value = evalTerms(terms, values);
    const constTerm = terms[terms.length - 1];
    const xTerm = terms[0];
    const cands = [
        value + 1, value - 1, value + 2, value - 2, -value,
        value - constTerm.coef,
        value - 2 * constTerm.coef,
        value - xTerm.coef * values.x
    ];
    if (two) {
        const yTerm = terms[1];
        cands.push(value - yTerm.coef * values.y);
        cands.push(value - xTerm.coef * values.x - yTerm.coef * values.y);
    }
    const options = buildNumberOptions(value, shuffle(cands));
    const cond = two ? `x = ${fmtInt(values.x)} és y = ${fmtInt(values.y)}` : `x = ${fmtInt(values.x)}`;
    return {
        mode: "substitute",
        level,
        question: `Mennyi a kifejezés értéke, ha ${cond}?`,
        expression: polyText(poly(terms)),
        answer: fmtInt(value),
        options,
        values,
        source: { kind: "terms", terms: terms.map(t => ({ coef: t.coef, variable: t.variable })) },
        hint: "A változó helyére írd be a megadott számot, majd számold ki a műveleteket. Negatív szám behelyettesítésekor tedd zárójelbe: 3x, ha x = −2, akkor 3 · (−2) = −6."
    };
}

function countKeys(terms) {
    const map = new Map();
    for (const t of terms) {
        const key = t.variable ?? "const";
        map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
}

function buildCombine(level) {
    for (let attempt = 0; attempt < 80; attempt++) {
        const two = level === "two";
        const vars = two ? ["x", "y"] : ["x"];
        const terms = [];
        const vcount = randInt(3, 4);
        for (let i = 0; i < vcount; i++) {
            terms.push(term(randInt(1, 6) * (Math.random() < 0.5 ? -1 : 1), pick(vars)));
        }
        const ccount = randInt(1, 2);
        for (let i = 0; i < ccount; i++) {
            terms.push(term(randInt(1, 9) * (Math.random() < 0.5 ? -1 : 1), null));
        }
        const counts = countKeys(terms);
        const hasLike = [...counts.values()].some(c => c >= 2);
        if (!hasLike) continue;
        const result = combineTerms(terms);
        if (result.terms.length < 2) continue;
        const display = poly(shuffle(terms.map(t => term(t.coef, t.variable))));
        if (exprText(display) === exprText(result)) continue;
        const options = buildExprOptions(result, polyDistractors(result.terms));
        return {
            mode: "combine",
            level,
            question: "Vond össze a hasonló tagokat!",
            expression: polyText(display),
            answer: exprText(result),
            options,
            source: { kind: "terms", terms: terms.map(t => ({ coef: t.coef, variable: t.variable })) },
            result,
            hint: "Csak az azonos betűt tartalmazó tagokat és a konstansokat lehet összevonni. Az együtthatókat összeadjuk, a betű változatlan marad: 3x + 4x = 7x, 5 − 2 = 3."
        };
    }
    return buildCombine("one");
}

function expandGroups(groups) {
    const all = [];
    for (const g of groups) {
        for (const t of g.terms) all.push(term(g.sign * t.coef, t.variable));
    }
    return all;
}

function wrongExpandGroups(groups) {
    const all = [];
    for (const g of groups) {
        g.terms.forEach((t, i) => {
            const sign = i === 0 ? g.sign : 1;
            all.push(term(sign * t.coef, t.variable));
        });
    }
    return all;
}

function groupText(group) {
    return polyText(poly(group.terms));
}

function buildParenthesis(level) {
    for (let attempt = 0; attempt < 100; attempt++) {
        const two = level === "two";
        const vars = two ? ["x", "y"] : ["x"];
        const first = two
            ? [term(randInt(1, 5) * (Math.random() < 0.4 ? -1 : 1), "x"), term(randInt(1, 5) * (Math.random() < 0.4 ? -1 : 1), "y")]
            : [term(randInt(1, 6) * (Math.random() < 0.4 ? -1 : 1), "x")];
        const makeGroup = () => two
            ? [term(randInt(1, 5) * (Math.random() < 0.5 ? -1 : 1), "x"), term(randInt(1, 5) * (Math.random() < 0.5 ? -1 : 1), "y"), term(randInt(1, 9) * (Math.random() < 0.5 ? -1 : 1), null)]
            : [term(randInt(1, 6) * (Math.random() < 0.5 ? -1 : 1), "x"), term(randInt(1, 9) * (Math.random() < 0.5 ? -1 : 1), null)];
        const g1 = makeGroup();
        const g2 = makeGroup();
        const s1 = pick([1, -1]);
        const s2 = pick([1, -1]);
        if (s1 === 1 && s2 === 1) continue;
        const groups = [
            { sign: 1, terms: first },
            { sign: s1, terms: g1 },
            { sign: s2, terms: g2 }
        ];
        const result = combineTerms(expandGroups(groups));
        if (result.terms.length < 2) continue;
        const expression = `${groupText(groups[0])} ${s1 === 1 ? "+" : MINUS} (${groupText(groups[1])}) ${s2 === 1 ? "+" : MINUS} (${groupText(groups[2])})`;
        const cands = polyDistractors(result.terms);
        cands.push(combineTerms(wrongExpandGroups(groups)));
        const options = buildExprOptions(result, cands);
        return {
            mode: "parenthesis",
            level,
            question: "Bontsd fel a zárójeleket, majd vonj össze!",
            expression,
            answer: exprText(result),
            options,
            source: { kind: "groups", groups },
            result,
            hint: "A zárójel előtti jelet minden tagra alkalmazd. A „−” a zárójel minden tagjának megfordítja az előjelét: −(x + 2) = −x − 2. Utána vonj össze."
        };
    }
    return buildParenthesis("one");
}

function buildDistribute(level) {
    for (let attempt = 0; attempt < 60; attempt++) {
        const two = level === "two";
        const factor = randInt(2, 8) * (Math.random() < 0.3 ? -1 : 1);
        const inner = two
            ? [term(randInt(1, 6) * (Math.random() < 0.4 ? -1 : 1), "x"), term(randInt(1, 6) * (Math.random() < 0.4 ? -1 : 1), "y"), term(randInt(1, 9) * (Math.random() < 0.5 ? -1 : 1), null)]
            : [term(randInt(1, 6) * (Math.random() < 0.4 ? -1 : 1), "x"), term(randInt(1, 9) * (Math.random() < 0.5 ? -1 : 1), null)];
        const source = product(factor, inner);
        const result = combineTerms(inner.map(t => term(factor * t.coef, t.variable)));
        const onlyFirst = inner.map((t, i) => i === 0 ? term(factor * t.coef, t.variable) : term(t.coef, t.variable));
        const cands = polyDistractors(result.terms);
        cands.push(combineTerms(onlyFirst));
        cands.push(poly(inner));
        const options = buildExprOptions(result, cands);
        return {
            mode: "distribute",
            level,
            question: "Szorozd be a zárójelet!",
            expression: exprText(source),
            answer: exprText(result),
            options,
            source: { kind: "product", factor, terms: inner.map(t => ({ coef: t.coef, variable: t.variable })) },
            result,
            hint: "A zárójel előtti szorzót a zárójel minden tagjával megszorozzuk: a(x + b) = ax + ab. Ügyelj az előjelre: −2(x − 3) = −2x + 6."
        };
    }
    return buildDistribute("one");
}

function buildFactor(level) {
    for (let attempt = 0; attempt < 80; attempt++) {
        const two = level === "two";
        let inner;
        if (two) {
            inner = [term(randInt(1, 6) * (Math.random() < 0.4 ? -1 : 1), "x"), term(randInt(1, 6) * (Math.random() < 0.4 ? -1 : 1), "y"), term(randInt(1, 9) * (Math.random() < 0.5 ? -1 : 1), null)];
        } else {
            inner = [term(randInt(1, 6) * (Math.random() < 0.4 ? -1 : 1), "x"), term(randInt(1, 9) * (Math.random() < 0.5 ? -1 : 1), null)];
        }
        const coefs = inner.map(t => t.coef);
        let g = coefs.reduce((a, b) => gcd(a, b), 0);
        if (g !== 1) continue;
        const factor = randInt(2, 9);
        const expanded = inner.map(t => term(factor * t.coef, t.variable));
        const correct = product(factor, inner);
        const options = buildExprOptions(correct, productDistractors(factor, inner));
        return {
            mode: "factor",
            level,
            question: "Emeld ki a közös tényezőt!",
            expression: polyText(poly(expanded)),
            answer: exprText(correct),
            options,
            source: { kind: "terms", terms: expanded.map(t => ({ coef: t.coef, variable: t.variable })) },
            result: correct,
            hint: "Keresd meg a tagok legnagyobb közös osztóját, és azt emeld ki a zárójel elé. A zárójelben minden tagot elosztunk a kiemelt tényezővel: 6x + 9 = 3(2x + 3)."
        };
    }
    return buildFactor("one");
}

const ALL_MODES = ["substitute", "combine", "parenthesis", "distribute", "factor"];

export function generateAlgebra(options = {}) {
    const { count = 4, mode = "substitute", level } = options;

    const builders = {
        substitute: () => buildSubstitute(level ?? "one"),
        combine: () => buildCombine(level ?? "one"),
        parenthesis: () => buildParenthesis(level ?? "one"),
        distribute: () => buildDistribute(level ?? "one"),
        factor: () => buildFactor(level ?? "one")
    };

    const tasks = [];
    const seen = new Set();

    let guard = 0;
    while (tasks.length < count && guard < count * 200) {
        guard++;
        const chosen = mode === "mixed" ? pick(ALL_MODES) : mode;
        const build = builders[chosen];
        if (!build) {
            throw new Error(`Ismeretlen algebra mód: ${chosen}`);
        }
        const task = build();
        const key = `${task.mode}|${task.expression}|${task.answer}`;
        if (seen.has(key)) continue;
        seen.add(key);
        tasks.push(task);
    }

    return tasks;
}
