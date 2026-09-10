import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";

const DECOMP_COLOR = "#e65100";
const TEN_COLOR = "#1565c0";

export function renderBridgeTen(step, root, onNext, progress, onResult, onAttempt) {
    root.innerHTML = "";

    const { a, b, complement, remainder, sum } = step;

    let mistakes = 0;
    let reported = false;
    let answered = false;

    const card = createCard("decomposition-card");

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = `🧩 ${a} + ${b} = ?`;

    const problemBox = document.createElement("div");
    problemBox.style.cssText = "display:flex; align-items:center; justify-content:center; gap:.6rem; margin:.3rem 0 .4rem; padding:.8rem 1rem; border-radius:14px; background:linear-gradient(135deg,#fff7e6,#ffe8cc); border:3px solid #f59e0b;";
    const problemInstr = document.createElement("span");
    problemInstr.style.cssText = "font-size:.85rem; font-weight:700; color:#b45309;";
    problemInstr.textContent = "Kiszámoljuk:";
    const problemExpr = document.createElement("span");
    problemExpr.style.cssText = "font-size:1.8rem; font-weight:900; color:#333;";
    const problemA = document.createElement("span");
    problemA.textContent = `${a}`;
    const problemPlus = document.createElement("span");
    problemPlus.textContent = " + ";
    const problemB = document.createElement("span");
    problemB.textContent = `${b}`;
    problemB.style.color = DECOMP_COLOR;
    const problemEq = document.createElement("span");
    problemEq.textContent = " = ?";

    title.style.cssText = "display:none";
    problemExpr.append(problemA, problemPlus, problemB, problemEq);
    problemBox.append(problemInstr, problemExpr);
    card.append(title, problemBox);

    const stepsList = document.createElement("div");
    stepsList.style.cssText = "display:flex; flex-direction:column; gap:.45rem; margin:.5rem 0;";

    const message = createMessageBox();
    message.element.style.cssText = "font-size:1.05rem; font-weight:700; text-align:center; margin:.4rem 0 .2rem; min-height:1.5em;";

    card.append(stepsList, message.element);
    root.append(card);

    function stepRow(label, question, color) {
        const row = document.createElement("div");
        row.style.cssText = "display:flex; flex-direction:column; align-items:center; gap:.25rem; padding:.45rem .6rem; border-radius:10px; background:#f8fafc; border:2px solid " + color + ";";

        const rowLabel = document.createElement("div");
        rowLabel.style.cssText = "font-size:.68rem; font-weight:900; color:" + color + "; letter-spacing:.5px; text-transform:uppercase;";
        rowLabel.textContent = label;

        const q = document.createElement("div");
        q.style.cssText = "font-size:1.15rem; font-weight:bold; color:#1a1a2e;";
        q.textContent = question;

        row.append(rowLabel, q);
        return row;
    }

    const row1 = stepRow("Pótold tízesre!", `${a} + ${complement} = 10`, "#4F86F7");
    const row2 = stepRow("Bontsd fel a többit!", `${b} = ${complement} + ${remainder}`, "#4F86F7");

    const divider = document.createElement("div");
    divider.style.cssText = "display:flex; align-items:center; gap:.5rem; margin:.35rem 0 0; color:#2e7d32; font-weight:900; font-size:.85rem;";
    const line = document.createElement("span");
    line.style.cssText = "flex:1; height:2px; background:#2e7d32;";
    const label = document.createElement("span");
    label.textContent = "🧮 Most adjuk össze!";
    const line2 = document.createElement("span");
    line2.style.cssText = "flex:1; height:2px; background:#2e7d32;";
    divider.append(line, label, line2);

    const row3 = stepRow("Add össze!", `10 + ${remainder} = ___`, "#2e7d32");

    const opts = document.createElement("div");
    opts.style.cssText = "display:flex; flex-wrap:wrap; gap:.4rem; justify-content:center;";

    const optionValues = step.steps[2].options;

    const optBtns = [];
    optionValues.forEach(value => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.style.cssText = "padding:.35rem .9rem; border:2px solid #2e7d32; border-radius:10px; background:#2e7d32; cursor:pointer; font-size:.95rem; font-weight:bold; color:#fff; transition: transform .15s, border-color .15s;";
        btn.textContent = value;
        btn.addEventListener("mouseenter", () => { btn.style.transform = "scale(1.05)"; });
        btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
        btn.addEventListener("click", () => solve(btn));
        opts.append(btn);
        optBtns.push(btn);
    });

    row3.append(opts);

    stepsList.append(row1, row2, divider, row3);

    function finish() {
        stepsList.style.display = "none";
        message.element.style.display = "none";

        const summary = document.createElement("div");
        summary.style.cssText = "text-align:center; font-size:2rem; font-weight:bold; margin:1.2rem 0 .6rem; color:#1a1a2e; display:flex; flex-wrap:wrap; gap:.4rem; align-items:center; justify-content:center;";

const s1 = document.createElement("span");
        s1.textContent = `${a} + `;

        const s2 = document.createElement("span");
        s2.textContent = `(${complement} + ${remainder})`;
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

    function solve(btn) {
        if (answered) return;

        const value = Number(btn.textContent);

        onAttempt?.();

        if (value === sum) {
            answered = true;
            btn.style.borderColor = "#2e7d32";
            btn.style.background = "#e8f5e9";
            btn.style.color = "#1a1a2e";
            opts.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");

            const q = row3.querySelector("div:nth-child(2)");
            q.textContent = `10 + ${remainder} = ${sum}`;
            q.style.color = "#2e7d32";

            const correct = document.createElement("span");
            correct.textContent = " ✅";
            q.append(correct);

            message.show("🎉 Kész!", "success");
            if (!reported) {
                reported = true;
                onResult?.(mistakes === 0);
            }
            finish();
        } else {
            mistakes++;
            if (!reported) {
                reported = true;
                onResult?.(false);
            }

            btn.style.borderColor = "#c62828";
            btn.style.background = "#ffebee";
            btn.style.color = "#1a1a2e";
            btn.style.opacity = "0.4";
            btn.style.pointerEvents = "none";
            message.show("🤔 Ez nem jó! Próbáld újra!", "retry");
        }
    }
}