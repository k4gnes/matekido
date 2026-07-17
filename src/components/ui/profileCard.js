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
    stars.textContent = `⭐ ${profile.stars}`;

    const lessons = document.createElement("p");
    lessons.className = "profile-stat";
    lessons.textContent = `📚 ${profile.lessonsCompleted}`;

    const letters = document.createElement("p");
    letters.className = "profile-stat";
    letters.textContent = `📬 ${profile.lettersDelivered}`;

    stats.append(stars, lessons, letters);
    card.append(title, stats);

    return card;

}