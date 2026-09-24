import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "📐 Szögek a postán",
    racing: "🏎️ Szögek a boxutcában",
    football: "⚽ Szögek a pályán",
    cooking: "🍳 Szögek a konyhában",
    animals: "🦁 Szögek az állatkertben",
    space: "🤖 Szögek az űrhajón",
    tram: "🚋 Szögek a villamoson"
};

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(name, attrs = {}) {
    const el = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

function createAngleSvg(step) {
    const angleDeg = step.angle;
    const angleRad = angleDeg * Math.PI / 180;

    const vx = 110;
    const vy = 135;
    const rayLen = 90;
    const arcR = 22;

    const w = 220;
    const h = 160;

    const svg = svgEl("svg", { viewBox: `0 0 ${w} ${h}`, class: "ang-svg" });

    const rx = vx + rayLen;
    const ry = vy;

    const ax = vx + rayLen * Math.cos(angleRad);
    const ay = vy - rayLen * Math.sin(angleRad);

    svg.append(svgEl("line", {
        x1: vx, y1: vy, x2: rx, y2: ry,
        stroke: "#334155",
        "stroke-width": 3,
        "stroke-linecap": "round"
    }));

    svg.append(svgEl("line", {
        x1: vx, y1: vy, x2: ax, y2: ay,
        stroke: "#334155",
        "stroke-width": 3,
        "stroke-linecap": "round"
    }));

    svg.append(svgEl("circle", {
        cx: vx, cy: vy, r: 4,
        fill: "#334155"
    }));

    const sx = vx + arcR;
    const sy = vy;
    const ex = vx + arcR * Math.cos(angleRad);
    const ey = vy - arcR * Math.sin(angleRad);

    const d = `M ${sx} ${sy} A ${arcR} ${arcR} 0 0 0 ${ex} ${ey}`;
    svg.append(svgEl("path", {
        d,
        fill: "none",
        stroke: "#ef4444",
        "stroke-width": 2.5
    }));

    const midRad = angleRad / 2;
    const labelR = arcR + 14;
    const lx = vx + labelR * Math.cos(midRad);
    const ly = vy - labelR * Math.sin(midRad);
    const label = svgEl("text", {
        x: lx, y: ly,
        "text-anchor": "middle",
        "dominant-baseline": "central",
        fill: "#64748b",
        "font-size": "12",
        "font-weight": "600"
    });
    label.textContent = `${angleDeg}°`;
    svg.append(label);

    return svg;
}

export function renderAngles(step, root, next, progress, onResult, onAttempt) {

    const world = getActiveWorld();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = TITLES[world] ?? TITLES.postman;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "ang-prompt";
    prompt.textContent = "Milyen szög ez? Válaszd ki a helyes választ!";
    card.append(prompt);

    card.append(createAngleSvg(step));

    const options = document.createElement("div");
    options.className = "ang-options";
    step.options.forEach((label, i) => {
        const btn = createButton(label, { className: "ang-option" });
        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;
            if (label === step.correctLabel) {
                markCorrect(btn);
                const names = {
                    acute: "hegyes",
                    right: "derékszög",
                    obtuse: "tompa szög"
                };
                feedback.success(`😊 Szép munka! Ez egy ${names[step.category]}!`);
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