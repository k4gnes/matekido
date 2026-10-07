import { createHintBox } from "../ui/hintBox.js";

function gcd(a, b) {
    return b ? gcd(b, a % b) : a;
}

function fractionText(percent) {
    const g = gcd(percent, 100);
    const den = 100 / g;
    return den === 1 ? String(percent / g) : `${percent / g}/${den}`;
}

export function renderPercentHint(step, container) {

    container.replaceChildren();

    const box = createHintBox();

    let body = "";

    if (step.mode === "grid") {
        body = `
            <p>A <strong>százalék</strong> azt mutatja, hány része valaminek a százból: mindig <strong>100 egyforma részre</strong> osztjuk az egészet.</p>

            <p>Itt 100 kockából ${step.cells} van kiszínezve – ezért ez <strong>${step.percent}%</strong>.</p>

            <p>Gyors részek, amiket érdemes megjegyezni: 10% = 1/10, 20% = 1/5, 25% = 1/4, 50% = 1/2.</p>
        `;
    } else if (step.mode === "frac") {
        body = `
            <p>A százalék a század része, tehát ${step.percent}% = <strong>${step.percent}/100</strong>.</p>

            <p>Egyszerűsítsd: a számlálót és a nevezőt oszd el a legnagyobb közös osztóval (${gcd(step.percent, 100)}), és kapod: <strong>${fractionText(step.percent)}</strong>.</p>

            <p>Gyors részek: 50% = 1/2, 25% = 1/4, 20% = 1/5, 10% = 1/10.</p>
        `;
    } else if (step.mode === "word") {
        body = `
            <p>A szavak mindig ugyanazt a századrészt jelentik:</p>

            <p><strong>fele</strong> = 50%, <strong>negyede</strong> = 25%, <strong>ötöde</strong> = 20%, <strong>tizede</strong> = 10%.</p>

            <p>Keresd a szövegben a részt jelentő szót, és annak a százalékát válaszd: itt ${step.word} szerepel, ezért <strong>${step.percent}%</strong>.</p>
        `;
    } else if (step.mode === "of") {
        body = `
            <p>Százalékot keresni kétféleképp lehet:</p>

            <p><strong>Gyors út:</strong> 10% = tizede, 20% = ötöde, 25% = negyede, 50% = fele. Tehát a(z) ${step.base} szám 10%-a ${step.base / 10}, 50%-a ${step.base / 2}.</p>

            <p><strong>Általános út:</strong> szorozd meg a számot a százalékkal, majd oszd el 100-zal: ${step.base} × ${step.percent} ÷ 100 = <strong>${step.answer}</strong>.</p>
        `;
    } else if (step.mode === "find") {
        body = `
            <p>Itt azt keressük, a rész hány százaléka az egésznek. A képlet: <strong>rész ÷ egész × 100</strong>.</p>

            <p>${step.value} ÷ ${step.base} = ${(step.value / step.base).toString().replace(".", ",")}</p>

            <p>Ez tizedes törttel ${step.percent / 100}, százalékban pedig <strong>${step.percent}%</strong>.</p>
        `;
    }

    box.innerHTML = `
        <p><strong>💡 Segítség</strong></p>

        ${body}
    `;

    container.append(box);
}
