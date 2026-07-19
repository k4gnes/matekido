import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";

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

        const title = document.createElement("h3");
        title.className = "lesson-card-title";
        title.textContent = lesson.mission;

        const subtitle = document.createElement("p");
        subtitle.className = "lesson-card-subtitle";
        subtitle.textContent = lesson.subtitle;

        lessonCard.append(title, subtitle);

        lessonCard.addEventListener("click", () => {
            onSelect(lesson.file);
        });

        lessonGrid.append(lessonCard);
    });

    card.append(lessonGrid);

    return card;
}

export function renderLessonMenu(index, root, onSelect, onProfile) {

    root.replaceChildren();

    const wrapper = createCard();

    const title = document.createElement("h1");
    title.textContent = "📚 Matekidő";

    wrapper.append(title);

    index.grades.forEach(grade => {
        wrapper.append(createLessonCard(grade, onSelect));
    });

    const profileButton = createButton("👤 Profilom", {
        onClick: () => onProfile?.()
    });
    profileButton.className = "profile-page-button";

    root.append(profileButton, wrapper);
}
