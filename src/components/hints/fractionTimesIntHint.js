import { createHintBox } from "../ui/hintBox.js";

function gcd(a, b) {
    return b ? gcd(b, a % b) : a;
}

export function renderFractionTimesIntHint(step, container) {

    container.replaceChildren();

    const box = createHintBox();

    const { num, den, factor, mode } = step;

    const rawNum = num * factor;
    const g = gcd(rawNum, den);
    const simpleNum = rawNum / g;
    const simpleDen = den / g;
    const parts = factor / den;

    const sumList = [];
    for (let i = 0; i < factor; i++) {
        sumList.push(`${num}/${den}`);
    }

    const multiplyText = g > 1
        ? ` (${num} × ${factor} = ${rawNum})`
        : "";

    const resultText = mode === "whole"
        ? `
            <p>A <strong>${den}</strong> rész egy teljes adagot jelent. Mivel a <strong>${factor}</strong> ennek <strong>${parts}</strong>-szorosa, a <strong>${rawNum}</strong> rész <strong>${parts}</strong> teljes adag, és minden adagban <strong>${num}</strong> rész van.</p>

            <p>Az eredmény tehát <strong>${parts}</strong> × <strong>${num}</strong> = <strong>${step.answer}</strong> teljes adag.</p>
        `
        : `
            <p>Ez még nem feltétlenül a legszebb alak. Nézd meg, osztható-e a számláló a nevezővel:</p>

            ${g > 1
                ? `<p>A <strong>${rawNum}</strong> és a <strong>${den}</strong> közös osztója a <strong>${g}</strong>, ezért le tudjuk egyszerűsíteni: az eredmény <strong>${simpleNum}/${simpleDen}</strong>.</p>`
                : `<p>A kapott <strong>${simpleNum}/${simpleDen}</strong> már nem egyszerűsíthető tovább, ez az eredmény.</p>`}
        `;

    box.innerHTML = `
        <p><strong>💡 Segítség</strong></p>

        <p>Egész számmal szorozni annyi, mint <strong>annyiszor összeadni</strong> magát a törteket:</p>

        <p>${sumList.join(" + ")}</p>

        <p>Ez sok lépés lenne, de van egy rövid út. Ha egész számmal szorozunk, akkor <strong>a nevező nem változik</strong>: csak a <strong>számlálót</strong> kell megszorozni az egész számmal.</p>

        <p>${num}/${den} × ${factor} = <strong>${rawNum}/${den}</strong>${multiplyText}</p>

        ${resultText}

        <p>A képen <strong>${factor}</strong> darab <strong>${num}/${den}</strong> adag látszik – mindegyik után egy újjal bővül az összes adag, ahogyan az egész számú szorzás ismételt összeadás.</p>
    `;

    container.append(box);
}
