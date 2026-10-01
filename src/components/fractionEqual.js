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
    space: "🤖",
    tram: "🚋"
};

const PROMPT = {
    expand: "Bővítsd a törtet! Mennyi lesz a számláló?",
    simplify: "Egyszerűsítsd a törtet! Mennyi lesz a számláló?",
    compare: "Melyik jel a helyes a két tört között?"
};

function fractionBox(top, bottom) {
    const wrap = document.createElement("div");
    wrap.className = "frsym";

    const num = document.createElement("div");
    num.className = "frsym-num";
    num.append(top);

    const line = document.createElement("div");
    line.className = "frsym-line";

    const den = document.createElement("div");
    den.className = "frsym-den";
    den.append(String(bottom));

    wrap.append(num, line, den);
    return wrap;
}

function picture(kind, total, filled) {
    const svg = createFractionSvg({ kind, total, filled });
    svg.classList.add("fequal-pic");
    return svg;
}

export function renderFractionEqual(step, root, next, progress, onResult, onAttempt) {

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "🍕"} Egyenlő törtek`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "fequal-prompt";
    prompt.textContent = PROMPT[step.mode] ?? "";
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

    if (step.mode === "compare") {
        const pics = document.createElement("div");
        pics.className = "fequal-pics";
        pics.append(picture(step.kind, step.denA, step.numA));
        pics.append(picture(step.kind, step.denB, step.numB));
        card.append(pics);

        const row = document.createElement("div");
        row.className = "fequal-row";

        const slot = document.createElement("div");
        slot.className = "fequal-sign";
        slot.textContent = "▢";

        row.append(fractionBox(step.numA, step.denA), slot, fractionBox(step.numB, step.denB));
        card.append(row);

        const options = document.createElement("div");
        options.className = "fequal-options";

        [">", "<", "="].forEach(op => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "fequal-option";
            btn.textContent = op;
            btn.addEventListener("click", () => {
                if (feedback.isAnswered()) return;
                if (op === step.operator) {
                    markCorrect(btn);
                    feedback.success(`🎉 Ügyes! ${step.numA}/${step.denA} ${op} ${step.numB}/${step.denB}. ${step.explanation}.`);
                } else {
                    feedback.retry();
                }
            });
            options.append(btn);
        });

        card.append(options);
        return;
    }

    const pics = document.createElement("div");
    pics.className = "fequal-pics";
    pics.append(picture(step.kind, step.den, step.num));
    card.append(pics);

    const row = document.createElement("div");
    row.className = "fequal-row";

    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.className = "fequal-input";
    input.setAttribute("aria-label", "számláló");

    row.append(fractionBox(step.num, step.den), sign("="), fractionBox(input, step.targetDen));
    card.append(row);

    const button = createButton("Ellenőrzöm", { className: "nav-bar-btn" });

    function check() {
        if (feedback.isAnswered()) return;
        const value = input.value.trim();
        if (value === "") return;

        if (Number(value) === step.answer) {
            input.disabled = true;
            button.disabled = true;
            markCorrect(input);
            const equalText = `${step.num}/${step.den} = ${step.answer}/${step.targetDen}`;
            feedback.success(`🎉 Ügyes! ${equalText}. ${step.explanation}.`);
        } else {
            feedback.retry();
            input.focus();
            input.select();
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

function sign(text) {
    const el = document.createElement("div");
    el.className = "fequal-sign";
    el.textContent = text;
    return el;
}