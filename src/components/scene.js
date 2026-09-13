import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { isFavoriteLesson, toggleFavoriteLesson } from "../profile/Profile.js";

export function renderScene(step, root, next, progress, activeWorld, onExit, lessonPos, onSkipNext, lessonFile, source) {
    root.innerHTML = "";

    const worldStep = activeWorld ? step.worldTitles?.[activeWorld] : null;

    const title = document.createElement("h1");
    title.textContent = worldStep?.title ?? step.title;

    const text = document.createElement("p");
    text.textContent = worldStep?.text ?? step.text;

    const ac = new AbortController();

    let done = false;

    const button = createButton("Kezdjük!", {
        className: "nav-bar-btn",
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

    const cornerBar = document.createElement("div");
    cornerBar.className = "corner-buttons";

    if (lessonFile) {
        const isFav = isFavoriteLesson(lessonFile);
        const favBtn = document.createElement("button");
        favBtn.type = "button";
        favBtn.className = "exercise-fav";
        favBtn.textContent = isFav ? "❤️" : "🤍";
        favBtn.title = isFav ? "Kedvencekből törlés" : "Kedvencekhez adás";
        favBtn.setAttribute("aria-label", "Kedvenc váltása");
        favBtn.addEventListener("click", () => {
            const nowFav = toggleFavoriteLesson(lessonFile);
            favBtn.textContent = nowFav ? "❤️" : "🤍";
            favBtn.title = nowFav ? "Kedvencekből törlés" : "Kedvencekhez adás";
        });
        cornerBar.append(favBtn);
    }

    if (onSkipNext) {
        const isNavigate = source === "consolidation" || source === "favorites" || source === "practice";
        const skipBtn = document.createElement("button");
        skipBtn.type = "button";
        skipBtn.className = isNavigate ? "exercise-next" : "exercise-fav";
        skipBtn.textContent = isNavigate ? "Tovább ▶" : "⏭️";
        skipBtn.title = isNavigate ? "Következő feladat" : "Következő feladat – kihagyom ezt most";
        skipBtn.setAttribute("aria-label", "Következő feladat");
        skipBtn.addEventListener("click", () => {
            ac.abort();
            onSkipNext();
        });
        cornerBar.append(skipBtn);
    }

    card.insertBefore(cornerBar, card.firstChild);

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
    buttonRow.style.cssText = "display:flex; gap:.4rem; justify-content:center; margin-top:1.5rem;";
    buttonRow.append(button);

    if (onExit) {
        const exitButton = createButton("📚 Leckék", {
            className: "nav-bar-btn",
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
