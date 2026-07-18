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
    }
];

export function getReachedMilestone(profile) {

    return MILESTONES.find(
        milestone => milestone.lessons === profile.lessonsCompleted
    );

}