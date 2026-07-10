import { generate } from "../generators/index.js";

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
                ...task,
                title: `🏠 ${index + 1}. ház`
            });

        });

    }

    return {
        ...lesson,
        steps
    };

}