import { createButton } from "./ui/button.js";
import { createNumberInput } from "./ui/numberInput.js";
import { createExercise } from "./ui/exercise.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_TITLES = {
    postman: "📮 Mennyi levél hiányzik?",
    racing: "🔧 Hány kerék hiányzik?",
    football: "⚽ Hány gól hiányzik?"
};

export function renderMissingNumber(step, root, next, progress, onResult) {

    let mistakes = 0;
    let answered = false;

    const world = getActiveWorld();

    const title = document.createElement("h1");
    title.textContent = WORLD_TITLES[world] ?? WORLD_TITLES.postman;

    const equation = document.createElement("div");
    equation.className = "equation";

    const first = document.createElement("span");
    first.textContent = step.a;

    const plus = document.createElement("span");
    plus.textContent = "+";

    const input = createNumberInput();

    const equal = document.createElement("span");
    equal.textContent = "=";

    const result = document.createElement("span");
    result.textContent = step.sum;

    equation.append(first, plus, input, equal, result);

    const button = createButton("Ellenőrzöm");

    const { message } = createExercise({
        root, title, progress,
        children: [equation, button]
    });

    requestAnimationFrame(() => {
        input.focus();
    });

    function check() {
        if (answered) return;

        const answer = Number(input.value);

        if (answer === step.answer) {

            answered = true;
            input.disabled = true;
            button.disabled = true;

            message.show("😊 Szép munka!", "success");

            onResult?.(true);
            setTimeout(() => next(), 800);

        } else {

            if (mistakes === 1) {
                message.show("🙂 Majdnem! Próbáld meg még egyszer!", "retry");
            } else {
                message.show("🤔 Még nem sikerült.", "retry");
            }

            mistakes++;

            onResult?.(false);
            input.focus();
            input.select();
        }
    }

    button.addEventListener("click", check);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") check();
    });
}
