function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const UNITS = {
    ten: { step: 10, label: "tízes" },
    hundred: { step: 100, label: "százas" },
    thousand: { step: 1000, label: "ezres" },
    tenThousand: { step: 10000, label: "tízezeres" },
    hundredThousand: { step: 100000, label: "százezres" }
};

function nonAligned(min, max, step) {

    const num = Math.floor(Math.random() * (max - min + 1)) + min;

    if (num % step !== 0) return num;
    if (num + 1 <= max) return num + 1;
    if (num - 1 >= min) return num - 1;

    throw new Error(`A ${min}–${max} tartományban nincs ${step} alá nem eső szám.`);

}

export function generateNeighborRound(options = {}) {

    const { count = 8, min = 1000, max = 9999, units = ["ten", "hundred", "thousand"] } = options;

    if (max < min) {
        throw new Error("A max értéknek legalább akkora kell lennie, mint a min.");
    }

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const unit = pick(units);
        const { step, label } = UNITS[unit];

        const num = nonAligned(min, max, step);

        tasks.push({
            number: num,
            unit,
            unitLabel: label,
            lower: Math.floor(num / step) * step,
            upper: Math.ceil(num / step) * step
        });
    }

    return tasks;
}
