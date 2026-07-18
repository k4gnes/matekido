export const ACHIEVEMENTS = [
    {
        id: "first-postman",
        icon: "📯",
        title: "Első postás",
        lessons: 10
    },
    {
        id: "experienced-postman",
        icon: "📮",
        title: "Tapasztalt postás",
        lessons: 25
    },
    {
        id: "master-postman",
        icon: "🏆",
        title: "Mesterpostás",
        lessons: 50
    }
];

export function getUnlockedAchievements(profile) {

    return ACHIEVEMENTS.filter(
        achievement => profile.lessonsCompleted >= achievement.lessons
    );

}