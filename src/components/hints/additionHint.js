import { splitNumber, distanceToNextTen } from "../../math/number.js";

export function renderAdditionHint(step, container) {

    const { a, b } = step;

    container.replaceChildren();

    const box = document.createElement("div");
    box.className = "hint";

    // 20-as számkör
    if (a + b <= 20) {

        box.innerHTML = `
            <p><strong>💡 Tipp</strong></p>
            <p>Számolj tovább a nagyobbik számtól!</p>
            <p>${Math.max(a, b)} ...</p>
        `;

        container.append(box);
        return;
    }

    // Mindig a nagyobb számhoz adjuk a kisebbet
    const big = Math.max(a, b);
    const small = Math.min(a, b);

    const toNextTen = distanceToNextTen(big);

    // Tízesátlépés
    if (toNextTen > 0 && toNextTen < small) {

        const rest = small - toNextTen;

        box.innerHTML = `
            <p><strong>💡 Tipp</strong></p>

            <p>Érj el először a következő tízeshez!</p>

            <p>${big} + ${toNextTen} = ${big + toNextTen}</p>

            <p>Most már csak ${rest} maradt.</p>

            <p>${big + toNextTen} + ${rest} = ${a + b}</p>
        `;

        container.append(box);
        return;
    }

    // Bontás
    const left = splitNumber(big);
    const right = splitNumber(small);

    box.innerHTML = `
        <p><strong>💡 Tipp</strong></p>

        <p>Bontsd fel a számokat!</p>

        <p>${big} = ${left.tens} + ${left.ones}</p>

        <p>${small} = ${right.tens} + ${right.ones}</p>

        <br>

        <p>Most add össze külön a tízeseket és az egyeseket!</p>
    `;

    container.append(box);

}