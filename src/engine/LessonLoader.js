import { updateStreak } from "../profile/Profile.js";

export async function loadLesson(path) {

    updateStreak();

    const response = await fetch(path);

    if (!response.ok) {
        throw new Error("Nem sikerült betölteni a leckét.");
    }

    return await response.json();

}