function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function generatePlaceValueThousands(options = {}) {

    const { count = 8, min = 1000, max = 9999, interaction = "mixed" } = options;

    const tasks = [];

    for (let i = 0; i < count; i++) {

        const num = Math.floor(Math.random() * (max - min + 1)) + min;

        const thousands = Math.floor(num / 1000);
        const hundreds = Math.floor((num % 1000) / 100);
        const tens = Math.floor((num % 100) / 10);
        const ones = num % 10;

        tasks.push({
            thousands,
            hundreds,
            tens,
            ones,
            answer: num,
            interaction: interaction === "mixed" ? pick(["input", "choice"]) : interaction
        });
    }

    return tasks;
}