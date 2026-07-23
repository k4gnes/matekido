import { createCard } from "./ui/card.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_EMOJI = {
    postman: "✉️",
    racing: "🔧",
    football: "⚽",
    cooking: "🥄"
};

export function renderDecompositionFindWrong(step, root, onNext, progress, onResult, onAttempt) {

    root.innerHTML = "";

    const world = getActiveWorld();
    const emoji = WORLD_EMOJI[world] ?? "🍎";

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
        btn.style.cssText = "display:flex; flex-direction:column; align-items:center; gap:0.3rem; padding:0.8rem 1.2rem; border:2px solid #ccc; border-radius:12px; background:white; cursor:pointer; font-size:1.2rem; font-weight:bold; transition: transform .15s, border-color .15s;";

        const expr = document.createElement("span");
        expr.style.cssText = "color:#1a1a2e; font-size:1.2rem; font-weight:bold;";
        expr.textContent = `${a} + ${b}`;

        const emojiRow = document.createElement("span");
        emojiRow.style.cssText = "font-size:0.85rem; line-height:1.4; word-break:break-all; max-width:180px;";
        emojiRow.textContent = `${emoji.repeat(a)} ${emoji.repeat(b)}`;

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

                const star = document.createElement("span");
                star.textContent = " ⭐";
                expr.append(star);

                result.textContent = `🎉 Szuper! ${a} + ${b} = ${a + b}, nem ${number}!`;
                result.style.color = "#2e7d32";

                onResult?.(true);
            } else {
                btn.style.borderColor = "#c62828";
                btn.style.background = "#ffebee";

                const cross = document.createElement("span");
                cross.textContent = " ❌";
                expr.append(cross);

                optionsContainer.querySelectorAll("button").forEach(b => {
                    if (b !== btn) {
                        const bText = b.querySelector("span")?.textContent?.replace(/\s/g, "");
                        if (bText === wrongKey) {
                            b.style.borderColor = "#2e7d32";
                            b.style.background = "#e8f5e9";
                            const star = document.createElement("span");
                            star.textContent = " ⭐";
                            b.querySelector("span").append(star);
                        }
                    }
                });

                result.textContent = `🤔 Nem! ${a} + ${b} = ${a + b}, azaz ${number}. A rossz: ${wrongA} + ${wrongB} = ${wrongA + wrongB}`;
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
