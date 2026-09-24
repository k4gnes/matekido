import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { createButton } from "./ui/button.js";
import { createHintBox } from "./ui/hintBox.js";
import { renderPolygonHint } from "./hints/polygonHint.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "📐 Sokszögek a postán",
    racing: "🏎️ Sokszögek a pályán",
    football: "⚽ Sokszögek a pályán",
    cooking: "🍳 Sokszögek a konyhában",
    animals: "🦁 Sokszögek az állatkertben",
    space: "🤖 Sokszögek az űrben",
    tram: "🚋 Sokszögek a városban"
};

const POLYGONS = {
    triangle: { label: "Háromszög", dative: "háromszögnek", sides: 3 },
    square: { label: "Négyszög", dative: "négyszögnek", sides: 4 },
    pentagon: { label: "Ötszög", dative: "ötszögnek", sides: 5 },
    hexagon: { label: "Hatszög", dative: "hatszögnek", sides: 6 },
    heptagon: { label: "Hétszög", dative: "hétszögnek", sides: 7 },
    octagon: { label: "Nyolcszög", dative: "nyolcszögnek", sides: 8 }
};

const COLORS = {
    triangle: "#f59e0b",
    square: "#3b82f6",
    pentagon: "#a855f7",
    hexagon: "#10b981",
    heptagon: "#ec4899",
    octagon: "#6366f1"
};

const QUESTIONS = {
    name: "Mi ez a sokszög?",
    sides: "Hány oldala van ennek a sokszögnek?",
    vertices: "Hány csúcsa van ennek a sokszögnek?",
    diagonals: "Hány átlója van ennek a sokszögnek?"
};

function polygonPoints(kind, size) {
    const n = POLYGONS[kind].sides;
    const c = 60;
    const r = size / 2;
    const pts = [];
    for (let i = 0; i < n; i++) {
        const angle = -Math.PI / 2 + i * 2 * Math.PI / n;
        pts.push([c + r * Math.cos(angle), c + r * Math.sin(angle)]);
    }
    return pts;
}

function createShapeSvg(step) {
    const svgNs = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNs, "svg");
    svg.setAttribute("viewBox", "0 0 120 120");

    const pts = polygonPoints(step.kind, 72);

    if (step.mode === "diagonals") {
        const n = POLYGONS[step.kind].sides;
        const segs = [];
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const a = Math.abs(j - i);
                const adjacent = a === 1 || a === n - 1;
                if (j <= i || adjacent) continue;
                segs.push({
                    i,
                    j,
                    x1: pts[i][0].toFixed(1),
                    y1: pts[i][1].toFixed(1),
                    x2: pts[j][0].toFixed(1),
                    y2: pts[j][1].toFixed(1)
                });
            }
        }

        const fan = segs.filter(s => s.i === 0);
        const rest = segs.filter(s => s.i !== 0);

        rest.forEach(seg => {
            const halo = document.createElementNS(svgNs, "line");
            halo.setAttribute("x1", seg.x1);
            halo.setAttribute("y1", seg.y1);
            halo.setAttribute("x2", seg.x2);
            halo.setAttribute("y2", seg.y2);
            halo.setAttribute("stroke", "#ffffff");
            halo.setAttribute("stroke-width", "3");
            svg.append(halo);

            const line = document.createElementNS(svgNs, "line");
            line.setAttribute("x1", seg.x1);
            line.setAttribute("y1", seg.y1);
            line.setAttribute("x2", seg.x2);
            line.setAttribute("y2", seg.y2);
            line.setAttribute("stroke", "#cbd5e1");
            line.setAttribute("stroke-width", "1.5");
            line.setAttribute("opacity", "0.85");
            svg.append(line);
        });

        fan.forEach(seg => {
            const halo = document.createElementNS(svgNs, "line");
            halo.setAttribute("x1", seg.x1);
            halo.setAttribute("y1", seg.y1);
            halo.setAttribute("x2", seg.x2);
            halo.setAttribute("y2", seg.y2);
            halo.setAttribute("stroke", "#ffffff");
            halo.setAttribute("stroke-width", "6");
            halo.setAttribute("stroke-linecap", "round");
            svg.append(halo);

            const line = document.createElementNS(svgNs, "line");
            line.setAttribute("x1", seg.x1);
            line.setAttribute("y1", seg.y1);
            line.setAttribute("x2", seg.x2);
            line.setAttribute("y2", seg.y2);
            line.setAttribute("stroke", "#e11d48");
            line.setAttribute("stroke-width", "3.5");
            line.setAttribute("stroke-linecap", "round");
            svg.append(line);
        });

        const dot = document.createElementNS(svgNs, "circle");
        dot.setAttribute("cx", pts[0][0].toFixed(1));
        dot.setAttribute("cy", pts[0][1].toFixed(1));
        dot.setAttribute("r", "4");
        dot.setAttribute("fill", "#e11d48");
        dot.setAttribute("stroke", "#ffffff");
        dot.setAttribute("stroke-width", "1.5");
        svg.append(dot);

        if (n > 3) {
            const fromLabel = document.createElementNS(svgNs, "text");
            fromLabel.setAttribute("x", pts[0][0].toFixed(1));
            fromLabel.setAttribute("y", (pts[0][1] - 9).toFixed(1));
            fromLabel.setAttribute("text-anchor", "middle");
            fromLabel.setAttribute("font-size", "10");
            fromLabel.setAttribute("font-weight", "700");
            fromLabel.setAttribute("fill", "#e11d48");
            fromLabel.textContent = "A";
            svg.append(fromLabel);
        }
    }

    const poly = document.createElementNS(svgNs, "polygon");
    poly.setAttribute("points", pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" "));
    poly.setAttribute("fill", COLORS[step.kind]);
    poly.setAttribute("fill-opacity", "0.85");
    poly.setAttribute("stroke", "#1e293b");
    poly.setAttribute("stroke-width", "2.5");
    poly.setAttribute("stroke-linejoin", "round");
    svg.append(poly);

    return svg;
}

