import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createExercise } from "./ui/exerciseShell.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";
import { makeOptions } from "./ui/optionHelper.js";

const WORLD = {
    postman: { title: "📮 Hány levél van a rakocsikban?", thousands: "🚚", hundreds: "🧺", tens: "📦", ones: "✉️" },
    racing: { title: "🏎️ Hány alkatrész kell a pályára?", thousands: "🏁", hundreds: "🏎️", tens: "⚙️", ones: "🔧" },
    football: { title: "⚽ Hány játékos van a bajnokságban?", thousands: "🏆", hundreds: "⚽", tens: "👨‍🏫", ones: "🏃" },
    cooking: { title: "🍳 Hány hozzávaló kell a nagy ebédhez?", thousands: "🥘", hundreds: "🍲", tens: "🍳", ones: "🥄" },
    animals: { title: "🦁 Hány állat van a füves pusztán?", thousands: "🦛", hundreds: "🦒", tens: "🦁", ones: "🐘" },
    space: { title: "🤖 Hány robotot küld az űrflotta?", thousands: "🛸", hundreds: "🚀", tens: "🛰️", ones: "🤖" },
    tram: { title: "🚋 Hány utast küld a villamosflotta?", thousands: "🚋", hundreds: "🚉", tens: "🚋", ones: "🚶" }
};

export function renderPlaceValueThousands(step, root, next, progress, onResult, onAttempt) {

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
        emojiRow.style.cssText = "font-size:1.25rem; line-height:1.7; text-align:center;";
        emojiRow.textContent = emoji.repeat(count);
        const lbl = document.createElement("div");
        lbl.style.cssText = "font-size:0.9rem; font-weight:bold; margin-top:0.2rem;";
        lbl.textContent = label;
        col.append(emojiRow, lbl);
        return col;
    }

    emojiArea.append(
        emojiColumn(w.thousands, step.thousands, "ezres"),
        emojiColumn(w.hundreds, step.hundreds, "százas"),
        emojiColumn(w.tens, step.tens, "tízes"),
        emojiColumn(w.ones, step.ones, "egyes")
    );

    const equation = document.createElement("div");
    equation.className = "equation";

    const desc = document.createElement("span");
    desc.textContent = `${step.thousands} ezres + ${step.hundreds} százas + ${step.tens} tízes + ${step.ones} egyes =`;

    let input;
    let optionsContainer;
    let button;

    if (useChoice) {
        equation.append(desc);
        optionsContainer = document.createElement("div");
        optionsContainer.className = "mult-options";

        const options = makeOptions(step.answer, 1000, 9999);
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
        input.style.width = "8ch";
        equation.append(desc, input);

        button = createButton("Ellenőrzöm", { className: "nav-bar-btn" });
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