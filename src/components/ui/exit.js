export function createExitButton(onExit) {

    const button = document.createElement("button");
    button.type = "button";
    button.className = "exercise-exit";
    button.setAttribute("role", "button");
    button.setAttribute("aria-label", "Leckék");
    button.title = "Leckék";
    button.textContent = "📚";

    button.addEventListener("click", () => {
        const overlay = document.createElement("div");
        overlay.className = "confirm-overlay";

        const dialog = document.createElement("div");
        dialog.className = "confirm-dialog";

        const text = document.createElement("p");
        text.textContent = "Kilépsz a leckékhez? A lecke nem lesz befejezve.";

        const actions = document.createElement("div");
        actions.className = "confirm-actions";

        const cancelBtn = document.createElement("button");
        cancelBtn.type = "button";
        cancelBtn.className = "confirm-cancel";
        cancelBtn.textContent = "Mégse";
        cancelBtn.addEventListener("click", () => overlay.remove());

        const exitBtn = document.createElement("button");
        exitBtn.type = "button";
        exitBtn.className = "confirm-exit";
        exitBtn.textContent = "Leckék";
        exitBtn.addEventListener("click", () => {
            overlay.remove();
            onExit();
        });

        actions.append(cancelBtn, exitBtn);
        dialog.append(text, actions);
        overlay.append(dialog);
        document.body.append(overlay);

        cancelBtn.focus();
    });

    return button;
}