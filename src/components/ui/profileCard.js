import { createCard } from "./card.js";
import { loadProfile, getNextGoal } from "../../profile/Profile.js";

export function createProfileCard() {

    const profile = loadProfile();

    const card = createCard();
    card.classList.add("profile-card");

    const goal = getNextGoal();

    const title = document.createElement("h1");
    title.className = "profile-title";
    title.textContent = "📮 Saját postahivatal";

    const stats = document.createElement("div");
    stats.className = "profile-stats";

    const lessons = document.createElement("p");
    lessons.className = "profile-stat";
    lessons.textContent =
        `📚 ${profile.lessonsCompleted} lecke`;

    const streak = document.createElement("p");
    streak.className = "profile-stat";
    streak.textContent = `🔥 ${profile.streak} nap`;

    const progress = document.createElement("progress");

    progress.max = goal.target;
    progress.value = goal.current;

    const label = document.createElement("p");

    label.className = "profile-goal";

    label.textContent =
        `🎯 Következő cél: ${goal.current} / ${goal.target}`;

    const quest = document.createElement("p");
    quest.className = "profile-quest";

    quest.textContent =
        `📅 Mai küldetés: ${profile.dailyQuest.progress}/3`;

    stats.append(lessons, streak);
    card.append(title, stats, label, progress, quest);

    return card;

}