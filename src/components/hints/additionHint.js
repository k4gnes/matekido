export function renderAdditionHint(step, container) {

    const { a, b } = step;

    container.replaceChildren();

    const box = document.createElement("div");
    box.className = "hint";

    if (a + b <= 20) {

        box.innerHTML = `
            <p><strong>💡 Tipp</strong></p>
            <p>Számolj tovább a nagyobbik számtól!</p>
            <p>${Math.max(a, b)} ...</p>
        `;

    } else {

        const ones = b % 10;
        const toNextTen = 10 - (a % 10);

        if (toNextTen > 0 && toNextTen < ones) {

            const rest = b - toNextTen;

            box.innerHTML = `
                <p><strong>💡 Tipp</strong></p>

                <p>${a} + ${toNextTen} = ${a + toNextTen}</p>

                <p>${a + toNextTen} + ${rest} = ${a + b}</p>
            `;

        } else {

            const tensA = Math.floor(a / 10) * 10;
            const onesA = a % 10;

            const tensB = Math.floor(b / 10) * 10;
            const onesB = b % 10;

            box.innerHTML = `
                <p><strong>💡 Tipp</strong></p>

                <p>${a} = ${tensA} + ${onesA}</p>

                <p>${b} = ${tensB} + ${onesB}</p>

                <br>

                <p>${tensA} + ${tensB} = ${tensA + tensB}</p>

                <p>${onesA} + ${onesB} = ${onesA + onesB}</p>

                <br>

                <p>${tensA + tensB} + ${onesA + onesB} = ${a + b}</p>
            `;

        }

    }

    container.append(box);

}