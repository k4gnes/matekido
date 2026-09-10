import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_EMOJI = {
    postman: "🍕",
    racing: "🔧",
    football: "⚽",
    cooking: "🍳",
    animals: "🦁",
    space: "🤖"
};

const KIND_LABEL = {
    pizza: "Pizza",
    csoki: "Csoki",
    szendvics: "Szendvics",
    torta: "Torta"
};

const FRACTION_NAMES = { 2: "fele", 3: "harmada", 4: "negyede" };

const NS = "http://www.w3.org/2000/svg";

function el(tag, attrs) {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
}

function roundRect(svg, x, y, w, h, r, fill, stroke) {
    const rect = el("rect", {
        x, y, width: w, height: h,
        rx: r, ry: r,
        fill, stroke: stroke ?? "none",
        "stroke-width": stroke ? 2 : 0
    });
    svg.append(rect);
}

function drawPizza(svg, option) {
    const cx = 60, cy = 60, r = 46;
    const total = option.total;
    for (let i = 0; i < total; i++) {
        const a1 = i * 2 * Math.PI / total - Math.PI / 2;
        const a2 = (i + 1) * 2 * Math.PI / total - Math.PI / 2;
        const x1 = cx + r * Math.cos(a1);
        const y1 = cy + r * Math.sin(a1);
        const x2 = cx + r * Math.cos(a2);
        const y2 = cy + r * Math.sin(a2);
        const filled = i < option.filled;
        const largeArc = a2 - a1 > Math.PI ? 1 : 0;
        const path = el("path", {
            d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
            fill: filled ? "#e2574c" : "#f6c453",
            stroke: "#b4423a",
            "stroke-width": 2
        });
        svg.append(path);
    }
    svg.append(el("circle", { cx, cy, r, fill: "none", stroke: "#d9746b", "stroke-width": 3 }));
}

function drawChoco(svg, option) {
    const total = option.total;
    const W = 120, H = 54, x0 = 12, y0 = 8, w = W - 24, h = H - 16;
    roundRect(svg, x0, y0, w, h, 6, "#a06a3c", "#7a4a2b");
    for (let i = 0; i < total; i++) {
        const x = x0 + 3 + i * (w - 6) / total;
        const cw = (w - 6) / total - 3;
        const filled = i < option.filled;
        roundRect(svg, x, y0 + 3, cw, h - 6, 3, filled ? "#5d3016" : "#c8906a");
    }
}

function drawSandwich(svg, option) {
    const total = option.total;
    const W = 120, H = 54, x0 = 8, y0 = 8, w = W - 16, h = H - 16;
    for (let i = 0; i < total; i++) {
        const x = x0 + i * w / total;
        const sw = w / total;
        const filled = i < option.filled;
        svg.append(el("rect", {
            x, y: y0 + 8, width: sw, height: h - 12,
            fill: filled ? "#8bc34a" : "#ffe082",
            stroke: "#c0a24f",
            "stroke-width": 1
        }));
    }
    roundRect(svg, x0, y0, w, 8, 4, "#d9a066", "#b57a4a");
    roundRect(svg, x0, y0 + h - 8, w, 8, 4, "#d9a066", "#b57a4a");
    svg.append(el("line", { x1: x0, y1: y0 + 8, x2: x0 + w, y2: y0 + 8, stroke: "#b57a4a", "stroke-width": 2 }));
}

function drawTorta(svg, option) {
    const cx = 60, cy = 60, r = 46;
    const total = option.total;
    for (let i = 0; i < total; i++) {
        const a1 = i * 2 * Math.PI / total - Math.PI / 2;
        const a2 = (i + 1) * 2 * Math.PI / total - Math.PI / 2;
        const x1 = cx + r * Math.cos(a1);
        const y1 = cy + r * Math.sin(a1);
        const x2 = cx + r * Math.cos(a2);
        const y2 = cy + r * Math.sin(a2);
        const filled = i < option.filled;
        const largeArc = a2 - a1 > Math.PI ? 1 : 0;
        const path = el("path", {
            d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
            fill: filled ? "#ef5350" : "#f8bbd0",
            stroke: "#d81b60",
            "stroke-width": 2
        });
        svg.append(path);
    }
    svg.append(el("circle", { cx, cy, r, fill: "none", stroke: "#ad1457", "stroke-width": 3 }));
}

function drawShape(svg, option) {
    if (option.kind === "pizza") drawPizza(svg, option);
    else if (option.kind === "csoki") drawChoco(svg, option);
    else if (option.kind === "szendvics") drawSandwich(svg, option);
    else if (option.kind === "torta") drawTorta(svg, option);
}

const VIEWBOX = {
    pizza: [0, 0, 120, 120],
    torta: [0, 0, 120, 120],
    csoki: [0, 0, 120, 64],
    szendvics: [0, 0, 120, 64]
};

function createItemSvg(option) {
    const svg = document.createElementNS(NS, "svg");
    const [vx, vy, vw, vh] = VIEWBOX[option.kind] ?? [0, 0, 120, 64];
    svg.setAttribute("viewBox", `${vx} ${vy} ${vw} ${vh}`);
    svg.setAttribute("width", String(vw));
    svg.setAttribute("height", String(vh));
    svg.setAttribute("class", "fraction-svg");
    drawShape(svg, option);
    return svg;
}

export function renderFraction(step, root, next, progress, onResult, onAttempt) {

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "🍕"} ${KIND_LABEL[step.kind]} – törtek`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "fraction-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    if (step.drawing) {
        const drawing = document.createElement("div");
        drawing.className = "fraction-drawing";
        drawing.append(createItemSvg(step.drawing));
        card.append(drawing);
    }

    const options = document.createElement("div");
    options.className = "fraction-options";

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

    step.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "fraction-option";

        const content = opt.kind ? createItemSvg(opt) : document.createTextNode(opt.text);

        btn.append(content);

        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;

            if (opt.correct) {
                markCorrect(btn);
                feedback.success(`🎉 Ügyes! Ez a ${FRACTION_NAMES[step.total]}!`);
            } else {
                feedback.retry();
            }
        });

        options.append(btn);
    });

    card.append(options);
}