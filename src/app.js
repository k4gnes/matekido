import { Game } from "./engine/Game.js?v=26";
import { loadLesson } from "./engine/LessonLoader.js";
import { buildLesson } from "./builders/LessonBuilder.js?v=13";
import { renderLessonMenu } from "./components/lessonMenu.js?v=9";
import { renderSkillMap } from "./components/skillMap.js?v=8";
import { renderHelp } from "./components/help.js?v=2";
import { renderProfilePage } from "./components/profilePage.js";
import { renderStatsPage } from "./components/statsPage.js?v=1";
import { renderPracticePage } from "./components/practicePage.js";
import { renderWelcomeScreen } from "./components/welcomeScreen.js?v=2";
import { renderParentDashboard } from "./components/parentDashboard.js?v=2";
import { getActiveId, listPlayers } from "./profile/UserManager.js";
import { setActiveGrade } from "./profile/Profile.js";
import { createCard } from "./components/ui/card.js";
import { createButton } from "./components/ui/button.js";

const root = document.getElementById("app");

const lessonIndex = await loadLesson("./data/lessons/index.json");

if (getActiveId() && listPlayers().length > 0) {
    showMenu();
} else {
    showWelcome();
}

function showWelcome() {
    renderWelcomeScreen(root, () => {
        showMenu();
    }, showParentDashboard);
}

function showParentDashboard() {
    renderParentDashboard(root, () => {
        showWelcome();
    }, lessonIndex);
}

function showMenu() {

    renderLessonMenu(
        lessonIndex,
        root,
        startLesson,
        showProfile,
        showWelcome,
        showSkillMap,
        () => showHelp(showMenu)
    );

}

function showSkillMap() {
    renderSkillMap(root, showMenu);
}

function showHelp(onBack) {
    renderHelp(root, onBack ?? showMenu);
}

function showProfile() {
    renderProfilePage(lessonIndex, root, showMenu, showStats, showPractice, () => showHelp(showProfile));
}

function showPractice() {
    renderPracticePage(lessonIndex, root, startLesson, showProfile);
}

function showStats() {
    renderStatsPage(root, (target) => {
        if (target === "lessons") {
            showMenu();
        } else {
            showProfile();
        }
    });
}

async function startLesson(path) {

    const rawLesson = await loadLesson(path);

    const lesson = buildLesson(rawLesson);

    let skill = null;
    const allLessons = lessonIndex.lessons || [];
    const found = allLessons.find(l => l.file === path);
    if (found) {
        skill = found.skill;
    }

    const game = new Game(
        lesson,
        root,
        {
            onRestart: () => startLesson(path),
            onExit: showMenu,
            onProfile: showProfile,
            onPractice: showPractice,
            onNext: () => {
                const next = getNextLesson(path);
                if (next) {
                    startLesson(next.file);
                    return;
                }
                const nextGrade = getNextGradeStart(path);
                if (nextGrade) {
                    showGradeChange(path, nextGrade);
                    return;
                }
                showMenu();
            }
        },
        path,
        skill,
        lessonIndex
    );

    game.start();

}

function getNextLesson(path) {

    const allLessons = lessonIndex.lessons || [];
    const idx = allLessons.findIndex(l => l.file === path);
    if (idx === -1) return null;

    const grade = allLessons[idx].grades?.[0];

    for (let i = idx + 1; i < allLessons.length; i++) {
        const candidate = allLessons[i];
        if (candidate.grades?.includes(grade)) {
            return candidate;
        }
    }

    return null;

}

function gradeLabel(grade) {
    if (grade === 1) return "az 1. osztállyal";
    if (grade === 2) return "a 2. osztállyal";
    return "a 3. osztállyal";
}

function nextGradeLabel(grade) {
    if (grade === 1) return "az 1. osztály";
    if (grade === 2) return "a 2. osztály";
    return "a 3. osztály";
}

function showGradeChange(path, next) {

    const allLessons = lessonIndex.lessons || [];
    const idx = allLessons.findIndex(l => l.file === path);
    const grade = idx !== -1 ? allLessons[idx].grades?.[0] : null;

    if (grade) {
        setActiveGrade(grade + 1);
    }

    root.replaceChildren();

    const card = createCard();

    const title = document.createElement("h1");
    title.textContent = grade ? `🎉 Elkészültél ${gradeLabel(grade)}!` : "🎉 Elkészültél!";

    const text = document.createElement("p");
    text.textContent = grade
        ? `Most ${nextGradeLabel(grade + 1)} tananyaga következik!`
        : "Következik a következő tananyag!";

    const button = createButton("➡️ Következő", {
        onClick: () => startLesson(next.file)
    });

    card.append(title, text, button);
    root.append(card);

    button.focus();

}

function getNextGradeStart(path) {

    const allLessons = lessonIndex.lessons || [];
    const idx = allLessons.findIndex(l => l.file === path);
    if (idx === -1) return null;

    const grade = allLessons[idx].grades?.[0];

    for (let i = 0; i < allLessons.length; i++) {
        const candidate = allLessons[i];
        if (candidate.grades?.[0] === grade + 1) {
            return candidate;
        }
    }

    return null;

}
