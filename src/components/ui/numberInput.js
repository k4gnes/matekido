export function createNumberInput(placeholder = "?") {

    const input = document.createElement("input");
    input.type = "number";
    input.placeholder = placeholder;

    return input;

}
