import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { createButton } from "./ui/button.js";
import { createHintBox } from "./ui/hintBox.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "📏 Hosszúságok a postán",
    racing: "🏎️ Távolságok a pályán",
    football: "⚽ Hosszúságok a pályán",
    cooking: "🍳 Hosszúságok a konyhában",
    animals: "🦁 Hosszúságok az állatkertben",
    space: "🛰️ Távolságok az űrben"
};

export function renderLengthUnits(step, root, next, progress, onResult, onAttempt) {

    const ac = new AbortController();
    const world = getActiveWorld();

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = TITLES[world] ?? TITLES.postman;
    card.append(title);

    const figure = document.createElement("div");
    figure.className = "lu-figure";
    figure.textContent = step.emoji;
    card.append(figure);

    const statement = document.createElement("div");
    statement.className = "lu-statement";
    statement.innerHTML = `
        <span>${step.name}</span>
        <span class="lu-number">${step.number}</span>
        <span class="lu-blank">___</span>
    `;
    card.append(statement);

    const prompt = document.createElement("p");
    prompt.className = "lu-prompt";
    prompt.textContent = "Melyik mértékegység illik a számhoz?";
    card.append(prompt);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "lu-options";

    step.options.forEach((option, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "lu-option";
        btn.dataset.value = index;
        btn.textContent = String(option);
        optionsContainer.append(btn);
    });

    card.append(optionsContainer);

    const hint = createHintBox();

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            if (step.hint) {
                hint.textContent = step.hint;
            }
            hintButton.style.display = "none";
        }
    });
    hintButton.style.display = "none";

    card.append(hintButton, hint);

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

    function checkAnswer(isCorrect) {
        if (feedback.isAnswered()) return;

        if (isCorrect) {
            optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");

            feedback.success(`😊 Ügyes! ${step.name}: ${step.number} ${step.unit}.`);
        } else {
            feedback.retry();

            if (feedback.getMistakes() >= 2 && !hintShown) {
                hintButton.style.display = "inline-block";
            }
        }
    }

    optionsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".lu-option");
        if (!btn || feedback.isAnswered()) return;

        const ok = Number(btn.dataset.value) === step.answer;

        if (ok) markCorrect(btn);

        checkAnswer(ok);
    }, { signal: ac.signal });
}