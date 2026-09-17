import { renderScene } from "../components/scene.js?v=6";
import { createInstructionHelp } from "../components/ui/instruction.js";
import { createExitButton } from "../components/ui/exit.js";
import { renderExercise } from "../components/exercise.js?v=5";
import { renderDecomposition } from "../components/decomposition.js?v=2";
import { renderDecompositionFindWrong } from "../components/decompositionFindWrong.js?v=3";
import { renderMissingNumber } from "../components/missingNumber.js?v=7";
import { renderComparison } from "../components/comparison.js?v=5";
import { renderNeighbor } from "../components/neighbor.js?v=5";
import { renderNeighborSingle } from "../components/neighborSingle.js?v=5";
import { renderNeighborRound } from "../components/neighborRound.js?v=2";
import { renderPlaceValue } from "../components/placeValue.js?v=5";
import { renderPlaceValueTwoInput } from "../components/placeValueTwoInput.js?v=5";
import { renderBridgeTen } from "../components/bridgeTen.js?v=12";
import { renderSequence } from "../components/sequence.js?v=14";
import { renderOrder } from "../components/order.js?v=15";
import { renderEvenOdd } from "../components/evenOdd.js?v=13";
import { renderPattern } from "../components/pattern.js?v=10";
import { renderShapeSort } from "../components/shapeSort.js?v=14";
import { renderTime } from "../components/time.js?v=10";
import { renderTimeConvert } from "../components/timeConvert.js?v=1";
import { renderSpatial } from "../components/spatial.js?v=26";
import { renderMoneyPay } from "../components/moneyPay.js?v=15";
import { renderMoneyCompare } from "../components/moneyCompare.js?v=13";
import { renderMoneyEnough } from "../components/moneyEnough.js?v=13";
import { renderMeasureCompare } from "../components/measureCompare.js?v=13";
import { renderMeasureSquares } from "../components/measureSquares.js?v=15";
import { renderWordProblem } from "../components/wordProblem.js?v=20";
import { renderMultPrep } from "../components/multPrep.js?v=8";
import { renderMultiplication } from "../components/multiplication.js?v=6";
import { renderDivision } from "../components/division.js?v=5";
import { renderMissingOperand } from "../components/missingOperand.js?v=5";
import { renderEstimate } from "../components/estimate.js?v=6";
import { renderTrueFalse } from "../components/trueFalse.js?v=5";
import { renderFindError } from "../components/findError.js?v=2";
import { renderShapeCompare } from "../components/shapeCompare.js?v=3";
import { renderSolidShape } from "../components/solidShape.js?v=2";
import { renderWeight } from "../components/weight.js?v=2";
import { renderVolume } from "../components/volume.js?v=2";
import { renderMoneyChange } from "../components/moneyChange.js?v=3";
import { renderPlaceValueHundreds } from "../components/placeValueHundreds.js?v=3";
import { renderPlaceValueThousands } from "../components/placeValueThousands.js?v=2";
import { renderNumberName } from "../components/numberName.js?v=2";
import { renderRounding } from "../components/rounding.js?v=4";
import { renderRoman } from "../components/roman.js?v=2";
import { renderTransform } from "../components/transform.js?v=3";
import { renderMirror } from "../components/mirror.js?v=3";
import { renderSetMatch } from "../components/setMatch.js?v=1";
import { renderDataChart } from "../components/dataChart.js?v=3";
import { renderCalendar } from "../components/calendar.js?v=2";
import { renderFraction } from "../components/fraction.js?v=6";
import { renderFractionOf } from "../components/fractionOf.js?v=1";
import { renderMeasureUnits } from "../components/measureUnits.js?v=2";
import { renderWrittenOperation } from "../components/writtenOperation.js?v=10";
import { renderRemainderDivision } from "../components/remainderDivision.js?v=6";
import { renderPerimeter } from "../components/perimeter.js?v=1";
import { renderArea } from "../components/area.js?v=1";
import { renderAngles } from "../components/angles.js?v=1";
import { renderCircle } from "../components/circle.js?v=1";
import { renderProbability } from "../components/probability.js?v=1";
import { renderOperationOrder } from "../components/operationOrder.js?v=1";

