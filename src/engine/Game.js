import { renderScene } from "../components/scene.js";
import { renderExercise } from "../components/exercise.js";
import { renderDecomposition } from "../components/decomposition.js";
import { renderMissingNumber } from "../components/missingNumber.js";
import { renderComparison } from "../components/comparison.js";
import { renderNeighbor } from "../components/neighbor.js";
import { renderNeighborSingle } from "../components/neighborSingle.js";
import { renderPlaceValue } from "../components/placeValue.js";
import { renderPlaceValueTwoInput } from "../components/placeValueTwoInput.js";


import { renderCelebration } from "../components/celebration.js";
import { renderProgress } from "../components/progress.js";
import { renderMissingProgress } from "../components/missingProgress.js";
import { renderComparisonProgress } from "../components/comparisonProgress.js";
import { renderNeighborProgress } from "../components/neighborProgress.js";

import { completeLesson, recordDailyResult, recordPerfectLesson, recordLessonResult, recordSkillResult, getActiveWorld } from "../profile/Profile.js";
import { grantRewards } from "../profile/RewardService.js";


export class Game {

    constructor(lesson, root, actions = {}, lessonFile = null, skill = null) {

        this.lesson = lesson;
        this.root = root;
        this.lessonFile = lessonFile;
        this.skill = skill;
        this.currentStep = 0;
        this.correct = 0;
        this.wrong = 0;
        this.attempts = 0;
        this.byType = {};

        this.onRestart = actions.onRestart;
        this.onExit = actions.onExit;
        this.onProfile = actions.onProfile;
    }

    onAttempt() {
        this.attempts++;
    }

    start() {
        this.render();
    }

    next() {

        this.currentStep++;

        this.render();

    }

    onResult(isCorrect, type) {
        if (isCorrect) {
            this.correct++;
        } else {
            this.wrong++;
        }
        if (type) {
            if (!this.byType[type]) {
                this.byType[type] = { correct: 0, wrong: 0 };
            }
            if (isCorrect) {
                this.byType[type].correct++;
            } else {
                this.byType[type].wrong++;
            }
        }
    }

    render() {

        if (this.currentStep >= this.lesson.steps.length) {
            let milestone = null;
            let reward = null;

            if (!this.lesson.completed) {
                try {
                    const profileBefore = completeLesson();
                    const dailyQuestJustCompleted = profileBefore && !profileBefore.dailyQuestCompleted;
                    recordDailyResult(this.correct, this.wrong, this.byType);
                    if (this.lessonFile) {
                        recordLessonResult(this.lessonFile, this.correct, this.wrong);
                    }
                    if (this.skill) {
                        recordSkillResult(this.skill, this.correct, this.wrong);
                    }
                    if (this.wrong === 0) {
                        recordPerfectLesson();
                    }
                    milestone = profileBefore?.milestone ?? null;
                    reward = grantRewards({
                        correct: this.correct,
                        wrong: this.wrong,
                        isMilestone: !!milestone,
                        dailyQuestJustCompleted
                    });
                } catch (e) { console.error(e); }
                this.lesson.completed = true;
            }

            renderCelebration(
                {
                    title: "🎉 Nagyszerű!",
                    text: this.wrong === 0
                        ? "Tökéletes! Egyetlen hiba sem volt!"
                        : "Minden feladatot megoldottál!"
                },
                this.root,
                {
                    onRestart: this.onRestart,
                    onExit: this.onExit,
                    onProfile: this.onProfile
                },
                milestone,
                reward,
                getActiveWorld()
            );

            return;

        }

        const step = this.lesson.steps[this.currentStep];

        const isCounted = s => s.type === "exercise" || s.type === "missing-number" || s.type === "comparison" || s.type === "neighbor" || s.type === "neighbor-single" || s.type === "place-value" || s.type === "place-value-two-input";

        const totalExercises = this.lesson.steps.filter(isCounted).length;
        const completedExercises = this.lesson.steps
            .slice(0, this.currentStep)
            .filter(isCounted).length;

        const progressCurrent = isCounted(step)
            ? completedExercises + 1
            : completedExercises;

        const hasMissing = this.lesson.steps.some(s => s.type === "missing-number");
        const hasComparison = this.lesson.steps.some(s => s.type === "comparison");
        const hasNeighbor = this.lesson.steps.some(s => s.type === "neighbor" || s.type === "neighbor-single");

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
                renderScene(step, this.root, () => this.next(), progress, getActiveWorld(), this.onExit);
                break;

            case "exercise":
                renderExercise(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, step.kind), () => this.onAttempt());
                break;

            case "decomposition":
                renderDecomposition(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, "decomposition"), () => this.onAttempt());
                break;

            case "missing-number":
                renderMissingNumber(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, "missing-number"), () => this.onAttempt());
                break;

            case "comparison":
                renderComparison(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, "comparison"), () => this.onAttempt());
                break;

            case "neighbor":
                renderNeighbor(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, "neighbor"), () => this.onAttempt());
                break;

            case "neighbor-single":
                renderNeighborSingle(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, "neighbor"), () => this.onAttempt());
                break;

            case "place-value":
                renderPlaceValue(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, "place-value"), () => this.onAttempt());
                break;

            case "place-value-two-input":
                renderPlaceValueTwoInput(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, "place-value"), () => this.onAttempt());
                break;

            case "celebration": {
                let milestone2 = null;
                let reward2 = null;
                if (!this.lesson.completed) {
                    try {
                        const result2 = completeLesson();
                        recordDailyResult(this.correct, this.wrong, this.byType);
                        if (this.lessonFile) {
                            recordLessonResult(this.lessonFile, this.correct, this.wrong);
                        }
                        if (this.skill) {
                            recordSkillResult(this.skill, this.correct, this.wrong);
                        }
                        if (this.wrong === 0) {
                            recordPerfectLesson();
                        }
                        milestone2 = result2.milestone;
                        reward2 = grantRewards({
                            correct: this.correct,
                            wrong: this.wrong,
                            isMilestone: !!milestone2,
                            dailyQuestJustCompleted: result2.dailyQuestJustCompleted
                        });
                    } catch (e) { console.error(e); }
                    this.lesson.completed = true;
                }

                renderCelebration(step, this.root, {
                    onRestart: this.onRestart,
                    onExit: this.onExit,
                    onProfile: this.onProfile
                }, milestone2, reward2, getActiveWorld());

                break;
            }

            default:
                console.error("Ismeretlen lépéstípus:", step.type);

        }

    }

}