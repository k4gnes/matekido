import { getActiveProfile, saveActiveProfile } from "./UserManager.js";

const ONE_DAY = 24 * 60 * 60 * 1000;

function getToday() {
    return new Date().toISOString().split("T")[0];
}

function refreshDailyQuest(profile) {

    if (profile.dailyQuest.date === getToday()) {
        return;
    }

    profile.dailyQuest = {
        ...profile.dailyQuest,
        progress: 0,
        completed: false,
        date: getToday()
    };

}
export function loadProfile() {

    const profile = getActiveProfile();

    if (!profile.dailyQuest) {
        profile.dailyQuest = { id: "three-lessons", progress: 0, date: null };
    }

    if (profile.dailyQuest.date !== getToday()) {
        profile.dailyQuest = {
            ...profile.dailyQuest,
            progress: 0,
            completed: false,
            date: getToday()
        };

        saveProfile(profile);
    }

    return profile;

}

export function saveProfile(profile) {

    saveActiveProfile(profile);

}

function unlock(theme) {

    const profile = loadProfile();

    if (!profile.unlockedThemes) {

        profile.unlockedThemes = [];

    }

    if (!profile.unlockedThemes.includes(theme)) {

        profile.unlockedThemes.push(theme);

        saveProfile(profile);

    }

}

export function completeLesson() {

    const profile = loadProfile();

    const prev = profile.lessonsCompleted;
    const dailyQuestWasCompleted = profile.dailyQuest?.completed ?? false;

    profile.lessonsCompleted++;

    if (!profile.dailyQuest) {
        profile.dailyQuest = { id: "three-lessons", progress: 0, date: null };
    }

    profile.dailyQuest.progress++;

    if (profile.dailyQuest.progress >= 3) {
        profile.dailyQuest.completed = true;
    }

    saveProfile(profile);

    let milestone = null;

    const goals = [10, 25, 50, 100];

    for (const goal of goals) {

        if (prev < goal && profile.lessonsCompleted >= goal) {

            milestone = { title: `${goal} lecke teljesítve!` };
            break;

        }

    }

    return {
        milestone,
        dailyQuestCompleted: profile.dailyQuest.completed,
        dailyQuestJustCompleted: profile.dailyQuest.completed && !dailyQuestWasCompleted
    };

}

export function addStars(count = 1) {

    const profile = loadProfile();

    profile.stars += count;

    saveProfile(profile);

}

export function addDeliverLetters(count = 1) {

    const profile = loadProfile();

    profile.lettersDelivered += count;

    saveProfile(profile);

}

export function updateStatistics(lessonId, correct, wrong) {

    const profile = loadProfile();

    if (!profile.statistics[lessonId]) {
        return;
    }

    profile.statistics[lessonId].correct += correct;
    profile.statistics[lessonId].wrong += wrong;

    saveProfile(profile);

}

export function recordLessonResult(lessonFile, correct, wrong) {

    const profile = loadProfile();

    if (!profile.lessonStats) {
        profile.lessonStats = {};
    }

    if (!profile.lessonStats[lessonFile]) {
        profile.lessonStats[lessonFile] = { correct: 0, wrong: 0 };
    }

    profile.lessonStats[lessonFile].correct += correct;
    profile.lessonStats[lessonFile].wrong += wrong;

    saveProfile(profile);

}

export function getLessonStats(lessonFile) {

    const profile = loadProfile();
    const stats = profile.lessonStats?.[lessonFile];

    if (!stats) {
        return null;
    }

    const total = stats.correct + stats.wrong;

    if (total === 0) {
        return null;
    }

    return {
        correct: stats.correct,
        total,
        percentage: Math.round((stats.correct / total) * 100)
    };

}

export function recordDailyResult(correct, wrong, byType = {}) {

    const profile = loadProfile();
    const today = getToday();

    if (!profile.dailyStats) {
        profile.dailyStats = {};
    }

    if (!profile.dailyStats[today]) {
        profile.dailyStats[today] = { correct: 0, wrong: 0, lessonsPlayed: 0, byType: {} };
    }

    if (!profile.dailyStats[today].byType) {
        profile.dailyStats[today].byType = {};
    }

    const day = profile.dailyStats[today];
    day.correct += correct;
    day.wrong += wrong;
    day.lessonsPlayed++;

    for (const [type, counts] of Object.entries(byType)) {
        if (!day.byType[type]) {
            day.byType[type] = { correct: 0, wrong: 0 };
        }
        day.byType[type].correct += counts.correct;
        day.byType[type].wrong += counts.wrong;
    }

    saveProfile(profile);

}

export function getDailyStats() {

    const profile = loadProfile();
    const stats = profile.dailyStats || {};

    for (const [date, day] of Object.entries(stats)) {
        if (!day.byType) {
            day.byType = {};
        }
    }

    return stats;

}

export function recordPerfectLesson() {

    const profile = loadProfile();

    if (!profile.perfectLessons) {
        profile.perfectLessons = 0;
    }

    profile.perfectLessons++;

    saveProfile(profile);

}

export function updateStreak() {

    const profile = loadProfile();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!profile.lastPlayed) {

        profile.streak = 1;
        profile.lastPlayed = today.toISOString();

        saveProfile(profile);
        return;

    }

    const lastPlayed = new Date(profile.lastPlayed);
    lastPlayed.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
        (today - lastPlayed) / ONE_DAY
    );

    if (diffDays === 0) {

        // Ma már játszott.
        return;

    }

    if (diffDays === 1) {

        // Tegnap is játszott.
        profile.streak++;

    } else {

        // Megszakadt a sorozat.
        profile.streak = 1;

    }

    profile.lastPlayed = today.toISOString();

    saveProfile(profile);

}

export function getNextGoal() {

    const profile = loadProfile();

    const goals = [10, 25, 50, 100];

    for (const goal of goals) {

        if (profile.lessonsCompleted < goal) {

            return {
                current: profile.lessonsCompleted,
                target: goal
            };

        }

    }

    return {
        current: profile.lessonsCompleted,
        target: profile.lessonsCompleted
    };

}

export function getActiveWorld() {

    const profile = loadProfile();
    return profile.activeWorld ?? "postman";

}

export function setActiveWorld(worldId) {

    const profile = loadProfile();
    profile.activeWorld = worldId;
    saveProfile(profile);

}

export function getUnlockedWorldIds() {

    const profile = loadProfile();
    return profile.unlockedThemes ?? ["postman"];

}

export function unlockWorld(worldId) {

    const profile = loadProfile();

    if (!profile.unlockedThemes) {
        profile.unlockedThemes = ["postman"];
    }

    if (!profile.unlockedThemes.includes(worldId)) {
        profile.unlockedThemes.push(worldId);
        saveProfile(profile);
    }

}