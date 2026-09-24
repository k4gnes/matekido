import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createCard } from "./ui/card.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createFeedback } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_TITLE = {
    postman: "🔍 Kerek szomszédok a postán",
    racing: "🏎️ Kerek szomszédok a pályán",
    football: "⚽ Kerek szomszédok a bajnokságban",
    cooking: "🍳 Kerek szomszédok a konyhában",
    animals: "🦁 Kerek szomszédok az állatkertben",
    space: "🤖 Kerek szomszédok az űrben",
    tram: "🚋 Kerek szomszédok a városban"
};

export function renderNeighborRound(step, root, next, progress, onResult, onAttempt) {

    const ac = new AbortController();

    const world = getActiveWorld();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = WORLD_TITLE[world] ?? WORLD_TITLE.postman;
    card.append(title);

    const numberLine = document.createElement("div");
    numberLine.className = "equation";
    numberLine.style.fontSize = "2.2rem";

    const numSpan = document.createElement("span");
    numSpan.textContent = step.number;
    numSpan.style.fontWeight = "bold";
    numberLine.append(numSpan);
    card.append(numberLine);

    function neighborInput(label) {
        const wrap = document.createElement("div");
        wrap.style.cssText = "display:flex; align-items:center; justify-content:center; gap:0.75rem; margin:0.35rem 0; font-size:1.2rem;";
        const lbl = document.createElement("span");
        lbl.style.cssText = "text-align:right;";
        lbl.textContent = label;
        const input = createNumberInput("?");
        input.style.width = "8ch";
        wrap.append(lbl, input);
        card.append(wrap);
        return input;
    }

    const lowerInput = neighborInput(`Kisebb ${step.unitLabel} szomszédja:`);
    const upperInput = neighborInput(`Nagyobb ${step.unitLabel} szomszédja:`);

    const button = createButton("Ellenőrzöm", { className: "nav-bar-btn" });
    card.append(button);

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

    requestAnimationFrame(() => {
        lowerInput.focus();
    });

    function check() {
        if (feedback.isAnswered()) return;

        const lower = Number(lowerInput.value);
        const upper = Number(upperInput.value);
        if (isNaN(lower) || isNaN(upper)) return;

        if (lower === step.lower && upper === step.upper) {
            lowerInput.disabled = true;
            upperInput.disabled = true;
            button.disabled = true;
            feedback.success();
        } else {
            feedback.retry();
            lowerInput.focus();
            lowerInput.select();
        }
    }

    button.addEventListener("click", check);
    lowerInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); upperInput.focus(); }
    }, { signal: ac.signal });
    upperInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); check(); }
    }, { signal: ac.signal });
}