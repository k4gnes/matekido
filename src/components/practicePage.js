import { getLessonStats, getActiveGrade } from "../profile/Profile.js";

export function getWeakLessonFiles(lessonIndex, grade) {

    const weak = new Set();
    const activeGrade = grade ?? getActiveGrade();

    for (const lesson of lessonIndex.lessons || []) {
        if (activeGrade != null && !(lesson.grades?.includes(activeGrade))) continue;
        const stats = getLessonStats(lesson.file);
        if (stats && stats.percentage < 90) {
            weak.add(lesson.file);
        }
    }

    return weak;

}

export function getNextPracticeLesson(lessonIndex, path) {

    const weak = getWeakLessonFiles(lessonIndex);

    const currentStillWeak = weak.has(path);

    weak.delete(path);

    if (currentStillWeak) {
        return pickNextLesson(lessonIndex, weak);
    }

    return pickNextLesson(lessonIndex, weak);

}

function pickNextLesson(lessonIndex, weakLessonFiles) {

    const lessons = (lessonIndex.lessons || []).filter(l => weakLessonFiles.has(l.file));

    if (lessons.length === 0) return null;

    let next = lessons[0];
    let worst = Infinity;

    for (const lesson of lessons) {
        const stats = getLessonStats(lesson.file);
        const percentage = stats ? stats.percentage : 0;
        if (percentage < worst) {
            worst = percentage;
            next = lesson;
        }
    }

    return next;

}