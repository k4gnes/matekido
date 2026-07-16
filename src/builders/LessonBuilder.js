import { generate } from "../generators/index.js?v=3";

export function buildLesson(lesson) {

    const steps = lesson.steps || [];

    const result = [];

    for (const step of steps) {

        if (step.type !== "exercise") {
            result.push(step);
            continue;
        }

        const tasks = generate(step);

        tasks.forEach((task, index) => {

            if (step.generator === "missing-to-10" || step.generator === "missing-random") {
                result.push({
                    type: "missing-number",
                    a: task.a,
                    sum: task.sum,
                    answer: task.answer
                });
            } else {
                result.push({
                    type: "exercise",
                    kind: "addition",
                    title: `🏠 ${index + 1}. ház`,
                    a: task.a,
                    b: task.b
                });
            }

        });

    }

    return {
        ...lesson,
        steps: result
    };

}