import { renderScene } from "../components/scene.js";
import { renderExercise } from "../components/exercise.js";
import { renderCelebration } from "../components/celebration.js";
import { renderProgress } from "../components/progress.js";

export class Game {

    constructor(lesson, root, actions = {}) {

        this.lesson = lesson;
        this.root = root;
        this.currentStep = 0;

        this.onRestart = actions.onRestart;
        this.onExit = actions.onExit;
    }

    start() {
        this.render();
    }

    next() {

        this.currentStep++;

        this.render();

    }

    render() {

        if (this.currentStep >= this.lesson.steps.length) {

            renderCelebration(
                {
                    title: "🎉 Nagyszerű!",
                    text: "Minden feladatot megoldottál!"
                },
                this.root,
                {
                    onRestart: this.onRestart,
                    onExit: this.onExit
                }
            );

            return;

        }

        const step = this.lesson.steps[this.currentStep];

        renderProgress(
            this.currentStep,
            this.lesson.steps.length,
            this.root
        );

        switch (step.type) {

            case "scene":
                renderScene(step, this.root, () => this.next());
                break;

            case "exercise":
                renderExercise(step, this.root, () => this.next());
                break;

            case "celebration":
                renderCelebration(step, this.root, {
                    onRestart: this.onRestart,
                    onExit: this.onExit
                });
                break;

            default:
                console.error("Ismeretlen lépéstípus:", step.type);

        }

    }

}