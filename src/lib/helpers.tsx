import type {BoardConfiguration} from "~/components/Types.tsx";

export function getWordFromCellIds(cellIds: number[], board: BoardConfiguration) {
    let word = cellIds.reduce((str, cellId) =>
            str.concat(board.find(l => l.cellId === cellId)?.letterBlock.letters[0] ?? ''),
        '');
    word = word.replace('Q', 'QU');
    const score = getWordScore(word);
    return {
        word: word,
        score: score
    };
}

export function getWordFromLetterBlockIds(letterIds: number[], board: BoardConfiguration) {
    return getWordFromCellIds(letterIds.map(lbid => getCellIdFromLetterId(board, lbid)), board);
}

export function getWordScore(word: string) {
    const length = word.length;
    let score;

    if (length === 3 || length === 4) {
        score = 1
    } else if (length === 5) {
        score = 2
    } else if (length === 6) {
        score = 3
    } else if (length === 7) {
        score = 5
    } else if (length >= 8) {
        score = 11
    } else
        score = 0;
    return score;
}

export function getCellIdFromLetterId(board: BoardConfiguration, letterBlockId: number) {
    const boardLetter = board.find(x => x.letterBlock.id === letterBlockId);
    if (!boardLetter) throw new Error(`No board letter with letterBlockId ${letterBlockId}`)
    return boardLetter.cellId;
}

export function getLetterAtCell(cellId: number, board: BoardConfiguration) {
    const boardLetterDie = board.find(x => x.cellId === cellId);
    if (!boardLetterDie) throw new Error('BoardLetterDie undefined')
    return boardLetterDie.letterBlock;
}