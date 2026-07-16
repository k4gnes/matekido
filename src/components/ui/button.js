export function createButton(text, { className = "", onClick = null } = {}) {

    const button = document.createElement("button");
    button.textContent = text;

    if (className) {
        button.className = className;
    }

    if (onClick) {
        button.addEventListener("click", onClick);
    }

    return button;

}
