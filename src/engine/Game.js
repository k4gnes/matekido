import { renderScene } from "../components/scene.js";
import { renderAddition } from "../components/addition.js";
import { renderCelebration } from "../components/celebration.js";

export class Game {

    constructor(lesson, root) {
        this.lesson = lesson;
        this.root = root;
        this.currentStep = 0;
    }

    start() {
        this.render();
    }

    next() {

        this.currentStep++;

        if (this.currentStep >= this.lesson.steps.length) {

            this.root.innerHTML = `
                <div class="card">
                    <h1>🏁 Lecke vége</h1>
                    <p>Nagyon ügyesen dolgoztál!</p>
                </div>
            `;

            return;
        }

        this.render();
    }

    getProgress() {

        const exercises = this.lesson.steps.filter(
            step => step.type === "addition"
        );

        const total = exercises.length;

        let current = 0;

        for (let i = 0; i <= this.currentStep; i++) {

            if (this.lesson.steps[i].type === "addition") {
                current++;
            }

        }

        return {
            current,
            total
        };
    }

    render() {

        const step = this.lesson.steps[this.currentStep];

        switch (step.type) {

            case "scene":
                renderScene(
                    step,
                    this.root,
                    () => this.next()
                );
                break;

            case "addition":
                renderAddition(
                    step,
                    this.root,
                    () => this.next()
                );
                break;

            case "celebration":
                renderCelebration(
                    step,
                    this.root,
                    () => this.next()
                );
                break;

            default:
                console.error(
                    "Ismeretlen lépéstípus:",
                    step.type
                );

        }

    }

}