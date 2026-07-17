import { renderScene } from "../components/scene.js";
import { renderExercise } from "../components/exercise.js";
import { renderDecomposition } from "../components/decomposition.js";
import { renderMissingNumber } from "../components/missingNumber.js";
import { renderComparison } from "../components/comparison.js";
import { renderNeighbor } from "../components/neighbor.js";


import { renderCelebration } from "../components/celebration.js";
import { renderProgress } from "../components/progress.js";
import { renderMissingProgress } from "../components/missingProgress.js";
import { renderComparisonProgress } from "../components/comparisonProgress.js";
import { renderNeighborProgress } from "../components/neighborProgress.js";

import { completeLesson } from "../profile/Profile.js";


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

            if (!this.lesson.completed) {
                completeLesson();
                this.lesson.completed = true;
            }

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

        const isCounted = s => s.type === "exercise" || s.type === "missing-number" || s.type === "comparison" || s.type === "neighbor";

        const totalExercises = this.lesson.steps.filter(isCounted).length;
        const completedExercises = this.lesson.steps
            .slice(0, this.currentStep)
            .filter(isCounted).length;

        const progressCurrent = isCounted(step)
            ? completedExercises + 1
            : completedExercises;

        const hasMissing = this.lesson.steps.some(s => s.type === "missing-number");
        const hasComparison = this.lesson.steps.some(s => s.type === "comparison");
        const hasNeighbor = this.lesson.steps.some(s => s.type === "neighbor");

        let progress;
        if (hasComparison) {
            progress = renderComparisonProgress({ current: progressCurrent, total: totalExercises });
        } else if (hasNeighbor) {
            progress = renderNeighborProgress({ current: progressCurrent, total: totalExercises });
        } else if (hasMissing) {
            progress = renderMissingProgress({ current: progressCurrent, total: totalExercises });
        } else {
            progress = renderProgress({ current: progressCurrent, total: totalExercises });
        }

        switch (step.type) {

            case "scene":
                renderScene(step, this.root, () => this.next(), progress);
                break;

            case "exercise":
                renderExercise(step, this.root, () => this.next(), progress);
                break;

            case "decomposition":
                renderDecomposition(step, this.root, () => this.next(), progress);
                break;

            case "missing-number":
                renderMissingNumber(step, this.root, () => this.next(), progress);
                break;

            case "comparison":
                renderComparison(step, this.root, () => this.next(), progress);
                break;

            case "neighbor":
                renderNeighbor(step, this.root, () => this.next(), progress);
                break;

            case "celebration":
                if (!this.lesson.completed) {
                    completeLesson();
                    this.lesson.completed = true;
                }

                renderCelebration(step, this.root, {
                    onRestart: this.onRestart,
                    onExit: this.onExit
                }
                );

                break;

            default:
                console.error("Ismeretlen lépéstípus:", step.type);

        }

    }

}