import { getLessonStats, getActiveGrade } from "../profile/Profile.js";

export function getWeakLessonFiles(lessonIndex, grade) {

    const weak = new Set();
    const activeGrade = grade ?? getActiveGrade();

    for (const lesson of lessonIndex.lessons || []) {
        if (activeGrade != null && !(lesson.grades?.includes(activeGrade))) continue;
        const stats = getLessonStats(lesson.file);
        if (stats && stats.percentage !== null && stats.percentage < 90) {
            weak.add(lesson.file);
        }
    }

    return weak;

}

export const REVIEW_INTERVAL_DAYS = 14;
export const REVIEW_BLOCK_MAX = 8;

export function isReviewDue(lesson, now = Date.now()) {

    if (lesson.practice) return false;
    const stats = getLessonStats(lesson.file);
    if (!stats || stats.percentage === null || stats.percentage < 90) return false;
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

    return due.slice(0, REVIEW_BLOCK_MAX).map(entry => entry.lesson);

}

export function getPracticeLessonFiles(lessonIndex, grade) {

    const weak = getWeakLessonFiles(lessonIndex, grade);
    const files = [];
    const seen = new Set();

    const weakLessons = (lessonIndex.lessons || [])
        .filter(l => weak.has(l.file))
        .sort((a, b) => (getLessonStats(a.file)?.percentage ?? 0) - (getLessonStats(b.file)?.percentage ?? 0));

    for (const lesson of weakLessons) {
        files.push(lesson.file);
        seen.add(lesson.file);
    }

    for (const lesson of getReviewDueLessons(lessonIndex, grade)) {
        if (seen.has(lesson.file)) continue;
        files.push(lesson.file);
        seen.add(lesson.file);
    }

    return files;

}

export function getNextPracticeLesson(lessonIndex, path) {

    const files = new Set(getPracticeLessonFiles(lessonIndex));
    files.delete(path);
    return pickNextLesson(lessonIndex, files);

}

function pickNextLesson(lessonIndex, weakLessonFiles) {

    const lessons = (lessonIndex.lessons || []).filter(l => weakLessonFiles.has(l.file));

    if (lessons.length === 0) return null;

    let next = lessons[0];
    let worst = Infinity;

    for (const lesson of lessons) {
        const stats = getLessonStats(lesson.file);
        if (stats?.practice) continue;
        const percentage = stats ? stats.percentage : 0;
        if (percentage < worst) {
            worst = percentage;
            next = lesson;
        }
    }

    return next;

}