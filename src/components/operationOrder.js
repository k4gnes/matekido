import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "🧮 Műveleti sorrend a postán",
    racing: "🏎️ Műveleti sorrend a boxutcában",
    football: "⚽ Műveleti sorrend a pályán",
    cooking: "🍳 Műveleti sorrend a konyhában",
    animals: "🦁 Műveleti sorrend az állatkertben",
    space: "🤖 Műveleti sorrend az űrhajón",
    tram: "🚋 Műveleti sorrend a villamoson"
};

export function renderOperationOrder(step, root, next, progress, onResult, onAttempt) {

    const world = getActiveWorld();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = TITLES[world] ?? TITLES.postman;
    card.append(title);

    const prompt = document.createElement("p");
    prompt.className = "oo-prompt";
    prompt.textContent = "Számold ki! Figyelj a műveleti sorrendre!";
    card.append(prompt);

    const expression = document.createElement("div");
    expression.className = "oo-expression";
    expression.textContent = step.expression;
    card.append(expression);

    const options = document.createElement("div");
    options.className = "oo-options";
    step.options.forEach((value, i) => {
        const btn = createButton(String(value), { className: "oo-option" });
        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;
            if (value === step.answer) {
                markCorrect(btn);
                feedback.success(`😊 Nagyszerű! ${step.explanation}`);
            } else {
                feedback.retry();
            }
        });
        options.append(btn);
    });
    card.append(options);

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
}