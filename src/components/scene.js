import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";

export function renderScene(step, root, next, progress, activeWorld) {
    root.innerHTML = "";

    const worldStep = activeWorld ? step.worldTitles?.[activeWorld] : null;

    const title = document.createElement("h1");
    title.textContent = worldStep?.title ?? step.title;

    const text = document.createElement("p");
    text.textContent = worldStep?.text ?? step.text;

    let done = false;

    const button = createButton("Kezdjük!", {
        onClick: () => {
            if (done) return;
            done = true;
            next();
        }
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

    const card = createCard();

   if (progress) {
    card.append(progress);
}

    card.append(title, text, button);

    root.replaceChildren(card);

    return button;
}
