import { renderFractionCommonDenHint } from "./hints/fractionCommonDenHint.js";
import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createHintBox } from "./ui/hintBox.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";
import { createFractionSvg, renderFractionSymbol } from "./ui/fractionShapes.js";

const WORLD_EMOJI = {
    postman: "🍕",
    racing: "🔧",
    football: "⚽",
    cooking: "🍳",
    animals: "🦁",
    space: "🤖",
    tram: "🚋"
};

const QUESTION = {
    add: "Mennyi az összeg?",
    sub: "Mennyi a különbség?"
};

function operand(kind, numerator, denominator) {
    const svg = createFractionSvg({ kind, total: denominator, filled: numerator });
    svg.classList.add("fcd-pic");
    return svg;
}

function sign(text) {
    const el = document.createElement("div");
    el.className = "fcd-sign";
    el.textContent = text;
    return el;
}

export function renderFractionCommonDen(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "🍕"} Különböző nevezőjű törtek`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "fcd-prompt";
    prompt.textContent = QUESTION[step.mode] ?? "";
    card.append(prompt);

    const pics = document.createElement("div");
    pics.className = "fcd-pics";
    pics.append(operand(step.kind, step.numA, step.denA));
    pics.append(operand(step.kind, step.numB, step.denB));
    card.append(pics);

    const row = document.createElement("div");
    row.className = "fcd-row";
    row.append(
        renderFractionSymbol(step.numA, step.denA),
        sign(step.operator),
        renderFractionSymbol(step.numB, step.denB),
        sign("="),
        sign("▢")
    );
    card.append(row);

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

    const options = document.createElement("div");
    options.className = "fraction-options";

    const hint = createHintBox();

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            renderFractionCommonDenHint(step, hint);
            hintButton.style.display = "none";
        }
    });
    hintButton.style.display = "none";

    step.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "fraction-option fraction-option-symbol";
        btn.append(renderFractionSymbol(opt.numerator, opt.denominator));

        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;

            if (opt.correct) {
                markCorrect(btn);
                feedback.success(`🎉 Ügyes! ${step.numA}/${step.denA} ${step.operator} ${step.numB}/${step.denB} = ${opt.numerator}/${opt.denominator}. ${step.explanation}.`);
            } else {
                feedback.retry();

                if (feedback.getMistakes() >= 2 && !hintShown) {
                    hintButton.style.display = "inline-block";
                }
            }
        });

        options.append(btn);
    });

    card.append(options, hintButton, hint);
}