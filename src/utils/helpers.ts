
export const uniqueId = function () {
    return "id-" + Math.random().toString(36).substring(2, 16);
    // TODO: include totalPlayers
};

export function getRandomIntInclusive(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}