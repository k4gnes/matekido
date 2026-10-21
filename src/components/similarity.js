import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "📐 Hasonló csomagok",
    racing: "🏎️ Hasonló alkatrészek",
    football: "⚽ Hasonló pályák",
    cooking: "🍳 Hasonló formák",
    animals: "🦁 Hasonló állatok",
    space: "🤖 Hasonló űrhajók",
    tram: "🚋 Hasonló járművek"
};

const SVG_NS = "http://www.w3.org/2000/svg";

// A rajzolt alak mindig ugyanaz (sematikus ábra, mint a Pitagorasz-feladatban), így a feliratok helye soha nem ütközik.
const SHAPE = {
    A: { x: 0, y: -1 },
    B: { x: -0.78, y: 0.72 },
    C: { x: 0.86, y: 0.72 }
};
const SHAPE_CENTER_X = 0.04;
const SHAPE_HEIGHT = 1.72;

const SIDE_EDGES = [
    { names: ["B", "C"], side: 0 },
    { names: ["C", "A"], side: 1 },
    { names: ["A", "B"], side: 2 }
];

function svgEl(name, attrs = {}) {
    const el = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

function addLabel(svg, x, y, text, color = "#1e293b") {
    const t = svgEl("text", {
        x,
        y,
        "text-anchor": "middle",
        "font-size": "13",
        "font-weight": "700",
        fill: color,
        stroke: "#ffffff",
        "stroke-width": "4",
        "paint-order": "stroke"
    });
    t.textContent = text;
    svg.append(t);
}

function drawTriangle(svg, opts) {
    const { box, size, unknown, labels, vertexLabels, fill, stroke } = opts;

    const scale = size / SHAPE_HEIGHT;
    const baseY = box.y + box.h - 26;
    const point = (key) => ({
        x: box.x + box.w / 2 + (SHAPE[key].x - SHAPE_CENTER_X) * scale,
        y: baseY + (SHAPE[key].y - 0.72) * scale
    });

    const points = { A: point("A"), B: point("B"), C: point("C") };

    svg.append(svgEl("polygon", {
        points: `${points.A.x.toFixed(1)},${points.A.y.toFixed(1)} ${points.B.x.toFixed(1)},${points.B.y.toFixed(1)} ${points.C.x.toFixed(1)},${points.C.y.toFixed(1)}`,
        fill,
        stroke,
        "stroke-width": 2.5,
        "stroke-linejoin": "round"
    }));

    SIDE_EDGES.forEach(({ names, side }) => {
        const p1 = points[names[0]];
        const p2 = points[names[1]];
        const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.hypot(dx, dy) || 1;
        let nx = -dy / len;
        let ny = dx / len;
        const center = { x: (points.A.x + points.B.x + points.C.x) / 3, y: (points.A.y + points.B.y + points.C.y) / 3 };
        if ((mid.x - center.x) * nx + (mid.y - center.y) * ny < 0) {
            nx = -nx;
            ny = -ny;
        }
        const pos = { x: mid.x + nx * 15, y: mid.y + ny * 15 };
        const isUnknown = side === unknown;
        addLabel(svg, pos.x, pos.y + 4, isUnknown ? "?" : labels[side], isUnknown ? "#dc2626" : "#1e293b");
    });

    Object.keys(points).forEach((key) => {
        const p = points[key];
        svg.append(svgEl("circle", { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: 3.5, fill: stroke }));
        const index = ["A", "B", "C"].indexOf(key);
        const pos = {
            A: { x: p.x, y: p.y - 12 },
            B: { x: p.x - 12, y: p.y + 16 },
            C: { x: p.x + 12, y: p.y + 16 }
        }[key];
        addLabel(svg, pos.x, pos.y, vertexLabels[index]);
    });
}

function createSimilaritySvg(step) {
    const svg = svgEl("svg", { viewBox: "0 0 460 260", class: "sim-svg" });

    const k = step.k ?? 1;
    const size1 = 120;
    const size2 = k >= 1 ? Math.min(size1 * k, 180) : Math.max(size1 * k, 76);

    const labelText = (fig) => fig.labels.map(v => (v === null ? "?" : `${v} cm`));

    drawTriangle(svg, {
        box: { x: 20, y: 24, w: 200, h: 210 },
        size: size1,
        unknown: step.first.unknown,
        labels: labelText(step.first),
        vertexLabels: ["A", "B", "C"],
        fill: "#fef3c7",
        stroke: "#1e293b"
    });

    drawTriangle(svg, {
        box: { x: 240, y: 24, w: 200, h: 210 },
        size: size2,
        unknown: step.second.unknown,
        labels: labelText(step.second),
        vertexLabels: ["A′", "B′", "C′"],
        fill: "#dbeafe",
        stroke: "#1d4ed8"
    });

    return svg;
}

export function renderSimilarity(step, root, next, progress, onResult, onAttempt) {

    const world = getActiveWorld();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = TITLES[world] ?? TITLES.postman;
    card.append(title);

    const question = document.createElement("p");
    question.className = "sim-question";
    question.textContent = step.question;
    card.append(question);

    if (step.mode !== "application") {
        const figure = document.createElement("div");
        figure.className = "sim-figure";
        figure.append(createSimilaritySvg(step));
        card.append(figure);
    }

    const options = document.createElement("div");
    options.className = "sim-options";
    step.options.forEach((value) => {
        const btn = createButton(String(value), { className: "sim-option" });
        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;
            if (value === step.answerLabel) {
                markCorrect(btn);
                feedback.success(step.successText);
            } else {
                feedback.retry();
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
}
