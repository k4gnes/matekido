import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createCountRow } from "./ui/countRow.js";
import { createExercise } from "./ui/exerciseShell.js";
import { createFeedback } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD = {
    postman: { title: "📮 Hány levél van a csomagban?", tens: "📦", ones: "✉️" },
    racing: { title: "🏎️ Hány szerszám kell összesen?", tens: "⚙️", ones: "🔧" },
    football: { title: "⚽ Hány játékos van a pályán?", tens: "👨‍🏫", ones: "🏃" },
    cooking: { title: "🍳 Hány kanál kell?", tens: "🍲", ones: "🥄" },
    animals: { title: "🦁 Hány állat van a karámban?", tens: "🦒", ones: "🦁" },
    space: { title: "🤖 Hány robot van a tartályban?", tens: "🛰️", ones: "🤖" },
    tram: { title: "🚋 Hány utas van a vagonban?", tens: "🚋", ones: "🚶" }
};

export function renderPlaceValue(step, root, next, progress, onResult, onAttempt) {

    const ac = new AbortController();

    const world = getActiveWorld();
    const w = WORLD[world] ?? WORLD.postman;

    const title = document.createElement("h1");
    title.textContent = w.title;

    const emojiArea = document.createElement("div");
    emojiArea.style.cssText = "display:flex; flex-wrap:wrap; gap:0.8rem; justify-content:center; margin:0.5rem 0;";

    function emojiColumn(emoji, count, label) {
        const col = document.createElement("div");
        col.style.cssText = "display:flex; flex-direction:column; align-items:center;";
        const lbl = document.createElement("div");
        lbl.style.cssText = "font-size:1rem; font-weight:bold; margin-top:0.2rem;";
        lbl.textContent = label;
        col.append(createCountRow(emoji, count), lbl);
        return col;
    }

    emojiArea.append(
        emojiColumn(w.tens, step.tens, "tízes"),
        emojiColumn(w.ones, step.ones, "egyes")
    );

    const equation = document.createElement("div");
    equation.className = "equation";

    const desc = document.createElement("span");
    desc.textContent = `${step.tens} tízes + ${step.ones} egyes =`;

    const input = createNumberInput();
    input.style.width = `${String(step.answer).length + 2}ch`;

    equation.append(desc, input);

    const button = createButton("Ellenőrzöm", { className: "nav-bar-btn" });

    const { message, card } = createExercise({
        root, title, progress,
        children: [emojiArea, equation, button]
    });

    const feedback = createFeedback({
        message,
        container: card,
        onNext: next,
        onResult,
        onAttempt
    });

    requestAnimationFrame(() => {
        input.focus();
    });

    function check() {
        if (feedback.isAnswered()) return;

        const answer = Number(input.value);

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

    button.addEventListener("click", check);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") check();
    }, { signal: ac.signal });
}
