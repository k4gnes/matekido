import { renderFractionDivideHint } from "./hints/fractionDivideHint.js";
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

const KIND_NOUN = {
    pizza: "pizza",
    torta: "torta szelet",
    csoki: "csokidarab",
    szendvics: "szendvics"
};

const QUESTION = {
    whole: "Hány adag jut egy részre?",
    fraction: "Hány adag jut egy részre?"
};

function sign(text) {
    const el = document.createElement("div");
    el.className = "fdv-sign";
    el.textContent = text;
    return el;
}

export function renderFractionDivide(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "🍕"} Törtek osztása`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "fdv-prompt";
    prompt.textContent = QUESTION[step.mode] ?? "";
    card.append(prompt);

    const noun = KIND_NOUN[step.kind] ?? "adag";

    if (step.mode === "whole") {
        const caption = document.createElement("p");
        caption.className = "fdv-caption";
        caption.textContent = `A teljes ${noun} ${step.divisor} egyforma részre osztva – egy rész a válasz.`;
        card.append(caption);

        const pics = document.createElement("div");
        pics.className = "fdv-pics";
        for (let i = 0; i < step.divisor; i++) {
            const svg = createFractionSvg({ kind: step.kind, total: step.divisor, filled: 1 });
            svg.classList.add("fdv-pic");
            pics.append(svg);
        }
        card.append(pics);
    } else {
        const caption = document.createElement("p");
        caption.className = "fdv-caption";
        caption.textContent = `A ${step.numB}/${step.denB} az egy adag ${step.denB}-ed része, és a ${step.denB}/${step.numB}-szorosa.`;
        card.append(caption);

        const pics = document.createElement("div");
        pics.className = "fdv-pics";
        const svg = createFractionSvg({ kind: step.kind, total: step.denA, filled: step.numA });
        svg.classList.add("fdv-pic");
        pics.append(svg);
        card.append(pics);
    }

    const row = document.createElement("div");
    row.className = "fdv-row";

    if (step.mode === "whole") {
        row.append(
            renderFractionSymbol(step.num, step.den),
            sign("÷"),
            sign(String(step.divisor)),
            sign("="),
            sign("▢")
        );
    } else {
        row.append(
            renderFractionSymbol(step.numA, step.denA),
            sign("÷"),
            renderFractionSymbol(step.numB, step.denB),
            sign("="),
            sign("▢")
        );
    }
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
            renderFractionDivideHint(step, hint);
            hintButton.style.display = "none";
        }
    });
    hintButton.style.display = "none";

    const problemText = step.mode === "whole"
        ? `${step.num}/${step.den} ÷ ${step.divisor}`
        : `${step.numA}/${step.denA} ÷ ${step.numB}/${step.denB}`;

    step.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "fraction-option fraction-option-symbol";
        btn.append(renderFractionSymbol(opt.numerator, opt.denominator));

        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;

            if (opt.correct) {
                markCorrect(btn);
                feedback.success(`🎉 Ügyes! ${problemText} = ${opt.numerator}/${opt.denominator}. ${step.explanation}`);
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