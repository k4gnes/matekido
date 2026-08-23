import { renderScene } from "../components/scene.js?v=1";
import { renderExercise } from "../components/exercise.js?v=1";
import { renderDecomposition } from "../components/decomposition.js?v=2";
import { renderDecompositionFindWrong } from "../components/decompositionFindWrong.js?v=2";
import { renderMissingNumber } from "../components/missingNumber.js?v=5";
import { renderComparison } from "../components/comparison.js?v=3";
import { renderNeighbor } from "../components/neighbor.js?v=3";
import { renderNeighborSingle } from "../components/neighborSingle.js?v=3";
import { renderPlaceValue } from "../components/placeValue.js?v=3";
import { renderPlaceValueTwoInput } from "../components/placeValueTwoInput.js?v=3";
import { renderBridgeTen } from "../components/bridgeTen.js?v=2";
import { renderSequence } from "../components/sequence.js?v=12";
import { renderOrder } from "../components/order.js?v=10";
import { renderEvenOdd } from "../components/evenOdd.js?v=10";
import { renderPattern } from "../components/pattern.js?v=9";
import { renderShapeSort } from "../components/shapeSort.js?v=10";
import { renderTime } from "../components/time.js?v=10";
import { renderSpatial } from "../components/spatial.js?v=11";
import { renderMoneyPay } from "../components/moneyPay.js?v=12";
import { renderMoneyCompare } from "../components/moneyCompare.js?v=12";
import { renderMoneyEnough } from "../components/moneyEnough.js?v=12";
import { renderMeasureCompare } from "../components/measureCompare.js?v=12";
import { renderMeasureSquares } from "../components/measureSquares.js?v=12";
import { renderWordProblem } from "../components/wordProblem.js?v=17";
import { renderMultPrep } from "../components/multPrep.js?v=4";
import { renderMultiplication } from "../components/multiplication.js?v=4";
import { renderDivision } from "../components/division.js?v=3";
import { renderMissingOperand } from "../components/missingOperand.js?v=3";
import { renderEstimate } from "../components/estimate.js?v=4";
import { renderTrueFalse } from "../components/trueFalse.js?v=4";
import { renderFindError } from "../components/findError.js?v=1";
import { renderShapeCompare } from "../components/shapeCompare.js?v=1";
import { renderSolidShape } from "../components/solidShape.js?v=1";

const COUNTED_TYPES = new Set([
    "exercise",
    "missing-number",
    "comparison",
    "neighbor",
    "neighbor-single",
    "place-value",
    "place-value-two-input",
    "decomposition-find-wrong",
    "bridge-ten",
    "sequence",
    "order",
    "even-odd",
    "pattern",
    "shape-sort",
    "time",
    "spatial",
    "money-pay",
    "money-compare",
    "money-enough",
    "measure-compare",
    "measure-squares",
    "word-problem",
    "equal-groups",
    "repeated-addition",
    "skip-counting",
    "table",
    "missing-factor",
    "match-groups",
    "link",
    "sharing",
    "grouping",
    "division-table",
    "missing-operand",
    "estimate",
    "true-false",
    "find-error",
    "shape-compare",
    "solid-shape"
]);

const isCounted = s => COUNTED_TYPES.has(s.type);


import { renderCelebration } from "../components/celebration.js?v=1";
import { renderProgress } from "../components/progress.js?v=1";
import { renderMissingProgress } from "../components/missingProgress.js?v=2";
import { renderComparisonProgress } from "../components/comparisonProgress.js?v=2";
import { renderNeighborProgress } from "../components/neighborProgress.js?v=2";

import { completeLesson, recordDailyResult, recordPerfectLesson, recordLessonResult, recordSkillResult, getActiveWorld } from "../profile/Profile.js";
import { grantRewards } from "../profile/RewardService.js";

const SKILL_BY_TYPE = {
    "decomposition-find-wrong": "decomposition",
    "neighbor-single": "neighbor",
    "place-value-two-input": "place-value"
};

const RENDERERS = new Map([
    ["exercise", renderExercise],
    ["decomposition", renderDecomposition],
    ["decomposition-find-wrong", renderDecompositionFindWrong],
    ["bridge-ten", renderBridgeTen],
    ["sequence", renderSequence],
    ["order", renderOrder],
    ["even-odd", renderEvenOdd],
    ["pattern", renderPattern],
    ["shape-sort", renderShapeSort],
    ["time", renderTime],
    ["spatial", renderSpatial],
    ["money-pay", renderMoneyPay],
    ["money-compare", renderMoneyCompare],
    ["money-enough", renderMoneyEnough],
    ["measure-compare", renderMeasureCompare],
    ["measure-squares", renderMeasureSquares],
    ["word-problem", renderWordProblem],
    ["equal-groups", renderMultPrep],
    ["repeated-addition", renderMultPrep],
    ["skip-counting", renderMultPrep],
    ["table", renderMultiplication],
    ["missing-factor", renderMultiplication],
    ["match-groups", renderMultiplication],
    ["link", renderMultiplication],
    ["sharing", renderDivision],
    ["grouping", renderDivision],
    ["division-table", renderDivision],
    ["missing-number", renderMissingNumber],
    ["missing-operand", renderMissingOperand],
    ["estimate", renderEstimate],
    ["true-false", renderTrueFalse],
    ["find-error", renderFindError],
    ["shape-compare", renderShapeCompare],
    ["solid-shape", renderSolidShape],
    ["comparison", renderComparison],
    ["neighbor", renderNeighbor],
    ["neighbor-single", renderNeighborSingle],
    ["place-value", renderPlaceValue],
    ["place-value-two-input", renderPlaceValueTwoInput]
]);


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

        if (step.type === "scene") {
            renderScene(step, this.root, () => this.next(), progress, getActiveWorld(), this.onExit);
            return;
        }

        if (step.type === "celebration") {
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

            return;
        }

        const renderer = RENDERERS.get(step.type);

        if (!renderer) {
            console.error("Ismeretlen lépéstípus:", step.type);
            return;
        }

        const skill = step.type === "exercise"
            ? step.kind
            : (SKILL_BY_TYPE[step.type] ?? step.type);

        renderer(
            step,
            this.root,
            () => this.next(),
            progress,
            (isCorrect) => this.onResult(isCorrect, skill),
            () => this.onAttempt()
        );

    }

}