export function renderPolygon(step, root, next, progress, onResult, onAttempt) {

    const ac = new AbortController();
    const world = getActiveWorld();

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = TITLES[world] ?? TITLES.postman;
    card.append(title);

    const figure = document.createElement("div");
    figure.className = "pg-figure";
    figure.append(createShapeSvg(step));
    card.append(figure);

    const question = document.createElement("p");
    question.className = "pg-question";
    question.textContent = QUESTIONS[step.mode] ?? QUESTIONS.name;
    card.append(question);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "pg-options";

    step.options.forEach((option, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pg-option" + (step.mode === "name" ? "" : " pg-option-num");
        btn.dataset.value = index;
        btn.textContent = String(option);
        optionsContainer.append(btn);
    });

    card.append(optionsContainer);

    const hint = createHintBox();

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            renderPolygonHint(step, hint);
            hintButton.style.display = "none";
        }
    });
    hintButton.style.display = "none";

    card.append(hintButton, hint);

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
        const data = POLYGONS[step.kind];
        if (step.mode === "name") {
            return `😊 Ügyes! Ez egy ${data.label}.`;
        }
        if (step.mode === "sides") {
            return `😊 Ügyes! A ${data.dative} ${data.sides} oldala van.`;
        }
        if (step.mode === "vertices") {
            return `😊 Ügyes! A ${data.dative} ${data.sides} csúcsa van.`;
        }
        const d = data.sides * (data.sides - 3) / 2;
        const perVertex = data.sides - 3;
        if (perVertex === 0) {
            return `😊 Ügyes! A ${data.dative} egyetlen átlója sincs.`;
        }
        return `😊 Ügyes! A ${data.dative} ${d} átlója van – egy csúcsból ${perVertex} indul.`;
    }

    function checkAnswer(isCorrect) {
        if (feedback.isAnswered()) return;

        if (isCorrect) {
            optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
            feedback.success(successText());
        } else {
            feedback.retry();

            if (feedback.getMistakes() >= 2 && !hintShown) {
                hintButton.style.display = "inline-block";
            }
        }
    }

    optionsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".pg-option");
        if (!btn || feedback.isAnswered()) return;

        const ok = Number(btn.dataset.value) === step.answer;

        if (ok) markCorrect(btn);

        checkAnswer(ok);
    }, { signal: ac.signal });
}