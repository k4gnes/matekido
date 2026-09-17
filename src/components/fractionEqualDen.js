import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createButton } from "./ui/button.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";
import { createFractionSvg } from "./ui/fractionShapes.js";

const WORLD_EMOJI = {
    postman: "🍕",
    racing: "🔧",
    football: "⚽",
    cooking: "🍳",
    animals: "🦁",
    space: "🤖"
};

const MODE_QUESTION = {
    "compare-symbol": "Melyik jel a helyes a két tört között?",
    "compare-picture": "Melyik a nagyobb tört?",
    add: "Mennyi az összeg?",
    sub: "Mennyi a különbség?"
};

const MODE_EXPR = {
    "compare-symbol": (s, numA, numB) => `${numA}/${s.denominator} ▢ ${numB}/${s.denominator}`,
    "compare-picture": () => null,
    add: (s, numA, numB) => `${numA}/${s.denominator} + ${numB}/${s.denominator} = ❓/${s.denominator}`,
    sub: (s, numA, numB) => `${numA}/${s.denominator} − ${numB}/${s.denominator} = ❓/${s.denominator}`
};

function renderCSS(card) {
    const style = document.createElement("style");
    style.textContent = `
        .feq-prompt {
            font-size: 1.3rem;
            font-weight: 700;
            text-align: center;
            margin: 0.5rem 0 0.2rem;
            color: #475569;
        }
        .feq-expr {
            font-size: 2rem;
            font-weight: 800;
            text-align: center;
            margin: 0.6rem 0;
            color: #1e293b;
        }
        .feq-compare {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2rem;
            margin: 0.8rem 0;
        }
        .feq-slot {
            font-size: 2.4rem;
            font-weight: 800;
            color: #e2574c;
            text-align: center;
            min-width: 2.4rem;
        }
        .feq-options {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            margin: 0.8rem 0;
        }
        .feq-option {
            font-size: 1.6rem;
            font-weight: 800;
            color: #1e293b;
            background: #ffffff;
            border: 2px solid #cbd5e1;
            border-radius: 14px;
            padding: 0.5rem 1rem;
            cursor: pointer;
        }
        .feq-option:hover {
            transform: scale(1.05);
            border-color: #94a3b8;
        }
        .feq-ops-pics {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1.4rem;
            margin: 0.8rem 0 0.4rem;
        }
        .feq-op-sign {
            font-size: 2.2rem;
            font-weight: 800;
            color: #334155;
        }
        .feq-pic {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.2rem;
            border: 3px solid transparent;
            border-radius: 16px;
            padding: 0.4rem;
            background: #fff;
            cursor: pointer;
        }
        .feq-pic:hover {
            border-color: #94a3b8;
        }
        .feq-pic-label {
            font-size: 1.1rem;
            font-weight: 700;
            color: #334155;
        }
        .feq-item .fraction-svg {
            width: 170px;
            height: 132px;
        }
        .feq-answer {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.6rem;
            margin: 0.8rem 0;
        }
        .feq-answer-input {
            width: 5ch;
            height: 3.2rem;
            text-align: center;
            font-size: 2rem;
            font-weight: 700;
            border: 2px solid #cbd5e1;
            border-radius: 10px;
            background: #fff;
            color: #334155;
        }
        .feq-answer-input:focus {
            border-color: #38bdf8;
            outline: none;
        }
        .feq-answer-den {
            font-size: 2rem;
            font-weight: 800;
            color: #1e293b;
        }
    `;
    card.prepend(style);
}

