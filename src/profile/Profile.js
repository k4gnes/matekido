const STORAGE_KEY = "matekido-profile";

const DEFAULT_PROFILE = {
    stars: 0,
    lessonsCompleted: 0,
    lettersDelivered: 0
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

export function completeLesson() {

    const profile = loadProfile();

    profile.lessonsCompleted++;

    saveProfile(profile);

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
