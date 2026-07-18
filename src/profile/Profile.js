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
    ]
};

export function loadProfile() {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        return { ...DEFAULT_PROFILE };
    }

    return JSON.parse(saved);

}

export function saveProfile(profile) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(profile)
    );

}

function unlock(theme) {

    const profile = loadProfile();

    if (!profile.unlockedThemes.includes(theme)) {

        profile.unlockedThemes.push(theme);

        saveProfile(profile);

    }

}

export function completeLesson() {

    const profile = loadProfile();

    profile.lessonsCompleted++;

    saveProfile(profile);

    if (profile.lessonsCompleted >= 25) {

        unlock("racing");

    }

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