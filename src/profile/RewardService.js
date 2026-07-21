import { loadProfile, saveProfile } from "./Profile.js";
import { getAllWorlds } from "../world/WorldRegistry.js";

const REWARD_TYPES = {
    LESSON_COMPLETE: { stars: 1, label: "Lecke teljesítve" },
    PERFECT_LESSON: { stars: 2, label: "Tökéletes lecke" },
    DAILY_QUEST: { stars: 3, label: "Napi küldetés teljesítve" },
    MILESTONE: { stars: 5, label: "Mérföldkő elérve" }
};

export function grantRewards({ correct, wrong, isMilestone, dailyQuestJustCompleted }) {

    const rewards = [];

    rewards.push({ ...REWARD_TYPES.LESSON_COMPLETE });

    if (wrong === 0) {
        rewards.push({ ...REWARD_TYPES.PERFECT_LESSON });
    }

    if (dailyQuestJustCompleted) {
        rewards.push({ ...REWARD_TYPES.DAILY_QUEST });
    }

    if (isMilestone) {
        rewards.push({ ...REWARD_TYPES.MILESTONE });
    }

    const totalStars = rewards.reduce((sum, r) => sum + r.stars, 0);

    const profile = loadProfile();
    const prevStars = profile.stars;
    profile.stars += totalStars;

    const allWorlds = getAllWorlds();
    const newlyUnlocked = [];

    for (const world of allWorlds) {
        const wasUnlocked = prevStars >= world.requiredStars;
        const isNowUnlocked = profile.stars >= world.requiredStars;
        if (!wasUnlocked && isNowUnlocked) {
            newlyUnlocked.push(world);
            if (!profile.unlockedThemes) {
                profile.unlockedThemes = ["postman"];
            }
            if (!profile.unlockedThemes.includes(world.id)) {
                profile.unlockedThemes.push(world.id);
            }
        }
    }

    saveProfile(profile);

    return { rewards, totalStars, newlyUnlocked };
}
