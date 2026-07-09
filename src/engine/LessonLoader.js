export async function loadLesson(path) {

    const response = await fetch(path);

    if (!response.ok) {
        throw new Error("Nem sikerült betölteni a leckét.");
    }

    return await response.json();

}