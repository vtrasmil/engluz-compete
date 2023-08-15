import { getRandomIntInclusive } from "~/utils/helpers";


const wordList = [
    ["resist", "sister"],
    ["wander", "warden", "warned"],
    ["unpack"],
    ["course", "source"],
    ["soviet"],
    ["cheeps", "speech"],
    ["speedy"],
    ["plains", "spinal"],
]
        
function getSolutionSet(index: number) {
    const wordSet = wordList[index];
    if (wordSet == undefined) {
        throw new Error('No word found in WordListManager')
    }
    return wordSet;
}

export function getRandomSolutionSet() {
    const i = getRandomIntInclusive(0, wordList.length - 1);
    return getSolutionSet(i);
}