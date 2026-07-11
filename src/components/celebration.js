export function renderCelebration(step, root, actions = {}) {

    root.replaceChildren();

    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h1");
    title.textContent = step.title ?? "🎉 Szép munka!";

    const text = document.createElement("p");
    text.textContent = step.text ?? "Ügyesen megoldottad az összes feladatot!";

    const restartButton = document.createElement("button");
    restartButton.textContent = "🔁 Újra";

    restartButton.addEventListener("click", () => {
        actions.onRestart?.();
    });

    const menuButton = document.createElement("button");
    menuButton.textContent = "📚 Leckék";

    menuButton.addEventListener("click", () => {
        actions.onExit?.();
    });

    card.append(
        title,
        text,
        restartButton,
        menuButton
    );

    root.append(card);
}