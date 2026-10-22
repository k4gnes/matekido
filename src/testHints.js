// Füstteszt a "💡 Segítséget kérek" gombokhoz.
//
// Minden olyan komponenst lejátszik, ami 6-7. osztályos leckét szolgál ki,
// és ellenőrzi, hogy:
//   1. a renderelés nem dob hibát,
//   2. a segítség gomb létezik, és eleinte rejtett,
//   3. két hibás válasz után megjelenik,
//   4. a gomb megnyomására a gomb és a feladat szövegéhez igazodó segítség jelenik meg.
//
// Futtatás: make test

const store = {};

globalThis.localStorage = {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    key: () => null,
    get length() { return Object.keys(store).length; }
};

function makeTarget() {
    const listeners = new Map();
    return {
        addEventListener(type, fn, opts = {}) {
            if (opts.signal?.aborted) return;
            if (!listeners.has(type)) listeners.set(type, new Set());
            listeners.get(type).add(fn);
            opts.signal?.addEventListener("abort", () => listeners.get(type)?.delete(fn));
        },
        removeEventListener(type, fn) {
            listeners.get(type)?.delete(fn);
        },
        fire(type, event) {
            for (const fn of [...(listeners.get(type) ?? [])]) fn(event);
        }
    };
}

function matches(el, selector) {
    const sel = selector.trim();
    if (!sel) return false;
    if (sel.startsWith(".")) return el.classList.contains(sel.slice(1));
    return el.tagName === sel.toUpperCase();
}

class El {
    constructor(tag) {
        this.tagName = String(tag).toUpperCase();
        this.className = "";
        this.children = [];
        this.style = {};
        this.dataset = new Proxy({}, {
            set(target, key, value) { target[key] = String(value); return true; },
            get(target, key) { return target[key]; }
        });
        this.disabled = false;
        this.value = "";
        this.parentElement = null;
        this._text = "";
        this._innerHTML = "";
        this._target = makeTarget();
    }
    get textContent() {
        if (this.children.length === 0) return this._text;
        return this._text + this.children.map(c => c.textContent).join("");
    }
    set textContent(value) {
        this._text = String(value);
        this.children = [];
    }
    get innerHTML() {
        return this._innerHTML;
    }
    set innerHTML(value) {
        this._innerHTML = String(value);
        this._text = String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        this.children = [];
    }
    append(...nodes) {
        for (const node of nodes) {
            if (node == null) continue;
            if (typeof node === "string") {
                this._text += node;
                continue;
            }
            this.children.push(node);
            node.parentElement = this;
        }
    }
    appendChild(node) {
        this.append(node);
        return node;
    }
    insertBefore(node, ref) {
        const index = this.children.indexOf(ref);
        this.children.splice(index < 0 ? this.children.length : index, 0, node);
        node.parentElement = this;
        return node;
    }
    remove() {
        const parent = this.parentElement;
        if (!parent) return;
        const index = parent.children.indexOf(this);
        if (index >= 0) parent.children.splice(index, 1);
        this.parentElement = null;
    }
    replaceChildren(...nodes) {
        this.children = [];
        this._text = "";
        this.append(...nodes);
    }
    setAttribute() {}
    getAttribute() { return null; }
    focus() {}
    scrollIntoView() {}
    get offsetWidth() { return 0; }
    addEventListener(...args) { return this._target.addEventListener(...args); }
    removeEventListener(...args) { return this._target.removeEventListener(...args); }
    click() {
        if (this.disabled) return;
        const event = { type: "click", target: this, defaultPrevented: false };
        let node = this;
        while (node) {
            node._target.fire("click", event);
            node = node.parentElement;
        }
    }
    closest(selector) {
        let node = this;
        while (node) {
            if (matches(node, selector)) return node;
            node = node.parentElement;
        }
        return null;
    }
    get classList() {
        const own = this;
        const parts = () => own.className.split(/\s+/).filter(Boolean);
        return {
            add(name) { if (!parts().includes(name)) own.className = parts().concat(name).join(" "); },
            remove(name) { own.className = parts().filter(p => p !== name).join(" "); },
            contains(name) { return parts().includes(name); },
            toggle(name, force) {
                const has = this.contains(name);
                const want = force === undefined ? !has : Boolean(force);
                if (want) this.add(name);
                else this.remove(name);
                return want;
            }
        };
    }
    querySelector(sel) { return this.querySelectorAll(sel)[0] ?? null; }
    querySelectorAll(selector) {
        const parts = selector.split(",").map(s => s.trim()).filter(Boolean);
        const out = [];
        const walk = (el) => {
            for (const child of el.children) {
                if (parts.some(p => matches(child, p))) out.push(child);
                walk(child);
            }
        };
        walk(this);
        return out;
    }
}

globalThis.document = {
    hidden: false,
    createElement: (tag) => new El(tag),
    createElementNS: (ns, tag) => new El(tag),
    ...makeTarget()
};

globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);

const { renderCircle } = await import("./components/circle.js");
const { renderPythagorean } = await import("./components/pythagorean.js");
const { renderShapeArea } = await import("./components/shapeArea.js");
const { renderSimilarity } = await import("./components/similarity.js");
const { renderWordProblem } = await import("./components/wordProblem.js");
const { renderTriangle } = await import("./components/triangle.js");
const { renderTransform } = await import("./components/transform.js");
const { renderProbability } = await import("./components/probability.js");
const { renderCombinatorics } = await import("./components/combinatorics.js");
const { renderCoordinate } = await import("./components/coordinate.js");
const { renderDataChart } = await import("./components/dataChart.js");
const { renderAngleMeasure } = await import("./components/angleMeasure.js");
const { renderDivisibility } = await import("./components/divisibility.js");
const { renderOperationOrder } = await import("./components/operationOrder.js");

const { generateCircle } = await import("./generators/circleGenerator.js");
const { generatePythagorean } = await import("./generators/pythagoreanGenerator.js");
const { generateShapeArea } = await import("./generators/shapeAreaGenerator.js");
const { generateSimilarity } = await import("./generators/similarityGenerator.js");
const { generateWordProblems } = await import("./generators/wordProblemGenerator.js");
const { generateTriangle } = await import("./generators/triangleGenerator.js");
const { generateTransform } = await import("./generators/transformGenerator.js");
const { generateProbability } = await import("./generators/probabilityGenerator.js");
const { generateCombinatorics } = await import("./generators/combinatoricsGenerator.js");
const { generateCoordinate } = await import("./generators/coordinateGenerator.js");
const { generateDataChart } = await import("./generators/dataChartGenerator.js");
const { generateAngleMeasure } = await import("./generators/angleMeasureGenerator.js");
const { generateDivisibility } = await import("./generators/divisibilityGenerator.js");
const { generateOperationOrder } = await import("./generators/operationOrderGenerator.js");

let failures = 0;

function check(cond, msg) {
    if (cond) console.log(`  ✔ ${msg}`);
    else { failures++; console.error(`  ✘ ${msg}`); }
}

function buttonByText(root, text) {
    const walk = (el) => {
        for (const child of el.children) {
            if (child.tagName === "BUTTON" && child.textContent.trim() === text) return child;
            const hit = walk(child);
            if (hit) return hit;
        }
        return null;
    };
    return walk(root);
}

function render(renderFn, step) {
    const root = new El("div");
    renderFn(step, root, () => {}, null, () => {}, () => {});
    return root;
}

function wrongButton(root, selector, isCorrect) {
    return root.querySelectorAll(selector).find(btn => isCorrect(btn)) ?? null;
}

