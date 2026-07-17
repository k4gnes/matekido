import { loadProfile } from "../../profile/Profile.js";
import { createCard } from "./card.js";

export function createProfileCard() {

    const profile = loadProfile();

    const card = createCard();
    card.classList.add("profile-card");

    const title = document.createElement("h1");
    title.className = "profile-title";
    title.textContent = "📮 Saját postahivatal";

    const stats = document.createElement("div");
    stats.className = "profile-stats";

    const stars = document.createElement("p");
    stars.className = "profile-stat";
    stars.textContent = `⭐ ${profile.stars} csillag`;

    const lessons = document.createElement("p");
    lessons.className = "profile-stat";
    lessons.textContent =
        `📚 ${profile.lessonsCompleted} lecke`;

    const letters = document.createElement("p");
    letters.className = "profile-stat";
    letters.textContent =
        `📬 ${profile.lettersDelivered} levél`;

    const streak = document.createElement("p");
    streak.className = "profile-stat";
    streak.textContent = `🔥 ${profile.streak} nap`;

    const progress = document.createElement("div");
    progress.className = "profile-progress";

    

    stats.append(stars, lessons, letters, streak);
    card.append(title, stats, progress);

    return card;

}