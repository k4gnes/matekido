import { createHintBox } from "../ui/hintBox.js";

export function renderFractionCommonDenHint(step, container) {

    container.replaceChildren();

    const box = createHintBox();

    const { numA, denA, numB, denB, commonDen, operator, answerNum, answerDen, mode } = step;

    const kA = commonDen / denA;
    const kB = commonDen / denB;
    const liftA = numA * kA;
    const liftB = numB * kB;
    const rest = mode === "sub" ? liftA - liftB : liftA + liftB;

    const same = kA === 1
        ? `A <strong>${denB}</strong> nevező már megvan, a <strong>${denA}</strong>-t bővíteni kell.`
        : `A <strong>${denA}</strong> és a <strong>${denB}</strong> nevező is bővül, mert egyik sem oszthatja a másikat maradék nélkül.`;

    const simplifyText = answerDen < commonDen
        ? `<p>Végül egyszerűsítsd: a <strong>${rest}</strong> és a <strong>${commonDen}</strong> közös osztója a <strong>${rest / answerNum}</strong>, ezért az eredmény <strong>${answerNum}/${answerDen}</strong>.</p>`
        : `<p>A kapott <strong>${answerNum}/${answerDen}</strong> már nem egyszerűsíthető tovább.</p>`;

    box.innerHTML = `
        <p><strong>💡 Segítség</strong></p>

        <p>A <strong>közös nevező</strong> a legkisebb olyan szám, amely mindkét nevező többszöröse.</p>

        <p>Itt a közös nevező a <strong>${commonDen}</strong>. ${same}</p>

        <p>A nevezőt bővítjük, de a számlálót is szorozni kell hozzá, különben más értéket kapnánk:</p>

        <p>${numA}/${denA} = <strong>${liftA}/${commonDen}</strong>${kA > 1 ? ` (${numA} × ${kA} = ${liftA})` : ""}</p>
        <p>${numB}/${denB} = <strong>${liftB}/${commonDen}</strong>${kB > 1 ? ` (${numB} × ${kB} = ${liftB})` : ""}</p>

        <p>Most már azonos a nevező, tehát csak a számlálókkal kell számolni:</p>

        <p>${liftA} ${operator} ${liftB} = <strong>${rest}</strong>, vagyis ${rest}/${commonDen}.</p>

        ${simplifyText}

        <p>A képen az első adag <strong>${denA}</strong> egyforma részre van osztva, a második <strong>${denB}</strong> részre. Közös nevezővel mindkettőt <strong>${commonDen}</strong> részesre váltjuk, de egyik adag mennyisége sem változik: ${numA}/${denA} = ${liftA}/${commonDen} és ${numB}/${denB} = ${liftB}/${commonDen}.</p>
    `;

    container.append(box);
}