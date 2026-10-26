import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { createMessageBox } from "./ui/messageBox.js";
import { createHintRequest } from "./ui/hintBox.js?v=2";
import { createFeedback, markCorrect } from "./ui/feedback.js";
import { getActiveWorld } from "../profile/Profile.js";

const TITLES = {
    postman: "🎲 Biztos vagy benne? A postán",
    racing: "🏎️ Biztos vagy benne? A boxutcában",
    football: "⚽ Biztos vagy benne? A pályán",
    cooking: "🍳 Biztos vagy benne? A konyhában",
    animals: "🦁 Biztos vagy benne? Az állatkertben",
    space: "🤖 Biztos vagy benne? Az űrhajón",
    tram: "🚋 Biztos vagy benne? A villamoson"
};

const COMPARE_TITLES = {
    postman: "🎲 Mi valószínűbb a postán?",
    racing: "🎲 Mi valószínűbb a boxutcában?",
    football: "🎲 Mi valószínűbb a pályán?",
    cooking: "🎲 Mi valószínűbb a konyhában?",
    animals: "🎲 Mi valószínűbb az állatkertben?",
    space: "🎲 Mi valószínűbb az űrhajón?",
    tram: "🎲 Mi valószínűbb a villamoson?"
};

const CHANCE_TITLES = {
    postman: "🎯 Mennyi az esélye a postán?",
    racing: "🎯 Mennyi az esélye a boxutcában?",
    football: "🎯 Mennyi az esélye a pályán?",
    cooking: "🎯 Mennyi az esélye a konyhában?",
    animals: "🎯 Mennyi az esélye az állatkertben?",
    space: "🎯 Mennyi az esélye az űrhajón?",
    tram: "🎯 Mennyi az esélye a villamoson?"
};

const FREQUENCY_TITLES = {
    postman: "📊 Gyakoriság a postán",
    racing: "📊 Gyakoriság a boxutcában",
    football: "📊 Gyakoriság a pályán",
    cooking: "📊 Gyakoriság a konyhában",
    animals: "📊 Gyakoriság az állatkertben",
    space: "📊 Gyakoriság az űrhajón",
    tram: "📊 Gyakoriság a villamoson"
};

function hintText(step) {
    if (step.mode === "chance") {
        const total = step.groups.reduce((sum, g) => sum + g.amount, 0);
        const target = step.groups[step.favorableIndex];
        return `A valószínűség = a kedvező esetek száma ÷ az összes eset száma. Összesen ${total} golyó van, és ${target.amount} ${target.color} – tehát ${target.amount}/${total}.`;
    }
    if (step.mode === "compare") {
        if (step.equal) {
            return "Mindkét színből ugyanannyi van a zacskában, ezért mindkettőt ugyanolyan eséllyel választod!";
        }
        const more = step.groups[0].amount > step.groups[1].amount ? step.groups[0] : step.groups[1];
        return `A ${more.color} golyóból van több (${more.amount} db), ezért azt választod ${step.ask === "bigger" ? "nagyobb" : "kisebb"} eséllyel.`;
    }
    if (step.mode === "frequency") {
        return "A relatív gyakoriság = a kedvező esetek száma ÷ a kísérletek száma.";
    }
    return "Biztos az, ami mindig megtörténik; lehetetlen az, ami soha nem fordulhat elő; lehetséges az, ami előfordulhat, de nem biztos.";
}

export function renderProbability(step, root, next, progress, onResult, onAttempt) {

    if (step.mode === "compare" || step.mode === "chance") {
        renderCompare(step, root, next, progress, onResult, onAttempt);
        return;
    }

    if (step.mode === "frequency") {
        renderFrequency(step, root, next, progress, onResult, onAttempt);
        return;
    }

    const world = getActiveWorld();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = TITLES[world] ?? TITLES.postman;
    card.append(title);

    const event = document.createElement("p");
    event.className = "prob-event";
    event.textContent = `${step.emoji} ${step.text}`;
    card.append(event);

    const prompt = document.createElement("p");
    prompt.className = "prob-prompt";
    prompt.textContent = "Milyen valószínű ez az esemény?";
    card.append(prompt);

    const options = document.createElement("div");
    options.className = "prob-options";
    step.options.forEach((label, i) => {
        const btn = createButton(label, { className: "prob-option" });
        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;
            if (label === step.correctLabel) {
                markCorrect(btn);
                feedback.success(`😊 Igazad van! Ez ${step.correctLabel.toLowerCase()}!`);
            } else {
                feedback.retry();
                maybeShowHint();
            }
        });
        options.append(btn);
    });
    card.append(options);

    const message = createMessageBox();
    const hint = createHintRequest(() => hintText(step));

    card.append(hint.button, hint.box);
    card.append(message.element);

    root.append(card);

    const feedback = createFeedback({
        message,
        container: card,
        onNext: next,
        onResult,
        onAttempt
    });

    function maybeShowHint() {
        if (feedback.getMistakes() >= 2) hint.offer();
    }

}

