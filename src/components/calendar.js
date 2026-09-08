import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "🗓️ Naptár",
    racing: "🏎️ Naptár a boxutcában",
    football: "⚽ Naptár a pályán",
    cooking: "🍳 Naptár a konyhában",
    animals: "🦁 Naptár az állatkertben",
    space: "🤖 Naptár az űrhajón"
};

function successText(mode) {
    if (mode === "next-day" || mode === "tomorrow") return "😊 Ügyes! A hét napjai rendben követik egymást!";
    if (mode === "prev-day" || mode === "yesterday") return "😊 Ügyes! Jól visszafelé is számoltál a napokon!";
    if (mode === "between-days") return "😊 Ügyes! Jól sorba rendezted a napokat!";
    if (mode === "next-month" || mode === "prev-month") return "😊 Ügyes! Pontos a hónapok sorrendje!";
    if (mode === "season-of-month" || mode === "next-season") return "😊 Ügyes! Rendben ismered az évszakokat!";
    return "😊 Ügyes! Jól ismered a naptárat!";
}

export function renderCalendar(step, root, next, progress, onResult, onAttempt) {

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

    const prompt = document.createElement("p");
    prompt.className = "cal-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "cal-options";

    step.options.forEach((value, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "cal-option";
        btn.textContent = value;
        btn.dataset.index = index;
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

    function checkAnswer(isCorrect) {
        if (feedback.isAnswered()) return;

        if (isCorrect) {
            optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");

            feedback.success(successText(step.mode));
        } else {
            feedback.retry();
        }
    }

    optionsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".cal-option");
        if (!btn || feedback.isAnswered()) return;

        const ok = Number(btn.dataset.index) === step.answer;

        if (ok) markCorrect(btn);

        checkAnswer(ok);
    }, { signal: ac.signal });
}