export function renderFractionEqualDen(step, root, next, progress, onResult, onAttempt) {

    root.replaceChildren();

    const card = createCard();
    renderCSS(card);

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "🍕"} Azonos nevezőjű törtek`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "feq-prompt";
    prompt.textContent = MODE_QUESTION[step.mode] ?? "";
    card.append(prompt);

    const message = createMessageBox();
    card.append(message.element);

    root.append(card);

    const feedback = createFeedback({
        message,
        container: card,
        onNext: next,
        onResult,
        onAttempt
    });

    const pic = (numerator) => createFractionSvg({ kind: step.kind, total: step.denominator, filled: numerator });

    function success(text) {
        feedback.success(text ?? "🎉 Ügyes!");
    }

    function wrongFocus(target) {
        feedback.retry();
        if (target?.focus) {
            target.focus();
            target.select();
        }
    }

    if (step.mode === "compare-symbol") {
        const expr = document.createElement("div");
        expr.className = "feq-expr";
        expr.textContent = MODE_EXPR["compare-symbol"](step, step.numA, step.numB);
        card.append(expr);

        const options = document.createElement("div");
        options.className = "feq-options";
        [">", "<", "="].forEach(op => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "feq-option";
            btn.textContent = op;
            btn.dataset.op = op;
            btn.addEventListener("click", () => {
                if (feedback.isAnswered()) return;
                if (op === step.operator) {
                    markCorrect(btn);
                    success(`🎉 Ügyes! ${step.numA}/${step.denominator} ${op} ${step.numB}/${step.denominator}`);
                } else {
                    feedback.retry();
                }
            });
            options.append(btn);
        });
        card.append(options);

    } else if (step.mode === "compare-picture") {
        const isBigA = step.numA > step.numB;

        const row = document.createElement("div");
        row.className = "feq-compare";

        const makePicBtn = (numerator, correct, label) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "feq-pic";
            const box = document.createElement("div");
            box.className = "feq-item";
            box.append(pic(numerator));
            const lbl = document.createElement("div");
            lbl.className = "feq-pic-label";
            lbl.textContent = label;
            btn.append(box, lbl);
            btn.addEventListener("click", () => {
                if (feedback.isAnswered()) return;
                if (correct) {
                    markCorrect(btn);
                    success(`🎉 Ügyes! A ${numerator}/${step.denominator} a nagyobb.`);
                } else {
                    feedback.retry();
                }
            });
            return btn;
        };

        row.append(makePicBtn(step.numA, isBigA, `${step.numA}/${step.denominator}`));
        row.append(makePicBtn(step.numB, !isBigA, `${step.numB}/${step.denominator}`));
        card.append(row);

    } else {
        const row = document.createElement("div");
        row.className = "feq-ops-pics";

        const operand = (numerator) => {
            const box = document.createElement("div");
            box.className = "feq-item";
            box.append(pic(numerator));
            return box;
        };

        const sign = step.mode === "add" ? "+" : "−";

        row.append(operand(step.numA));
        const opSign = document.createElement("div");
        opSign.className = "feq-op-sign";
        opSign.textContent = sign;
        row.append(opSign);
        row.append(operand(step.numB));
        card.append(row);

        const expr = document.createElement("div");
        expr.className = "feq-expr";
        expr.textContent = MODE_EXPR[step.mode](step, step.numA, step.numB);
        card.append(expr);

        const answer = document.createElement("div");
        answer.className = "feq-answer";

        const input = document.createElement("input");
        input.type = "number";
        input.min = "0";
        input.className = "feq-answer-input";
        input.setAttribute("aria-label", "eredmény számlálója");

        const den = document.createElement("span");
        den.className = "feq-answer-den";
        den.textContent = `/ ${step.denominator}`;

        answer.append(input, den);
        card.append(answer);

        const button = createButton("Ellenőrzöm", { className: "nav-bar-btn" });

        function check() {
            if (feedback.isAnswered()) return;
            const v = input.value.trim();
            if (v === "") return;

            if (Number(v) === step.answer) {
                input.disabled = true;
                button.disabled = true;
                markCorrect(input);
                success(`🎉 Ügyes! ${step.numA}/${step.denominator} ${sign} ${step.numB}/${step.denominator} = ${step.answer}/${step.denominator}`);
            } else {
                wrongFocus(input);
            }
        }

        button.addEventListener("click", check);
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                check();
            }
        });

        card.append(button);

        requestAnimationFrame(() => input.focus());
    }
}