const COUNTED_TYPES = new Set([
    "exercise",
    "missing-number",
    "comparison",
    "neighbor",
    "neighbor-single",
    "neighbor-round",
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
    "time-convert",
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
    "solid-shape",
    "weight",
    "volume",
    "money-change",
"place-value-hundreds",
    "place-value-thousands",
    "number-name",
    "rounding",
    "roman",
    "transform",
    "mirror",
    "set-match",
    "data-chart",
    "calendar",
"fraction",
    "fraction-of",
    "measure-units",
    "written-operation",
    "remainder-division",
    "perimeter",
    "area",
    "angles",
    "circle",
    "probability",
    "operation-order"
]);

const isCounted = s => COUNTED_TYPES.has(s.type);


import { renderCelebration } from "../components/celebration.js?v=9";
import { renderProgress } from "../components/progress.js?v=2";
import { renderMissingProgress } from "../components/missingProgress.js?v=3";
import { renderComparisonProgress } from "../components/comparisonProgress.js?v=3";
import { renderNeighborProgress } from "../components/neighborProgress.js?v=3";

import { completeLesson, recordDailyResult, recordPerfectLesson, recordLessonResult, recordSkillResult, resolveSkippedLesson, getLessonStats, getActiveWorld, isFavoriteLesson, toggleFavoriteLesson, resolveLessonGrade } from "../profile/Profile.js";
import { grantRewards } from "../profile/RewardService.js";

const SKILL_BY_TYPE = {
    "decomposition-find-wrong": "decomposition",
    "neighbor-single": "neighbor",
    "neighbor-round": "neighbor",
    "place-value-two-input": "place-value",
    "place-value-thousands": "place-value"
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
    ["time-convert", renderTimeConvert],
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
    ["weight", renderWeight],
    ["volume", renderVolume],
    ["money-change", renderMoneyChange],
    ["comparison", renderComparison],
    ["neighbor", renderNeighbor],
    ["neighbor-single", renderNeighborSingle],
    ["neighbor-round", renderNeighborRound],
    ["place-value", renderPlaceValue],
    ["place-value-two-input", renderPlaceValueTwoInput],
    ["place-value-hundreds", renderPlaceValueHundreds],
    ["place-value-thousands", renderPlaceValueThousands],
    ["number-name", renderNumberName],
    ["rounding", renderRounding],
    ["roman", renderRoman],
    ["transform", renderTransform],
    ["mirror", renderMirror],
    ["set-match", renderSetMatch],
    ["data-chart", renderDataChart],
    ["calendar", renderCalendar],
    ["fraction", renderFraction],
    ["fraction-of", renderFractionOf],
    ["measure-units", renderMeasureUnits],
    ["written-operation", renderWrittenOperation],
    ["remainder-division", renderRemainderDivision],
    ["perimeter", renderPerimeter],
    ["area", renderArea],
    ["angles", renderAngles],
    ["circle", renderCircle],
    ["probability", renderProbability],
    ["operation-order", renderOperationOrder]
]);


export class Game {

    constructor(lesson, root, actions = {}, lessonFile = null, skill = null, lessonIndex = null, source = null) {

        this.lesson = lesson;
        this.root = root;
        this.lessonFile = lessonFile;
        this.skill = skill;
        this.lessonIndex = lessonIndex;
        this.source = source;
        this.currentStep = 0;
        this.instructionTitle = null;
        this.instructionText = null;
        this.correct = 0;
        this.wrong = 0;
        this.attempts = 0;
        this.byType = {};

        this.onRestart = actions.onRestart;
        this.onExit = actions.onExit;
        this.onProfile = actions.onProfile;
        this.onNext = actions.onNext;
        this.onSkipNext = actions.onSkipNext;
        this.onGradeComplete = actions.onGradeComplete;
    }