function renderFrequency(step, root, next, progress, onResult, onAttempt) {

    const world = getActiveWorld();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = FREQUENCY_TITLES[world] ?? FREQUENCY_TITLES.postman;
    card.append(title);

    const event = document.createElement("p");
    event.className = "prob-event";
    event.textContent = step.event;
    card.append(event);

    const table = document.createElement("table");
    table.className = "dt-table";

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    const headLabel = document.createElement("th");
    headLabel.textContent = "Adat";
    const headValue = document.createElement("th");
    headValue.textContent = "Érték";
    headRow.append(headLabel, headValue);
    thead.append(headRow);
    table.append(thead);

    const tbody = document.createElement("tbody");
    [
        ["Kísérletek száma", step.trials],
        ["Kedvező esetek", step.favorable],
        ["Nem kedvező esetek", step.trials - step.favorable]
    ].forEach(([label, value]) => {
        const row = document.createElement("tr");
        const labelCell = document.createElement("td");
        labelCell.textContent = label;
        const valueCell = document.createElement("td");
        valueCell.textContent = String(value);
        row.append(labelCell, valueCell);
        tbody.append(row);
    });
    table.append(tbody);
    card.append(table);

    const prompt = document.createElement("p");
    prompt.className = "prob-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    const options = document.createElement("div");
    options.className = "prob-options";
    step.options.forEach((label) => {
        const btn = createButton(label, { className: "prob-option" });
        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;
            if (label === step.correctLabel) {
                markCorrect(btn);
                feedback.success(step.successText);
            } else {
                feedback.retry();
                maybeShowHint();
            }
        });
        options.append(btn);
    });
    card.append(options);

    const message = createMessageBox();
    const hint = createHintRequest(() => hintText(step));

    card.append(hint.button, hint.box);
    card.append(message.element);

    root.append(card);

    const feedback = createFeedback({
        message,
        container: card,
        onNext: next,
        onResult,
        onAttempt
    });

    function maybeShowHint() {
        if (feedback.getMistakes() >= 2) hint.offer();
    }

}

function renderCompare(step, root, next, progress, onResult, onAttempt) {

    const world = getActiveWorld();

    root.replaceChildren();

    const card = createCard();

    if (progress) {
        card.append(progress);
    }

    const title = document.createElement("h1");
    title.textContent = (step.mode === "chance" ? CHANCE_TITLES[world] : COMPARE_TITLES[world]) ?? COMPARE_TITLES.postman;
    card.append(title);

    if (step.scenario === "spinner") {
        card.append(renderSpinner(step.groups));
    } else {
        card.append(renderBag(step.groups));
    }

    const prompt = document.createElement("p");
    prompt.className = "prob-prompt";
    prompt.textContent = step.question;
    card.append(prompt);

    const options = document.createElement("div");
    options.className = "prob-options";
    step.options.forEach((label) => {
        const btn = createButton(optionText(step, label), { className: "prob-option" });
        btn.addEventListener("click", () => {
            if (feedback.isAnswered()) return;
            if (label === step.correctLabel) {
                markCorrect(btn);
                feedback.success(step.successText);
            } else {
                feedback.retry();
                maybeShowHint();
            }
        });
        options.append(btn);
    });
    card.append(options);

    const message = createMessageBox();
    const hint = createHintRequest(() => hintText(step));

    card.append(hint.button, hint.box);
    card.append(message.element);

    root.append(card);

    const feedback = createFeedback({
        message,
        container: card,
        onNext: next,
        onResult,
        onAttempt
    });

    function maybeShowHint() {
        if (feedback.getMistakes() >= 2) hint.offer();
    }

}

function optionText(step, label) {
    if (step.mode === "chance") return label;
    const group = step.groups.find(g => g.label === label);
    return group ? `${group.emoji} ${label}` : `⚖️ ${label}`;
}

function renderBag(groups) {
    const wrap = document.createElement("div");
    wrap.className = "prob-bag";

    groups.forEach(group => {
        for (let i = 0; i < group.amount; i++) {
            const ball = document.createElement("span");
            ball.className = "prob-ball";
            ball.textContent = group.emoji;
            wrap.append(ball);
        }
    });

    const caption = document.createElement("p");
    caption.className = "prob-caption";
    caption.textContent = `A zsákban ${groups[0].amount} ${groups[0].color} és ${groups[1].amount} ${groups[1].color} golyó van.`;
    wrap.append(caption);

    return wrap;
}

function renderSpinner(groups) {
    const wrap = document.createElement("div");
    wrap.className = "prob-spinner-wrap";

    const total = groups.reduce((sum, g) => sum + g.amount, 0);
    const firstPercent = (groups[0].amount / total) * 100;

    const spinner = document.createElement("div");
    spinner.className = "prob-spinner";
    spinner.style.background = `conic-gradient(${groups[0].hex} 0 ${firstPercent}%, ${groups[1].hex} ${firstPercent}% 100%)`;

    const needle = document.createElement("span");
    needle.className = "prob-needle";
    needle.textContent = "🔻";
    spinner.append(needle);

    wrap.append(spinner);

    return wrap;
}
