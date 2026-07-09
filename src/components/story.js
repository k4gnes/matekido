export function renderStory(step, root) {
    root.innerHTML = "";

    const title = document.createElement("h1");
    title.textContent = step.title;

    const text = document.createElement("p");
    text.textContent = step.text;

    const button = document.createElement("button");
    button.textContent = "Kezdjük!";

    const card = document.createElement("div");
    card.className = "card";

    card.append(title, text, button);

    root.replaceChildren(card);


    return button;

    
}