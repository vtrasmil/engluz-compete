
// https://dev.to/codebubb/how-to-shuffle-an-array-in-javascript-2ikj
export function shuffleArrayCopy(array: any[]) : any[] {
    let newArray = array.slice();
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = newArray[i];
        newArray[i] = newArray[j];
        newArray[j] = temp;
    }
    return newArray;
}