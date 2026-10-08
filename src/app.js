import { Game } from "./engine/Game.js?v=110";
import { loadLesson } from "./engine/LessonLoader.js";
import { buildLesson } from "./builders/LessonBuilder.js?v=40";
import { renderLessonMenu } from "./components/lessonMenu.js?v=94";
import { renderSkillMap } from "./components/skillMap.js?v=30";
import { renderHelp } from "./components/help.js?v=6";
import { renderProfilePage } from "./components/profilePage.js?v=14";
import { renderStatsPage } from "./components/statsPage.js?v=15";
import { getNextPracticeLesson } from "./components/practicePage.js?v=10";
import { renderWelcomeScreen } from "./components/welcomeScreen.js?v=10";
import { renderParentDashboard } from "./components/parentDashboard.js?v=8";
import { renderParentHub } from "./components/parentHub.js?v=10";
import { renderTransferPage } from "./components/transferPage.js?v=2";
import { getActiveId, listPlayers } from "./profile/UserManager.js?v=4";
import { getActiveGrade, getFavoriteLessons, getLessonStats, recordLessonSkip, getSkippedLessons, getActiveWorld, setActiveGrade, resolveLessonGrade } from "./profile/Profile.js";
import { CONSOLIDATION_LESSONS } from "./data/consolidation.js";
import { createCard } from "./components/ui/card.js";
import { createButton } from "./components/ui/button.js";
import { installDiagnostics, showPendingMessage } from "./components/appDiagnostics.js";

installDiagnostics();
showPendingMessage();

const root = document.getElementById("app");

const ROUTE_KEY = "matekido-route";

function readRoute() {
    try {
        return sessionStorage.getItem(ROUTE_KEY) || "";
    } catch {
        return "";
    }
}

function setRoute(name) {
    try {
        sessionStorage.setItem(ROUTE_KEY, name);
    } catch {
        return;
    }
}

const lessonIndex = await loadLesson("./data/lessons/index.json");

const restoredRoute = readRoute();

if (restoredRoute === "welcome") {
    showWelcome();
} else if (restoredRoute === "profile") {
    showProfile();
} else if (restoredRoute === "stats") {
    showStats();
} else if (restoredRoute === "help") {
    showHelp();
} else if (restoredRoute === "parent") {
    showParentHub();
} else if (restoredRoute === "dashboard") {
    showParentDashboard();
} else if (restoredRoute === "transfer") {
    showTransferPage();
} else if (getActiveId() && listPlayers().length > 0) {
    showMenu();
} else {
    showWelcome();
}

function setWorldBackground() {
    const worldId = getActiveWorld();
    if (worldId) {
        document.body.dataset.world = worldId;
    }
}

function setTipVisible(visible) {
    document.body.classList.toggle("hide-tip", !visible);
}

function clearWorldBackground() {
    delete document.body.dataset.world;
}

function showWelcome() {
    clearWorldBackground();
    setTipVisible(true);
    setRoute("welcome");
    renderWelcomeScreen(root, () => {
        showMenu();
    }, showHelp, lessonIndex);
}

function showParentDashboard() {
    clearWorldBackground();
    setTipVisible(true);
    setRoute("dashboard");
    renderParentDashboard(root, () => {
        showWelcome();
    }, lessonIndex);
}

function showMenu() {

    setWorldBackground();
    setTipVisible(true);
    setRoute("menu");

    renderLessonMenu({
        index: lessonIndex,
        root,
        onSelect: startLesson,
        onProfile: showProfile,
        onSwitch: showWelcome,
        onParent: showParentHub,
        onHelp: () => showHelp(),
        onStats: showStats
    });

}

function navFor() {
    return {
        onLessons: showMenu,
        onProfile: showProfile,
        onStats: showStats,
        onHelp: () => showHelp(),
        onSwitch: showWelcome,
        onParent: showParentHub
    };
}

function showSkillMap() {
    clearWorldBackground();
    setTipVisible(true);
    setRoute("parent");
    renderSkillMap(root, () => showParentHub());
}

function showParentHub() {
    clearWorldBackground();
    setTipVisible(true);
    setRoute("parent");
    renderParentHub(root, {
        ...navFor(),
        onDashboard: () => {
            clearWorldBackground();
            setTipVisible(true);
            renderParentDashboard(root, () => showParentHub(), lessonIndex);
        },
        onTopics: showSkillMap,
        onTransfer: showTransferPage
    });
}

function showTransferPage() {
    clearWorldBackground();
    setTipVisible(true);
    setRoute("transfer");
    renderTransferPage(root, () => showParentHub());
}

function showHelp() {
    clearWorldBackground();
    setTipVisible(true);
    setRoute("help");
    renderHelp(root, navFor());
}

