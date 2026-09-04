import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";

export function renderScene(step, root, next, progress, activeWorld, onExit, lessonPos) {
    root.innerHTML = "";

    const worldStep = activeWorld ? step.worldTitles?.[activeWorld] : null;

    const title = document.createElement("h1");
    title.textContent = worldStep?.title ?? step.title;

    const text = document.createElement("p");
    text.textContent = worldStep?.text ?? step.text;

    const ac = new AbortController();

    let done = false;

    const button = createButton("Kezdjük!", {
        onClick: () => {
            if (done) return;
            done = true;
            ac.abort();
            next();
        }
    });

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

    if (lessonPos) {
        const posText = document.createElement("p");
        posText.className = "scene-lesson-pos";
        posText.textContent = `${lessonPos.position}. lecke a ${lessonPos.total}-ből`;
        card.append(posText);
    }

    card.append(title, text);

    const illustration = worldStep?.illustration ?? step.illustration;
    if (illustration) {
        const ill = document.createElement("div");
        ill.className = "illustration";
        ill.innerHTML = illustration;
        card.append(ill);
    }

    const buttonRow = document.createElement("div");
    buttonRow.style.cssText = "display:flex; gap:.5rem; justify-content:center;";
    buttonRow.append(button);

    if (onExit) {
        const exitButton = createButton("📚 Leckék", {
            onClick: () => {
                ac.abort();
                onExit();
            }
        });
        buttonRow.append(exitButton);
    }

    card.append(buttonRow);

    root.replaceChildren(card);

    return button;
}
