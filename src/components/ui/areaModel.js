export function createAreaModel(option) {

    const { rows, cols, filledRows, filledCols } = option;

    const wrap = document.createElement("div");
    wrap.className = "areamodel";
    wrap.style.gridTemplateColumns = `1.6rem repeat(${cols}, 1.6rem)`;

    const corner = document.createElement("div");
    corner.className = "areamodel-corner";
    wrap.append(corner);

    for (let c = 0; c < cols; c++) {
        const label = document.createElement("div");
        label.className = "areamodel-lab" + (c < filledCols ? " areamodel-lab-on" : "");
        label.textContent = String(c + 1);
        wrap.append(label);
    }

    for (let r = 0; r < rows; r++) {
        const label = document.createElement("div");
        label.className = "areamodel-lab" + (r < filledRows ? " areamodel-lab-on" : "");
        label.textContent = String(r + 1);
        wrap.append(label);

        for (let c = 0; c < cols; c++) {
            const cell = document.createElement("div");
            cell.className = "areamodel-cell" + (r < filledRows && c < filledCols ? " areamodel-cell-on" : "");
            wrap.append(cell);
        }
    }

    return wrap;
}
