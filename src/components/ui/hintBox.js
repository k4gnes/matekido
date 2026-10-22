import { createButton } from "./button.js";

export function createHintBox() {

    const box = document.createElement("div");
    box.className = "hint";

    return box;

}

export function createHintRequest(getText) {

    const box = createHintBox();
    let shown = false;

    const button = createButton("💡 Segítséget kérek", {
        onClick: () => {
            shown = true;
            box.innerHTML = `<p><strong>💡 Segítség</strong></p><p>${getText()}</p>`;
            button.style.display = "none";
        }
    });
    button.style.display = "none";

    return {
        box,
        button,
        offer: () => {
            if (!shown) button.style.display = "inline-block";
        }
    };

}
