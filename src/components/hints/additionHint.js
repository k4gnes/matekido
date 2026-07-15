import { splitNumber, distanceToNextTen } from "../../math/number.js";

export function renderAdditionHint(step, container) {

    const { a, b } = step;

    container.replaceChildren();

    const box = document.createElement("div");
    box.className = "hint";

    // mindig a nagyobb számhoz adunk
    const big = Math.max(a, b);
    const small = Math.min(a, b);

    const stepToTen = distanceToNextTen(big);
    // 20-as számkör
    if (a + b <= 20 && stepToTen > 0 && stepToTen < small) {
        const rest = small - stepToTen;

        box.innerHTML = `
            <p><strong>💡 Segítség</strong></p>

            <p> Mindig a nagyobb számhoz adjunk hozzá, ezért vegyük a nagyobb számot (${big}) előre:  ${big} + ${small} = ? </p>
            
            <p> Ezután érd el a következő tízest!</p>

            <p>${big} + ${stepToTen} = ${big + stepToTen}</p>

            <p>Most add hozzá ami még maradt a kisebből (${small}) :  ${rest} </p>

            <p>${a === small ? `${a} + ${b} = ${big} + ${small} = ${big + stepToTen} + ${rest} =?` : `${big} + ${small} = ${big + stepToTen} + ${rest} =?`}</p>
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



    // Tízesátlépés
    // if (stepToTen > 0 && stepToTen < small) {
    // Tízesátlépés csak akkor,
    // ha a kisebbik szám egyjegyű.

    if (small < 10 && stepToTen > 0 && stepToTen < small) {

        const rest = small - stepToTen;

        box.innerHTML = `
            <p><strong>💡 Segítség</strong></p>

            <p>Először érd el a következő tízest!</p>

            <p>${big} + ${stepToTen} = ${big + stepToTen}</p>

            <p>Most add hozzá ami még maradt + ${small} +ból : + ${rest} </p>

            <p>${big + stepToTen} + ${rest} = ${a + b}</p>
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