import { createCard } from "./ui/card.js";
import { getActiveWorld } from "../profile/Profile.js";
import { REFERENCES, OBJECTS } from "../data/spatial.js";

const SVG_NS = "http://www.w3.org/2000/svg";

const WORLD_EMOJI = {
    postman: "🧭",
    racing: "🏁",
    football: "⚽",
    cooking: "🍳"
};

function el(tag, attrs = {}) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attrs)) {
        node.setAttribute(key, value);
    }
    return node;
}

function rect(svg, x, y, w, h, fill, stroke, sw) {
    svg.append(el("rect", { x, y, width: w, height: h, rx: 4, fill, stroke, "stroke-width": sw }));
}

function circle(svg, cx, cy, r, fill, stroke, sw) {
    svg.append(el("circle", { cx, cy, r, fill, stroke, "stroke-width": sw }));
}

function polygon(svg, points, fill, stroke, sw) {
    svg.append(el("polygon", { points, fill, stroke, "stroke-width": sw }));
}

const REFERENCE_DRAW = {
    doboz(svg) {
        rect(svg, 80, 40, 60, 100, "#fbbf24", "#b45309", 3);
        rect(svg, 80, 40, 60, 16, "#f59e0b", "#b45309", 2);
        rect(svg, 106, 40, 8, 100, "#fde68a", "#b45309", 2);
    },
    fa(svg) {
        rect(svg, 102, 90, 16, 75, "#92400e", "#78350f", 2);
        circle(svg, 110, 62, 34, "#22c55e", "#15803d", 2);
        circle(svg, 97, 74, 20, "#16a34a", "#15803d", 2);
    },
    szek(svg) {
        rect(svg, 80, 58, 14, 47, "#a78bfa", "#6d28d9", 2);
        rect(svg, 80, 105, 60, 14, "#a78bfa", "#6d28d9", 2);
        rect(svg, 84, 119, 8, 46, "#8b5cf6", "#6d28d9", 2);
        rect(svg, 128, 119, 8, 46, "#8b5cf6", "#6d28d9", 2);
    },
    asztal(svg) {
        rect(svg, 55, 85, 110, 14, "#f59e0b", "#b45309", 3);
        rect(svg, 70, 99, 10, 66, "#b45309", "#92400e", 2);
        rect(svg, 140, 99, 10, 66, "#b45309", "#92400e", 2);
    },
    haz(svg) {
        rect(svg, 80, 90, 60, 75, "#fb923c", "#c2410c", 3);
        polygon(svg, "70,90 110,45 150,90", "#ef4444", "#b91c1c", 2);
        rect(svg, 103, 130, 14, 35, "#7c2d12", "#7c2d12", 0);
        rect(svg, 88, 108, 14, 14, "#fff7ed", "#c2410c", 2);
    }
};

const POSITION_POINT = {
    above: (b) => ({ x: b.x + b.w / 2, y: b.y - 30 }),
    below: (b) => ({ x: b.x + b.w / 2, y: b.y + b.h + 22 }),
    "in-front": (b) => ({ x: b.x + b.w / 2, y: b.y + b.h - 22 }),
    behind: (b) => ({ x: b.x + b.w / 2, y: b.y + 8 }),
    beside: (b) => ({ x: b.x + b.w + 30, y: b.y + b.h - 14 }),
    left: (b) => ({ x: b.x - 30, y: b.y + b.h / 2 }),
    right: (b) => ({ x: b.x + b.w + 30, y: b.y + b.h / 2 })
};

function createScene(step) {
    const ref = REFERENCES.find(r => r.id === step.ref);
    const obj = OBJECTS.find(o => o.id === step.object);
    const point = POSITION_POINT[step.position](ref.bbox);

    const svg = el("svg", { viewBox: "0 0 220 210", class: "spatial-svg" });

    const emoji = el("text", {
        x: point.x,
        y: point.y,
        "font-size": 48,
        "text-anchor": "middle",
        "dominant-baseline": "central"
    });
    emoji.textContent = obj.emoji;

    if (step.position === "behind") {
        const defs = el("defs");
        const clip = el("clipPath", { id: "behind-clip" });
        clip.append(el("rect", { x: 0, y: 0, width: 220, height: ref.bbox.y }));
        defs.append(clip);
        svg.append(defs);
        emoji.setAttribute("clip-path", "url(#behind-clip)");
        svg.append(emoji);
        REFERENCE_DRAW[ref.id](svg);
    } else {
        REFERENCE_DRAW[ref.id](svg);
        svg.append(emoji);
    }

    return { svg, ref, obj };
}

export function renderSpatial(step, root, onNext, progress, onResult, onAttempt) {

    root.innerHTML = "";

    const world = getActiveWorld();
    const ref = REFERENCES.find(r => r.id === step.ref);
    const obj = OBJECTS.find(o => o.id === step.object);

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.className = "spatial-title";
    title.textContent = `${WORLD_EMOJI[world] ?? "🧭"} Hol van ${obj.article} ${obj.name}?`;
    card.append(title);

    const sceneWrap = document.createElement("div");
    sceneWrap.className = "spatial-scene";
    sceneWrap.append(createScene(step).svg);
    card.append(sceneWrap);

    const prompt = document.createElement("p");
    prompt.className = "spatial-prompt";
    prompt.textContent = "Kattints a helyes válaszra!";
    card.append(prompt);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "spatial-options";

    const message = document.createElement("div");
    message.className = "spatial-message";

    let answered = false;
    let reported = false;

    step.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "spatial-option";
        btn.textContent = opt.text;

        btn.addEventListener("click", () => {
            if (answered) return;
            answered = true;

            onAttempt?.();

            optionsContainer.querySelectorAll("button").forEach(b => (b.style.pointerEvents = "none"));

            if (opt.correct) {
                btn.classList.add("spatial-option-correct");
                message.textContent = "🎉 Jó válasz!";
                message.className = "spatial-message spatial-message-good";

                if (!reported) {
                    reported = true;
                    onResult?.(true);
                }
            } else {
                btn.classList.add("spatial-option-wrong");
                optionsContainer.querySelectorAll("button").forEach(b => {
                    if (b.textContent === step.answer) {
                        b.classList.add("spatial-option-correct");
                    }
                });
                message.textContent = `🤔 Nem! A helyes meghatározás: ${step.answer}`;
                message.className = "spatial-message spatial-message-bad";

                if (!reported) {
                    reported = true;
                    onResult?.(false);
                }
            }

            const nextBtn = document.createElement("button");
            nextBtn.className = "spatial-next";
            nextBtn.textContent = "➡️ Tovább";
            nextBtn.addEventListener("click", () => onNext());
            card.append(nextBtn);
        });

        optionsContainer.append(btn);
    });

    card.append(optionsContainer, message);
    root.append(card);
}
