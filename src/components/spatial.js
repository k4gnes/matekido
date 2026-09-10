import { createCard } from "./ui/card.js";
import { getActiveWorld } from "../profile/Profile.js";
import { REFERENCES, OBJECTS } from "../data/spatial.js?v=1";

const SVG_NS = "http://www.w3.org/2000/svg";

const WORLD_EMOJI = {
    postman: "🧭",
    racing: "🏁",
    football: "⚽",
    cooking: "🍳",
    animals: "🦁",
    space: "🤖"
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

function ellipse(svg, cx, cy, rx, ry, fill, stroke, sw) {
    svg.append(el("ellipse", { cx, cy, rx, ry, fill, stroke, "stroke-width": sw }));
}


function drawReference(svg, ref) {
    const emoji = el("text", {
        x: ref.bbox.x + ref.bbox.w / 2,
        y: ref.bbox.y + ref.bbox.h / 2,
        "font-size": Math.min(ref.bbox.w, ref.bbox.h) * 0.95,
        "text-anchor": "middle",
        "dominant-baseline": "central"
    });
    emoji.textContent = ref.emoji;
    svg.append(emoji);
}

const OBJECT_DRAW = {
    labda(n, x, y) {
        circle(n, x, y, 20, "#ffffff", "#1f2937", 2);
        polygon(n, `${x},${y - 16} ${x + 6},${y - 4} ${x - 6},${y - 4}`, "#1f2937", "#1f2937", 0);
        ellipse(n, x + 8, y - 12, 7, 4, "#e2e8f0", "#e2e8f0", 0);
    },
    alma(n, x, y) {
        circle(n, x - 7, y, 13, "#ef4444", "#b91c1c", 2);
        ellipse(n, x - 13, y + 6, 4, 7, "#fca5a5", "#fca5a5", 0);
        rect(n, x - 4, y - 20, 3, 8, "#78350f", "#78350f", 0);
        ellipse(n, x + 5, y - 16, 7, 4, "#22c55e", "#16a34a", 1);
    },
    virag(n, x, y) {
        circle(n, x, y - 14, 10, "#f472b6", "#db2777", 1.5);
        circle(n, x + 13, y - 4, 10, "#fb7185", "#db2777", 1.5);
        circle(n, x - 13, y - 4, 10, "#f9a8d4", "#db2777", 1.5);
        circle(n, x + 8, y + 10, 10, "#c4b5fd", "#db2777", 1.5);
        circle(n, x - 8, y + 10, 10, "#fbcfe8", "#db2777", 1.5);
        circle(n, x, y, 8, "#fbbf24", "#b45309", 2);
    },
    pillango(n, x, y) {
        ellipse(n, x - 12, y - 6, 10, 13, "#c084fc", "#7e22ce", 1.5);
        ellipse(n, x + 12, y - 6, 10, 13, "#c084fc", "#7e22ce", 1.5);
        ellipse(n, x - 8, y + 8, 7, 9, "#a855f7", "#7e22ce", 1.5);
        ellipse(n, x + 8, y + 8, 7, 9, "#a855f7", "#7e22ce", 1.5);
        rect(n, x - 2, y - 16, 4, 32, "#374151", "#374151", 0);
    },
    macska(n, x, y) {
        circle(n, x - 8, y + 2, 15, "#f97316", "#c2410c", 2);
        circle(n, x + 11, y - 8, 9, "#fb923c", "#c2410c", 2);
        polygon(n, `${x + 6},${y - 16} ${x + 10},${y - 24} ${x + 16},${y - 17}`, "#f97316", "#c2410c", 1);
        polygon(n, `${x + 13},${y - 17} ${x + 17},${y - 25} ${x + 21},${y - 13}`, "#f97316", "#c2410c", 1);
        rect(n, x + 21, y + 3, 13, 3, "#c2410c", "#c2410c", 0);
    },
    kutya(n, x, y) {
        circle(n, x + 8, y - 2, 14, "#ca8a04", "#713f12", 2);
        circle(n, x - 8, y - 8, 9, "#e7e5e4", "#713f12", 2);
        ellipse(n, x - 2, y - 16, 5, 8, "#a16207", "#713f12", 1);
        rect(n, x + 19, y + 2, 12, 3, "#713f12", "#713f12", 0);
    },
    eger(n, x, y) {
        circle(n, x, y, 11, "#9ca3af", "#4b5563", 1.5);
        ellipse(n, x - 11, y - 3, 6, 8, "#9ca3af", "#4b5563", 1);
        ellipse(n, x + 11, y - 3, 6, 8, "#9ca3af", "#4b5563", 1);
        rect(n, x - 1, y + 8, 15, 2.5, "#6b7280", "#6b7280", 0);
    },
    level(n, x, y) {
        rect(n, x - 16, y - 13, 32, 26, "#f8fafc", "#64748b", 2);
        polygon(n, `${x - 16},${y - 13} ${x},${y + 3} ${x + 16},${y - 13}`, "#db2777", "#db2777", 0);
    },
    csomag(n, x, y) {
        rect(n, x - 16, y - 15, 32, 30, "#b45309", "#78350f", 2);
        rect(n, x - 3, y - 15, 6, 30, "#fde68a", "#d97706", 1);
        rect(n, x - 16, y - 3, 32, 6, "#fde68a", "#d97706", 1);
    },
    kulcs(n, x, y) {
        circle(n, x - 12, y, 8, "#d4d4d8", "#71717a", 2);
        circle(n, x - 12, y, 2, "#71717a", "#71717a", 0);
        rect(n, x - 5, y - 2, 18, 4, "#d4d4d8", "#71717a", 1);
        rect(n, x + 10, y + 2, 4, 8, "#d4d4d8", "#71717a", 1);
        rect(n, x + 3, y + 5, 4, 6, "#d4d4d8", "#71717a", 1);
    },
    kerek(n, x, y) {
        circle(n, x, y, 17, "#1f2937", "#111827", 2);
        circle(n, x, y, 11, "#d1d5db", "#374151", 2);
        rect(n, x - 1.5, y - 12, 3, 24, "#374151", "#374151", 0);
        rect(n, x - 12, y - 1.5, 24, 3, "#374151", "#374151", 0);
        n.append(el("rect", { x: x - 1.5, y: y - 12, width: 3, height: 24, fill: "#374151", transform: `rotate(45 ${x} ${y})` }));
        n.append(el("rect", { x: x - 1.5, y: y - 12, width: 3, height: 24, fill: "#374151", transform: `rotate(-45 ${x} ${y})` }));
        circle(n, x, y, 2.5, "#374151", "#374151", 0);
    },
    sisak(n, x, y) {
        rect(n, x - 12, y - 16, 24, 16, "#facc15", "#a16207", 2);
        rect(n, x - 20, y - 2, 40, 8, "#f59e0b", "#a16207", 2);
        rect(n, x - 4, y - 24, 8, 8, "#fde68a", "#a16207", 1);
    },
    kesztyu(n, x, y) {
        rect(n, x - 8, y - 13, 23, 27, "#f43f5e", "#be123c", 2);
        rect(n, x - 2, y - 22, 6, 9, "#be123c", "#be123c", 0);
        rect(n, x - 8, y + 14, 23, 8, "#fecdd3", "#be123c", 2);
    },
    tojas(n, x, y) {
        ellipse(n, x, y, 12, 17, "#fef3c7", "#f59e0b", 2);
        ellipse(n, x - 4, y - 5, 4, 7, "#ffffff", "#ffffff", 0);
    },
    gomba(n, x, y) {
        rect(n, x - 4, y - 2, 8, 18, "#f8fafc", "#94a3b8", 1.5);
        ellipse(n, x, y - 7, 18, 13, "#ef4444", "#b91c1c", 2);
        circle(n, x - 8, y - 10, 3, "#fef2f2", "#fef2f2", 0);
        circle(n, x + 6, y - 5, 2.5, "#fef2f2", "#fef2f2", 0);
        circle(n, x + 1, y - 13, 2.2, "#fef2f2", "#fef2f2", 0);
    },
    jatekos(n, x, y) {
        circle(n, x, y - 15, 8, "#fcd9b8", "#b45309", 1.5);
        rect(n, x - 9, y - 8, 18, 16, "#3b82f6", "#1d4ed8", 2);
        rect(n, x - 11, y + 8, 6, 10, "#2563eb", "#1e40af", 1);
        rect(n, x + 5, y + 8, 6, 10, "#2563eb", "#1e40af", 1);
    },
    zaszlo(n, x, y) {
        rect(n, x - 2, y - 19, 4, 35, "#64748b", "#475569", 1.5);
        polygon(n, `${x + 2},${y - 19} ${x + 22},${y - 16} ${x + 2},${y - 7}`, "#ef4444", "#b91c1c", 1.5);
    },
    oroszlan(n, x, y) {
        circle(n, x, y, 16, "#d97706", "#92400e", 2);
        circle(n, x, y, 10, "#fbbf24", "#b45309", 1.5);
        circle(n, x - 5, y + 3, 3, "#7c2d12", "#7c2d12", 0);
        circle(n, x + 5, y + 3, 3, "#7c2d12", "#7c2d12", 0);
        ellipse(n, x, y + 8, 6, 3, "#f59e0b", "#b45309", 1);
    },
    zebra(n, x, y) {
        rect(n, x - 16, y - 6, 20, 12, "#f8fafc", "#334155", 2);
        rect(n, x + 2, y - 19, 7, 13, "#f8fafc", "#334155", 1);
        rect(n, x - 12, y - 6, 3, 12, "#111827", "#111827", 0);
        rect(n, x - 6, y - 6, 3, 12, "#111827", "#111827", 0);
        rect(n, x, y - 6, 3, 12, "#111827", "#111827", 0);
        rect(n, x - 4, y - 19, 3, 13, "#111827", "#111827", 0);
        rect(n, x - 14, y + 6, 4, 8, "#334155", "#334155", 0);
        rect(n, x - 4, y + 6, 4, 8, "#334155", "#334155", 0);
    },
    majom(n, x, y) {
        circle(n, x - 15, y, 9, "#92400e", "#78350f", 1.5);
        circle(n, x + 15, y, 9, "#92400e", "#78350f", 1.5);
        circle(n, x, y, 14, "#a16207", "#713f12", 2);
        circle(n, x - 5, y + 3, 3, "#78350f", "#78350f", 0);
        circle(n, x + 5, y + 3, 3, "#78350f", "#78350f", 0);
        ellipse(n, x, y + 9, 6, 3, "#fde68a", "#78350f", 1);
    },
    zsiraf(n, x, y) {
        rect(n, x - 4, y - 25, 8, 34, "#facc15", "#ca8a04", 2);
        circle(n, x, y - 27, 7, "#fbbf24", "#ca8a04", 1.5);
        ellipse(n, x + 5, y - 28, 3, 4, "#fbbf24", "#ca8a04", 1);
        circle(n, x - 3, y - 28, 1.5, "#2d3748", "#2d3748", 0);
        rect(n, x + 3, y - 8, 8, 3, "#ca8a04", "#ca8a04", 0);
    },
    robot(n, x, y) {
        rect(n, x - 3, y - 27, 6, 6, "#ef4444", "#ef4444", 0);
        rect(n, x - 8, y - 17, 16, 10, "#94a3b8", "#475569", 2);
        rect(n, x - 13, y - 5, 26, 23, "#94a3b8", "#475569", 2);
        circle(n, x - 5, y - 12, 2.5, "#1e293b", "#1e293b", 0);
        circle(n, x + 5, y - 12, 2.5, "#1e293b", "#1e293b", 0);
        rect(n, x - 9, y + 4, 6, 4, "#38bdf8", "#38bdf8", 0);
        rect(n, x + 3, y + 4, 6, 4, "#38bdf8", "#38bdf8", 0);
    },
    muhold(n, x, y) {
        rect(n, x - 10, y - 5, 20, 17, "#f8fafc", "#64748b", 2);
        rect(n, x - 24, y - 16, 10, 13, "#2563eb", "#1d4ed8", 1.5);
        rect(n, x + 14, y - 16, 10, 13, "#2563eb", "#1d4ed8", 1.5);
        rect(n, x - 4, y - 16, 3, 11, "#94a3b8", "#94a3b8", 0);
        rect(n, x + 1, y - 16, 3, 11, "#94a3b8", "#94a3b8", 0);
        rect(n, x - 2, y + 12, 4, 7, "#ef4444", "#ef4444", 0);
        circle(n, x, y + 24, 3, "#ef4444", "#ef4444", 0);
    },
    urhajos(n, x, y) {
        circle(n, x, y - 15, 9, "#f8fafc", "#64748b", 2);
        circle(n, x, y - 15, 5, "#bfdbfe", "#2563eb", 1);
        rect(n, x - 9, y - 5, 18, 20, "#e2e8f0", "#64748b", 2);
        rect(n, x - 11, y + 2, 4, 6, "#cbd5e1", "#64748b", 1);
        rect(n, x + 7, y + 2, 4, 6, "#cbd5e1", "#64748b", 1);
        rect(n, x - 7, y + 14, 5, 5, "#cbd5e1", "#64748b", 1);
        rect(n, x + 2, y + 14, 5, 5, "#cbd5e1", "#64748b", 1);
    }
};

function shadow(svg, cx, baseY, w) {
    ellipse(svg, cx, baseY, w / 2, 5, "rgba(15,23,42,0.16)", "rgba(15,23,42,0)", 0);
}

function mark(svg, cx, cy, r) {
    svg.append(el("circle", { cx, cy, r, fill: "none", stroke: "#2563eb", "stroke-width": 2.5, "stroke-dasharray": "6 5", opacity: 0.9 }));
}

function drawObject(svg, obj, cx, baseY, scale) {
    const group = el("g", { transform: `translate(${cx} ${baseY - 26 * scale}) scale(${scale})` });
    OBJECT_DRAW[obj.id](group, 0, 0);
    svg.append(group);
}

function createScene(step) {

    const ref = REFERENCES.find(r => r.id === step.ref);
    const obj = OBJECTS.find(o => o.id === step.object);
    const b = ref.bbox;
    const pos = step.position;
    const floorY = b.y + b.h;
    const cx = b.x + b.w / 2;
    const groundY = floorY - 44;

    const svg = el("svg", { viewBox: "0 0 220 210", class: "spatial-svg" });

    rect(svg, 0, 0, 220, groundY, "#e0f2fe");
    rect(svg, 0, groundY, 220, 210 - groundY, "#ecfdf5");
    rect(svg, 0, groundY, 220, 3, "#a7f3d0");
    rect(svg, 0, groundY + 22, 220, 1.5, "#d1fae5");
    rect(svg, 0, groundY + 44, 220, 1.5, "#d1fae5");
    shadow(svg, cx, floorY, b.w * 0.55);

    if (pos === "behind") {
        const cy = b.y + b.h / 2;
        const ox = cx + b.w * 0.3;
        const s = 0.85;
        drawObject(svg, obj, ox, cy + 26 * s, s);
        mark(svg, ox, cy, 24);
        const emojiEl = el("text", {
            x: cx, y: cy,
            "font-size": Math.min(b.w, b.h) * 0.95,
            "text-anchor": "middle",
            "dominant-baseline": "central",
            transform: `rotate(10, ${cx}, ${cy})`
        });
        emojiEl.textContent = ref.emoji;
        svg.append(emojiEl);
    } else if (pos === "below") {
        const centerY = Math.min(floorY + 30, 185);
        const baseY = centerY + 26 * 0.9;
        drawObject(svg, obj, cx, baseY, 0.9);
        mark(svg, cx, centerY, 28);
        drawReference(svg, ref);
        shadow(svg, cx, Math.min(centerY + 26, 200), 36);
    } else if (pos === "in-front") {
        drawReference(svg, ref);
        shadow(svg, cx, floorY, 46);
        const centerY = floorY - 18;
        const baseY = centerY + 26 * 1.15;
        drawObject(svg, obj, cx, baseY, 1.15);
        mark(svg, cx, centerY, 31);
    } else if (pos === "above") {
        drawReference(svg, ref);
        const cy = Math.max(b.y - 58, 22);
        const baseY = cy + 26 * 0.95;
        drawObject(svg, obj, cx, baseY, 0.95);
        mark(svg, cx, cy, 27);
    } else {
        const emojiW = Math.min(b.w, b.h) * 0.95;
        const leftEdge = cx - emojiW / 2;
        const rightEdge = cx + emojiW / 2;
        const ox = pos === "left" ? leftEdge - 18 : rightEdge + 18;
        drawReference(svg, ref);
        shadow(svg, ox, floorY, 38);
        drawObject(svg, obj, ox, floorY, 1);
        mark(svg, ox, floorY - 27, 28);
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
