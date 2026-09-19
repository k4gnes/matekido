import { createHintBox } from "../ui/hintBox.js";

const SIDES = {
    triangle: { label: "Háromszög", dative: "háromszögnek", sides: 3 },
    square: { label: "Négyszög", dative: "négyszögnek", sides: 4 },
    pentagon: { label: "Ötszög", dative: "ötszögnek", sides: 5 },
    hexagon: { label: "Hatszög", dative: "hatszögnek", sides: 6 },
    heptagon: { label: "Hétszög", dative: "hétszögnek", sides: 7 },
    octagon: { label: "Nyolcszög", dative: "nyolcszögnek", sides: 8 }
};

function nameTable() {
    return Object.values(SIDES)
        .map(s => `<p>${s.dative} ${s.sides} oldala van.</p>`)
        .join("");
}

export function renderPolygonHint(step, container) {

    container.replaceChildren();

    const box = createHintBox();

    const data = SIDES[step.kind];

    if (step.mode === "name") {
        box.innerHTML = `
            <p><strong>💡 Segítség</strong></p>

            <p>Számold meg az oldalakat (éleket) az ábrán!</p>

            ${nameTable()}
        `;
    } else if (step.mode === "vertices") {
        box.innerHTML = `
            <p><strong>💡 Segítség</strong></p>

            <p>Számold meg a csúcsokat (a sarkokat), ahol két oldal találkozik!</p>

            <p>Egy ${data.label.toLowerCase()}nak ugyanannyi csúcsa van, mint oldala: ${data.sides}.</p>
        `;
    } else if (step.mode === "sides") {
        box.innerHTML = `
            <p><strong>💡 Segítség</strong></p>

            <p>Számold meg az oldalakat (a sokszög éleit) egyesével az ábrán!</p>

            <p>Ez a ${data.label.toLowerCase()} – neki ${data.sides} oldala van.</p>
        `;
    } else {
        const perVertex = data.sides - 3;
        const total = data.sides * perVertex / 2;
        box.innerHTML = `
            <p><strong>💡 Segítség</strong></p>

            <p>Az átló két <strong>nem szomszédos</strong> csúcsot köt össze.</p>

            ${perVertex > 0
                ? `<p>Számold meg a piros pontból induló piros átlókat! Egy csúcsból ${perVertex} átló indul.</p>
                   <p>Összesen ${data.sides} · ${perVertex} : 2 = ${total} átló van – a felezés azért kell, mert minden átlót kétszer számolnánk.</p>`
                : `<p>A ${data.dative} minden csúcsa szomszédos a többivel, ezért egyetlen átlója sincs.</p>`
            }
        `;
    }

    container.append(box);
}