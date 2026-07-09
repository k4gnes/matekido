export function renderCelebration(step, root, next) {

    root.replaceChildren();

    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h1");
    title.textContent = step.title;

    const text = document.createElement("p");
    text.textContent = step.text;

    const button = document.createElement("button");
    button.textContent = "Következő";

    button.addEventListener("click", next);

    card.append(title, text, button);

    root.append(card);
}