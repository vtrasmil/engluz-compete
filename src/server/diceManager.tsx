import shuffleArrayCopy, { shuffleArrayJS, shuffleString } from "~/components/helpers"

export const boggleDice =
    [
        "AACIOT",
        "ABILTY",
        "ABJMOQ",// TODO: Qu
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

export function rollAndShuffleDice(dice: string[]) {
    const shuffledDice = shuffleArrayCopy(dice);
    let roll: string[] = [];
    shuffledDice.forEach((die, i) => {
        die = shuffleString(die); 
        roll = [...roll, die];
    });
    return roll;
}

export function rollDice(dice: string[], diceToRoll: number[]) {
    let roll: string[] = [];
    dice.forEach((die, i) => {
        if (diceToRoll.includes(i)) {
            die = shuffleString(die); 
        }
        roll = [...roll, die];
    });
    return roll;
}


export function toStoredDiceRollString(dice: string[]) {
        return dice.join(',');
}

export function toFaceUpValues(dice: string[]) {
    let letters = '';
    for (let key in dice) {
        letters += dice[key]?.[0];
    }
    return letters;
}

