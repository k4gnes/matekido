import { createCard } from "./ui/card.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_EMOJI = {
    postman: null,
    racing: "🔧",
    football: "⚽",
    cooking: "🥄",
    animals: "🦁",
    space: "🤖"
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

    let answered = false;

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
            emojiRow.style.wordBreak = "break-all";
            emojiRow.textContent = `${emoji.repeat(a)} ${emoji.repeat(b)}`;
        } else {
            for (let i = 0; i < a; i++) emojiRow.append(createEnvelopeSVG());
            const spacer = document.createElement("span");
            spacer.textContent = " ";
            emojiRow.append(spacer);
            for (let i = 0; i < b; i++) emojiRow.append(createEnvelopeSVG());
        }

        btn.append(expr, emojiRow);

        btn.addEventListener("mouseenter", () => {
            if (!answered) btn.style.transform = "scale(1.05)";
        });
        btn.addEventListener("mouseleave", () => {
            if (!answered) btn.style.transform = "";
        });

        btn.addEventListener("click", () => {
            if (answered) return;
            answered = true;

            onAttempt?.();

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

                result.textContent = `🎉 Szuper! ${a} + ${b} = ${a + b}, nem ${number}!`;
                result.style.color = "#2e7d32";

                onResult?.(true);
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

                result.textContent = `🤔 Nem! ${a} + ${b} = ${a + b}, azaz ${number}. A kakukktojás: ${wrongA} + ${wrongB} = ${wrongA + wrongB}`;
                result.style.color = "#c62828";

                onResult?.(false);
            }

            const nextBtn = document.createElement("button");
            nextBtn.textContent = "➡️ Tovább";
            nextBtn.style.cssText = "padding:0.6rem 1.5rem; font-size:1rem; border:2px solid #4a90d9; border-radius:12px; background:#4a90d9; color:white; cursor:pointer; margin-top:1rem;";
            nextBtn.addEventListener("click", () => onNext());
            card.append(nextBtn);
        });

        optionsContainer.append(btn);
    });

    const result = document.createElement("div");
    result.style.cssText = "font-size:1.3rem; font-weight:bold; margin:1rem 0; min-height:1.5em;";

    card.append(titleElement, optionsContainer, result);
    root.append(card);

}