function showProfile() {
    setWorldBackground();
    setTipVisible(true);
    setRoute("profile");
    renderProfilePage({
        lessonIndex,
        root,
        onBack: showMenu,
        onStats: showStats,
        onHelp: () => showHelp(),
        onSwitch: showWelcome,
        onParent: showParentHub
    });
}

function showStats() {
    setWorldBackground();
    setTipVisible(true);
    setRoute("stats");
    renderStatsPage(root, navFor(), lessonIndex);
}

async function startLesson(path, opts = {}) {
    clearWorldBackground();
    setTipVisible(false);

    let rawLesson;
    try {
        rawLesson = await loadLesson(path);
    } catch (e) {
        console.error(e);
        showMenu();
        return;
    }

    const lesson = buildLesson(rawLesson);

    let skill = null;
    const allLessons = lessonIndex.lessons || [];
    const found = allLessons.find(l => l.file === path);
    if (found) {
        skill = found.skill;
    }

    const canMarkSkip = !opts.from && !found?.practice;
    const alreadySkipped = canMarkSkip && getSkippedLessons("grade").includes(path);

    const game = new Game(
        lesson,
        root,
        {
            onRestart: () => startLesson(path, opts),
            onExit: showMenu,
            onProfile: showProfile,
            onStats: showStats,
            onHelp: () => showHelp(),
            onNext: found?.practice ? () => {
                const from = opts.from;
                if (from === "play") {
                    showMenu();
                    return;
                }
                if (from === "practice") {
                    const next = getNextPracticeLesson(lessonIndex, path);
                    if (next) {
                        startLesson(next.file, { from: "practice" });
                        return;
                    }
                }
                showMenu();
            } : () => continueToNext(path, opts),
            onGradeComplete: opts.from ? null : () => showGradeComplete(path),
            onSkipNext: alreadySkipped || found?.practice ? null : () => {
                if (canMarkSkip && !getLessonStats(path)) {
                    recordLessonSkip(path, "grade");
                }
                continueToNext(path, opts);
            }
        },
        path,
        skill,
        lessonIndex,
        opts.from || null,
        opts.list || null
    );

    game.start();

}

