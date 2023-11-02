import shuffleArrayCopy, { shuffleString } from "~/components/helpers";

export type LetterDieSchema = {
    'letters': string,
    'id': number,
}

export interface BoardSchema {
    dice: LetterDieSchema[]
}

export const BoggleDice: LetterDieSchema[] =
    [
        { letters: "AACIOT", id: 0 },
        { letters: "ABILTY", id: 1 },
        { letters: "ABJMOQ", id: 2 },
        { letters: "ACDEMP", id: 3 },
        { letters: "ACELRS", id: 4 },
        { letters: "ADENVZ", id: 5 },
        { letters: "AHMORS", id: 6 },
        { letters: "BIFORX", id: 7 },
        { letters: "DENOSW", id: 8 },
        { letters: "DKNOTU", id: 9 },
        { letters: "EEFHIY", id: 10 },
        { letters: "EGKLUY", id: 11 },
        { letters: "EGINTV", id: 12 },
        { letters: "EHINPS", id: 13 },
        { letters: "ELPSTU", id: 14 },
        { letters: "GILRUW", id: 15 },
    ]

export function rollAndShuffleDice(dice: LetterDieSchema[]) : LetterDieSchema[] {
    const shuffledDice = shuffleArrayCopy<LetterDieSchema>(dice);
    let roll: LetterDieSchema[] = [];
    shuffledDice.forEach((die, i) => {
        die = {letters: shuffleString(die.letters), id: die.id};
        roll = [...roll, die];
    });
    return roll;
}

// TODO: should this roll dice by ID or position in array?
export function rollDice(dice: LetterDieSchema[], diceToRoll: number[]) {
    let roll: LetterDieSchema[] = [];
    dice.forEach((die, i) => {
        if (diceToRoll.includes(i)) {
            die = {letters: shuffleString(die.letters), id: die.id};
        }
        roll = [...roll, die];
    });
    return roll;
}


export function toStoredDiceRoll(dice: string[]) {
        return dice.join(',');
}

export function toFaceUpValues(dice: LetterDieSchema[]) {
    let letters = '';
    dice.forEach((v, i) => {
        letters += dice[i]?.letters[0];
    })
    return letters;
}

