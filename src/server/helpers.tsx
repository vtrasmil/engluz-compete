import {BAD_FOUR_LETTER_WORDS} from "~/server/Constants.tsx";

export function generateRandomString(length = 4): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    if (BAD_FOUR_LETTER_WORDS.find(w => w === result)) {
        return generateRandomString(length);
    }
    return result;
}