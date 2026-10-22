import { getLessonStats, getActiveGrade } from "../profile/Profile.js";

// Az ismétlésnél az utolsó próba számít; a régi mentésekben még nincs ilyen,
// ott a teljes előélet százaléka marad.
export function latestPercentage(stats) {
    if (!stats) return null;
    return stats.lastPercentage ?? stats.percentage ?? null;
}

export function getWeakLessonFiles(lessonIndex, grade) {

    const weak = new Set();
    const activeGrade = grade ?? getActiveGrade();

    for (const lesson of lessonIndex.lessons || []) {
        if (activeGrade != null && !(lesson.grades?.includes(activeGrade))) continue;
        const percentage = latestPercentage(getLessonStats(lesson.file));
        if (percentage !== null && percentage < 90) {
            weak.add(lesson.file);
        }
    }

    return weak;

}

export const REVIEW_INTERVAL_DAYS = 14;
export const PRACTICE_BLOCK_MAX = 8;

export function isReviewDue(lesson, now = Date.now()) {

    if (lesson.practice) return false;
    const stats = getLessonStats(lesson.file);
    const percentage = latestPercentage(stats);
    if (percentage === null || percentage < 90) return false;
    if (!stats.lastDoneAt) return false;
    return stats.lastDoneAt <= now - REVIEW_INTERVAL_DAYS * 24 * 60 * 60 * 1000;

}

export function getReviewDueLessons(lessonIndex, grade, now = Date.now()) {

    const activeGrade = grade ?? getActiveGrade();
    const due = [];

    for (const lesson of lessonIndex.lessons || []) {
        if (!lesson.grades?.includes(activeGrade)) continue;
        if (!isReviewDue(lesson, now)) continue;
        due.push({ lesson, lastDoneAt: getLessonStats(lesson.file).lastDoneAt });
    }

    due.sort((a, b) => a.lastDoneAt - b.lastDoneAt);

    return due.map(entry => entry.lesson);

}

export function getPracticeLessonFiles(lessonIndex, grade) {

    const weak = getWeakLessonFiles(lessonIndex, grade);
    const files = [];
    const seen = new Set();

    const weakLessons = (lessonIndex.lessons || [])
        .filter(l => weak.has(l.file))
        .sort((a, b) => (latestPercentage(getLessonStats(a.file)) ?? 0) - (latestPercentage(getLessonStats(b.file)) ?? 0));

    for (const lesson of weakLessons) {
        files.push(lesson.file);
        seen.add(lesson.file);
    }

    for (const lesson of getReviewDueLessons(lessonIndex, grade)) {
        if (seen.has(lesson.file)) continue;
        files.push(lesson.file);
        seen.add(lesson.file);
    }

    return files.slice(0, PRACTICE_BLOCK_MAX);

}
