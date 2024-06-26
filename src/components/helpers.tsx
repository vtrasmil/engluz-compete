// https://dev.to/codebubb/how-to-shuffle-an-array-in-javascript-2ikj
export default function shuffleArrayCopy<T>(array: T[]): T[] {
    const newArray = array.slice();
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp1 = newArray[i];
        const temp2 = newArray[j];
        if (temp1 == undefined || temp2 == undefined) {
            throw new Error('To-be-shuffled array member is undefined');
        }
        newArray[i] = temp2;
        newArray[j] = temp1;
    }
    return newArray;
}

export function shuffleArrayJS<T>(array: T[]) {
    return array
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
}

export function shuffleString(str: string) {
    return shuffleArrayJS<string>([...str])
        .reduce((acc, curr) => acc + curr, '');


}

