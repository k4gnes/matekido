import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";

export function renderCelebration(step, root, actions = {}, milestone, reward, activeWorld) {

    root.replaceChildren();

    const card = createCard();

    const worldStep = activeWorld ? step.worldTitles?.[activeWorld] : null;

    const title = document.createElement("h1");
    title.textContent = worldStep?.title ?? step.title ?? "🎉 Szép munka!";

    const text = document.createElement("p");
    text.textContent = worldStep?.text ?? step.text ?? "Ügyesen megoldottad az összes feladatot!";

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

        const milestoneEl = document.createElement("div");
        milestoneEl.className = "milestone";

        milestoneEl.innerHTML = `
        <div class="milestone-icon">🏅</div>
        <h2>${milestone.title}</h2>
        <p>Új mérföldkövet értél el!</p>
    `;

        card.append(title, text, milestoneEl, restartButton, menuButton, profileButton);

    } else {

        card.append(title, text, restartButton, menuButton, profileButton);

    }

    if (reward && reward.totalStars > 0) {

        const rewardEl = document.createElement("div");
        rewardEl.className = "reward-section";

        const starsEl = document.createElement("div");
        starsEl.className = "reward-stars";
        starsEl.textContent = "⭐".repeat(reward.totalStars);

        const rewardList = document.createElement("div");
        rewardList.className = "reward-list";

        reward.rewards.forEach(r => {
            const item = document.createElement("div");
            item.className = "reward-item";
            item.textContent = `${r.label} (+${r.stars} ⭐)`;
            rewardList.append(item);
        });

        rewardEl.append(starsEl, rewardList);

        if (milestone) {
            const milestoneEl = card.querySelector(".milestone");
            milestoneEl.after(rewardEl);
        } else {
            text.after(rewardEl);
        }

    }

    if (reward && reward.newlyUnlocked && reward.newlyUnlocked.length > 0) {

        const worldEl = document.createElement("div");
        worldEl.className = "world-unlock";

        const worldTitle = document.createElement("h2");
        worldTitle.textContent = "🌍 Új világ feloldva!";

        worldEl.append(worldTitle);

        reward.newlyUnlocked.forEach(world => {
            const worldItem = document.createElement("div");
            worldItem.className = "world-unlock-item";
            worldItem.innerHTML = `<span class="world-unlock-icon">${world.icon}</span><span>${world.name}</span>`;
            worldEl.append(worldItem);
        });

        const rewardSection = card.querySelector(".reward-section");
        if (rewardSection) {
            rewardSection.after(worldEl);
        } else if (milestone) {
            const milestoneEl = card.querySelector(".milestone");
            milestoneEl.after(worldEl);
        } else {
            text.after(worldEl);
        }

    }

    root.append(card);
}
