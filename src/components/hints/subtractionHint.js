import { subtractionSteps } from "../../math/subtraction.js";
import { createHintBox } from "../ui/hintBox.js";

export function renderSubtractionHint(step, container) {

    const { a, b } = step;

    container.replaceChildren();

    const box = createHintBox();

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
