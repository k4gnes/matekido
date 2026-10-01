import { createHintBox } from "../ui/hintBox.js";

function gcd(a, b) {
    return b ? gcd(b, a % b) : a;
}

export function renderFractionDivideHint(step, container) {

    container.replaceChildren();

    const box = createHintBox();

    const gWhole = step.mode === "whole"
        ? gcd(step.num, step.den * step.divisor)
        : gcd(step.rawNum, step.rawDen);

    const body = step.mode === "whole"
        ? `
            <p>Egész számmal osztani annyi, mint a nevezőt megszorozni vele. A számláló ilyenkor <strong>változatlan marad</strong>:</p>

            <p>${step.num}/${step.den} ÷ ${step.divisor} = <strong>${step.num}/${step.den * step.divisor}</strong> (${step.den} × ${step.divisor} = ${step.den * step.divisor})</p>

            ${gWhole > 1
                ? `<p>Ezután egyszerűsítünk: a <strong>${step.num}</strong> és a <strong>${step.den * step.divisor}</strong> közös osztója a <strong>${gWhole}</strong>, így az eredmény <strong>${step.answerNum}/${step.answerDen}</strong>.</p>`
                : `<p>A kapott <strong>${step.answerNum}/${step.answerDen}</strong> már nem egyszerűsíthető tovább.</p>`}

            <p>A képen a teljes ${step.divisor} egyforma részre van osztva, és egy rész ki van emelve: az a rész az egész <strong>1/${step.divisor}</strong>-e, és az adagod ennyinek ennyi-szerese.</p>
        `
        : `
            <p>Törttel osztani nem lehet – de <strong>megfordított szorzással</strong> lehet! Az osztandó megmarad, az osztó pedig <strong>megfordul</strong>: a számláló és a nevező helyet cserél.</p>

            <p>${step.numA}/${step.denA} ÷ ${step.numB}/${step.denB} = ${step.numA}/${step.denA} × <strong>${step.denB}/${step.numB}</strong></p>

            <p>Most már szorzol, tehát a számlálókat és a nevezőket összeszorozod:</p>

            <p>Számláló: ${step.numA} × ${step.denB} = <strong>${step.rawNum}</strong></p>
            <p>Nevező: ${step.denA} × ${step.numB} = <strong>${step.rawDen}</strong></p>

            <p>Így a szorzat <strong>${step.rawNum}/${step.rawDen}</strong>.</p>

            ${gWhole > 1
                ? `<p>Végül egyszerűsítünk: a <strong>${step.rawNum}</strong> és a <strong>${step.rawDen}</strong> közös osztója a <strong>${gWhole}</strong>, tehát az eredmény <strong>${step.answerNum}/${step.answerDen}</strong>.</p>`
                : `<p>A kapott <strong>${step.answerNum}/${step.answerDen}</strong> már nem egyszerűsíthető tovább.</p>`}

            <p>A képen a <strong>${step.numA}/${step.denA}</strong> adagot látod. Ehhez hozzá kell venni annyiszor, amennyiszer a <strong>${step.denB}/${step.numB}</strong>-szerese – vagyis az eredmény ${step.answerNum}/${step.answerDen}. Mivel <strong>${step.numB}/${step.denB}</strong> 1-nél kisebb, az eredmény mindig nagyobb a kiindulásnál: <strong>${step.numA}/${step.denA}</strong>-nél nagyobb, és ez itt teljesül is.</p>

            <p><strong>Példa:</strong> 1/2 ÷ 1/4 = 1/2 × 4/1 = 4/2 = 2. Négy darab fél, azaz két teljes adag.</p>
        `;

    box.innerHTML = `
        <p><strong>💡 Segítség</strong></p>

        ${body}
    `;

    container.append(box);
}