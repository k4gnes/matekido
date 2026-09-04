import { createCard } from "./ui/card.js";

const DECOMP_COLOR = "#e65100";
const TEN_COLOR = "#1565c0";
const RESULT_COLOR = "#6a1b9a";

export function renderBridgeTen(step, root, onNext, progress, onResult, onAttempt) {
    root.innerHTML = "";

    const { a, b, complement, remainder, sum, options } = step;

    let decompPicked = false;
    let reported = false;

    const card = createCard("decomposition-card");

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = `🧩 ${a} + ${b} = ?`;

    const eqWrap = document.createElement("div");
    eqWrap.style.cssText = "text-align:center; margin:0.5rem 0;";

    const equation = document.createElement("div");
    equation.style.cssText = "font-size:2rem; font-weight:bold; color:#1a1a2e; display:inline-flex; flex-wrap:wrap; gap:0.3rem; align-items:center; justify-content:center;";

    const aSpan = document.createElement("span");
    aSpan.textContent = `${a} +`;

    const bSpan = document.createElement("span");
    bSpan.textContent = b;
    bSpan.style.color = DECOMP_COLOR;

    const eq1 = document.createElement("span");
    eq1.textContent = "=";

    const tenBlock = document.createElement("span");
    tenBlock.style.cssText = "position:relative; display:inline-block;";

    const tenLabel = document.createElement("span");
    tenLabel.style.cssText = `position:absolute; bottom:100%; left:50%; transform:translateX(-50%); font-size:.75rem; color:${TEN_COLOR}; font-weight:900; letter-spacing:.5px; line-height:1; white-space:nowrap;`;
    tenLabel.textContent = "= 10";

    const tenRow = document.createElement("span");
    tenRow.style.cssText = "display:inline;";

    const tenA = document.createElement("span");
    tenA.textContent = `${a} + `;

    const openParen = document.createElement("span");
    openParen.textContent = "(";
    openParen.style.color = DECOMP_COLOR;

    const q1 = document.createElement("span");
    q1.textContent = " ?";
    q1.style.color = DECOMP_COLOR;

    tenRow.append(tenA, openParen, q1);

    const underline = document.createElement("span");
    underline.style.cssText = `position:absolute; top:100%; left:0; right:0; height:3px; background:${TEN_COLOR};`;

    tenBlock.append(tenLabel, tenRow, underline);

    const decompRest = document.createElement("span");
    decompRest.style.color = DECOMP_COLOR;
    decompRest.textContent = "+ ? )";

    const eq2 = document.createElement("span");
    eq2.textContent = "= ?";

    equation.append(aSpan, bSpan, eq1, tenBlock, decompRest, eq2);
    eqWrap.append(equation);

    const optsContainer = document.createElement("div");
    optsContainer.style.cssText = "display:flex; flex-wrap:wrap; gap:0.6rem; justify-content:center; margin:1rem 0;";

    const message = document.createElement("div");
    message.style.cssText = "font-size:1.1rem; font-weight:bold; text-align:center; margin:0.5rem 0; min-height:1.5em;";

    options.forEach(opt => {
        const [x, y] = opt.text.split("+").map(Number);
        const btn = document.createElement("button");
        btn.style.cssText = "padding:0.6rem 1.2rem; border:2px solid #4F86F7; border-radius:12px; background:#4F86F7; cursor:pointer; font-size:1.1rem; font-weight:bold; color:#fff; transition: transform .15s, border-color .15s;";
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
                btn.style.color = "#1a1a2e";
                message.textContent = "🎉 Jó bontás!";
                message.style.color = "#2e7d32";

                equation.innerHTML = "";
                equation.style.cssText = "font-size:2rem; font-weight:bold; text-align:center; margin:0.5rem 0; color:#1a1a2e; display:flex; flex-wrap:wrap; gap:0.4rem; align-items:center; justify-content:center;";

                const r1 = document.createElement("span");
                r1.textContent = `${a} + ${b} = `;
                const r2 = document.createElement("span");
                r2.textContent = `(${a} + ${complement})`;
                r2.style.cssText = `color:${RESULT_COLOR}; font-weight:bold;`;
                const r3 = document.createElement("span");
                r3.textContent = ` + ${remainder} = `;
                const r4 = document.createElement("span");
                r4.textContent = sum;
                r4.style.cssText = "color:#2e7d32; font-weight:bold;";
                equation.append(r1, r2, r3, r4);

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
                btn.style.borderColor = "#c62828";
                btn.style.background = "#ffebee";
                btn.style.color = "#1a1a2e";
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

    card.append(title, eqWrap, optsContainer, message);
    root.append(card);
}
