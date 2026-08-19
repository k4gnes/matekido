function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function generateNeighbor(options = {}) {

    const { count = 10, max = 20, interaction = "mixed" } = options;

    const tasks = [];

    for (let i = 0; i < count; i++) {

        let a;
        do {
            a = Math.floor(Math.random() * (max - 1)) + 2;
        } while (a % 10 === 0);

        const lowerTen = Math.floor(a / 10) * 10;
        const upperTen = Math.ceil(a / 10) * 10;

        tasks.push({
            type: "neighbor",
            a,
            left: a - 1,
            right: a + 1,
            answer: a,
            lowerTen,
            upperTen,
            interaction: interaction === "mixed" ? pick(["input", "choice"]) : interaction
        });
    }

    return tasks;
}
