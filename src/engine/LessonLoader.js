import { updateStreak } from "../profile/Profile.js";

export async function loadLesson(path) {

    updateStreak();

    const cacheBuster = path.includes("?") ? "&v=" : "?v=";
    const response = await fetch(path + cacheBuster + Date.now());

    if (!response.ok) {
        throw new Error("Nem sikerült betölteni a leckét.");
    }

    return await response.json();

}