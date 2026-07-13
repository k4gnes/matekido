import { renderAdditionHint } from "./hints/additionHint.js";

export function renderAddition(step, root, next, progress) {

    let mistakes = 0;
    let hintShown = false;
    let answered = false;

    root.replaceChildren();
    const card = document.createElement("div");
    card.className = "card";
    const title = document.createElement("h1");
    title.textContent = step.title;
    const equation = document.createElement("div");
    equation.className = "equation";
    const first = document.createElement("span"); first.textContent = step.a;
    const plus = document.createElement("span"); plus.textContent = "+";
    const second = document.createElement("span"); second.textContent = step.b;
    const equal = document.createElement("span"); equal.textContent = "=";
    const input = document.createElement("input");
    input.type = "number"; input.placeholder = "?";


    equation.append(first, plus, second, equal, input);
    const button = document.createElement("button");
    button.textContent = "Ellenőrzöm";

    root.append(card);

    requestAnimationFrame(() => {
        input.focus();
    });

    const message = document.createElement("p");
    message.className = "message";


    const hint = document.createElement("div");
    hint.className = "hint";

    const hintButton = document.createElement("button");
    hintButton.textContent = "💡 Segítséget kérek";
    hintButton.style.display = "none";

    hintButton.addEventListener("click", () => {

        hintShown = true;

        //hint.textContent = "💡 Itt hamarosan segítséget kapsz.";
        renderAdditionHint(step, hint);
        hintButton.style.display = "none";

        input.focus();

    });

    if (progress) {
        card.append(progress);
    }

    card.append(
        title,
        equation,
        button,
        message,
        hintButton,
        hint
    );


    function check() {
        if (answered) return;

        const answer = Number(input.value);
        const correctAnswer = step.a + step.b;

        if (answer === correctAnswer) {

            answered = true;
            input.disabled = true;
            button.disabled = true;

            message.textContent = "😊 Szép munka!";
            message.className = "message success";

            setTimeout(() => next(), 800);

        } else {


            if (mistakes === 1) {

                message.textContent = "🙂 Majdnem! Próbáld meg még egyszer!";

            } else {

                message.textContent = "🤔 Még nem sikerült.";

            }

            message.className = "message retry";

            mistakes++;

            if (mistakes >= 2 && !hintShown) {
                hintButton.style.display = "inline-block";
            }

            input.focus();
            input.select();
        }
    }

    button.addEventListener("click", check);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") check();
    });
}
