import { renderScene } from "../components/scene.js?v=11";
import { createInstructionHelp } from "../components/ui/instruction.js";
import { HINT_TYPES, lessonHasHint } from "../data/hintLessons.js";
import { createExitButton } from "../components/ui/exit.js";
import { renderExercise } from "../components/exercise.js?v=5";
import { renderDecomposition } from "../components/decomposition.js?v=5";
import { renderDecompositionFindWrong } from "../components/decompositionFindWrong.js?v=5";
import { renderMissingNumber } from "../components/missingNumber.js?v=8";
import { renderComparison } from "../components/comparison.js?v=7";
import { renderNeighbor } from "../components/neighbor.js?v=5";
import { renderNeighborSingle } from "../components/neighborSingle.js?v=6";
import { renderNeighborRound } from "../components/neighborRound.js?v=6";
import { renderPlaceValue } from "../components/placeValue.js?v=8";
import { renderPlaceValueTwoInput } from "../components/placeValueTwoInput.js?v=7";
import { renderBridgeTen } from "../components/bridgeTen.js?v=14";
import { renderSequence } from "../components/sequence.js?v=15";
import { renderOrder } from "../components/order.js?v=16";
import { renderEvenOdd } from "../components/evenOdd.js?v=13";
import { renderPattern } from "../components/pattern.js?v=12";
import { renderShapeSort } from "../components/shapeSort.js?v=14";
import { renderTime } from "../components/time.js?v=13";
import { renderTimeConvert } from "../components/timeConvert.js?v=2";
import { renderSpatial } from "../components/spatial.js?v=30";
import { renderMoneyPay } from "../components/moneyPay.js?v=16";
import { renderMoneyCompare } from "../components/moneyCompare.js?v=14";
import { renderMoneyEnough } from "../components/moneyEnough.js?v=14";
import { renderMeasureCompare } from "../components/measureCompare.js?v=14";
import { renderMeasureSquares } from "../components/measureSquares.js?v=16";
import { renderWordProblem } from "../components/wordProblem.js?v=25";
import { renderMultPrep } from "../components/multPrep.js?v=9";
import { renderMultiplication } from "../components/multiplication.js?v=7";
import { renderMultiplicationPlay } from "../components/multiplicationPlay.js?v=10";
import { renderOperationOrderPlay } from "../components/operationOrderPlay.js?v=5";
import { renderDivision } from "../components/division.js?v=6";
import { renderMissingOperand } from "../components/missingOperand.js?v=6";
import { renderEstimate } from "../components/estimate.js?v=8";
import { renderTrueFalse } from "../components/trueFalse.js?v=6";
import { renderFindError } from "../components/findError.js?v=3";
import { renderShapeCompare } from "../components/shapeCompare.js?v=4";
import { renderSolidShape } from "../components/solidShape.js?v=4";
import { renderPolygon } from "../components/polygon.js?v=5";
import { renderElapsedTime } from "../components/elapsedTime.js?v=2";
import { renderLengthUnits } from "../components/lengthUnits.js?v=2";
import { renderCompoundShape } from "../components/compoundShape.js?v=3";
import { renderShapeFormula } from "../components/shapeFormula.js?v=4";
import { renderWeight } from "../components/weight.js?v=3";
import { renderVolume } from "../components/volume.js?v=3";
import { renderMoneyChange } from "../components/moneyChange.js?v=5";
import { renderPlaceValueHundreds } from "../components/placeValueHundreds.js?v=6";
import { renderPlaceValueThousands } from "../components/placeValueThousands.js?v=9";
import { renderNumberName } from "../components/numberName.js?v=3";
import { renderRounding } from "../components/rounding.js?v=6";
import { renderRoman } from "../components/roman.js?v=2";
import { renderTransform } from "../components/transform.js?v=4";
import { renderMirror } from "../components/mirror.js?v=4";
import { renderSetMatch } from "../components/setMatch.js?v=3";
import { renderDataChart } from "../components/dataChart.js?v=4";
import { renderCalendar } from "../components/calendar.js?v=3";
import { renderFraction } from "../components/fraction.js?v=8";
import { renderFractionOf } from "../components/fractionOf.js?v=3";
import { renderFractionEqualDen } from "../components/fractionEqualDen.js?v=2";
import { renderFractionEqual } from "../components/fractionEqual.js?v=1";
import { renderFractionCommonDen } from "../components/fractionCommonDen.js?v=1";
import { renderFractionTimesInt } from "../components/fractionTimesInt.js?v=1";
import { renderFractionTimesFrac } from "../components/fractionTimesFrac.js?v=1";
import { renderFractionDivide } from "../components/fractionDivide.js?v=1";
import { renderDecimal } from "../components/decimal.js?v=5";
import { renderPercent } from "../components/percent.js?v=1";
import { renderDivisibility } from "../components/divisibility.js?v=2";
import { renderAngleMeasure } from "../components/angleMeasure.js?v=2";
import { renderMeasureUnits } from "../components/measureUnits.js?v=13";
import { renderWrittenOperation } from "../components/writtenOperation.js?v=12";
import { renderRemainderDivision } from "../components/remainderDivision.js?v=7";
import { renderWrittenDivision } from "../components/writtenDivision.js?v=4";
import { renderPerimeter } from "../components/perimeter.js?v=2";
import { renderArea } from "../components/area.js?v=2";
import { renderAngles } from "../components/angles.js?v=2";
import { renderCircle } from "../components/circle.js?v=2";
import { renderProbability } from "../components/probability.js?v=2";
import { renderOperationOrder } from "../components/operationOrder.js?v=2";

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
    "written-division",
