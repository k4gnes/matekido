import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { getAllSkillStats, getActiveWorld } from "../profile/Profile.js";
import { CATEGORIES } from "../data/skills.js";
import { createLessonCard } from "./lessonMenu.js";

export function getWeakSkillIds() {

    const skillStats = getAllSkillStats();
    const weak = new Set();

    for (const [skillId, raw] of Object.entries(skillStats)) {
        const total = raw.correct + raw.wrong;
        if (total === 0) continue;
        const percentage = Math.round((raw.correct / total) * 100);
        if (percentage < 90) {
            weak.add(skillId);
        }
    }

    return weak;

}

export function renderPracticePage(lessonIndex, root, onSelect, onBack) {

    root.replaceChildren();

    const weakSkills = getWeakSkillIds();
    const activeWorld = getActiveWorld();

    const card = createCard();

    const title = document.createElement("h1");
    title.textContent = "🎯 Gyakorlás";

    const subtitle = document.createElement("p");
    subtitle.className = "lesson-card-subtitle";
    subtitle.textContent = "Ezekkel a feladatokkal 90% alatt állsz.";

    card.append(title, subtitle);

    const lessons = (lessonIndex.lessons || []).filter(l => weakSkills.has(l.skill));

    if (lessons.length === 0) {
        const empty = document.createElement("p");
        empty.className = "lesson-card-subtitle";
        empty.textContent = "Nincs gyakorlandó feladat. 🎉";
        card.append(empty);
    } else {
        const categorized = {};
        for (const key of Object.keys(CATEGORIES)) {
            categorized[key] = [];
        }
        lessons.forEach(l => {
            const cat = l.category || "operations";
            if (!categorized[cat]) categorized[cat] = [];
            categorized[cat].push(l);
        });

        for (const [catKey, catLessons] of Object.entries(categorized)) {
            if (catLessons.length === 0) continue;

            const category = CATEGORIES[catKey];

            const catSection = document.createElement("div");
            catSection.className = "category-section";

            const catTitle = document.createElement("h3");
            catTitle.className = "category-title";
            catTitle.textContent = `${category.icon} ${category.title}`;
            catSection.append(catTitle);

            const lessonGrid = document.createElement("div");
            lessonGrid.className = "lesson-grid";

            catLessons.forEach(lesson => {
                lessonGrid.append(createLessonCard(lesson, onSelect, activeWorld));
            });

            catSection.append(lessonGrid);
            card.append(catSection);
        }
    }

    const buttonRow = document.createElement("div");
    buttonRow.style.cssText = "display:flex; gap:.5rem; justify-content:center; margin-top:1rem;";

    const backButton = createButton("👤 Profil", {
        onClick: () => onBack()
    });
    backButton.className = "profile-page-button";

    buttonRow.append(backButton);
    card.append(buttonRow);

    root.append(card);

}
