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
    const shuffledDice = shuffleArrayCopy(dice);
    let roll: string[] = [];
    shuffledDice.forEach((die) => {
        // roll = [...roll, [...shuffleString(die)]];
        roll = [...roll, shuffleString(die).charAt(0)]
    });
    return roll;
}

export function getDiceRollAsString(dice: string[]) {
    const shuffledDice = shuffleArrayCopy(dice);
    let roll = '';
    shuffledDice.forEach(die => {
        roll = roll.concat(shuffleString(die).charAt(0));  
    });
    return roll;
}
    
// console.log(getDiceRollAsString(boggleDice));