import { createCard } from "./ui/card.js";
import { createButton } from "./ui/button.js";
import { getLessonStats, getActiveWorld } from "../profile/Profile.js";
import { CATEGORIES } from "../data/skills.js";
import { createLessonCard } from "./lessonMenu.js";

export function getWeakLessonFiles(lessonIndex) {

    const weak = new Set();

    for (const lesson of lessonIndex.lessons || []) {
        const stats = getLessonStats(lesson.file);
        if (stats && stats.percentage < 90) {
            weak.add(lesson.file);
        }
    }

    return weak;

}

function pickNextLesson(lessonIndex, weakLessonFiles) {

    const lessons = (lessonIndex.lessons || []).filter(l => weakLessonFiles.has(l.file));

    if (lessons.length === 0) return null;

    let next = lessons[0];
    let worst = Infinity;

    for (const lesson of lessons) {
        const stats = getLessonStats(lesson.file);
        const percentage = stats ? stats.percentage : 0;
        if (percentage < worst) {
            worst = percentage;
            next = lesson;
        }
    }

    return next;

}

function buildLessonSections(lessons, onSelect, activeWorld) {

    const categorized = {};
    for (const key of Object.keys(CATEGORIES)) {
        categorized[key] = [];
    }
    lessons.forEach(l => {
        const cat = l.category || "operations";
        if (!categorized[cat]) categorized[cat] = [];
        categorized[cat].push(l);
    });

    const fragment = document.createDocumentFragment();

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
        fragment.append(catSection);
    }

    return fragment;

}

export function renderPracticePage(lessonIndex, root, onSelect, onBack) {

    root.replaceChildren();

    const weakLessonFiles = getWeakLessonFiles(lessonIndex);
    const activeWorld = getActiveWorld();

    const card = createCard();

    const title = document.createElement("h1");
    title.textContent = "🎯 Gyakorlás";

    card.append(title);

    const weakLessons = (lessonIndex.lessons || []).filter(l => weakLessonFiles.has(l.file));

    if (weakLessons.length === 0) {
        const empty = document.createElement("p");
        empty.className = "lesson-card-subtitle";
        empty.textContent = "Nincs gyakorlandó feladat. 🎉";
        card.append(empty);
    } else {
        const next = pickNextLesson(lessonIndex, weakLessonFiles);

        const nextTitle = document.createElement("h2");
        nextTitle.className = "lesson-group";
        nextTitle.textContent = "➡️ Következő gyakorlás";
        card.append(nextTitle);

        const nextWrap = document.createElement("div");
        nextWrap.className = "next-lesson-card";
        nextWrap.append(createLessonCard(next, onSelect, activeWorld));
        card.append(nextWrap);

        const allTitle = document.createElement("h2");
        allTitle.className = "lesson-group";
        allTitle.textContent = `📚 Minden gyakorlandó feladat (${weakLessons.length})`;
        card.append(allTitle);

        card.append(buildLessonSections(weakLessons, onSelect, activeWorld));
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
