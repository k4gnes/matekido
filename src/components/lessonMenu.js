function createLessonCard(grade, onSelect) {

    const card = document.createElement("div");
    card.className = "card";

    const gradeTitle = document.createElement("h2");
    gradeTitle.className = "lesson-group";
    gradeTitle.textContent = grade.title;

    const separator = document.createElement("hr");
    separator.className = "lesson-separator";

    card.append(gradeTitle, separator);

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

        card.append(lessonCard);
    });

    return card;
}

export function renderLessonMenu(index, root, onSelect) {

    root.replaceChildren();

    const wrapper = document.createElement("div");
    wrapper.className = "card";

    const title = document.createElement("h1");
    title.textContent = "📚 Matekidő";

    wrapper.append(title);

    index.grades.forEach(grade => {
        wrapper.append(createLessonCard(grade, onSelect));
    });

    root.append(wrapper);
}
