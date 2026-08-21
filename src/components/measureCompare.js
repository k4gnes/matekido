import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_EMOJI = {
    postman: "📏",
    racing: "🔧",
    football: "⚽",
    cooking: "🥄",
    animals: "🦁",
    space: "🤖"
};

const U = 30;
const LEFT = 18;

function drawRow(svg, { emoji, name }, start, end, fill, stroke) {
    const x1 = LEFT + start * U;
    const x2 = LEFT + end * U;
    const width = x2 - x1;

    const ns = "http://www.w3.org/2000/svg";
    const el = (tag, attrs) => {
        const n = document.createElementNS(ns, tag);
        for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
        return n;
    };

    const emojiText = el("text", {
        x: (x1 + x2) / 2,
        y: 18,
        "font-size": 16,
        "text-anchor": "middle"
    });
    emojiText.textContent = emoji;

    const obj = el("rect", {
        x: x1, y: 24, width, height: 20,
        rx: 4,
        fill, stroke,
        "stroke-width": 2
    });

    svg.append(emojiText, obj);

    for (let t = 0; t <= 8; t++) {
        const x = LEFT + t * U;
        svg.append(el("line", {
            x1: x, y1: 58, x2: x, y2: 48,
            stroke: "#64748b", "stroke-width": t === start || t === end ? 2 : 1
        }));
        const num = el("text", { x, y: 68, "font-size": 9, "text-anchor": "middle", fill: "#64748b" });
        num.textContent = t;
        svg.append(num);
    }
    svg.append(el("line", { x1: LEFT, y1: 58, x2: LEFT + 8 * U, y2: 58, stroke: "#94a3b8", "stroke-width": 2 }));
}

export function renderMeasureCompare(step, root, next, progress, onResult, onAttempt) {


    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "📏"} Melyik hosszabb?`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "meas-prompt";
    prompt.textContent = "Olvasd le a mércéken, milyen hosszú a két tárgy, és válaszd ki, melyik a hosszabb!";
    card.append(prompt);

    const rows = document.createElement("div");
    rows.className = "meas-rows";

    const rowA = document.createElement("div");
    rowA.className = "meas-row";
    const headA = document.createElement("div");
    headA.className = "meas-row-head";
    headA.textContent = `A: ${step.objectA.emoji} ${step.objectA.name}`;
    const svgA = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgA.setAttribute("viewBox", `0 0 ${LEFT + 8 * U + 18} 72`);
    svgA.setAttribute("width", LEFT + 8 * U + 18);
    svgA.setAttribute("height", 72);
    svgA.setAttribute("class", "meas-svg");
    drawRow(svgA, step.objectA, step.startA, step.endA, "#f87171", "#b91c1c");
    rowA.append(headA, svgA);

    const rowB = document.createElement("div");
    rowB.className = "meas-row";
    const headB = document.createElement("div");
    headB.className = "meas-row-head";
    headB.textContent = `B: ${step.objectB.emoji} ${step.objectB.name}`;
    const svgB = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgB.setAttribute("viewBox", `0 0 ${LEFT + 8 * U + 18} 72`);
    svgB.setAttribute("width", LEFT + 8 * U + 18);
    svgB.setAttribute("height", 72);
    svgB.setAttribute("class", "meas-svg");
    drawRow(svgB, step.objectB, step.startB, step.endB, "#60a5fa", "#1d4ed8");
    rowB.append(headB, svgB);

    rows.append(rowA, rowB);
    card.append(rows);

    const options = document.createElement("div");
    options.className = "meas-options";

    const message = createMessageBox();
    card.append(message.element);

    root.replaceChildren(card);

    const feedback = createFeedback({
        message,
        container: card,
        onNext: next,
        onResult,
        onAttempt
    });

    step.options.forEach(opt => {
        const btn = createButton(opt.text, {
            className: "meas-option",
            onClick: () => {
                if (feedback.isAnswered()) return;

                if (opt.correct) {
                    markCorrect(btn);
                    feedback.success(
                        step.answer === "equal"
                            ? `🎉 Igen, egyformán hosszúak: mindkettő ${step.lengthA} négyzet!`
                            : `🎉 Jó válasz! ${opt.text} ${step.answer === "A" ? step.lengthA : step.lengthB} négyzet hosszú.`
                    );
                } else {
                    feedback.retry();
                }
            }
        });
        options.append(btn);
    });

    card.append(options);
}
