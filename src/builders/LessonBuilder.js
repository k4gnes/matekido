import { generate } from "../generators/index.js?v=3";

export function buildLesson(lesson) {

    const steps = [];

    for (const step of lesson.steps) {

        if (step.type !== "exercise") {
            steps.push(step);
            continue;
        }

        const tasks = generate(step);

        tasks.forEach((task, index) => {

            steps.push({
                type: "exercise",
                kind: "addition",
                title: `🏠 ${index + 1}. ház`,
                a: task.a,
                b: task.b
            });

        });

    }

    return {
        ...lesson,
        steps
    };

}