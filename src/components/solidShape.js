import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "📦 Térbeli alakzatok",
    racing: "🏎️ Térbeli alakzatok",
    football: "⚽ Térbeli alakzatok",
    cooking: "🍳 Térbeli alakzatok",
    animals: "🦁 Térbeli alakzatok",
    space: "🤖 Térbeli alakzatok",
    tram: "🚋 Térbeli alakzatok"
};

const SOLIDS = {
    cube: { label: "kocka", dative: "kockának", faces: 6, edges: 12, vertices: 8, color: "#3b82f6" },
    cuboid: { label: "téglatest", dative: "téglatestnek", faces: 6, edges: 12, vertices: 8, color: "#8b5cf6" },
    prism: { label: "hasáb", dative: "hasábnak", faces: 5, edges: 9, vertices: 6, color: "#14b8a6" },
    pyramid: { label: "gúla", dative: "gúlának", faces: 5, edges: 8, vertices: 5, color: "#f97316" },
    cylinder: { label: "henger", dative: "hengernek", faces: 3, color: "#10b981" },
    cone: { label: "kúp", dative: "kúpnak", faces: 2, color: "#f59e0b" },
    sphere: { label: "gömb", dative: "gömbnek", faces: 0, color: "#ef4444" }
};

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(name, attrs = {}) {
    const el = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

function lineAttrs() {
    return { stroke: "#1e293b", "stroke-width": "2.5", "stroke-linejoin": "round", "stroke-linecap": "round" };
}

function createSolidSvg(solid) {
    const svg = svgEl("svg", { viewBox: "0 0 120 120" });
    const color = SOLIDS[solid].color;
    const la = lineAttrs();

    if (solid === "cube") {
        svg.append(svgEl("rect", { x: 28, y: 46, width: 46, height: 46, rx: 2, fill: color, "fill-opacity": ".9", ...la }));
        svg.append(svgEl("path", { d: "M28,46 L44,30 L90,30 L74,46", fill: color, "fill-opacity": ".65", ...la }));
        svg.append(svgEl("path", { d: "M90,30 L90,76 L74,92 L74,46 Z", fill: color, "fill-opacity": ".5", ...la }));
    } else if (solid === "cuboid") {
        svg.append(svgEl("rect", { x: 20, y: 52, width: 60, height: 40, rx: 2, fill: color, "fill-opacity": ".9", ...la }));
        svg.append(svgEl("path", { d: "M20,52 L36,32 L96,32 L80,52", fill: color, "fill-opacity": ".65", ...la }));
        svg.append(svgEl("path", { d: "M96,32 L96,72 L80,92 L80,52 Z", fill: color, "fill-opacity": ".5", ...la }));
    } else if (solid === "prism") {
        svg.append(svgEl("path", { d: "M42,76 L72,26 L102,76 Z", fill: color, "fill-opacity": ".5", ...la }));
        svg.append(svgEl("path", { d: "M30,88 L42,76 L102,76 L90,88 Z", fill: color, "fill-opacity": ".7", ...la }));
        svg.append(svgEl("path", { d: "M90,88 L102,76 L72,26 L60,38 Z", fill: color, "fill-opacity": ".6", ...la }));
        svg.append(svgEl("path", { d: "M30,88 L60,38 L90,88 Z", fill: color, "fill-opacity": ".9", ...la }));
    } else if (solid === "pyramid") {
        svg.append(svgEl("path", { d: "M22,82 L60,96 L98,82 L60,68 Z", fill: color, "fill-opacity": ".5", ...la }));
        svg.append(svgEl("path", { d: "M22,82 L60,26 L60,96 Z", fill: color, "fill-opacity": ".75", ...la }));
        svg.append(svgEl("path", { d: "M98,82 L60,26 L60,96 Z", fill: color, "fill-opacity": ".9", ...la }));
    } else if (solid === "cylinder") {
        svg.append(svgEl("path", { d: "M30,34 L30,86 A30,11 0 0 0 90,86 L90,34", fill: color, "fill-opacity": ".85", ...la }));
        svg.append(svgEl("ellipse", { cx: 60, cy: 86, rx: 30, ry: 11, fill: color, ...la }));
        svg.append(svgEl("ellipse", { cx: 60, cy: 34, rx: 30, ry: 11, fill: color, "fill-opacity": ".55", ...la }));
    } else if (solid === "cone") {
        svg.append(svgEl("path", { d: "M60,18 L28,88 A32,11 0 0 0 92,88 Z", fill: color, "fill-opacity": ".85", ...la }));
        svg.append(svgEl("ellipse", { cx: 60, cy: 88, rx: 32, ry: 11, fill: color, "fill-opacity": ".45", ...la }));
    } else if (solid === "sphere") {
        svg.append(svgEl("circle", { cx: 60, cy: 62, r: 36, fill: color, "fill-opacity": ".85", ...la }));
        svg.append(svgEl("ellipse", {
            cx: 47, cy: 46, rx: 13, ry: 9, fill: "#ffffff", "fill-opacity": ".4", stroke: "none",
            transform: "rotate(-28 47 46)"
        }));
    }

    return svg;
}

function createNetSvg(solid) {
    const svg = svgEl("svg", { viewBox: "0 0 160 130" });
    const color = SOLIDS[solid].color;
    const la = lineAttrs();

    function face(name, attrs) {
        svg.append(svgEl(name, { fill: color, "fill-opacity": ".25", ...la, ...attrs }));
    }

    if (solid === "cube") {
        [[15, 45], [45, 45], [75, 45], [105, 45], [45, 15], [45, 75]]
            .forEach(([x, y]) => face("rect", { x, y, width: 30, height: 30 }));
    } else if (solid === "cuboid") {
        [[20, 50], [48, 50], [76, 50], [104, 50]]
            .forEach(([x, y]) => face("rect", { x, y, width: 28, height: 20 }));
        [[48, 30], [48, 70]].forEach(([x, y]) => face("rect", { x, y, width: 20, height: 20 }));
    } else if (solid === "prism") {
        [[35, 45], [65, 45], [95, 45]]
            .forEach(([x, y]) => face("rect", { x, y, width: 30, height: 40 }));
        face("path", { d: "M65,45 L95,45 L80,20 Z" });
        face("path", { d: "M65,85 L95,85 L80,110 Z" });
    } else if (solid === "pyramid") {
        face("rect", { x: 60, y: 45, width: 40, height: 40 });
        face("path", { d: "M60,45 L100,45 L80,15 Z" });
        face("path", { d: "M60,85 L100,85 L80,115 Z" });
        face("path", { d: "M60,45 L60,85 L30,65 Z" });
        face("path", { d: "M100,45 L100,85 L130,65 Z" });
    }

    return svg;
}

export function renderSolidShape(step, root, next, progress, onResult, onAttempt) {

    const ac = new AbortController();
    const world = getActiveWorld();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = TITLES[world] ?? TITLES.postman;
    card.append(title);

    const figure = document.createElement("div");
    figure.className = "ss-figure";
    figure.append(step.mode === "net" ? createNetSvg(step.solid) : createSolidSvg(step.solid));
    card.append(figure);

    const prompt = document.createElement("p");
    prompt.className = "ss-prompt";
    prompt.textContent = step.mode === "faces" ? "Hány lapja van ennek a testnek?"
        : step.mode === "edges" ? "Hány éle van ennek a testnek?"
        : step.mode === "vertices" ? "Hány csúcsa van ennek a testnek?"
        : step.mode === "net" ? "Melyik test hálója ez?"
        : "Mi ez a test?";
    card.append(prompt);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "ss-options";

    step.options.forEach((value, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "ss-option";
        btn.textContent = value;
        btn.dataset.index = index;
        optionsContainer.append(btn);
    });

    card.append(optionsContainer);

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
        const info = SOLIDS[step.solid];
        if (step.mode === "faces") {
            return `😊 Ügyes! A ${info.dative} ${info.faces} lapja van.`;
        }
        if (step.mode === "edges") {
            return `😊 Ügyes! A ${info.dative} ${info.edges} éle van.`;
        }
        if (step.mode === "vertices") {
            return `😊 Ügyes! A ${info.dative} ${info.vertices} csúcsa van.`;
        }
        if (step.mode === "net") {
            return `😊 Ügyes! Ez a ${info.label} hálója.`;
        }
        return `😊 Ügyes! Ez egy ${info.label}.`;
    }

    function checkAnswer(isCorrect) {
        if (feedback.isAnswered()) return;

        if (isCorrect) {
            optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");

            feedback.success(successText());
        } else {
            feedback.retry();
        }
    }

    optionsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".ss-option");
        if (!btn || feedback.isAnswered()) return;

        const ok = Number(btn.dataset.index) === step.answer;

        if (ok) markCorrect(btn);

        checkAnswer(ok);
    }, { signal: ac.signal });
}
