import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { listPlayers, getActiveId } from "../profile/UserManager.js";

export function renderCelebration(step, root, actions = {}, milestone, reward, activeWorld, lessonIndex) {

    root.replaceChildren();

    const card = createCard();

    const worldStep = activeWorld ? step.worldTitles?.[activeWorld] : null;

    const title = document.createElement("h1");
    title.textContent = worldStep?.title ?? step.title ?? "🎉 Szép munka!";

    const text = document.createElement("p");
    text.textContent = worldStep?.text ?? step.text ?? "Ügyesen megoldottad az összes feladatot!";

    const restartButton = createButton("🔁 Újra", {
        className: "nav-bar-btn",
        onClick: () => actions.onRestart?.()
    });

    const nextButton = actions.onNext
        ? createButton("➡️ Következő", {
            className: "nav-bar-btn",
            onClick: () => actions.onNext()
        })
        : null;

    const menuButton = createButton("📚 Leckék", {
        className: "nav-bar-btn",
        onClick: () => actions.onExit?.()
    });

    const activePlayer = actions.onProfile ? listPlayers().find(p => p.id === getActiveId()) ?? null : null;

    const profileButton = activePlayer
        ? (() => {
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = "nav-bar-player";
            chip.textContent = `${activePlayer.avatar} ${activePlayer.name}`;
            chip.title = "Profil";
            chip.setAttribute("aria-label", "Profil: " + activePlayer.name);
            chip.addEventListener("click", () => actions.onProfile());
            return chip;
        })()
        : createButton("👤 Profil", {
            className: "nav-bar-btn",
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

        card.append(title, text, milestoneEl);

    } else {

        card.append(title, text);

    }

    const buttons = document.createElement("div");
    buttons.className = "celebration-buttons";

    if (nextButton) buttons.append(nextButton);
    buttons.append(restartButton, menuButton, profileButton);

    card.append(buttons);

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

    if (nextButton) {
        nextButton.focus();
    }
}
