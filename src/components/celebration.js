import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createNavBar } from "./ui/navbar.js";
import { getAllWorlds } from "../world/WorldRegistry.js";
import { formatDuration, worstRunIndex, compareText, runTooltip } from "../utils/assessment.js?v=3";

// A felmérés rövid kiértékelése: az összidő, a hibák, leckénkénti bontás,
// majd a korábbi futások idővel és hibaszámmal (a legtöbb hibás jelölve).
function renderEvaluation({ summary, history }) {

    const box = document.createElement("section");
    box.className = "assessment-eval";

    const title = document.createElement("h2");
    title.textContent = "📝 Kiértékelés";
    box.append(title);

    const totals = document.createElement("p");
    totals.className = "assessment-eval-totals";
    totals.textContent = `⏱️ ${formatDuration(summary.seconds)} · ✅ ${summary.correct} helyes · ❌ ${summary.wrong} hiba`;
    box.append(totals);

    const lessons = document.createElement("ul");
    summary.lessons.forEach((lesson, index) => {
        const item = document.createElement("li");
        item.textContent = `${index + 1}. ${lesson.title ?? lesson.file} – ⏱ ${formatDuration(lesson.seconds)} · ❌ ${lesson.wrong ?? 0}`;
        lessons.append(item);
    });
    box.append(lessons);

    if (history.length > 0) {

        const heading = document.createElement("h3");
        heading.textContent = "Korábbi futások";
        box.append(heading);

        const worst = worstRunIndex(history);
        const list = document.createElement("ul");
        history.forEach((run, index) => {
            const item = document.createElement("li");
            const when = new Date(run.startedAt).toLocaleDateString("hu-HU");
            item.textContent = `${when} · ⏱ ${formatDuration(run.seconds)} · ❌ ${run.wrong ?? 0}`
                + (index === worst ? " · legtöbb hiba" : "");
            item.title = runTooltip(run, when);
            list.append(item);
        });
        box.append(list);

        const compare = document.createElement("p");
        compare.className = "assessment-eval-compare";
        compare.textContent = `Előzőhöz képest: ${compareText(summary, history[0])}`;
        box.append(compare);

    }

    return box;

}

export function renderCelebration(step, root, actions = {}, milestone, reward, activeWorld, lessonIndex, lessonTitle, gradeLabel, elapsedSeconds, options = {}) {

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
    if (!options.hideRestart) buttons.append(restartButton);

    card.append(buttons);

    if (options.evaluation) card.append(renderEvaluation(options.evaluation));

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

        if (reward.napocska) {
            const sunEl = document.createElement("div");
            sunEl.className = "reward-napocska";

            const sunIcon = document.createElement("span");
            sunIcon.className = "napocska-sun";
            sunIcon.style.background = `var(--world-${reward.napocska.world})`;

            sunEl.append(sunIcon, "+1 napocska");
            rewardEl.append(sunEl);
        }

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

    // A 7. napocska jelvényt ér: egyszer, az átlépés napján villan fel.
    const earnedWorld = reward?.napocska?.count === 7
        ? getAllWorlds().find(w => w.id === reward.napocska.world)
        : null;

    if (earnedWorld) {

        const badgeEl = document.createElement("div");
        badgeEl.className = "world-unlock world-unlock-link badge-earned";
        badgeEl.setAttribute("role", "button");
        badgeEl.setAttribute("tabindex", "0");
        badgeEl.setAttribute("aria-label", `${earnedWorld.name} jelvény megszerezve – kattints a profilodra`);
        badgeEl.addEventListener("click", () => actions.onProfile?.());
        badgeEl.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                actions.onProfile?.();
            }
        });

        const badgeTitle = document.createElement("h2");
        badgeTitle.textContent = "🎖️ Jelvény megszerezve!";

        const badgeItem = document.createElement("div");
        badgeItem.className = "world-unlock-item";
        badgeItem.innerHTML = `<span class="world-unlock-icon">${earnedWorld.icon}</span><span>${earnedWorld.name}</span>`;

        const badgeHint = document.createElement("p");
        badgeHint.className = "world-unlock-hint";
        badgeHint.textContent = "👉 Kattints, és nézd meg a jelvényed a profilodban!";

        badgeEl.append(badgeTitle, badgeItem, badgeHint);

        const rewardSectionForBadge = card.querySelector(".reward-section");
        if (rewardSectionForBadge) {
            rewardSectionForBadge.after(badgeEl);
        } else if (milestone) {
            card.querySelector(".milestone").after(badgeEl);
        } else {
            text.after(badgeEl);
        }
    }

    if (typeof elapsedSeconds === "number" && elapsedSeconds >= 0) {

        const timeEl = document.createElement("p");
        timeEl.className = "celebration-time";
        timeEl.textContent = `⏱️ ${formatDuration(elapsedSeconds)}`;
        text.after(timeEl);

    }

    root.append(card);

    if (nextButton) {
        nextButton.focus();
    }
}
