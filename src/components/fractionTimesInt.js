import { renderFractionTimesIntHint } from "./hints/fractionTimesIntHint.js";
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
    whole: "Hány teljes adag lesz?",
    fraction: "Hány adag lesz összesen?"
};

const KIND_NOUN = {
    pizza: "pizza",
    torta: "torta szelet",
    csoki: "csokidarab",
    szendvics: "szendvics"
};

function answerText(step) {
    return step.mode === "whole"
        ? String(step.answer)
        : `${step.answerNum}/${step.answerDen}`;
}

function sign(text) {
    const el = document.createElement("div");
    el.className = "fti-sign";
    el.textContent = text;
    return el;
}

export function renderFractionTimesInt(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "🍕"} Törtek szorzása egész számmal`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "fti-prompt";
    prompt.textContent = QUESTION[step.mode] ?? "";
    card.append(prompt);

    const noun = KIND_NOUN[step.kind] ?? "adag";
    const caption = document.createElement("p");
    caption.className = "fti-caption";
    caption.textContent = `${step.factor} db ${step.num}/${step.den} ${noun}`;
    card.append(caption);

    const pics = document.createElement("div");
    pics.className = "fti-pics";
    for (let i = 0; i < step.factor; i++) {
        const svg = createFractionSvg({ kind: step.kind, total: step.den, filled: step.num });
        svg.classList.add("fti-pic");
        pics.append(svg);
    }
    card.append(pics);

    const row = document.createElement("div");
    row.className = "fti-row";
    row.append(
        renderFractionSymbol(step.num, step.den),
        sign("×"),
        sign(String(step.factor)),
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
            renderFractionTimesIntHint(step, hint);
            hintButton.style.display = "none";
        }
    });
    hintButton.style.display = "none";

    step.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";

        if (step.mode === "whole") {
            btn.className = "fraction-option";
            btn.textContent = String(opt.value);
        } else {
            btn.className = "fraction-option fraction-option-symbol";
            btn.append(renderFractionSymbol(opt.numerator, opt.denominator));
        }

        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;

            if (opt.correct) {
                markCorrect(btn);
                feedback.success(`🎉 Ügyes! ${step.num}/${step.den} × ${step.factor} = ${answerText(step)}. ${step.explanation}`);
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