"fraction-equal-den",
"fraction-equal",
"fraction-common-den",
"fraction-times-int",
"fraction-times-frac",
"fraction-divide",
"decimal",
"percent",
"divisibility",
    "angle-measure",
    "perimeter",
    "area",
    "angles",
    "circle",
    "probability",
    "operation-order",
    "polygon",
    "elapsed-time",
    "length-units",
    "compound-shape",
    "shape-formula"
]);

const isCounted = s => COUNTED_TYPES.has(s.type);


import { renderCelebration } from "../components/celebration.js?v=15";
import { renderProgress } from "../components/progress.js?v=4";
import { renderMissingProgress } from "../components/missingProgress.js?v=4";
import { renderComparisonProgress } from "../components/comparisonProgress.js?v=4";
import { renderNeighborProgress } from "../components/neighborProgress.js?v=4";

import { completeLesson, recordDailyResult, recordPerfectLesson, recordLessonResult, recordLessonPractice, recordSkillResult, recordCustomDoneLesson, resolveSkippedLesson, getLessonStats, getActiveWorld, isFavoriteLesson, toggleFavoriteLesson, resolveLessonGrade } from "../profile/Profile.js";
import { grantRewards } from "../profile/RewardService.js";
import { observeBigNumbers } from "../utils/formatNumbers.js";

const SKILL_BY_TYPE = {
    "decomposition-find-wrong": "decomposition",
    "neighbor-single": "neighbor",
    "neighbor-round": "neighbor",
    "place-value-two-input": "place-value",
    "place-value-thousands": "place-value",
    "fraction-equal-den": "fraction",
    "fraction-equal": "fraction",
    "fraction-common-den": "fraction",
    "fraction-times-int": "fraction",
    "fraction-times-frac": "fraction",
    "fraction-divide": "fraction"
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
    ["multiplication-play", renderMultiplicationPlay],
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
    ["polygon", renderPolygon],
    ["elapsed-time", renderElapsedTime],
    ["length-units", renderLengthUnits],
    ["compound-shape", renderCompoundShape],
    ["shape-formula", renderShapeFormula],
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
    ["fraction-equal-den", renderFractionEqualDen],
    ["fraction-equal", renderFractionEqual],
    ["fraction-common-den", renderFractionCommonDen],
    ["fraction-times-int", renderFractionTimesInt],
    ["fraction-times-frac", renderFractionTimesFrac],
    ["fraction-divide", renderFractionDivide],
    ["decimal", renderDecimal],
    ["percent", renderPercent],
    ["divisibility", renderDivisibility],
    ["angle-measure", renderAngleMeasure],
    ["measure-units", renderMeasureUnits],
    ["written-operation", renderWrittenOperation],
    ["remainder-division", renderRemainderDivision],
    ["written-division", renderWrittenDivision],
    ["perimeter", renderPerimeter],
    ["area", renderArea],
    ["angles", renderAngles],
    ["circle", renderCircle],
    ["probability", renderProbability],
    ["operation-order", renderOperationOrder],
    ["operation-order-play", renderOperationOrderPlay]
]);


export class Game {

    constructor(lesson, root, actions = {}, lessonFile = null, skill = null, lessonIndex = null, source = null, lessonPool = null) {

        this.lesson = lesson;
        this.root = root;
        this.lessonFile = lessonFile;
        this.skill = skill;
        this.lessonIndex = lessonIndex;
        this.source = source;
        this.lessonPool = lessonPool;
        this.currentStep = 0;
        this.instructionTitle = null;
        this.instructionText = null;
        this.correct = 0;
        this.wrong = 0;
        this.attempts = 0;
        this.byType = {};
        this.startedAt = null;
        this.componentCleanup = null;
        this.stopNumberWatch = null;

        const leave = (action) => action ? (...args) => {
            this.cleanupComponent();
            action(...args);
        } : action;

        this.onRestart = leave(actions.onRestart);
        this.onExit = leave(actions.onExit);
        this.onProfile = leave(actions.onProfile);
        this.onStats = leave(actions.onStats);
        this.onHelp = leave(actions.onHelp);
        this.onNext = leave(actions.onNext);
        this.onSkipNext = leave(actions.onSkipNext);
        this.onGradeComplete = leave(actions.onGradeComplete);
    }

