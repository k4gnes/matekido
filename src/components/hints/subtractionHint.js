import { subtractionSteps } from "../../math/subtraction.js";
import { createHintBox } from "../ui/hintBox.js";

export function renderSubtractionHint(step, container) {

    const { a, b, inputPos, result } = step;

    container.replaceChildren();

    const box = createHintBox();

    if (inputPos === "left" || inputPos === "right") {
        const missing = inputPos === "left" ? result + b : a - result;

        box.innerHTML = `
            <p><strong>💡 Segítség</strong></p>

            ${
                inputPos === "left"
                    ? `
                        <p>A kisebbítendőt <strong>összeadással</strong> kapod meg:</p>

                        <p>${result} + ${b} = <strong>${missing}</strong></p>

                        <p>Tehát: <strong>${missing}</strong> − ${b} = ${result}</p>
                    `
                    : `
                        <p>A kivonandót <strong>kivonással</strong> kapod meg:</p>

                        <p>${a} − ${result} = <strong>${missing}</strong></p>

                        <p>Tehát: ${a} − <strong>${missing}</strong> = ${result}</p>
                    `
            }
        `;

        container.append(box);
        return;

    }

    const info = subtractionSteps(a, b);

    if (info.strategy === "to-ten") {

        box.innerHTML = `
            <p><strong>💡 Segítség</strong></p>

            <p>Először vonj le annyit, hogy tízesre essél!</p>

            <p>${a} - ${info.stepToTen} = ${info.tenResult}</p>

            <p>Most vonj le még ${info.rest}-t: ${info.tenResult} - ${info.rest} = ${info.tenResult - info.rest}</p>
        `;

    } else {

        box.innerHTML = `
            <p><strong>💡 Segítség</strong></p>

            <p>Számolj vissza a nagyobb számtól!</p>

            <p><strong>${info.big}</strong> ...</p>
        `;

    }

    container.append(box);

}
