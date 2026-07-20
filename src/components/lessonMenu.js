import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { listPlayers, getActiveId } from "../profile/UserManager.js";

const TYPE_EMOJI = {
    addition: "➕",
    subtraction: "➖",
    mixed: "🔀",
    "missing-number": "❓",
    comparison: "⚖️",
    neighbor: "🔍",
    decomposition: "🧩"
};

function createLessonCard(grade, onSelect) {

    const card = createCard();

    const gradeTitle = document.createElement("h2");
    gradeTitle.className = "lesson-group";
    gradeTitle.textContent = grade.title;

    const separator = document.createElement("hr");
    separator.className = "lesson-separator";

    card.append(gradeTitle, separator);

    const lessonGrid = document.createElement("div");
    lessonGrid.className = "lesson-grid";

    grade.lessons.forEach(lesson => {

        const lessonCard = document.createElement("div");
        lessonCard.className = "lesson-card";

        const typeEmoji = TYPE_EMOJI[lesson.type] ?? "";

        const title = document.createElement("h3");
        title.className = "lesson-card-title";
        title.textContent = lesson.mission;

        const subtitle = document.createElement("p");
        subtitle.className = "lesson-card-subtitle";
        subtitle.textContent = lesson.subtitle;

        const typeBadge = document.createElement("span");
        typeBadge.className = "lesson-type-badge";
        typeBadge.textContent = typeEmoji;

        lessonCard.append(typeBadge, title, subtitle);

        lessonCard.addEventListener("click", () => {
            onSelect(lesson.file);
        });

        lessonGrid.append(lessonCard);
    });

    card.append(lessonGrid);

    return card;
}

export function renderLessonMenu(index, root, onSelect, onProfile, onSwitch) {

    root.replaceChildren();

    const wrapper = createCard();

    const title = document.createElement("h1");
    title.textContent = "📚 Matekidő";

    wrapper.append(title);

    index.grades.forEach(grade => {
        wrapper.append(createLessonCard(grade, onSelect));
    });

    const buttonRow = document.createElement("div");
    buttonRow.style.cssText = "display:flex; gap:.5rem; justify-content:center; margin-bottom:1rem;";

    const allPlayers = listPlayers();
    const activeId = getActiveId();
    const currentPlayer = allPlayers.find(p => p.id === activeId);

    const profileButton = createButton("👤 Profilom", {
        onClick: () => onProfile?.()
    });
    profileButton.className = "profile-page-button";

    buttonRow.append(profileButton);

    if (currentPlayer) {
        const avatar = document.createElement("span");
        avatar.textContent = currentPlayer.avatar;
        avatar.style.cssText = "font-size:1.4rem; line-height:1; display:inline-flex; align-items:center;";
        buttonRow.append(avatar);
    }

    if (onSwitch) {
        const switchButton = createButton("👤 Játékos", {
            onClick: () => onSwitch?.()
        });
        switchButton.className = "profile-page-button";
        buttonRow.append(switchButton);
    }

    root.append(buttonRow, wrapper);
}
