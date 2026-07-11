export function createLessonCard(lesson, onSelect) {

    const card = document.createElement("article");
    card.className = "lesson-card";

    const mission = document.createElement("h3");
    mission.className = "lesson-card-title";
    mission.textContent = lesson.mission;

    const subtitle = document.createElement("p");
    subtitle.className = "lesson-card-subtitle";
    subtitle.textContent = lesson.subtitle;

    card.append(
        mission,
        subtitle
    );

    card.addEventListener("click", () => {
        onSelect(lesson.file);
    });

    return card;

}