    getLessonPosition() {
        if (!this.lessonIndex || !this.lessonFile) return null;
        const allLessons = this.lessonIndex.lessons || [];
        const idx = allLessons.findIndex(l => l.file === this.lessonFile);
        if (idx === -1) return null;
        const grade = resolveLessonGrade(allLessons[idx]);
        if (grade == null) return null;
        const gradeLessons = allLessons.filter(l => l.grades?.includes(grade));
        const posInGrade = gradeLessons.findIndex(l => l.file === this.lessonFile);
        return { position: posInGrade + 1, total: gradeLessons.length };
    }

    getLessonGrade() {
        if (!this.lessonIndex || !this.lessonFile) return null;
        const allLessons = this.lessonIndex.lessons || [];
        const entry = allLessons.find(l => l.file === this.lessonFile);
        return resolveLessonGrade(entry);
    }

    isGradeComplete() {
        if (!this.lessonIndex || !this.lessonFile) return false;
        const allLessons = this.lessonIndex.lessons || [];
        const grade = this.getLessonGrade();
        if (grade == null) return false;
        const gradeLessons = allLessons.filter(l => l.grades?.includes(grade));
        return gradeLessons.length > 0 && gradeLessons.every(l => getLessonStats(l.file));
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
                        resolveSkippedLesson(this.lessonFile);
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
                    onNext: this.onNext
                },
                milestone,
                reward,
                getActiveWorld(),
                this.lessonIndex
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
            const worldStep = step.worldTitles?.[getActiveWorld()] ?? null;
            this.instructionTitle = worldStep?.title ?? step.title;
            this.instructionText = worldStep?.text ?? step.text;
            const lessonPos = this.getLessonPosition();
            renderScene(step, this.root, () => this.next(), progress, getActiveWorld(), this.onExit, lessonPos, this.onSkipNext, this.lessonFile, this.source);
            return;
        }

        if (step.type === "celebration") {
            let milestone2 = null;
            let reward2 = null;
            let gradeJustCompleted = false;
            if (!this.lesson.completed) {
                const gradeWasComplete = this.isGradeComplete();
                try {
                    const result2 = completeLesson();
                    recordDailyResult(this.correct, this.wrong, this.byType);
                    if (this.lessonFile) {
                        recordLessonResult(this.lessonFile, this.correct, this.wrong);
                        resolveSkippedLesson(this.lessonFile);
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
                gradeJustCompleted = !gradeWasComplete && this.isGradeComplete();
            }

            renderCelebration(step, this.root, {
                onRestart: this.onRestart,
                onExit: this.onExit,
                onProfile: this.onProfile,
                onNext: gradeJustCompleted && this.onGradeComplete ? this.onGradeComplete : this.onNext
            }, milestone2, reward2, getActiveWorld(), this.lessonIndex);

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

        const card = this.root.querySelector(".card");
        const helpTitle = this.instructionTitle ?? step.title;
        const helpText = this.instructionText ?? step.text;
        if (card) {
            const cornerBar = document.createElement("div");
            cornerBar.className = "corner-buttons";
            if (helpTitle || helpText) {
                cornerBar.append(createInstructionHelp(helpTitle, helpText));
            }
            if (this.lessonFile) {
                const isFav = isFavoriteLesson(this.lessonFile);
                const favBtn = document.createElement("button");
                favBtn.type = "button";
                favBtn.className = "exercise-fav";
                favBtn.textContent = isFav ? "❤️" : "🤍";
                favBtn.title = isFav ? "Kedvencekből törlés" : "Kedvencekhez adás";
                favBtn.setAttribute("aria-label", "Kedvenc váltása");
                favBtn.addEventListener("click", () => {
                    const nowFav = toggleFavoriteLesson(this.lessonFile);
                    favBtn.textContent = nowFav ? "❤️" : "🤍";
                    favBtn.title = nowFav ? "Kedvencekből törlés" : "Kedvencekhez adás";
                });
                cornerBar.append(favBtn);
            }
            if (this.onExit) {
                cornerBar.append(createExitButton(this.onExit));
            }
            card.insertBefore(cornerBar, card.firstChild);
        }

    }

}