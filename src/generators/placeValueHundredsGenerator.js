function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function generatePlaceValueHundreds(options = {}) {

    const { count = 10, min = 100, max = 999, interaction = "mixed" } = options;

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const num = Math.floor(Math.random() * (max - min + 1)) + min;

        const hundreds = Math.floor(num / 100);
        const tens = Math.floor((num % 100) / 10);
        const ones = num % 10;

        tasks.push({
            hundreds,
            tens,
            ones,
            answer: num,
            interaction: interaction === "mixed" ? pick(["input", "choice"]) : interaction
        });
    }

    return tasks;
}