import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createExercise } from "./ui/exerciseShell.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";
import { makeOptions } from "./ui/optionHelper.js";

const WORLD = {
    postman: { title: "📮 Hány levél van a csomagokban?", hundreds: "🧺", tens: "📦", ones: "✉️" },
    racing: { title: "🏎️ Hány alkatrész kell összesen?", hundreds: "🏎️", tens: "⚙️", ones: "🔧" },
    football: { title: "⚽ Hány játékos van a pályán?", hundreds: "⚽", tens: "👨‍🏫", ones: "🏃" },
    cooking: { title: "🍳 Hány hozzávaló kell?", hundreds: "🍲", tens: "🍳", ones: "🥄" },
    animals: { title: "🦁 Hány állat van a karámokban?", hundreds: "🦒", tens: "🦁", ones: "🐘" },
    space: { title: "🤖 Hány robot van az egységekben?", hundreds: "🚀", tens: "🛰️", ones: "🤖" }
};

export function renderPlaceValueHundreds(step, root, next, progress, onResult, onAttempt) {

    const ac = new AbortController();

    const world = getActiveWorld();
    const w = WORLD[world] ?? WORLD.postman;

    const useChoice = step.interaction === "choice";

    const title = document.createElement("h1");
    title.textContent = w.title;

    const emojiArea = document.createElement("div");
    emojiArea.style.cssText = "display:flex; flex-wrap:wrap; gap:0.8rem; justify-content:center; margin:0.5rem 0;";

    function emojiColumn(emoji, count, label) {
        const col = document.createElement("div");
        col.style.cssText = "display:flex; flex-direction:column; align-items:center;";
        const emojiRow = document.createElement("div");
        emojiRow.style.cssText = "font-size:1.5rem; line-height:1.7; text-align:center;";
        emojiRow.textContent = emoji.repeat(count);
        const lbl = document.createElement("div");
        lbl.style.cssText = "font-size:1rem; font-weight:bold; margin-top:0.2rem;";
        lbl.textContent = label;
        col.append(emojiRow, lbl);
        return col;
    }

    emojiArea.append(
        emojiColumn(w.hundreds, step.hundreds, "százas"),
        emojiColumn(w.tens, step.tens, "tízes"),
        emojiColumn(w.ones, step.ones, "egyes")
    );

    const equation = document.createElement("div");
    equation.className = "equation";

    const desc = document.createElement("span");
    desc.textContent = `${step.hundreds} százas + ${step.tens} tízes + ${step.ones} egyes =`;

    let input;
    let optionsContainer;
    let button;

    if (useChoice) {
        equation.append(desc);
        optionsContainer = document.createElement("div");
        optionsContainer.className = "mult-options";

        const options = makeOptions(step.answer, 100, 999);
        options.forEach(value => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "mult-option";
            btn.textContent = value;
            btn.dataset.value = value;
            optionsContainer.append(btn);
        });
    } else {
        input = createNumberInput();
        equation.append(desc, input);

        button = createButton("Ellenőrzöm");
    }

    const children = [emojiArea, equation];
    if (optionsContainer) children.push(optionsContainer);
    if (button) children.push(button);

    const { message, card } = createExercise({
        root, title, progress,
        children
    });

    const feedback = createFeedback({
        message,
        container: card,
        onNext: next,
        onResult,
        onAttempt
    });

    function check() {
        if (feedback.isAnswered()) return;

        const answer = Number(input.value);
        if (isNaN(answer)) return;

        if (answer === step.answer) {
            input.disabled = true;
            button.disabled = true;
            feedback.success();
        } else {
            feedback.retry();
            input.focus();
            input.select();
        }
    }

    if (input) {
        requestAnimationFrame(() => {
            input.focus();
        });

        button.addEventListener("click", check);
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") check();
        }, { signal: ac.signal });
    }

    if (useChoice && optionsContainer) {
        optionsContainer.addEventListener("click", (e) => {
            const btn = e.target.closest(".mult-option");
            if (!btn || feedback.isAnswered()) return;
            const value = Number(btn.dataset.value);

            if (value === step.answer) {
                markCorrect(btn);
                optionsContainer.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
                feedback.success();
            } else {
                feedback.retry();
            }
        });
    }
}