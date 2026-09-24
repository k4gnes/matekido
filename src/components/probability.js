import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "🎲 Biztos vagy benne? A postán",
    racing: "🏎️ Biztos vagy benne? A boxutcában",
    football: "⚽ Biztos vagy benne? A pályán",
    cooking: "🍳 Biztos vagy benne? A konyhában",
    animals: "🦁 Biztos vagy benne? Az állatkertben",
    space: "🤖 Biztos vagy benne? Az űrhajón",
    tram: "🚋 Biztos vagy benne? A villamoson"
};

export function renderProbability(step, root, next, progress, onResult, onAttempt) {

    const world = getActiveWorld();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = TITLES[world] ?? TITLES.postman;
    card.append(title);

    const event = document.createElement("p");
    event.className = "prob-event";
    event.textContent = `${step.emoji} ${step.text}`;
    card.append(event);

    const prompt = document.createElement("p");
    prompt.className = "prob-prompt";
    prompt.textContent = "Milyen valószínű ez az esemény?";
    card.append(prompt);

    const options = document.createElement("div");
    options.className = "prob-options";
    step.options.forEach((label, i) => {
        const btn = createButton(label, { className: "prob-option" });
        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;
            if (label === step.correctLabel) {
                markCorrect(btn);
                feedback.success(`😊 Igazad van! Ez ${step.correctLabel.toLowerCase()}!`);
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