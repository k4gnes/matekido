import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createExercise } from "./ui/exercise.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD = {
    postman: { title: "📮 Hány levél van a csomagban?", tens: "📦", ones: "✉️" },
    racing: { title: "🏎️ Hány autó van a garázsban?", tens: "🛞", ones: "🔧" },
    football: { title: "⚽ Hány játékos a pályán?", tens: "👨‍🏫", ones: "⚽" },
    cooking: { title: "🍳 Hány hozzávaló kell?", tens: "🍲", ones: "🥄" }
};

export function renderPlaceValueTwoInput(step, root, next, progress, onResult, onAttempt) {

    let mistakes = 0;
    let answered = false;
    let reported = false;

    const ac = new AbortController();

    const world = getActiveWorld();
    const w = WORLD[world] ?? WORLD.postman;

    const title = document.createElement("h1");
    title.textContent = w.title;

    const emojiArea = document.createElement("div");
    emojiArea.style.cssText = "text-align:center; margin:0.5rem 0;";

    const emojiRow = document.createElement("div");
    emojiRow.style.cssText = "display:flex; flex-wrap:wrap; gap:0.3rem; justify-content:center; font-size:1.6rem; line-height:1.8;";
    emojiRow.textContent = `${w.tens.repeat(step.tens)} ${w.ones.repeat(step.ones)}`;

    const labelRow = document.createElement("div");
    labelRow.style.cssText = "display:flex; justify-content:space-between; width:100%; font-size:1rem; font-weight:bold; margin-top:0.2rem; padding:0 0.5rem;";
    if (step.tens > 0) {
        const tensLabel = document.createElement("span");
        tensLabel.textContent = "tízes";
        labelRow.append(tensLabel);
    }
    if (step.ones > 0) {
        const onesLabel = document.createElement("span");
        onesLabel.textContent = "egyes";
        labelRow.append(onesLabel);
    }

    emojiArea.append(emojiRow, labelRow);

    const wrapper = document.createElement("div");
    wrapper.style.cssText = "text-align:center;";

    const numberLine = document.createElement("div");
    numberLine.className = "equation";

    const numberSpan = document.createElement("span");
    numberSpan.textContent = `${step.answer} =`;

    const tensWrap = document.createElement("div");
    tensWrap.style.cssText = "display:flex; flex-direction:column; align-items:center;";
    const tensInput = createNumberInput("?");
    const tensLabelInput = document.createElement("div");
    tensLabelInput.style.cssText = "font-size:1rem; font-weight:bold; margin-top:0.2rem;";
    tensLabelInput.textContent = "tízes";
    tensWrap.append(tensInput, tensLabelInput);

    const plus = document.createElement("span");
    plus.textContent = "+";

    const onesWrap = document.createElement("div");
    onesWrap.style.cssText = "display:flex; flex-direction:column; align-items:center;";
    const onesInput = createNumberInput("?");
    const onesLabelInput = document.createElement("div");
    onesLabelInput.style.cssText = "font-size:1rem; font-weight:bold; margin-top:0.2rem;";
    onesLabelInput.textContent = "egyes";
    onesWrap.append(onesInput, onesLabelInput);

    numberLine.append(numberSpan, tensWrap, plus, onesWrap);

    wrapper.append(numberLine);

    const button = createButton("Ellenőrzöm");

    const { message } = createExercise({
        root, title, progress,
        children: [emojiArea, wrapper, button]
    });

    requestAnimationFrame(() => {
        tensInput.focus();
    });

    function check() {
        if (answered) return;

        const tens = Number(tensInput.value);
        const ones = Number(onesInput.value);

        onAttempt?.();

        if (tens === step.tens && ones === step.ones) {

            answered = true;
            tensInput.disabled = true;
            onesInput.disabled = true;
            button.disabled = true;

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
            tensInput.focus();
            tensInput.select();
        }
    }

    button.addEventListener("click", check);
    tensInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") check();
    }, { signal: ac.signal });
    onesInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") check();
    }, { signal: ac.signal });
}