function continueToNext(path, opts = {}) {

    if (opts.from === "custom" && Array.isArray(opts.list)) {
        const files = opts.list;
        const idx = files.indexOf(path);
        const next = idx !== -1 ? files[idx + 1] : null;
        if (next) {
            startLesson(next, opts);
            return;
        }
        showMenu();
        return;
    }

    if (opts.from === "practice" || opts.from === "play") {
        if (opts.from === "practice") {
            const next = getNextPracticeLesson(lessonIndex, path);
            if (next) {
                startLesson(next.file, { from: "practice" });
                return;
            }
        }
        showMenu();
        return;
    }

    if (opts.from === "consolidation" || opts.from === "favorites") {
        const files = opts.from === "consolidation" ? getConsolidationFiles() : getFavoriteFiles();
        const idx = files.indexOf(path);
        if (idx !== -1) {
            const next = files[idx + 1];
            if (next) {
                startLesson(next, opts);
                return;
            }
        }
        showMenu();
        return;
    }

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

function getConsolidationFiles() {

    const grade = getActiveGrade();
    const ids = CONSOLIDATION_LESSONS[grade] || [];
    const byId = new Map((lessonIndex.lessons || []).map(l => [l.id, l]));
    const files = ids.map(id => byId.get(id)).filter(l => l && l.grades?.includes(grade));
    return files.map(l => l.file);

}

function getFavoriteFiles() {

    const grade = getActiveGrade();
    const files = new Set((lessonIndex.lessons || [])
        .filter(l => l.grades?.includes(grade))
        .map(l => l.file));
    return getFavoriteLessons().filter(f => files.has(f));

}

function getNextLesson(path) {

    const allLessons = lessonIndex.lessons || [];
    const idx = allLessons.findIndex(l => l.file === path);
    if (idx === -1) return null;

    const grade = resolveLessonGrade(allLessons[idx]);

    const gradeLessons = allLessons.filter(l => l.grades?.includes(grade) && !l.practice);
    const pos = gradeLessons.findIndex(l => l.file === path);
    if (pos === -1) return null;

    const skippedSet = new Set(getSkippedLessons().filter(file =>
        gradeLessons.some(l => l.file === file)
    ));

    for (let i = pos + 1; i < gradeLessons.length; i++) {
        const candidate = gradeLessons[i];
        if (!skippedSet.has(candidate.file) && !getLessonStats(candidate.file)) {
            return candidate;
        }
    }

    for (let i = 0; i < pos; i++) {
        const candidate = gradeLessons[i];
        if (!skippedSet.has(candidate.file) && !getLessonStats(candidate.file)) {
            return candidate;
        }
    }

    const undoneSkipped = gradeLessons.find(l => skippedSet.has(l.file) && !getLessonStats(l.file));
    if (undoneSkipped) {
        return undoneSkipped;
    }

    return gradeLessons[(pos + 1) % gradeLessons.length];

}

function gradeArticle(grade) {
    return grade === 1 || grade === 5 ? "az" : "a";
}

function gradeLabel(grade) {
    return `${gradeArticle(grade)} ${grade}. osztállyal`;
}

function nextGradeLabel(grade) {
    return `${gradeArticle(grade)} ${grade}. osztály`;
}

function showGradeChange(path, next) {

    const allLessons = lessonIndex.lessons || [];
    const idx = allLessons.findIndex(l => l.file === path);
    const grade = idx !== -1 ? resolveLessonGrade(allLessons[idx]) : null;

    if (grade) {
        const skippedCount = getSkippedLessons().filter(file =>
            allLessons.some(l => l.grades?.includes(grade) && l.file === file)
        ).length;

        if (skippedCount > 0) {
            root.replaceChildren();
            setTipVisible(true);

            const card = createCard();

            const title = document.createElement("h1");
            title.textContent = "⏭️ Van még kihagyott feladatod";

            const text = document.createElement("p");
            text.textContent = `Minden feladatot megoldottál, de ${skippedCount} feladatot kihagytál a feladatlistán. Ha szeretnéd, előbb pótolhatod őket – az osztályváltóval viszont bármikor továbbléphetsz a ${nextGradeLabel(grade + 1)}ra.`;

            const button = createButton("🔙 Vissza a feladatokhoz", {
                className: "nav-bar-btn",
                onClick: showMenu
            });

            card.append(title, text, button);
            root.append(card);

            button.focus();

            return;
        }
    }

    root.replaceChildren();
    setTipVisible(true);

    const card = createCard();

    const title = document.createElement("h1");
    title.textContent = grade ? `🎉 Elkészültél ${gradeLabel(grade)}!` : "🎉 Elkészültél!";

    const text = document.createElement("p");
    text.textContent = grade
        ? "Ügyes vagy, minden feladatot teljesítettél! Ha szeretnél, az osztályválasztóval továbbléphetsz a következőre."
        : "Ügyes vagy, minden feladatot teljesítettél!";

    const button = createButton("📚 Vissza a feladatokhoz", {
        className: "nav-bar-btn",
        onClick: showMenu
    });

    card.append(title, text, button);
    root.append(card);

    button.focus();

}

function showGradeComplete(path) {

    const allLessons = lessonIndex.lessons || [];
    const idx = allLessons.findIndex(l => l.file === path);
    const grade = idx !== -1 ? resolveLessonGrade(allLessons[idx]) : null;

    root.replaceChildren();

    const card = createCard();

    const title = document.createElement("h1");
    title.textContent = grade ? `🎉 Gratulálunk, ${gradeArticle(grade)} ${grade}. osztályt befejezted!` : "🎉 Gratulálunk!";

    const text = document.createElement("p");
    text.textContent = "Ügyes vagy, az összes feladatot teljesítetted ebben az osztályban!";

    const buttons = document.createElement("div");
    buttons.className = "celebration-buttons";

    const nextGrade = grade != null ? grade + 1 : null;
    const nextLesson = nextGrade != null ? getNextGradeStart(path) : null;
    const nextGradeKnown = nextGrade != null
        && (lessonIndex.gradeConfig ?? []).some(g => g.grade === nextGrade);

    if (nextLesson && nextGradeKnown) {
        const nextBtn = createButton(`➡️ ${nextGrade}. osztály feladatai`, {
            className: "nav-bar-btn",
            onClick: () => {
                setActiveGrade(nextGrade);
                startLesson(nextLesson.file);
            }
        });
        buttons.append(nextBtn);
    }

    const menuBtn = createButton("📚 Leckék", {
        className: "nav-bar-btn",
        onClick: showMenu
    });
    buttons.append(menuBtn);

    card.append(title, text, buttons);
    root.append(card);

    buttons.firstChild?.focus();

}

function getNextGradeStart(path) {

    const allLessons = lessonIndex.lessons || [];
    const idx = allLessons.findIndex(l => l.file === path);
    if (idx === -1) return null;

    const grade = resolveLessonGrade(allLessons[idx]);

    for (let i = 0; i < allLessons.length; i++) {
        const candidate = allLessons[i];
        if (candidate.grades?.[0] === grade + 1) {
            return candidate;
        }
    }

    return null;

}
