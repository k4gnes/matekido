import { createNumberInput } from "./numberInput.js";
import { createButton } from "./button.js";

export function renderNumberInputWithSubmit(card, onCheck, signal) {
    const input = createNumberInput();
    input.className = "mult-input";
    card.append(input);

    const button = createButton("Ellenőrzöm");
    card.append(button);

    function check() {
        const value = Number(input.value);
        if (isNaN(value)) return;
        onCheck(value, input, button);
    }

    button.addEventListener("click", check);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") check();
    }, { signal });

    requestAnimationFrame(() => input.focus());

    return { input, button };
}
