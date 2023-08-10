
export const uniqueId = function () {
    return "id-" + Math.random().toString(36).substring(2, 16);
    // TODO: include totalPlayers
};