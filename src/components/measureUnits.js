import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_EMOJI = {
    postman: "📏",
    racing: "🔧",
    football: "⚽",
    cooking: "🥄",
    animals: "🦁",
    space: "🤖",
    tram: "🚋"
};

const KIND_CONFIG = {
    length: {
        title: "Hosszúság-mérés",
        hint: "1 m = 10 dm = 100 cm, 1 dm = 10 cm",
        hintAdvanced: "1 km = 1000 m, 1 m = 1000 mm, 1 m = 10 dm = 100 cm"
    },
    weight: {
        title: "Súly-mérés",
        hint: "1 kg = 100 dkg, 1 dkg = 10 g"
    },
    volume: {
        title: "Űrtartalom-mérés",
        hint: "1 l = 10 dl, 1 dl = 10 cl"
    }
};

export function renderMeasureUnits(step, root, next, progress, onResult, onAttempt) {

    const ac = new AbortController();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const emoji = WORLD_EMOJI[getActiveWorld()] ?? "📏";
    const config = KIND_CONFIG[step.kind] ?? KIND_CONFIG.length;

    const title = document.createElement("h1");
    title.textContent = `${emoji} ${config.title}`;
    card.append(title);

    const hint = document.createElement("p");
    hint.className = "mu-hint";
    hint.textContent = (step.advanced && config.hintAdvanced) ? config.hintAdvanced : config.hint;
    card.append(hint);

    const prompt = document.createElement("p");
    prompt.className = "mu-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "mu-options";

    step.options.forEach(value => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "mu-option";
        btn.textContent = value;
        btn.dataset.value = value;
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
            feedback.success(`🎉 Ügyes! ${step.value} ${step.unit} = ${step.answer} ${step.target}`);
        } else {
            feedback.retry();
        }
    }

    optionsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".mu-option");
        if (!btn || feedback.isAnswered()) return;

        const value = Number(btn.dataset.value);
        const ok = value === step.answer;

        if (ok) markCorrect(btn);

        checkAnswer(ok);
    }, { signal: ac.signal });
}