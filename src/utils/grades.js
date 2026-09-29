export function gradesWithLessons(index) {
    const config = index?.gradeConfig || [];
    const lessons = index?.lessons || [];
    const used = new Set();

    lessons.forEach(l => (l.grades || []).forEach(g => used.add(g)));

    return config.filter(gc => used.has(gc.grade));
}
