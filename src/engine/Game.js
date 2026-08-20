import { renderScene } from "../components/scene.js";
import { renderExercise } from "../components/exercise.js";
import { renderDecomposition } from "../components/decomposition.js";
import { renderDecompositionFindWrong } from "../components/decompositionFindWrong.js";
import { renderMissingNumber } from "../components/missingNumber.js";
import { renderComparison } from "../components/comparison.js";
import { renderNeighbor } from "../components/neighbor.js";
import { renderNeighborSingle } from "../components/neighborSingle.js";
import { renderPlaceValue } from "../components/placeValue.js";
import { renderPlaceValueTwoInput } from "../components/placeValueTwoInput.js";
import { renderBridgeTen } from "../components/bridgeTen.js";
import { renderSequence } from "../components/sequence.js?v=9";
import { renderOrder } from "../components/order.js?v=9";
import { renderEvenOdd } from "../components/evenOdd.js?v=9";
import { renderPattern } from "../components/pattern.js?v=9";
import { renderShapeSort } from "../components/shapeSort.js?v=9";
import { renderTime } from "../components/time.js?v=10";
import { renderSpatial } from "../components/spatial.js?v=11";
import { renderMoneyPay } from "../components/moneyPay.js?v=10";
import { renderMoneyCompare } from "../components/moneyCompare.js?v=10";
import { renderMoneyEnough } from "../components/moneyEnough.js?v=10";
import { renderMeasureCompare } from "../components/measureCompare.js?v=10";
import { renderMeasureSquares } from "../components/measureSquares.js?v=10";
import { renderWordProblem } from "../components/wordProblem.js?v=13";
import { renderMultPrep } from "../components/multPrep.js?v=1";
import { renderMultiplication } from "../components/multiplication.js?v=2";
import { renderDivision } from "../components/division.js?v=1";
import { renderMissingOperand } from "../components/missingOperand.js?v=1";
import { renderEstimate } from "../components/estimate.js?v=1";
import { renderTrueFalse } from "../components/trueFalse.js?v=1";


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
        this.onPractice = actions.onPractice;
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
                    onProfile: this.onProfile,
                    onPractice: this.onPractice
                },
                milestone,
                reward,
                getActiveWorld()
            );

            return;

        }

        const step = this.lesson.steps[this.currentStep];

        const isCounted = s => s.type === "exercise" || s.type === "missing-number" || s.type === "comparison" || s.type === "neighbor" || s.type === "neighbor-single" || s.type === "place-value" || s.type === "place-value-two-input" || s.type === "decomposition-find-wrong" || s.type === "bridge-ten" || s.type === "sequence" || s.type === "order" || s.type === "even-odd" || s.type === "pattern" || s.type === "shape-sort" || s.type === "time" || s.type === "spatial" || s.type === "money-pay" || s.type === "money-compare" || s.type === "money-enough" || s.type === "measure-compare" || s.type === "measure-squares" || s.type === "word-problem" || s.type === "equal-groups" || s.type === "repeated-addition" || s.type === "skip-counting" || s.type === "table" || s.type === "missing-factor" || s.type === "match-groups" || s.type === "link" || s.type === "sharing" || s.type === "grouping" || s.type === "division-table" || s.type === "missing-operand" || s.type === "estimate" || s.type === "true-false";

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

            case "decomposition-find-wrong":
                renderDecompositionFindWrong(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, "decomposition"), () => this.onAttempt());
                break;

            case "bridge-ten":
                renderBridgeTen(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, "bridge-ten"), () => this.onAttempt());
                break;

            case "sequence":
                renderSequence(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, "sequence"), () => this.onAttempt());
                break;

            case "order":
                renderOrder(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, "order"), () => this.onAttempt());
                break;

            case "even-odd":
                renderEvenOdd(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, "even-odd"), () => this.onAttempt());
                break;

            case "pattern":
                renderPattern(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, "pattern"), () => this.onAttempt());
                break;

            case "shape-sort":
                renderShapeSort(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, "shape-sort"), () => this.onAttempt());
                break;

            case "time":
                renderTime(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, "time"), () => this.onAttempt());
                break;

            case "spatial":
                renderSpatial(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, "spatial"), () => this.onAttempt());
                break;

            case "money-pay":
                renderMoneyPay(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, "money-pay"), () => this.onAttempt());
                break;

            case "money-compare":
                renderMoneyCompare(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, "money-compare"), () => this.onAttempt());
                break;

            case "money-enough":
                renderMoneyEnough(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, "money-enough"), () => this.onAttempt());
                break;

            case "measure-compare":
                renderMeasureCompare(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, "measure-compare"), () => this.onAttempt());
                break;

            case "measure-squares":
                renderMeasureSquares(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, "measure-squares"), () => this.onAttempt());
                break;

            case "word-problem":
                renderWordProblem(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, "word-problem"), () => this.onAttempt());
                break;

            case "equal-groups":
            case "repeated-addition":
            case "skip-counting":
                renderMultPrep(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, step.type), () => this.onAttempt());
                break;

            case "table":
            case "missing-factor":
            case "match-groups":
            case "link":
                renderMultiplication(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, step.type), () => this.onAttempt());
                break;

            case "sharing":
            case "grouping":
            case "division-table":
                renderDivision(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, step.type), () => this.onAttempt());
                break;

            case "missing-number":
                renderMissingNumber(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, "missing-number"), () => this.onAttempt());
                break;

            case "missing-operand":
                renderMissingOperand(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, "missing-operand"), () => this.onAttempt());
                break;

            case "estimate":
                renderEstimate(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, "estimate"), () => this.onAttempt());
                break;

            case "true-false":
                renderTrueFalse(step, this.root, () => this.next(), progress, (isCorrect) => this.onResult(isCorrect, "true-false"), () => this.onAttempt());
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
                    onProfile: this.onProfile,
                    onPractice: this.onPractice
                }, milestone2, reward2, getActiveWorld());

                break;
            }

            default:
                console.error("Ismeretlen lépéstípus:", step.type);

        }

    }

}