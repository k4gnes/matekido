import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createHintBox } from "./ui/hintBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "📦 Felszín és térfogat a postán",
    racing: "🏎️ Felszín és térfogat a boxutcában",
    football: "⚽ Felszín és térfogat a pályán",
    cooking: "🍳 Felszín és térfogat a konyhában",
    animals: "🦁 Felszín és térfogat az állatkertben",
    space: "🚀 Felszín és térfogat az űrhajón",
    tram: "🚋 Felszín és térfogat a villamoson"
};

const PROPERTY_TITLES = {
    postman: "📦 Testek tulajdonságai a postán",
    racing: "🏎️ Testek tulajdonságai a boxutcában",
    football: "⚽ Testek tulajdonságai a pályán",
    cooking: "🍳 Testek tulajdonságai a konyhában",
    animals: "🦁 Testek tulajdonságai az állatkertben",
    space: "🚀 Testek tulajdonságai az űrhajón",
    tram: "🚋 Testek tulajdonságai a villamoson"
};

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(name, attrs = {}) {
    const el = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

function svgLabel(svg, cx, cy, text) {
    const t = svgEl("text", {
        x: cx,
        y: cy,
        "text-anchor": "middle",
        "font-size": "13",
        "font-weight": "700",
        fill: "#1e293b",
        stroke: "#ffffff",
        "stroke-width": "4",
        "paint-order": "stroke"
    });
    t.textContent = text;
    svg.append(t);
}

function createPrismSvg(step) {
    const { a, b, c } = step;
    const unit = 56 / Math.max(a, b, c);
    const fw = a * unit;
    const fh = b * unit;
    const dx = c * unit * 0.6;
    const dy = c * unit * 0.35;
    const x = 58;
    const y = 92;

    const svg = svgEl("svg", { viewBox: "0 0 205 165", class: "slm-svg" });

    const p1 = [x, y];
    const p2 = [x + fw, y];
    const p3 = [x, y - fh];

    function face(points, fill) {
        svg.append(svgEl("polygon", {
            points: points.map(p => p.join(",")).join(" "),
            fill,
            stroke: "#1e293b",
            "stroke-width": "2.5",
            "stroke-linejoin": "round"
        }));
    }

    face([p1, p2, [p2[0] + dx, p2[1] - dy], [p1[0] + dx, p1[1] - dy]], "#60a5fa");
    face([p2, p3, [p3[0] + dx, p3[1] - dy], [p2[0] + dx, p2[1] - dy]], "#93c5fd");
    face([p1, p2, p3], "#3b82f6");

    svgLabel(svg, x + fw / 2, y + 18, `a = ${a} cm`);
    svgLabel(svg, x - 14, y - fh / 2, `b = ${b} cm`);
    svgLabel(svg, x + fw + dx / 2 + 14, y - dy / 2 + 4, `c = ${c} cm`);

    return svg;
}

function createSolidSvg(step) {
    if (step.solid === "prism") return createPrismSvg(step);

    const { solid, a, b, c } = step;
    const unit = 64 / Math.max(a, b, c);
    const fw = a * unit;
    const fh = b * unit;
    const dx = c * unit * 0.55;
    const dy = c * unit * 0.4;
    const x = 62;
    const y = 58;

    const svg = svgEl("svg", { viewBox: "0 0 205 165", class: "slm-svg" });

    svg.append(svgEl("path", {
        d: `M${x},${y} L${x + dx},${y - dy} L${x + fw + dx},${y - dy} L${x + fw},${y} Z`,
        fill: "#93c5fd",
        stroke: "#1e293b",
        "stroke-width": "2.5",
        "stroke-linejoin": "round"
    }));
    svg.append(svgEl("path", {
        d: `M${x + fw},${y} L${x + fw + dx},${y - dy} L${x + fw + dx},${y + fh - dy} L${x + fw},${y + fh} Z`,
        fill: "#60a5fa",
        stroke: "#1e293b",
        "stroke-width": "2.5",
        "stroke-linejoin": "round"
    }));
    svg.append(svgEl("rect", {
        x, y, width: fw, height: fh,
        fill: "#3b82f6",
        "fill-opacity": ".9",
        stroke: "#1e293b",
        "stroke-width": "2.5",
        "stroke-linejoin": "round"
    }));

    if (step.mode === "faceDiagonal" || step.mode === "spaceDiagonal") {
        const x2 = step.mode === "faceDiagonal" ? x + fw : x + fw + dx;
        const y2 = step.mode === "faceDiagonal" ? y : y - dy;
        svg.append(svgEl("line", {
            x1: x, y1: y + fh, x2, y2,
            stroke: "#dc2626",
            "stroke-width": "2.5",
            "stroke-dasharray": "6 4",
            "stroke-linecap": "round"
        }));
    }

    svgLabel(svg, x + fw / 2, y + fh + 20, `a = ${a} cm`);
    svgLabel(svg, x - 12, y + fh / 2 + 4, `${solid === "cube" ? "a" : "b"} = ${b} cm`);
    svgLabel(svg, x + fw + dx + 2, y - dy - 8, `${solid === "cube" ? "a" : "c"} = ${c} cm`);

    return svg;
}

function hintFor(step) {
    if (step.mode === "faceDiagonal") {
        return `💡 A lapátló az a és b él által alkotott derékszögű háromszög átfogója: √(${step.a}² + ${step.b}²) = ${step.answer} cm.`;
    }
    if (step.mode === "spaceDiagonal") {
        return `💡 A testátló: √(${step.a}² + ${step.b}² + ${step.c}²) = ${step.answer} cm.`;
    }
    if (step.mode === "surface") {
        if (step.solid === "cube") {
            return `💡 A kockának 6 egyforma lapja van: A = 6 × a × a = 6 × ${step.a} × ${step.a} = ${step.answer} cm²`;
        }
        if (step.solid === "prism") {
            const hyp = Math.sqrt(step.a * step.a + step.b * step.b);
            return `💡 A = a×b + (a + b + √(a²+b²)) × c = ${step.a * step.b} + (${step.a + step.b + hyp}) × ${step.c} = ${step.answer} cm²`;
        }
        return `💡 A = 2 × (a×b + a×c + b×c) = 2 × (${step.a * step.b} + ${step.a * step.c} + ${step.b * step.c}) = ${step.answer} cm²`;
    }
    if (step.solid === "cube") {
        return `💡 A kocka térfogata: V = a × a × a = ${step.a} × ${step.a} × ${step.a} = ${step.answer} cm³`;
    }
    if (step.solid === "prism") {
        return `💡 V = (a×b / 2) × c = (${step.a}×${step.b} / 2) × ${step.c} = ${step.answer} cm³`;
    }
    return `💡 V = a × b × c = ${step.a} × ${step.b} × ${step.c} = ${step.answer} cm³`;
}

export function renderSolidMeasure(step, root, next, progress, onResult, onAttempt) {

    const world = getActiveWorld();

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const propertyMode = step.mode === "faceDiagonal" || step.mode === "spaceDiagonal";
    const titles = propertyMode ? PROPERTY_TITLES : TITLES;
    const title = document.createElement("h1");
    title.textContent = titles[world] ?? titles.postman;
    card.append(title);

    const figure = document.createElement("div");
    figure.className = "slm-figure";
    figure.append(createSolidSvg(step));
    card.append(figure);

    const prompt = document.createElement("p");
    prompt.className = "slm-prompt";
    prompt.textContent = step.mode === "faceDiagonal" ? "Mekkora az a × b lap átlója?"
        : step.mode === "spaceDiagonal" ? "Mekkora a testátló?"
        : step.mode === "surface" ? "Mekkora a test felszíne? (A lapok területének összege.)"
        : "Mekkora a test térfogata? (Mennyi fér bele?)";
    card.append(prompt);

    const hint = createHintBox();

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            hint.textContent = hintFor(step);
            hintButton.style.display = "none";
        }
    });
    hintButton.style.display = "none";

    card.append(hintButton, hint);

    const options = document.createElement("div");
    options.className = "slm-options";

    step.options.forEach(value => {
        const btn = createButton(String(value), { className: "slm-option" });
        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;
            if (value === step.answer) {
                markCorrect(btn);
                feedback.success(successText());
            } else {
                feedback.retry();
                if (feedback.getMistakes() >= 2 && !hintShown) {
                    hintButton.style.display = "inline-block";
                }
            }
        });
        options.append(btn);
    });
    card.append(options);

    const message = createMessageBox();
    card.append(message.element);

    root.append(card);

    const feedback = createFeedback({
        message,
        container: card,
        onNext: next,
        onResult,
        onAttempt
    });

    function successText() {
        if (step.mode === "faceDiagonal") {
            return `😊 Ügyes! A lapátló ${step.answer} cm.`;
        }
        if (step.mode === "spaceDiagonal") {
            return `😊 Ügyes! A testátló ${step.answer} cm.`;
        }
        if (step.mode === "surface") {
            if (step.solid === "cube") {
                return `😊 Ügyes! A = 6 × ${step.a} × ${step.a} = ${step.answer} cm²`;
            }
            if (step.solid === "prism") {
                return `😊 Ügyes! A = ${step.a * step.b} + ${step.a + step.b + Math.sqrt(step.a * step.a + step.b * step.b)} × ${step.c} = ${step.answer} cm²`;
            }
            return `😊 Ügyes! A = 2 × (${step.a * step.b} + ${step.a * step.c} + ${step.b * step.c}) = ${step.answer} cm²`;
        }
        if (step.solid === "cube") {
            return `😊 Ügyes! V = ${step.a} × ${step.a} × ${step.a} = ${step.answer} cm³`;
        }
        if (step.solid === "prism") {
            return `😊 Ügyes! V = (${step.a} × ${step.b} / 2) × ${step.c} = ${step.answer} cm³`;
        }
        return `😊 Ügyes! V = ${step.a} × ${step.b} × ${step.c} = ${step.answer} cm³`;
    }
}
