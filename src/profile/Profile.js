const STORAGE_KEY = "matekido-profile";
const ONE_DAY = 24 * 60 * 60 * 1000;

const DEFAULT_PROFILE = {
    stars: 0,
    lessonsCompleted: 0,
    lettersDelivered: 0,
    streak: 0,
    lastPlayed: null,
    unlockedThemes: [
        "postman"
    ],
    dailyQuest: {
        id: "three-lessons",
        progress: 0,
        date: null
    }
};

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

    const saved = localStorage.getItem(STORAGE_KEY);

    const profile = saved
        ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) }
        : { ...DEFAULT_PROFILE };

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

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(profile)
    );

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

    profile.lessonsCompleted++;

    if (!profile.dailyQuest) {
        profile.dailyQuest = { id: "three-lessons", progress: 0, date: null };
    }

    profile.dailyQuest.progress++;

    if (profile.dailyQuest.progress >= 3) {
    profile.dailyQuest.completed = true;
}

    saveProfile(profile);

    if (profile.lessonsCompleted >= 25) {

        unlock("racing");

    }

    const goals = [10, 25, 50, 100];

    for (const goal of goals) {

        if (prev < goal && profile.lessonsCompleted >= goal) {

            return { title: `${goal} lecke teljesítve!` };

        }

    }

    return null;

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