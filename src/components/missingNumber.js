export function renderMissingNumber(step, root, next, progress) {

    let mistakes = 0;
    let answered = false;

    root.replaceChildren();

    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h1");
    title.textContent = "🔢 Mennyi hiányzik?";

    const equation = document.createElement("div");
    equation.className = "equation";

    const first = document.createElement("span");
    first.textContent = step.a;

    const plus = document.createElement("span");
    plus.textContent = "+";

    const input = document.createElement("input");
    input.type = "number";
    input.placeholder = "?";

    const equal = document.createElement("span");
    equal.textContent = "=";

    const result = document.createElement("span");
    result.textContent = step.sum;

    equation.append(first, plus, input, equal, result);

    const button = document.createElement("button");
    button.textContent = "Ellenőrzöm";

    const message = document.createElement("p");
    message.className = "message";

    if (progress) {
        card.append(progress);
    }

    card.append(title, equation, button, message);

    root.append(card);

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

            input.focus();
            input.select();
        }
    }

    button.addEventListener("click", check);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") check();
    });
}
