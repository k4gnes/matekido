import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createNavBar } from "./ui/navbar.js";

export function renderCelebration(step, root, actions = {}, milestone, reward, activeWorld, lessonIndex, lessonTitle, gradeLabel) {

    root.replaceChildren();

    const card = createCard();

    const navbar = createNavBar({
        onLessons: () => actions.onExit?.(),
        onProfile: () => actions.onProfile?.(),
        onStats: () => actions.onStats?.(),
        onHelp: () => actions.onHelp?.()
    });

    card.append(navbar);

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
        ? createButton("➡️ Tovább", {
            className: "nav-bar-btn",
            onClick: () => actions.onNext()
        })
        : null;

    if (lessonTitle || gradeLabel) {

        const lessonInfo = document.createElement("div");
        lessonInfo.className = "celebration-lesson";

        if (lessonTitle) {
            const titleEl = document.createElement("span");
            titleEl.textContent = lessonTitle;
            lessonInfo.append(titleEl);
        }

        if (gradeLabel) {
            const gradeEl = document.createElement("span");
            gradeEl.className = "lesson-grade-badge";
            gradeEl.textContent = gradeLabel;
            lessonInfo.append(gradeEl);
        }

        card.append(lessonInfo);

    }

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
    buttons.append(restartButton);

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
        worldEl.className = "world-unlock world-unlock-link";
        worldEl.setAttribute("role", "button");
        worldEl.setAttribute("tabindex", "0");
        worldEl.setAttribute("aria-label", "Új világ feloldva – kattints a profilodra az aktiváláshoz");
        worldEl.addEventListener("click", () => actions.onProfile?.());
        worldEl.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                actions.onProfile?.();
            }
        });

        const worldTitle = document.createElement("h2");
        worldTitle.textContent = "🌍 Új világ feloldva!";

        const worldHint = document.createElement("p");
        worldHint.className = "world-unlock-hint";
        worldHint.textContent = "👆 Kattints a profilodra, és rögtön aktiválhatod!";

        worldEl.append(worldTitle);

        reward.newlyUnlocked.forEach(world => {
            const worldItem = document.createElement("div");
            worldItem.className = "world-unlock-item";
            worldItem.innerHTML = `<span class="world-unlock-icon">${world.icon}</span><span>${world.name}</span>`;
            worldEl.append(worldItem);
        });

        worldEl.append(worldHint);

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
