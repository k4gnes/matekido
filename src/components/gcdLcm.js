import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createHintBox } from "./ui/hintBox.js";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const WORLD_EMOJI = {
    postman: "📮",
    racing: "🏎️",
    football: "⚽",
    cooking: "🍳",
    animals: "🦁",
    space: "🤖",
    tram: "🚋"
};

function gcdLcmHint(step) {
    if (step.mode === "lcm" || step.mode === "common-multiple") {
        return "A közös többszörösök mindkét számnak többszörösei. Sorold fel mindkét szám többszöröseit, és keresd meg az első közöset – az a legkisebb közös többszörös.";
    }
    return "A közös osztók mindkét számot maradék nélkül osztják. A legnagyobb közös osztót megkapod, ha a két szám prímfelbontásában a közös prímeket összeszorzod.";
}

function successText(step) {
    const [a, b] = step.pair;
    if (step.mode === "gcd") {
        return `🎉 Ügyes! A ${a} és a ${b} legnagyobb közös osztója a ${step.answer}.`;
    }
    if (step.mode === "lcm") {
        return `🎉 Ügyes! A ${a} és a ${b} legkisebb közös többszöröse a ${step.answer}.`;
    }
    if (step.mode === "common-divisor") {
        return `🎉 Ügyes! A ${step.answer} közös osztója a ${a}-nek és a ${b}-nek.`;
    }
    return `🎉 Ügyes! A ${step.answer} közös többszöröse a ${a}-nek és a ${b}-nek.`;
}

export function renderGcdLcm(step, root, next, progress, onResult, onAttempt) {

    let hintShown = false;

    root.replaceChildren();

    const card = createCard();

    if (progress) card.append(progress);

    const title = document.createElement("h1");
    title.textContent = `${WORLD_EMOJI[getActiveWorld()] ?? "🤝"} LNKO és LKKT`;
    card.append(title);

    if (step.pair) {
        const pairBox = document.createElement("div");
        pairBox.className = "gcd-lcm-pair";
        step.pair.forEach((value, index) => {
            if (index > 0) {
                const sep = document.createElement("span");
                sep.className = "gcd-lcm-sep";
                sep.textContent = "és";
                pairBox.append(sep);
            }
            const chip = document.createElement("span");
            chip.className = "gcd-lcm-chip";
            chip.textContent = value;
            pairBox.append(chip);
        });
        card.append(pairBox);
    }

    const prompt = document.createElement("p");
    prompt.className = "gcd-lcm-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    const message = createMessageBox();
    card.append(message.element);

    root.append(card);

    const feedback = createFeedback({
        message,
        container: card,
        onNext: next,
        onResult,
        onAttempt
    });

    const hint = createHintBox();
    hint.classList.add("gcd-lcm-hint");

    const hintButton = createButton("💡 Segítséget kérek", {
        onClick: () => {
            hintShown = true;
            hint.innerHTML = `<p><strong>💡 Segítség</strong></p><p>${gcdLcmHint(step)}</p>`;
            hintButton.style.display = "none";
        }
    });
    hintButton.style.display = "none";

    function maybeShowHint() {
        if (feedback.getMistakes() >= 2 && !hintShown) {
            hintButton.style.display = "inline-block";
        }
    }

    const options = document.createElement("div");
    options.className = "gcd-lcm-options";

    step.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "gcd-lcm-option";
        btn.textContent = opt.text;

        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;

            if (opt.correct) {
                markCorrect(btn);
                options.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");
                feedback.success(successText(step));
            } else {
                feedback.retry();
                maybeShowHint();
            }
        });

        options.append(btn);
    });

    card.append(options, hintButton, hint);
}