    getLessonPosition() {
        if (this.lessonPool?.length) {
            const poolIdx = this.lessonPool.findIndex(f => f === this.lessonFile);
            if (poolIdx !== -1) {
                return { position: poolIdx + 1, total: this.lessonPool.length };
            }
        }
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

    getLessonMeta() {
        if (!this.lessonIndex || !this.lessonFile) return null;
        const allLessons = this.lessonIndex.lessons || [];
        return allLessons.find(l => l.file === this.lessonFile) || null;
    }

    getLessonGrade() {
        if (!this.lessonIndex || !this.lessonFile) return null;
        const allLessons = this.lessonIndex.lessons || [];
        const entry = allLessons.find(l => l.file === this.lessonFile);
        return resolveLessonGrade(entry);
    }

    getLessonGradeLabel() {
        if (!this.lessonIndex || !this.lessonFile) return null;
        const allLessons = this.lessonIndex.lessons || [];
        const entry = allLessons.find(l => l.file === this.lessonFile);
        const grades = entry?.grades || [];
        if (grades.length === 0) return null;
        const sorted = [...grades].sort((a, b) => a - b);
        if (sorted.length === 1) {
            return `${sorted[0]}. osztály`;
        }
        return `${sorted[0]}–${sorted[sorted.length - 1]}. osztály`;
    }

    getLessonTitle() {
        if (!this.lessonIndex || !this.lessonFile) return null;
        const allLessons = this.lessonIndex.lessons || [];
        const entry = allLessons.find(l => l.file === this.lessonFile);
        if (!entry) return null;
        return entry.worldTitles?.[getActiveWorld()] ?? entry.mission ?? entry.title ?? null;
    }

    isGradeComplete() {
        if (!this.lessonIndex || !this.lessonFile) return false;
        const allLessons = this.lessonIndex.lessons || [];
        const grade = this.getLessonGrade();
        if (grade == null) return false;
        const gradeLessons = allLessons.filter(l => l.grades?.includes(grade));
        const counted = gradeLessons.filter(l => !l.practice);
        return counted.length > 0 && counted.every(l => getLessonStats(l.file));
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

    onSceneNext() {
        if (this.startedAt === null) {
            this.startedAt = Date.now();
        }
        this.next();
    }

    elapsedSeconds() {
        if (this.startedAt === null) return null;
        return Math.max(0, Math.round((Date.now() - this.startedAt) / 1000));
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

    cleanupComponent() {
        if (this.stopNumberWatch) {
            this.stopNumberWatch();
            this.stopNumberWatch = null;
        }
        if (typeof this.componentCleanup !== "function") return;
        const cleanup = this.componentCleanup;
        this.componentCleanup = null;
        try {
            cleanup();
        } catch (e) {
            console.error(e);
        }
    }

    watchNumbers() {
        this.stopNumberWatch?.();
        this.stopNumberWatch = observeBigNumbers(this.root);
    }

    render() {

        this.renderStep();

        this.watchNumbers();

    }

    renderStep() {

        this.cleanupComponent();

        if (this.currentStep >= this.lesson.steps.length) {
            let milestone = null;
            let reward = null;
            const practice = !this.lesson.steps.some(isCounted);

            if (!this.lesson.completed) {
                try {
                    const profileBefore = completeLesson();
                    const dailyQuestJustCompleted = profileBefore && !profileBefore.dailyQuestCompleted;
                    recordDailyResult(this.correct, this.wrong, this.byType);
                    if (this.lessonFile) {
                        if (practice) recordLessonPractice(this.lessonFile);
                        else recordLessonResult(this.lessonFile, this.correct, this.wrong);
                        resolveSkippedLesson(this.lessonFile);
                    }
                    if (this.skill && !practice) {
                        recordSkillResult(this.skill, this.correct, this.wrong);
                    }
                    if (this.source === "custom" && this.lessonFile) {
                        recordCustomDoneLesson(this.lessonFile);
                    }
                    if (this.wrong === 0 && !practice) {
                        recordPerfectLesson();
                    }
                    milestone = profileBefore?.milestone ?? null;
                    if (!practice) {
                        reward = grantRewards({
                            correct: this.correct,
                            wrong: this.wrong,
                            isMilestone: !!milestone,
                            dailyQuestJustCompleted
                        });
                    }
                } catch (e) { console.error(e); }
                this.lesson.completed = true;
            }

            renderCelebration(
                {
                    title: "🎉 Nagyszerű!",
                    text: practice
                        ? "Jó gyakorlás, köszönöm!"
                        : (this.wrong === 0
                            ? "Tökéletes! Egyetlen hiba sem volt!"
                            : "Minden feladatot megoldottál!")
                },
                this.root,
                {
                    onRestart: this.onRestart,
                    onExit: this.onExit,
                    onProfile: this.onProfile,
                    onStats: this.onStats,
                    onHelp: this.onHelp,
                    onNext: this.onNext
                },
                milestone,
                reward,
                getActiveWorld(),
                this.lessonIndex,
                null,
                null,
                this.elapsedSeconds()
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
            const isPlayLesson = !this.lesson.steps.some(isCounted);
            const sceneExit = isPlayLesson ? null : this.onExit;
            renderScene(step, this.root, () => this.onSceneNext(), progress, getActiveWorld(), sceneExit, lessonPos, this.onSkipNext, this.lessonFile, this.source, this.getLessonGradeLabel());
            return;
        }

        if (step.type === "celebration") {
            let milestone2 = null;
            let reward2 = null;
            let gradeJustCompleted = false;
            const practice = !this.lesson.steps.some(isCounted);
            if (!this.lesson.completed) {
                const gradeWasComplete = this.isGradeComplete();
                try {
                    const result2 = completeLesson();
                    recordDailyResult(this.correct, this.wrong, this.byType);
                    if (this.lessonFile) {
                        if (practice) recordLessonPractice(this.lessonFile);
                        else recordLessonResult(this.lessonFile, this.correct, this.wrong);
                        resolveSkippedLesson(this.lessonFile);
                    }
                    if (this.skill && !practice) {
                        recordSkillResult(this.skill, this.correct, this.wrong);
                    }
                    if (this.source === "custom" && this.lessonFile) {
                        recordCustomDoneLesson(this.lessonFile);
                    }
                    if (this.wrong === 0 && !practice) {
                        recordPerfectLesson();
                    }
                    milestone2 = result2.milestone;
                    if (!practice) {
                        reward2 = grantRewards({
                            correct: this.correct,
                            wrong: this.wrong,
                            isMilestone: !!milestone2,
                            dailyQuestJustCompleted: result2.dailyQuestJustCompleted
                        });
                    }
                } catch (e) { console.error(e); }
                this.lesson.completed = true;
                gradeJustCompleted = !gradeWasComplete && this.isGradeComplete();
            }

            renderCelebration(step, this.root, {
                onRestart: this.onRestart,
                onExit: this.onExit,
                onProfile: this.onProfile,
                onStats: this.onStats,
                onHelp: this.onHelp,
                onNext: gradeJustCompleted && this.onGradeComplete ? this.onGradeComplete : this.onNext
            }, milestone2, reward2, getActiveWorld(), this.lessonIndex, this.getLessonTitle(), this.getLessonGradeLabel(), this.elapsedSeconds());

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

        const cleanup = renderer(
            step,
            this.root,
            () => this.next(),
            progress,
            (isCorrect) => this.onResult(isCorrect, skill),
            () => this.onAttempt()
        );
        this.componentCleanup = typeof cleanup === "function" ? cleanup : null;

        const card = this.root.querySelector(".card");
        const helpTitle = this.instructionTitle ?? step.title;
        const helpText = this.instructionText ?? step.text;
        if (card) {
            const cornerBar = document.createElement("div");
            cornerBar.className = "corner-buttons";
            const gradeLabel = this.getLessonGradeLabel();
            if (gradeLabel) {
                const gradeText = document.createElement("span");
                gradeText.className = "lesson-grade-badge";
                gradeText.textContent = gradeLabel;
                cornerBar.append(gradeText);
            }
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
            if (lessonHasHint(this.getLessonMeta()) || HINT_TYPES.has(step.type)) {
                const hintDot = document.createElement("span");
                hintDot.className = "exercise-hint-dot";
                hintDot.textContent = "💡";
                hintDot.title = "Ehhez a leckéhez van feladat-segítség";
                cornerBar.append(hintDot);
            }
            if (this.onExit) {
                cornerBar.append(createExitButton(this.onExit));
            }
            card.insertBefore(cornerBar, card.firstChild);

            const lessonPos = this.getLessonPosition();
            if (lessonPos) {
                const posText = document.createElement("p");
                posText.className = "scene-lesson-pos";
                posText.textContent = `${lessonPos.position}. lecke a ${lessonPos.total}-ből`;
                cornerBar.after(posText);
            }
        }

    }

}