import { createCard } from "./ui/card.js";
import { getActiveWorld } from "../profile/Profile.js";
import { REFERENCES, OBJECTS } from "../data/spatial.js";

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
    },
    postalada(svg) {
        rect(svg, 106, 92, 8, 53, "#475569", "#334155", 2);
        rect(svg, 80, 50, 60, 44, "#3b82f6", "#1d4ed8", 3);
        rect(svg, 90, 60, 40, 24, "#60a5fa", "#1d4ed8", 2);
        circle(svg, 106, 84, 3, "#1e3a8a", "#1e3a8a", 0);
        rect(svg, 140, 54, 5, 18, "#1d4ed8", "#1d4ed8", 0);
        rect(svg, 145, 54, 18, 12, "#ef4444", "#b91c1c", 2);
    },
    auto(svg) {
        rect(svg, 60, 88, 34, 7, "#f97316", "#c2410c", 2);
        rect(svg, 60, 95, 100, 35, "#f97316", "#c2410c", 3);
        rect(svg, 88, 99, 30, 14, "#bfdbfe", "#1d4ed8", 2);
        circle(svg, 84, 130, 11, "#334155", "#1f2937", 2);
        circle(svg, 136, 130, 11, "#334155", "#1f2937", 2);
    },
    versenyauto(svg) {
        rect(svg, 60, 118, 100, 18, "#ef4444", "#b91c1c", 3);
        rect(svg, 100, 104, 30, 15, "#fecaca", "#b91c1c", 2);
        rect(svg, 60, 120, 16, 10, "#f87171", "#b91c1c", 2);
        rect(svg, 146, 110, 10, 14, "#ef4444", "#b91c1c", 2);
        circle(svg, 98, 109, 3, "#1e3a8a", "#1e3a8a", 0);
        circle(svg, 82, 136, 10, "#1f2937", "#111827", 2);
        circle(svg, 140, 136, 10, "#1f2937", "#111827", 2);
    },
    garazs(svg) {
        rect(svg, 60, 55, 100, 90, "#d6d3d1", "#78716c", 3);
        polygon(svg, "52,55 110,22 168,55", "#92400e", "#78350f", 2);
        rect(svg, 78, 95, 64, 50, "#1c1917", "#44403c", 2);
        rect(svg, 82, 120, 56, 16, "#ef4444", "#b91c1c", 2);
        circle(svg, 92, 137, 6, "#1f2937", "#111827", 2);
        circle(svg, 128, 137, 6, "#1f2937", "#111827", 2);
    },
    rajtkapu(svg) {
        rect(svg, 60, 58, 100, 34, "#dc2626", "#991b1b", 3);
        rect(svg, 60, 82, 100, 8, "#f8fafc", "#94a3b8", 1);
        for (let i = 0; i < 10; i++) {
            if (i % 2 === 0) {
                rect(svg, 62 + i * 10, 82, 8, 8, "#1f2937", "#1f2937", 0);
            }
        }
        rect(svg, 62, 92, 10, 43, "#1f2937", "#111827", 2);
        rect(svg, 148, 92, 10, 43, "#1f2937", "#111827", 2);
    },
    tuzhely(svg) {
        rect(svg, 60, 70, 100, 80, "#f1f5f9", "#94a3b8", 3);
        circle(svg, 85, 92, 15, "#e2e8f0", "#94a3b8", 2);
        circle(svg, 135, 92, 15, "#e2e8f0", "#94a3b8", 2);
        rect(svg, 75, 112, 70, 28, "#cbd5e1", "#94a3b8", 2);
        rect(svg, 103, 120, 14, 12, "#64748b", "#475569", 2);
    },
    hutosekreny(svg) {
        rect(svg, 80, 45, 60, 110, "#e2e8f0", "#94a3b8", 3);
        rect(svg, 80, 70, 60, 5, "#94a3b8", "#94a3b8", 0);
        rect(svg, 128, 56, 6, 10, "#64748b", "#475569", 2);
        rect(svg, 128, 84, 6, 56, "#64748b", "#475569", 2);
    },
    tal(svg) {
        circle(svg, 110, 105, 45, "#fca5a5", "#f87171", 3);
        circle(svg, 110, 98, 35, "#fecaca", "#f87171", 2);
        rect(svg, 100, 130, 20, 10, "#e2e8f0", "#94a3b8", 2);
    },
    kapu(svg) {
        rect(svg, 60, 50, 8, 100, "#e2e8f0", "#94a3b8", 2);
        rect(svg, 152, 50, 8, 100, "#e2e8f0", "#94a3b8", 2);
        rect(svg, 60, 50, 100, 8, "#e2e8f0", "#94a3b8", 2);
        for (let x = 68; x < 160; x += 10) {
            rect(svg, x, 58, 2, 92, "#cbd5e1", "#cbd5e1", 0);
        }
        for (let y = 58; y < 150; y += 10) {
            rect(svg, 68, y, 92, 2, "#cbd5e1", "#cbd5e1", 0);
        }
    },
    lelato(svg) {
        polygon(svg, "60,150 160,150 166,134 74,134", "#f8fafc", "#94a3b8", 2);
        polygon(svg, "70,134 166,134 172,114 86,114", "#e2e8f0", "#94a3b8", 2);
        polygon(svg, "82,114 172,114 178,94 96,94", "#cbd5e1", "#94a3b8", 2);
    },
    labdatarto(svg) {
        rect(svg, 70, 45, 80, 80, "#f8fafc", "#94a3b8", 3);
        circle(svg, 92, 70, 10, "#ef4444", "#b91c1c", 2);
        circle(svg, 108, 78, 10, "#3b82f6", "#1d4ed8", 2);
        circle(svg, 124, 66, 10, "#f59e0b", "#b45309", 2);
        rect(svg, 70, 120, 80, 8, "#e2e8f0", "#94a3b8", 2);
    },
    ketrec(svg) {
        rect(svg, 60, 55, 100, 90, "#fef3c7", "#d97706", 3);
        rect(svg, 60, 55, 100, 8, "#b45309", "#b45309", 0);
        rect(svg, 60, 137, 100, 8, "#b45309", "#b45309", 0);
        for (let x = 64; x < 160; x += 12) {
            rect(svg, x, 63, 3, 74, "#b45309", "#b45309", 0);
        }
        rect(svg, 60, 55, 4, 90, "#b45309", "#b45309", 0);
        rect(svg, 156, 55, 4, 90, "#b45309", "#b45309", 0);
    },
    itato(svg) {
        rect(svg, 55, 100, 110, 24, "#93c5fd", "#2563eb", 3);
        rect(svg, 55, 100, 110, 8, "#bfdbfe", "#2563eb", 2);
        rect(svg, 50, 124, 120, 8, "#94a3b8", "#64748b", 2);
    },
    tavacska(svg) {
        svg.append(el("ellipse", { cx: 110, cy: 115, rx: 58, ry: 26, fill: "#93c5fd", stroke: "#2563eb", "stroke-width": 3 }));
        svg.append(el("ellipse", { cx: 98, cy: 110, rx: 14, ry: 8, fill: "#bfdbfe", stroke: "#2563eb", "stroke-width": 1 }));
        rect(svg, 48, 138, 124, 8, "#4ade80", "#16a34a", 2);
    },
    raketa(svg) {
        polygon(svg, "110,35 97,72 123,72", "#e2e8f0", "#64748b", 2);
        rect(svg, 97, 72, 26, 52, "#f8fafc", "#64748b", 3);
        circle(svg, 110, 92, 9, "#93c5fd", "#2563eb", 2);
        rect(svg, 97, 124, 26, 8, "#94a3b8", "#64748b", 2);
        polygon(svg, "97,132 84,150 97,142", "#ef4444", "#b91c1c", 2);
        polygon(svg, "123,132 136,150 123,142", "#ef4444", "#b91c1c", 2);
        polygon(svg, "108,132 112,132 110,150", "#f59e0b", "#b45309", 2);
    },
    allomas(svg) {
        rect(svg, 60, 70, 100, 18, "#e2e8f0", "#64748b", 3);
        rect(svg, 60, 88, 100, 8, "#94a3b8", "#64748b", 2);
        rect(svg, 70, 96, 80, 16, "#cbd5e1", "#64748b", 2);
        circle(svg, 100, 79, 5, "#93c5fd", "#2563eb", 2);
        for (let i = 0; i < 5; i++) {
            rect(svg, 62 + i * 19, 96, 16, 4, "#3b82f6", "#1d4ed8", 1);
        }
    },
    tartaly(svg) {
        rect(svg, 70, 55, 80, 90, "#e2e8f0", "#64748b", 3);
        rect(svg, 70, 55, 80, 10, "#94a3b8", "#64748b", 2);
        rect(svg, 85, 82, 50, 42, "#cbd5e1", "#64748b", 2);
        circle(svg, 128, 103, 3, "#334155", "#334155", 0);
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
