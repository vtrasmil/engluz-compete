import shuffleArrayCopy, { shuffleArrayJS, shuffleString } from "~/components/helpers"

export const boggleDice =
    [
        "AACIOT",
        "ABILTY",
        "ABJMOQ",//Qu
        "ACDEMP",
        "ACELRS",
        "ADENVZ",
        "AHMORS",
        "BIFORX",
        "DENOSW",
        "DKNOTU",
        "EEFHIY",
        "EGKLUY",
        "EGINTV",
        "EHINPS",
        "ELPSTU",
        "GILRUW"
    ]

export function getDiceRoll(dice: string[]) {
    let shuffledCopy = shuffleArrayCopy(dice);
    let roll: string[] = [];
    shuffledCopy.forEach((die, i) => {
        // roll = [...roll, [...shuffleString(die)]];
        roll = [...roll, shuffleString(die)]
    });
    return roll;
}

export function getDiceRollAsString(dice: string[]) {
    let shuffledCopy = shuffleArrayCopy(dice);
    console.log(shuffledCopy);
    let roll = '';
    shuffledCopy.forEach(die => {
        // roll = [...roll, [...shuffleString(die)]];
        roll = roll.concat(shuffleString(die));
        
    });
    return roll;
}
    
// console.log(getDiceRollAsString(boggleDice));