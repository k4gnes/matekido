import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "📐 Szögek mérése a postán",
    racing: "🏎️ Szögek mérése a boxutcában",
    football: "⚽ Szögek mérése a pályán",
    cooking: "🍳 Szögek mérése a konyhában",
    animals: "🦁 Szögek mérése az állatkertben",
    space: "🤖 Szögek mérése az űrhajón",
    tram: "🚋 Szögek mérése a villamoson"
};

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(name, attrs = {}) {
    const el = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

function createMeasureSvg(angleDeg, showLabel) {
    const rad = angleDeg * Math.PI / 180;
    const vx = 120;
    const vy = 150;
    const r = 100;
    const rayLen = 92;

    const svg = svgEl("svg", { viewBox: "0 0 240 174", class: "am-svg" });

    for (let a = 0; a <= 180; a += 5) {
        const ar = a * Math.PI / 180;
        const big = a % 10 === 0;
        const r1 = big ? 84 : 91;
        svg.append(svgEl("line", {
            x1: vx + r1 * Math.cos(ar),
            y1: vy - r1 * Math.sin(ar),
            x2: vx + r * Math.cos(ar),
            y2: vy - r * Math.sin(ar),
            stroke: "#cbd5e1",
            "stroke-width": big ? 2 : 1
        }));
    }

    const labelR = r + 14;
    [0, 30, 60, 90, 120, 150, 180].forEach(l => {
        const lr = l * Math.PI / 180;
        const label = svgEl("text", {
            x: vx + labelR * Math.cos(lr),
            y: vy - labelR * Math.sin(lr) + 4,
            "text-anchor": l === 0 ? "end" : l === 180 ? "start" : "middle",
            fill: "#94a3b8",
            "font-size": "11",
            "font-weight": "600"
        });
        label.textContent = `${l}°`;
        svg.append(label);
    });

    svg.append(svgEl("line", {
        x1: vx, y1: vy, x2: vx + rayLen, y2: vy,
        stroke: "#334155",
        "stroke-width": 3,
        "stroke-linecap": "round"
    }));

    svg.append(svgEl("line", {
        x1: vx, y1: vy, x2: vx + rayLen * Math.cos(rad), y2: vy - rayLen * Math.sin(rad),
        stroke: "#334155",
        "stroke-width": 3,
        "stroke-linecap": "round"
    }));

    svg.append(svgEl("circle", {
        cx: vx, cy: vy, r: 4,
        fill: "#334155"
    }));

    const arcR = 36;
    const d = `M ${vx + arcR} ${vy} A ${arcR} ${arcR} 0 0 0 ${vx + arcR * Math.cos(rad)} ${vy - arcR * Math.sin(rad)}`;
    svg.append(svgEl("path", {
        d,
        fill: "none",
        stroke: "#ef4444",
        "stroke-width": 3
    }));

    if (showLabel) {
        const mid = rad / 2;
        const lx = vx + 62 * Math.cos(mid);
        const ly = vy - 62 * Math.sin(mid);
        const label = svgEl("text", {
            x: lx, y: ly,
            "text-anchor": "middle",
            "dominant-baseline": "central",
            fill: "#ef4444",
            "font-size": "14",
            "font-weight": "700"
        });
        label.textContent = `${angleDeg}°`;
        svg.append(label);
    }

    return svg;
}

function createMiniAngle(angleDeg) {
    const rad = angleDeg * Math.PI / 180;
    const vx = 60;
    const vy = 62;
    const rayLen = 46;
    const arcR = 16;

    const svg = svgEl("svg", { viewBox: "0 0 120 78", class: "am-mini" });

    svg.append(svgEl("line", {
        x1: vx, y1: vy, x2: vx + rayLen, y2: vy,
        stroke: "#334155",
        "stroke-width": 3,
        "stroke-linecap": "round"
    }));

    svg.append(svgEl("line", {
        x1: vx, y1: vy, x2: vx + rayLen * Math.cos(rad), y2: vy - rayLen * Math.sin(rad),
        stroke: "#334155",
        "stroke-width": 3,
        "stroke-linecap": "round"
    }));

    svg.append(svgEl("circle", {
        cx: vx, cy: vy, r: 3,
        fill: "#334155"
    }));

    const d = `M ${vx + arcR} ${vy} A ${arcR} ${arcR} 0 0 0 ${vx + arcR * Math.cos(rad)} ${vy - arcR * Math.sin(rad)}`;
    svg.append(svgEl("path", {
        d,
        fill: "none",
        stroke: "#ef4444",
        "stroke-width": 2.5
    }));

    return svg;
}

export function renderAngleMeasure(step, root, next, progress, onResult, onAttempt) {

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
    prompt.className = "am-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    if (step.mode === "compare") {
        const row = document.createElement("div");
        row.className = "am-compare-row";

        const makeFigure = (letter, deg, isCorrect, onClick) => {
            const fig = document.createElement("div");
            fig.className = "am-figure";

            const letterEl = document.createElement("span");
            letterEl.className = "am-letter";
            letterEl.textContent = letter;
            fig.append(letterEl);

            fig.append(createMiniAngle(deg));

            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "am-option";
            btn.textContent = `A(z) ${letter} szög`;
            btn.addEventListener("click", onClick);
            fig.append(btn);

            return { fig, btn };
        };

        const figA = makeFigure("A", step.angleA, step.options[0].correct, () => {
            if (feedback.isAnswered()) return;
            if (step.options[0].correct) {
                markCorrect(figA.btn);
                feedback.success(`🎉 Ügyes! Az A szög a nagyobb.`);
            } else {
                feedback.retry();
            }
        });
        const figB = makeFigure("B", step.angleB, step.options[1].correct, () => {
            if (feedback.isAnswered()) return;
            if (step.options[1].correct) {
                markCorrect(figB.btn);
                feedback.success(`🎉 Ügyes! A B szög a nagyobb.`);
            } else {
                feedback.retry();
            }
        });

        row.append(figA.fig);
        row.append(figB.fig);

        card.append(row);
    } else {
        card.append(createMeasureSvg(step.angle, step.mode === "kind"));

        const options = document.createElement("div");
        options.className = "am-options";

        step.options.forEach(opt => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "am-option";
            btn.textContent = opt.text;

            btn.addEventListener("click", () => {
                if (feedback.isAnswered()) return;

                if (opt.correct) {
                    markCorrect(btn);
                    if (step.mode === "kind") {
                        feedback.success(`🎉 Ügyes! A ${step.angle}°-os szög ${opt.text.toLowerCase()}.`);
                    } else {
                        feedback.success(`🎉 Ügyes! A szög ${opt.text}.`);
                    }
                } else {
                    feedback.retry();
                }
            });

            options.append(btn);
        });

        card.append(options);
    }

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