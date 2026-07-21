import { loadProfile, saveProfile } from "./Profile.js";

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
    profile.stars += totalStars;
    saveProfile(profile);

    return { rewards, totalStars };
}
