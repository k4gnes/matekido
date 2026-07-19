import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";

export function renderCelebration(step, root, actions = {}, milestone) {

    root.replaceChildren();

    const card = createCard();

    const title = document.createElement("h1");
    title.textContent = step.title ?? "🎉 Szép munka!";

    const text = document.createElement("p");
    text.textContent = step.text ?? "Ügyesen megoldottad az összes feladatot!";

    const restartButton = createButton("🔁 Újra", {
        onClick: () => actions.onRestart?.()
    });

    const menuButton = createButton("📚 Leckék", {
        onClick: () => actions.onExit?.()
    });

    const profileButton = createButton("👤 Profilom", {
        onClick: () => actions.onProfile?.()
    });

    if (milestone) {

        const reward = document.createElement("div");
        reward.className = "milestone";

        reward.innerHTML = `
        <div class="milestone-icon">🏅</div>
        <h2>${milestone.title}</h2>
        <p>Új mérföldkövet értél el!</p>
    `;

        card.append(title, text, reward, restartButton, menuButton, profileButton);

    } else {

        card.append(title, text, restartButton, menuButton, profileButton);

    }

    root.append(card);
}
