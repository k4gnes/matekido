import { splitNumber, distanceToNextTen } from "../../math/number.js";

export function renderAdditionHint(step, container) {

    const { a, b } = step;

    container.replaceChildren();

    const box = document.createElement("div");
    box.className = "hint";

    const big = Math.max(a, b);
    const small = Math.min(a, b);

    const stepToFirstTen = distanceToNextTen(a);

    // 20-as számkör
    if (a + b <= 20 && stepToFirstTen > 0 && stepToFirstTen <= b) {
        const rest = b - stepToFirstTen;

        box.innerHTML = `
            <p><strong>💡 Segítség</strong></p>

            <p> Először érd el a következő tízest!</p>

            <p>${a} + ${stepToFirstTen} = ${a + stepToFirstTen}</p>

            <p>Most add hozzá ami még maradt a másikból: ${b} - ${stepToFirstTen} = ${rest} </p>

            <p>${a} + ${b} = ${a + stepToFirstTen} + ${rest} </p>
        `;

        container.append(box);
        return;

    }
    else if (a + b <= 20) {
        box.innerHTML = `
            <p><strong>💡 Segítség</strong></p>

            <p>Számolj tovább a nagyobbik számtól!</p>

            <p><strong>${Math.max(a, b)}</strong> ...</p>
        `;

        container.append(box);
        return;

    }

    // Bontás
    const left = splitNumber(big);
    const right = splitNumber(small);

    box.innerHTML = `
        <p><strong>💡 Segítség</strong></p>

        <p>Bontsd fel a számokat!</p>

        <p>${big} = ${left.tens} + ${left.ones}</p>

        <p>${small} = ${right.tens} + ${right.ones}</p>

        <p>Most add össze külön a tízeseket és az egyeseket!</p>
    `;

    container.append(box);

}