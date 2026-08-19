import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";

function makeOptions(answer, min, max, count = 4) {
    const options = [answer];
    const seen = new Set([answer]);
    const deltas = [1, -1, 2, -2, 3, -3, 5, -5];
    for (const d of deltas) {
        if (options.length >= count) break;
        const v = answer + d;
        if (v >= min && v <= max && !seen.has(v)) {
            seen.add(v);
            options.push(v);
        }
    }
    for (let v = min; v <= max && options.length < count; v++) {
        if (!seen.has(v)) {
            seen.add(v);
            options.push(v);
        }
    }
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
}

export function renderNeighbor(step, root, next, progress, onResult, onAttempt) {

    let mistakes = 0;
    let answered = false;
    let reported = false;

    const ac = new AbortController();
    const useChoice = step.interaction === "choice";

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = "🔍 Kinek a szomszédai?";
    card.append(title);

    const row = document.createElement("div");
    row.className = "equation";

    const lowerTen = document.createElement("span");
    lowerTen.textContent = step.lowerTen;
    lowerTen.className = "neighbor-ten";

    const dotsLeft = document.createElement("span");
    dotsLeft.textContent = "...";
    dotsLeft.className = "neighbor-dots";

    const left = document.createElement("span");
    left.textContent = step.left;
    left.className = "neighbor-num";

    const right = document.createElement("span");
    right.textContent = step.right;
    right.className = "neighbor-num";

    const dotsRight = document.createElement("span");
    dotsRight.textContent = "...";
    dotsRight.className = "neighbor-dots";

    const upperTen = document.createElement("span");
    upperTen.textContent = step.upperTen;
    upperTen.className = "neighbor-ten";

    let input;
    let optionsContainer;

    if (useChoice) {
        row.append(lowerTen, dotsLeft, left, right, dotsRight, upperTen);
        card.append(row);

        const prompt = document.createElement("p");
        prompt.className = "mult-prompt";
        prompt.textContent = "Melyik szám a hiányzó szomszéd?";
        card.append(prompt);

        const options = makeOptions(step.answer, step.answer - 5, step.answer + 5);
        optionsContainer = document.createElement("div");
        optionsContainer.className = "mult-options";

        options.forEach(value => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "mult-option";
            btn.textContent = value;
            btn.dataset.value = value;
            optionsContainer.append(btn);
        });

        card.append(optionsContainer);
    } else {
        input = createNumberInput();
        row.append(lowerTen, dotsLeft, left, input, right, dotsRight, upperTen);
        card.append(row);

        const button = createButton("Ellenőrzöm");
        card.append(button);

        button.addEventListener("click", check);
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") check();
        }, { signal: ac.signal });
    }

    const message = createMessageBox();
    card.append(message.element);

    root.append(card);

    if (input) {
        requestAnimationFrame(() => input.focus());
    }

    function checkAnswer(isCorrect) {
        if (answered) return;

        onAttempt?.();

        if (isCorrect) {
            answered = true;
            if (input) {
                input.disabled = true;
            }
            if (optionsContainer) {
                optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
            }

            message.show("😊 Szép munka!", "success");

            if (!reported) {
                reported = true;
                onResult?.(true);
            }
            ac.abort();
            setTimeout(() => next(), 800);
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
            if (input) {
                input.focus();
                input.select();
            }
        }
    }

    function check() {
        if (answered) return;
        const answer = Number(input.value);
        if (isNaN(answer)) return;
        checkAnswer(answer === step.answer);
    }

    if (useChoice && optionsContainer) {
        optionsContainer.addEventListener("click", (e) => {
            const btn = e.target.closest(".mult-option");
            if (!btn || answered) return;
            checkAnswer(Number(btn.dataset.value) === step.answer);
        });
    }
}
