import { createHintBox } from "../ui/hintBox.js";

function gcd(a, b) {
    return b ? gcd(b, a % b) : a;
}

export function renderFractionTimesFracHint(step, container) {

    container.replaceChildren();

    const box = createHintBox();

    const { numA, denA, numB, denB, rawNum, rawDen, answerNum, answerDen } = step;

    const g = gcd(rawNum, rawDen);

    const simplifyText = g > 1
        ? `
            <p>Ez a tört nagyon jól egyszerűsíthető. A <strong>${rawNum}</strong> és a <strong>${rawDen}</strong> közös osztója a <strong>${g}</strong>, és ${g} nem nagyobb a <strong>${rawNum}</strong>-nél, ezért mindkettőt el lehet osztani vele:</p>

            <p>${rawNum} ÷ ${g} = <strong>${answerNum}</strong> és ${rawDen} ÷ ${g} = <strong>${answerDen}</strong>, tehát az eredmény <strong>${answerNum}/${answerDen}</strong>.</p>
        `
        : `
            <p>Nézd meg, osztható-e valamivel a <strong>${rawNum}</strong> és a <strong>${rawDen}</strong>. Ha nincs közös osztójuk, akkor készen vagyunk: az eredmény <strong>${answerNum}/${answerDen}</strong> marad.</p>
        `;

    box.innerHTML = `
        <p><strong>💡 Segítség</strong></p>

        <p>Törtet törttel szorozva <strong>a számlálók összeadódnak és a nevezők összeadódnak</strong> – vagyis mindkét helyen szorzás történik:</p>

        <p>Számlálók: ${numA} × ${numB} = <strong>${rawNum}</strong></p>
        <p>Nevezők: ${denA} × ${denB} = <strong>${rawDen}</strong></p>

        <p>Így a szorzat <strong>${rawNum}/${rawDen}</strong>.</p>

        ${simplifyText}

        <p>A képen az első <strong>${numA}</strong> sort és az első <strong>${numB}</strong> oszlopot nézd meg egyszerre: ahol a kettő találkozik, ott <strong>${rawNum}</strong> kék mező van, az egész táblázaton pedig <strong>${rawDen}</strong> rész. Ezért az eredmény <strong>${answerNum}/${answerDen}</strong>.</p>

        <p>Mindig érdemes előbb egyszerűsíteni a számlálókat és a nevezőket, ha lehet, mert sokkal kisebb számokkal kell dolgozni.</p>
    `;

    container.append(box);
}
