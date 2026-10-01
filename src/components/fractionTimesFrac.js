import { renderFractionTimesFracHint } from "./hints/fractionTimesFracHint.js";
import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createHintBox } from "./ui/hintBox.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";
import { createAreaModel } from "./ui/areaModel.js";
import { renderFractionSymbol } from "./ui/fractionShapes.js";

const WORLD_EMOJI = {
    postman: "🍕",
    racing: "🔧",
    football: "⚽",
    cooking: "🍳",
    animals: "🦁",
    space: "🤖",
    tram: "🚋"
};

const PROMPT = "Mennyi az eredmény?";

function sign(text) {
    const el = document.createElement("div");
    el.className = "ftf-sign";
    el.textContent = text;
    return el;
}

export function renderFractionTimesFrac(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "🍕"} Törtek szorzása törttel`;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "ftf-prompt";
    prompt.textContent = PROMPT;
    card.append(prompt);

    const caption = document.createElement("p");
    caption.className = "ftf-caption";
    caption.textContent = `Az első ${step.numA} sorból ${step.denA}-féle és az első ${step.numB} oszlopból ${step.denB}-féle részlet találkozik: ${step.rawNum} rész a ${step.rawDen} részből.`;
    card.append(caption);

    card.append(createAreaModel({
        rows: step.denA,
        cols: step.denB,
        filledRows: step.numA,
        filledCols: step.numB
    }));

    const row = document.createElement("div");
    row.className = "ftf-row";
    row.append(
        renderFractionSymbol(step.numA, step.denA),
        sign("×"),
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
            renderFractionTimesFracHint(step, hint);
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
                feedback.success(`🎉 Ügyes! ${step.numA}/${step.denA} × ${step.numB}/${step.denB} = ${opt.numerator}/${opt.denominator}. ${step.explanation}`);
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
