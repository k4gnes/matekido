import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "🕐 Idő a postán",
    racing: "🏎️ Idő a boxutcában",
    football: "⚽ Idő a pályán",
    cooking: "🍳 Idő a konyhában",
    animals: "🦁 Idő az állatkertben",
    space: "🤖 Idő az űrhajón"
};

const EVENTS = {
    postman: "a csomagszállítás",
    racing: "a futam",
    football: "a mérkőzés",
    cooking: "a sütés",
    animals: "az oroszlánok etetése",
    space: "az űrjárat"
};

function fmtTime(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h} óra ${m} perc`;
}

function fmtKor(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h} órakor` : `${fmtTime(minutes)}kor`;
}

function fmtDur(minutes) {
    if (minutes < 60) return `${minutes} perc`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h} óra` : `${h} óra ${m} perc`;
}

export function renderElapsedTime(step, root, next, progress, onResult, onAttempt) {

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

    const eventName = EVENTS[world] ?? EVENTS.postman;

    let question;
    if (step.mode === "duration") {
        question = `${eventName} ${fmtKor(step.start)} kezdődött, és ${fmtKor(step.end)} ért véget. Hány percig tartott?`;
    } else if (step.mode === "end") {
        question = `${eventName} ${fmtKor(step.start)} kezdődött, és ${fmtDur(step.duration)}ig tartott. Mikor ért véget?`;
    } else {
        question = `${eventName} ${fmtKor(step.end)} ért véget, és ${fmtDur(step.duration)}ig tartott. Mikor kezdődött?`;
    }

    const prompt = document.createElement("p");
    prompt.className = "et-question";
    prompt.textContent = question;
    card.append(prompt);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "et-options";

    step.options.forEach(value => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "et-option" + (step.mode === "duration" ? " et-option-num" : "");
        btn.dataset.value = value;
        btn.textContent = step.mode === "duration" ? `${value} perc` : fmtTime(value);
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
        if (step.mode === "duration") {
            return `😊 Ügyes! ${eventName} ${fmtDur(step.duration)}ig tartott.`;
        }
        if (step.mode === "end") {
            return `😊 Ügyes! ${eventName} ${fmtKor(step.end)} ért véget.`;
        }
        return `😊 Ügyes! ${eventName} ${fmtKor(step.start)} kezdődött.`;
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
        const btn = e.target.closest(".et-option");
        if (!btn || feedback.isAnswered()) return;

        const ok = Number(btn.dataset.value) === step.answer;

        if (ok) markCorrect(btn);

        checkAnswer(ok);
    }, { signal: ac.signal });
}