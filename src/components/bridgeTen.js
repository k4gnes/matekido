import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";

const DECOMP_COLOR = "#e65100";
const TEN_COLOR = "#1565c0";

export function renderBridgeTen(step, root, onNext, progress, onResult, onAttempt) {
    root.innerHTML = "";

    const { a, b, steps, sum } = step;

    let current = 0;
    let mistakes = 0;
    let reported = false;

    const card = createCard("decomposition-card");

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = `🧩 ${a} + ${b} = ?`;
    card.append(title);

    const dotsWrap = document.createElement("div");
    dotsWrap.style.cssText = "display:flex; gap:.5rem; justify-content:center; margin:.2rem 0 .4rem;";
    const dots = steps.map(() => {
        const dot = document.createElement("span");
        dot.style.cssText = "width:12px;height:12px;border-radius:50%;background:#d0d7de;display:inline-block;";
        dotsWrap.append(dot);
        return dot;
    });
    card.append(dotsWrap);

    const stepsList = document.createElement("div");
    stepsList.style.cssText = "display:flex; flex-direction:column; gap:.6rem; margin:.8rem 0;";

    const message = createMessageBox();
    message.element.style.cssText = "font-size:1.05rem; font-weight:700; text-align:center; margin:.4rem 0 .2rem; min-height:1.5em;";

    card.append(stepsList, message.element);
    root.append(card);

    function updateDots() {
        dots.forEach((dot, i) => {
            dot.style.background = i < current ? "#2e7d32" : i === current ? TEN_COLOR : "#d0d7de";
        });
    }

    function fillQuestion(question, answer) {
        return question.replace("☐", String(answer));
    }

    function renderStep() {
        updateDots();
        const s = steps[current];

        const row = document.createElement("div");
        row.style.cssText = "display:flex; flex-direction:column; align-items:center; gap:.4rem; padding:.7rem; border-radius:12px; background:#f8fafc; border:2px solid #4F86F7;";

        const rowLabel = document.createElement("div");
        rowLabel.style.cssText = "font-size:.75rem; font-weight:900; color:#888; letter-spacing:.5px; text-transform:uppercase;";
        rowLabel.textContent = s.label;

        const q = document.createElement("div");
        q.style.cssText = "font-size:1.7rem; font-weight:bold; color:#1a1a2e;";
        q.textContent = s.question;

        const opts = document.createElement("div");
        opts.style.cssText = "display:flex; flex-wrap:wrap; gap:.6rem; justify-content:center;";

        const optBtns = [];
        s.options.forEach(value => {
            const btn = document.createElement("button");
            btn.style.cssText = "padding:.6rem 1.2rem; border:2px solid #4F86F7; border-radius:12px; background:#4F86F7; cursor:pointer; font-size:1.1rem; font-weight:bold; color:#fff; transition: transform .15s, border-color .15s;";
            btn.textContent = value;
            btn.addEventListener("mouseenter", () => { btn.style.transform = "scale(1.05)"; });
            btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
            btn.addEventListener("click", () => solve(btn, row, q, opts));
            opts.append(btn);
            optBtns.push(btn);
        });

        row.append(rowLabel, q, opts);
        stepsList.append(row);
    }

    function finish() {
        stepsList.style.display = "none";
        message.element.style.display = "none";

        const summary = document.createElement("div");
        summary.style.cssText = "text-align:center; font-size:2rem; font-weight:bold; margin:1.2rem 0 .6rem; color:#1a1a2e; display:flex; flex-wrap:wrap; gap:.4rem; align-items:center; justify-content:center;";

        const s1 = document.createElement("span");
        s1.textContent = `${a} + ${b} = `;

        const s2 = document.createElement("span");
        s2.textContent = `${a} + (${step.complement} + ${step.remainder})`;
        s2.style.color = DECOMP_COLOR;

        const s3 = document.createElement("span");
        s3.textContent = ` = ${sum}`;
        s3.style.color = "#2e7d32";

        summary.append(s1, s2, s3);

        const nextBtn = document.createElement("button");
        nextBtn.textContent = "➡️ Tovább";
        nextBtn.style.cssText = "padding:.6rem 1.5rem; font-size:1rem; border:2px solid #4a90d9; border-radius:12px; background:#4a90d9; color:white; cursor:pointer; margin-top:1rem;";
        nextBtn.addEventListener("click", () => onNext());

        card.append(summary, nextBtn);
        setTimeout(() => nextBtn.focus(), 0);
    }

    function solve(btn, row, q, opts) {
        if (btn.style.pointerEvents === "none") return;

        onAttempt?.();

        const s = steps[current];

        if (Number(btn.textContent) === s.answer) {
            btn.style.borderColor = "#2e7d32";
            btn.style.background = "#e8f5e9";
            btn.style.color = "#1a1a2e";
            opts.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");

            q.textContent = fillQuestion(s.question, s.answer);
            q.style.color = "#2e7d32";
            row.style.borderColor = "#2e7d32";

            const correct = document.createElement("span");
            correct.textContent = " ✅";
            q.append(correct);

            if (current < steps.length - 1) {
                message.show("🎉 Szuper! Következő lépés!", "success");
                current++;
                renderStep();
            } else {
                message.show("🎉 Kész!", "success");
                if (!reported) {
                    reported = true;
                    onResult?.(mistakes === 0);
                }
                finish();
            }
        } else {
            btn.style.borderColor = "#c62828";
            btn.style.background = "#ffebee";
            btn.style.color = "#1a1a2e";
            btn.style.pointerEvents = "none";
            btn.style.opacity = "0.4";

            mistakes++;
            if (!reported) {
                reported = true;
                onResult?.(false);
            }

            message.show("🤔 Ezt már felhasználtuk! Próbálj másik számot!", "retry");
        }
    }

    renderStep();
}