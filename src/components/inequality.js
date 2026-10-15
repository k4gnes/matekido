import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createHintBox } from "./ui/hintBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const SVGNS = "http://www.w3.org/2000/svg";

const WORLD_EMOJI = {
    postman: "📮",
    racing: "🏎️",
    football: "⚽",
    cooking: "🍳",
    animals: "🦁",
    space: "🤖",
    tram: "🚋"
};

function svgEl(name, attrs) {
    const el = document.createElementNS(SVGNS, name);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

function buildLine(relation, bound) {
    const min = 0;
    const max = 10;
    const w = 264;
    const h = 88;
    const pad = 20;
    const lineY = 44;
    const usable = w - 2 * pad;
    const x = v => pad + ((v - min) / (max - min)) * usable;
    const right = relation === ">" || relation === "≥";
    const strict = relation === ">" || relation === "<";
    const color = "#2b7de9";

    const svg = svgEl("svg", { viewBox: `0 0 ${w} ${h}`, class: "ineq-svg", "aria-hidden": "true" });

    svg.append(svgEl("line", { x1: x(min) - 6, y1: lineY, x2: x(max) + 2, y2: lineY, class: "ineq-axis" }));
    svg.append(svgEl("polygon", { points: `${x(max) + 2},${lineY - 4} ${x(max) + 10},${lineY} ${x(max) + 2},${lineY + 4}`, class: "ineq-axis-arrow" }));

    for (let v = min; v <= max; v++) {
        svg.append(svgEl("line", { x1: x(v), y1: lineY - 5, x2: x(v), y2: lineY + 5, class: "ineq-tick" }));
        const label = svgEl("text", { x: x(v), y: lineY + 26, class: "ineq-label", "text-anchor": "middle" });
        label.textContent = v;
        svg.append(label);
    }

    const from = right ? x(bound) : x(min) - 6;
    const to = right ? x(max) + 2 : x(bound);
    svg.append(svgEl("line", { x1: from, y1: lineY, x2: to, y2: lineY, class: "ineq-ray", stroke: color }));

    if (right) {
        svg.append(svgEl("polygon", { points: `${to},${lineY - 7} ${to + 12},${lineY} ${to},${lineY + 7}`, class: "ineq-ray-arrow", fill: color }));
    } else {
        svg.append(svgEl("polygon", { points: `${to},${lineY - 7} ${to - 12},${lineY} ${to},${lineY + 7}`, class: "ineq-ray-arrow", fill: color }));
    }

    svg.append(svgEl("circle", {
        cx: x(bound),
        cy: lineY,
        r: 6,
        class: strict ? "ineq-endpoint ineq-open" : "ineq-endpoint ineq-closed",
        fill: strict ? "#ffffff" : color,
        stroke: color
    }));

    return svg;
}

function hintText(step) {
    const circles = "A > és < esetén a határérték nem tartozik a megoldáshalmazba, ezért üres karika van. A ≥ és ≤ esetén a határérték is megoldás, ezért teli karika van.";
    if (step.mode === "linear" || step.mode === "linear-line") {
        const flip = step.sourceRelation !== step.relation;
        const flipNote = flip
            ? " Mivel negatív számmal osztottunk, az egyenlőtlenség jele megfordult."
            : " Mivel pozitív számmal osztottunk, a jel nem változott.";
        return `Az ismeretlent hagyd az egyik oldalon, a számokat a másikon, majd ossz az együtthatóval.${flipNote} ${circles}`;
    }
    return `${circles} A színes nyíl arra mutat, amerre a megoldások vannak: x > 3 esetén jobbra, x < 3 esetén balra.`;
}

function successText(step) {
    return `🎉 Ügyes! A megoldáshalmaz: x ${step.relation} ${step.bound}.`;
}

export function renderInequality(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "📈"} Egyenlőtlenségek`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "ineq-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    if (step.mode === "read") {
        const lineBox = document.createElement("div");
        lineBox.className = "ineq-line";
        lineBox.append(buildLine(step.relation, step.bound));
        card.append(lineBox);
    }

    if (["solve", "linear", "linear-line"].includes(step.mode)) {
        const expression = document.createElement("div");
        expression.className = "ineq-expression";
        expression.textContent = step.expression;
        card.append(expression);
    }

    const message = createMessageBox();
    card.append(message.element);

    const options = document.createElement("div");
    const lineMode = step.mode === "choose" || step.mode === "linear-line";
    options.className = lineMode ? "ineq-options ineq-options-lines" : "ineq-options";

    step.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "ineq-option";
        btn.dataset.correct = String(!!opt.correct);

        if (lineMode) {
            btn.classList.add("ineq-option-line");
            btn.append(buildLine(opt.relation, opt.bound));
        } else {
            btn.textContent = opt.text;
        }

        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;

            if (opt.correct) {
                markCorrect(btn);
                options.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
                feedback.success(successText(step));
            } else {
                feedback.retry();
                maybeShowHint();
            }
        });

        options.append(btn);
    });

    card.append(options);

    root.append(card);

    const feedback = createFeedback({
        message,
        container: card,
        onNext: next,
        onResult,
        onAttempt
    });

    const hint = createHintBox();
    hint.classList.add("ineq-hint");

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            hint.innerHTML = `<p><strong>💡 Segítség</strong></p><p>${hintText(step)}</p>`;
            hintButton.style.display = "none";
        }
    });
    hintButton.style.display = "none";

    function maybeShowHint() {
        if (feedback.getMistakes() >= 2 && !hintShown) {
            hintButton.style.display = "inline-block";
        }
    }

    card.append(hintButton, hint);
}
