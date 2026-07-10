export function renderScene(step, root, next, progress) {
    root.innerHTML = "";

    const title = document.createElement("h1");
    title.textContent = step.title;

    const text = document.createElement("p");
    text.textContent = step.text;

    const button = document.createElement("button");
    button.textContent = "Kezdjük!";
    button.addEventListener("click", next);

    const card = document.createElement("div");
    card.className = "card";

   if (progress) {
    card.append(progress);
}
   
    card.append(title, text, button);

    root.replaceChildren(card);


    return button;


    
}