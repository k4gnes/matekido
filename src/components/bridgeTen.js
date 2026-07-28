import { createCard } from "./ui/card.js";
import { createNumberInput } from "./ui/numberInput.js";

export function renderBridgeTen(step, root, onNext, progress, onResult, onAttempt) {
    root.innerHTML = "";

    const { a, b, complement, remainder, sum, options } = step;

    let decompPicked = false;
    let answered = false;
    let reported = false;

    const card = createCard("decomposition-card");

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = `🧩 ${a} + ${b} = ?`;

    const equation = document.createElement("div");
    equation.style.cssText = "font-size:2rem; font-weight:bold; text-align:center; margin:0.5rem 0; color:#1a1a2e;";
    equation.textContent = `${a} + ${b} = ${a} + ( ? + ? )`;

    const optsContainer = document.createElement("div");
    optsContainer.style.cssText = "display:flex; flex-wrap:wrap; gap:0.6rem; justify-content:center; margin:1rem 0;";

    const message = document.createElement("div");
    message.style.cssText = "font-size:1.1rem; font-weight:bold; text-align:center; margin:0.5rem 0; min-height:1.5em;";

    options.forEach(opt => {
        const [x, y] = opt.text.split("+").map(Number);
        const btn = document.createElement("button");
        btn.style.cssText = "padding:0.6rem 1.2rem; border:2px solid #ccc; border-radius:12px; background:white; cursor:pointer; font-size:1.1rem; font-weight:bold; color:#1a1a2e; transition: transform .15s, border-color .15s;";
        btn.textContent = `${x} + ${y}`;

        btn.addEventListener("mouseenter", () => {
            if (!decompPicked) btn.style.transform = "scale(1.05)";
        });
        btn.addEventListener("mouseleave", () => {
            if (!decompPicked) btn.style.transform = "";
        });

        btn.addEventListener("click", () => {
            if (decompPicked) return;
            decompPicked = true;

            onAttempt?.();

            optsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");

            if (opt.correct) {
                btn.style.borderColor = "#2e7d32";
                btn.style.background = "#e8f5e9";
                message.textContent = "🎉 Jó bontás! Mennyi az összeg?";
                message.style.color = "#2e7d32";

                equation.innerHTML = "";
                equation.style.cssText = "font-size:2rem; font-weight:bold; text-align:center; margin:0.5rem 0; color:#1a1a2e; display:flex; flex-wrap:wrap; gap:0.4rem; align-items:center; justify-content:center;";

                const eqSpan = document.createElement("span");
                eqSpan.textContent = `${a} + ${b} = ${a} + ${complement} + ${remainder} = 10 + ${remainder} =`;
                equation.append(eqSpan);

                const input = createNumberInput();
                input.style.cssText = "width:5rem; padding:0.4rem; font-size:2rem; text-align:center; border:2px solid #ccc; border-radius:12px; outline:none;";
                equation.append(input);

                const checkBtn = document.createElement("button");
                checkBtn.textContent = "✅ Ellenőrzöm";
                checkBtn.style.cssText = "padding:0.6rem 1.5rem; font-size:1rem; border:2px solid #4a90d9; border-radius:12px; background:#4a90d9; color:white; cursor:pointer;";

                const bottomRow = document.createElement("div");
                bottomRow.style.cssText = "display:flex; flex-wrap:wrap; gap:0.6rem; align-items:center; justify-content:center; margin:0.5rem 0;";
                bottomRow.append(checkBtn);
                card.append(bottomRow);

                function checkSum() {
                    if (answered) return;
                    const val = Number(input.value);
                    if (val === sum) {
                        answered = true;
                        input.disabled = true;
                        checkBtn.disabled = true;
                        eqSpan.textContent = `${a} + ${b} = ${a} + ${complement} + ${remainder} = 10 + ${remainder} = ${sum}`;
                        input.style.display = "none";
                        message.textContent = `😊 Szuper!`;
                        message.style.color = "#2e7d32";

                        if (!reported) {
                            reported = true;
                            onResult?.(true);
                        }

                        const nextBtn = document.createElement("button");
                        nextBtn.textContent = "➡️ Tovább";
                        nextBtn.style.cssText = "padding:0.6rem 1.5rem; font-size:1rem; border:2px solid #4a90d9; border-radius:12px; background:#4a90d9; color:white; cursor:pointer; margin-top:1rem;";
                        nextBtn.addEventListener("click", () => onNext());
                        card.append(nextBtn);
                    } else {
                        message.textContent = `🤔 Nem, ${a} + ${b} = ${sum}. Próbáld újra!`;
                        message.style.color = "#c62828";
                        if (!reported) {
                            reported = true;
                            onResult?.(false);
                        }
                        input.focus();
                        input.select();
                    }
                }

                checkBtn.addEventListener("click", checkSum);
                input.addEventListener("keydown", (e) => {
                    if (e.key === "Enter") checkSum();
                });

                requestAnimationFrame(() => input.focus());
            } else {
                btn.style.borderColor = "#c62828";
                btn.style.background = "#ffebee";
                message.textContent = "🤔 Ez nem jó bontás!";
                message.style.color = "#c62828";

                if (!reported) {
                    reported = true;
                    onResult?.(false);
                }

                setTimeout(() => {
                    decompPicked = false;
                    optsContainer.querySelectorAll("button").forEach(b => {
                        b.style.pointerEvents = "";
                        if (b !== btn) b.style.opacity = "";
                    });
                    btn.style.pointerEvents = "none";
                    btn.style.opacity = "0.4";
                    message.textContent = "Próbáld másik bontást!";
                    message.style.color = "#888";
                }, 1000);
            }
        });

        optsContainer.append(btn);
    });

    card.append(title, equation, optsContainer, message);
    root.append(card);
}
