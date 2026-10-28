import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";
import { createShapeSvg } from "./ui/shapeSvg.js";

const TITLES = {
    postman: "🧺 Válogatás",
    racing: "🏎️ Válogatás a boxutcában",
    football: "⚽ Válogatás a pályán",
    cooking: "🍳 Válogatás a konyhában",
    animals: "🦁 Válogatás az állatkertben",
    space: "🤖 Válogatás az űrhajón",
    tram: "🚋 Válogatás a villamoson"
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
    const mode = step.mode || (step.examples && step.examples[0] && typeof step.examples[0].value !== "undefined" ? "numbers" : "shapes");
    if (mode === "numbers") {
        (step.examples || []).forEach(ex => {
            const wrap = document.createElement("span");
            wrap.className = "sz-member sz-member-num";
            const val = typeof ex === "object" && ex !== null ? ex.value : ex;
            wrap.textContent = String(val);
            membersEl.append(wrap);
        });
    } else {
        (step.examples || []).forEach(shape => {
            const wrap = document.createElement("span");
            wrap.className = "sz-member";
            wrap.append(createShapeSvg({ kind: shape.kind, color: shape.color, size: shape.size }));
            membersEl.append(wrap);
        });
    }
    setBox.append(membersEl);

    card.append(setBox);

    const prompt = document.createElement("p");
    prompt.className = "sz-prompt";
    prompt.textContent = `Melyik illik ${step.rule}?`;
    card.append(prompt);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "sz-options";

    (step.options || []).forEach((opt, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "sz-option";
        btn.dataset.index = index;
        if (mode === "numbers") {
            const span = document.createElement("span");
            span.className = "sz-option-num";
            const val = typeof opt === "object" && opt !== null ? opt.value : opt;
            span.textContent = String(val);
            btn.append(span);
        } else {
            btn.append(createShapeSvg({ kind: opt.kind, color: opt.color, size: opt.size }));
        }
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
        return `😊 Ügyes! Ez az alakzat illik ${step.rule}.`;
    }

    function checkAnswer(isCorrect) {
        if (feedback.isAnswered()) return;

        if (isCorrect) {
            optionsContainer.querySelectorAll(".sz-option").forEach(b => b.disabled = true);

            feedback.success(successText());
        } else {
            feedback.retry();
        }
    }

    optionsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".sz-option");
        if (!btn || feedback.isAnswered()) return;
        if (btn.disabled) return;

        const idx = Number(btn.dataset.index);
        if (Number.isNaN(idx)) return;
        if (typeof step.answer === "undefined" || step.answer === null) return;
        const ok = idx === step.answer;

        if (ok) markCorrect(btn);

        checkAnswer(ok);
    }, { signal: ac.signal });
}