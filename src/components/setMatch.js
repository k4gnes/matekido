import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";
import { createShapeSvg } from "./ui/shapeSvg.js";

const TITLES = {
    postman: "🧺 Halmazok és válogatás",
    racing: "🏎️ Válogatás a boxutcában",
    football: "⚽ Válogatás a pályán",
    cooking: "🍳 Válogatás a konyhában",
    animals: "🦁 Válogatás az állatkertben",
    space: "🤖 Válogatás az űrhajón"
};

export function renderSetMatch(step, root, next, progress, onResult, onAttempt) {

    const ac = new AbortController();
    const world = getActiveWorld();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = TITLES[world] ?? TITLES.postman;
    card.append(title);

    const setBox = document.createElement("div");
    setBox.className = "sz-box";

    const setLabel = document.createElement("div");
    setLabel.className = "sz-label";
    setLabel.textContent = step.label;
    setBox.append(setLabel);

    const membersEl = document.createElement("div");
    membersEl.className = "sz-members";
    step.examples.forEach(shape => {
        const wrap = document.createElement("span");
        wrap.className = "sz-member";
        wrap.append(createShapeSvg({ kind: shape.kind, color: shape.color, size: shape.size }));
        membersEl.append(wrap);
    });
    setBox.append(membersEl);

    card.append(setBox);

    const prompt = document.createElement("p");
    prompt.className = "sz-prompt";
    prompt.textContent = `Melyik illik ${step.rule}`;
    card.append(prompt);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "sz-options";

    step.options.forEach((shape, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "sz-option";
        btn.dataset.index = index;
        btn.append(createShapeSvg({ kind: shape.kind, color: shape.color, size: shape.size }));
        optionsContainer.append(btn);
    });

    card.append(optionsContainer);

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

    function successText() {
        return `😊 Ügyes! Ez az alakzat illik ${step.rule}`;
    }

    function checkAnswer(isCorrect) {
        if (feedback.isAnswered()) return;

        if (isCorrect) {
            optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");

            feedback.success(successText());
        } else {
            feedback.retry();
        }
    }

    optionsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".sz-option");
        if (!btn || feedback.isAnswered()) return;

        const ok = Number(btn.dataset.index) === step.answer;

        if (ok) markCorrect(btn);

        checkAnswer(ok);
    }, { signal: ac.signal });
}