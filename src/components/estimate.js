import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "📦 Becslés",
    racing: "🏎️ Becslés",
    football: "⚽ Becslés",
    cooking: "🍳 Becslés",
    animals: "🦁 Becslés",
    space: "🤖 Becslés"
};

export function renderEstimate(step, root, next, progress, onResult, onAttempt) {

    let answered = false;
    let reported = false;
    let mistakes = 0;

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

    const expr = document.createElement("div");
    expr.className = "est-expression";
    expr.textContent = step.expression;
    card.append(expr);

    if (step.hint) {
        const hint = document.createElement("p");
        hint.className = "est-hint";
        hint.textContent = step.hint;
        card.append(hint);
    }

    const prompt = document.createElement("p");
    prompt.className = "est-prompt";
    prompt.textContent = "Melyik a legjobb becslés?";
    card.append(prompt);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "est-options";

    step.options.forEach(value => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "est-option";
        btn.textContent = value;
        btn.dataset.value = value;
        optionsContainer.append(btn);
    });

    card.append(optionsContainer);

    const message = createMessageBox();
    card.append(message.element);

    root.append(card);

    function checkAnswer(isCorrect) {
        if (answered) return;

        onAttempt?.();

        if (isCorrect) {
            answered = true;
            optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
            message.show("😊 Szép munka!", "success");

            if (!reported) {
                reported = true;
                onResult?.(true);
            }
            ac.abort();
            const nextBtn = document.createElement("button");
            nextBtn.type = "button";
            nextBtn.className = "est-next";
            nextBtn.textContent = "➡️ Tovább";
            nextBtn.addEventListener("click", () => next());
            card.append(nextBtn);
        } else {
            if (mistakes === 1) {
                message.show("🙂 Majdnem! Próbáld meg még egyszer!", "retry");
            } else {
                message.show("🤔 Még nem sikerült.", "retry");
            }
            mistakes++;

            if (!reported) {
                reported = true;
                onResult?.(false);
            }
        }
    }

    optionsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".est-option");
        if (!btn || answered) return;
        checkAnswer(Number(btn.dataset.value) === step.answer);
    }, { signal: ac.signal });
}
