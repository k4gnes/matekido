export const MILESTONES = [
    {
        lessons: 10,
        title: "🏅 Első postás"
    },
    {
        lessons: 25,
        title: "🏎️ Versenyautó világ"
    },
    {
        lessons: 50,
        title: "🚀 Űrhajó világ"
    },
    {
        lessons: 500,
        title: "🏆 500 lecke mestere"
    }
];

export function getReachedMilestone(profile) {

    return MILESTONES.find(
        milestone => milestone.lessons === profile.lessonsCompleted
    );

}