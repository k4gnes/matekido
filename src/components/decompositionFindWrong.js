import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_EMOJI = {
    postman: null,
    racing: "🔧",
    football: "⚽",
    cooking: "🥄",
    animals: "🦁",
    space: "🤖",
    tram: "🚋"
};

function createEnvelopeSVG() {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 64 48");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "18");

    const rect = document.createElementNS(ns, "rect");
    rect.setAttribute("x", "2");
    rect.setAttribute("y", "2");
    rect.setAttribute("width", "60");
    rect.setAttribute("height", "44");
    rect.setAttribute("rx", "5");
    rect.setAttribute("fill", "#ffffff");
    rect.setAttribute("stroke", "#64748b");
    rect.setAttribute("stroke-width", "2");

    const flap = document.createElementNS(ns, "polyline");
    flap.setAttribute("points", "2,4 32,25 62,4");
    flap.setAttribute("fill", "none");
    flap.setAttribute("stroke", "#64748b");
    flap.setAttribute("stroke-width", "2");

    const stamp = document.createElementNS(ns, "rect");
    stamp.setAttribute("x", "43");
    stamp.setAttribute("y", "5");
    stamp.setAttribute("width", "16");
    stamp.setAttribute("height", "16");
    stamp.setAttribute("rx", "2");
    stamp.setAttribute("fill", "#ef4444");
    stamp.setAttribute("stroke", "#b91c1c");
    stamp.setAttribute("stroke-width", "1");

    const stampText = document.createElementNS(ns, "text");
    stampText.setAttribute("x", "51");
    stampText.setAttribute("y", "17");
    stampText.setAttribute("text-anchor", "middle");
    stampText.setAttribute("font-family", "Arial, sans-serif");
    stampText.setAttribute("font-size", "11");
    stampText.setAttribute("font-weight", "bold");
    stampText.setAttribute("fill", "white");
    stampText.textContent = "M";

    svg.append(rect, flap, stamp, stampText);
    return svg;
}

export function renderDecompositionFindWrong(step, root, onNext, progress, onResult, onAttempt) {

    root.innerHTML = "";

    const world = getActiveWorld();
    const emoji = WORLD_EMOJI[world] !== undefined ? WORLD_EMOJI[world] : "🍎";

    const number = step.number ?? Math.floor(Math.random() * 10) + 1;

    const correct = new Set();
    for (let i = 0; i <= number; i++) {
        correct.add(`${i}+${number - i}`);
    }

    let wrongA, wrongB;
    do {
        wrongA = Math.floor(Math.random() * (number + 2));
        wrongB = Math.floor(Math.random() * (number + 2));
    } while (wrongA + wrongB === number || wrongA + wrongB > number + 3 || wrongA + wrongB < 0);

    const wrongKey = `${wrongA}+${wrongB}`;

    const correctKeys = [];
    const pool = [...correct];
    const maxCorrect = Math.min(4, pool.length);
    while (correctKeys.length < maxCorrect) {
        const idx = Math.floor(Math.random() * pool.length);
        correctKeys.push(pool.splice(idx, 1)[0]);
    }

    const options = [...correctKeys, wrongKey];
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }

    const card = createCard("decomposition-card");

    if (progress) {
        card.append(progress);
    }

    const titleElement = document.createElement("h1");
    titleElement.textContent = `🧩 Melyik összeg nem ${number}?`;

    const optionsContainer = document.createElement("div");
    optionsContainer.style.cssText = "display:flex; flex-wrap:wrap; gap:0.6rem; justify-content:center; margin:1rem 0;";

    const result = createMessageBox();

    card.append(titleElement, optionsContainer, result.element);
    root.append(card);

    const feedback = createFeedback({
        message: result,
        container: card,
        onNext,
        onResult,
        onAttempt
    });

    options.forEach(opt => {
        const [a, b] = opt.split("+").map(Number);
        const isWrong = opt === wrongKey;

        const btn = document.createElement("button");
        btn.style.cssText = "display:flex; flex-direction:column; align-items:center; gap:0.3rem; padding:0.8rem 1.2rem; border:2px solid #4F86F7; border-radius:12px; background:#4F86F7; cursor:pointer; font-size:1.2rem; font-weight:bold; color:#fff; transition: transform .15s, border-color .15s;";

        const expr = document.createElement("span");
        expr.style.cssText = "color:inherit; font-size:1.2rem; font-weight:bold;";
        expr.textContent = `${a} + ${b}`;

        const emojiRow = document.createElement("span");
        emojiRow.style.cssText = "display:flex; flex-wrap:wrap; gap:2px; align-items:center; justify-content:center; max-width:200px;";

        if (emoji) {
            emojiRow.style.fontSize = "0.85rem";
            emojiRow.style.lineHeight = "1.4";
            const appendChip = (count) => {
                for (let i = 0; i < count; i++) {
                    const chip = document.createElement("span");
                    chip.style.cssText = "display:inline-flex; align-items:center; justify-content:center; background:#fff; border-radius:6px; padding:2px; line-height:1;";
                    chip.textContent = emoji;
                    emojiRow.append(chip);
                }
            };
            appendChip(a);
            const spacer = document.createElement("span");
            spacer.style.width = "4px";
            emojiRow.append(spacer);
            appendChip(b);
        } else {
            for (let i = 0; i < a; i++) emojiRow.append(createEnvelopeSVG());
            const spacer = document.createElement("span");
            spacer.textContent = " ";
            emojiRow.append(spacer);
            for (let i = 0; i < b; i++) emojiRow.append(createEnvelopeSVG());
        }

        btn.append(expr, emojiRow);

        btn.addEventListener("mouseenter", () => {
            if (!feedback.isAnswered()) btn.style.transform = "scale(1.05)";
        });
        btn.addEventListener("mouseleave", () => {
            if (!feedback.isAnswered()) btn.style.transform = "";
        });

        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;

            optionsContainer.querySelectorAll("button").forEach(b => {
                b.style.pointerEvents = "none";
            });

            if (isWrong) {
                btn.style.borderColor = "#2e7d32";
                btn.style.background = "#e8f5e9";
                btn.style.color = "#1a1a2e";

                const star = document.createElement("span");
                star.textContent = " ⭐";
                expr.append(star);

                feedback.success(`🎉 Szuper! ${a} + ${b} = ${a + b}, nem ${number}!`);
            } else {
                btn.style.borderColor = "#c62828";
                btn.style.background = "#ffebee";
                btn.style.color = "#1a1a2e";

                const cross = document.createElement("span");
                cross.textContent = " ❌";
                expr.append(cross);

                optionsContainer.querySelectorAll("button").forEach(b => {
                    if (b !== btn) {
                        const bText = b.querySelector("span")?.textContent?.replace(/\s/g, "");
                        if (bText === wrongKey) {
                            b.style.borderColor = "#2e7d32";
                            b.style.background = "#e8f5e9";
                            b.style.color = "#1a1a2e";
                            const star = document.createElement("span");
                            star.textContent = " ⭐";
                            b.querySelector("span").append(star);
                        }
                    }
                });

                feedback.reveal(`🤔 Nem! ${a} + ${b} = ${a + b}, azaz ${number}. A kakukktojás: ${wrongA} + ${wrongB} = ${wrongA + wrongB}`);
            }
        });

        optionsContainer.append(btn);
    });
}
