export function renderScene(step, root, next, progress) {
    root.innerHTML = "";

    const title = document.createElement("h1");
    title.textContent = step.title;

    const text = document.createElement("p");
    text.textContent = step.text;

    let done = false;

    const button = document.createElement("button");
    button.textContent = "Kezdjük!";
    button.addEventListener("click", () => {
        if (done) return;
        done = true;
        next();
    });

    const ac = new AbortController();
    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            ac.abort();
            if (done) return;
            done = true;
            next();
        }
    }, { signal: ac.signal });

    const card = document.createElement("div");
    card.className = "card";

   if (progress) {
    card.append(progress);
}
   
    card.append(title, text, button);

    root.replaceChildren(card);

    return button;
}