const CASES = [
    {
        name: "circle",
        render: renderCircle,
        steps: () => generateCircle({ count: 8 }),
        wrong: (step, root) => {
            const correct = step.answerLabel ?? step.correctLabel ?? String(step.answer);
            return wrongButton(root, ".cir-option", btn => btn.textContent.trim() !== correct);
        }
    },
    {
        name: "pythagorean",
        render: renderPythagorean,
        steps: () => generatePythagorean({ count: 6 }),
        wrong: (step, root) => wrongButton(root, ".pyth-option", btn => btn.dataset.correct === "0")
    },
    {
        name: "shapeArea",
        render: renderShapeArea,
        steps: () => generateShapeArea({ count: 6 }),
        wrong: (step, root) => wrongButton(root, ".sa-option", btn => btn.dataset.value !== String(step.answer))
    },
    {
        name: "similarity",
        render: renderSimilarity,
        steps: () => generateSimilarity({ count: 6 }),
        wrong: (step, root) => wrongButton(root, ".sim-option", btn => btn.textContent.trim() !== step.answerLabel)
    },
    {
        name: "wordProblem",
        render: renderWordProblem,
        steps: () => ["join", "compare", "multiply", "divide", "proportion", "remainder", "two-step", "equation", "ratio-split", "direct-proportion", "inverse-proportion"]
            .flatMap(kind => generateWordProblems({ count: 1, max: 100, kind, interaction: "choice" })),
        wrong: (step, root) => {
            if (step.kind === "two-step") {
                return wrongButton(root, ".wp-option", btn => btn.textContent.trim() !== String(step.firstAnswer));
            }
            if (step.kind === "equation") {
                return wrongButton(root, ".wp-option", btn => btn.textContent.trim() !== step.equation);
            }
            if (step.kind === "remainder") {
                return wrongButton(root, ".wp-option", btn => btn.textContent.trim() !== String(step.quotient));
            }
            return wrongButton(root, ".wp-option", btn => btn.textContent.trim() !== String(step.answer));
        }
    },
    {
        name: "triangle",
        render: renderTriangle,
        steps: () => generateTriangle({ count: 6 }),
        wrong: (step, root) => wrongButton(root, ".tri-option", btn => btn.dataset.correct === "0")
    },
    {
        name: "transform",
        render: renderTransform,
        steps: () => [...generateTransform({ count: 3, mode: "turn" }), ...generateTransform({ count: 3, mode: "translate" })],
        wrong: (step, root) => wrongButton(root, ".tr-option", btn => btn.dataset.index !== String(step.answer))
    },
    {
        name: "probability",
        render: renderProbability,
        steps: () => [
            ...generateProbability({ count: 3 }),
            ...generateProbability({ count: 2, mode: "compare" }),
            ...generateProbability({ count: 2, mode: "chance" })
        ],
        wrong: (step, root) => wrongButton(root, ".prob-option", btn => {
            const text = btn.textContent.trim();
            return text !== step.correctLabel && !text.endsWith(` ${step.correctLabel}`);
        })
    },
    {
        name: "combinatorics",
        render: renderCombinatorics,
        steps: () => [
            ...generateCombinatorics({ count: 1, mode: "count" }),
            ...generateCombinatorics({ count: 1, mode: "pair" }),
            ...generateCombinatorics({ count: 1, mode: "multiply" })
        ],
        wrong: (step, root) => {
            const wrongText = step.options.find(o => !o.correct)?.text;
            if (!wrongText) return null;
            return wrongButton(root, ".comb-choice-option", btn => btn.textContent.trim() === wrongText);
        }
    },
    {
        name: "coordinate",
        render: renderCoordinate,
        steps: () => generateCoordinate({ count: 6 }),
        wrong: (step, root) => {
            if (step.mode !== "read") return null;
            return wrongButton(root, ".cd-option", btn => btn.dataset.index !== String(step.answer));
        }
    },
    {
        name: "dataChart",
        render: renderDataChart,
        steps: () => generateDataChart({ count: 6 }),
        wrong: (step, root) => wrongButton(root, ".dt-option", btn => btn.dataset.index !== String(step.answer))
    },
    {
        name: "angleMeasure",
        render: renderAngleMeasure,
        steps: () => generateAngleMeasure({ count: 8 }),
        wrong: (step, root) => {
            if (step.mode === "compare") {
                return wrongButton(root, ".am-option", btn => !btn.textContent.includes(step.options[0].correct ? " A szög" : " B szög"));
            }
            const wrongText = step.options.find(o => !o.correct)?.text;
            if (!wrongText) return null;
            return wrongButton(root, ".am-option", btn => btn.textContent.trim() === wrongText);
        }
    },
    {
        name: "divisibility",
        render: renderDivisibility,
        steps: () => generateDivisibility({ count: 6 }),
        wrong: (step, root) => {
            const wrongText = step.options.find(o => !o.correct)?.text;
            if (!wrongText) return null;
            return wrongButton(root, ".divisibility-option", btn => btn.textContent.trim() === wrongText);
        }
    },
    {
        name: "operationOrder",
        render: renderOperationOrder,
        steps: () => generateOperationOrder({ count: 6 }),
        wrong: (step, root) => wrongButton(root, ".oo-option", btn => btn.textContent.trim() !== String(step.answer))
    }
];

for (const testCase of CASES) {
    console.log(`${testCase.name} – segítség gomb`);
    const steps = testCase.steps();

    for (const step of steps) {
        const root = render(testCase.render, step);
        const button = buttonByText(root, "💡 Segítséget kérek");

        if (!button) {
            check(false, `${testCase.name}: nincs segítség gomb (mód: ${step.mode ?? step.kind ?? "?"})`);
            continue;
        }
        check(button.style.display === "none", `${testCase.name} (${step.mode ?? step.kind ?? "?"}): a gomb eleinte rejtett`);

        button.click();

        const box = root.querySelector(".hint");
        check(Boolean(box && box.textContent.trim().length > 0), `${testCase.name} (${step.mode ?? step.kind ?? "?"}): a gomb szöveget ad`);
    }

    const wrongStep = steps.find(step => testCase.wrong(step, render(testCase.render, step)));
    if (!wrongStep) {
        check(false, `${testCase.name}: nem sikerült hibás választ találni`);
        continue;
    }

    const root = render(testCase.render, wrongStep);
    const button = buttonByText(root, "💡 Segítséget kérek");
    const wrong = testCase.wrong(wrongStep, root);

    wrong.click();
    check(button.style.display === "none", `${testCase.name}: egy hiba után még rejtett a gomb`);
    wrong.click();
    check(button.style.display !== "none", `${testCase.name}: két hiba után megjelenik a gomb`);
}

if (failures > 0) {
    console.error(`\n${failures} ellenőrzés sikertelen.`);
    process.exit(1);
}

console.log("\nMinden segítség gomb rendben.");
