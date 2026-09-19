export function createNumberInput(placeholder = "?") {

    const input = document.createElement("input");
    input.type = "number";
    input.placeholder = placeholder;
    input.setAttribute("aria-label", "A válasz beírása");

    return input;

}
