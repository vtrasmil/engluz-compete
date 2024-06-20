import {useEffect, useRef, useState} from "react";
import {ablyChannelName} from "~/server/ably/ablyHelpers";
import {BoggleDice} from "~/server/diceManager";
import {getCellIdFromLetterId} from "~/utils/helpers";
import {MIN_WORD_LENGTH} from "./Constants.tsx";
import {LetterBlock} from "./LetterBlock";
import {BoardConfiguration, WordSubmissionState} from "./Types.tsx";
import {useUserIdContext} from "./hooks/useUserIdContext";
import useSelectionDrag from "./useSelectionDrag.tsx";


interface BoardProps {
    boardConfig: BoardConfiguration,
    roomCode: string,
    onSubmitWord: (cellIds: number[]) => void,
    wordSubmissionState: WordSubmissionState,
    onReselecting: () => void,
}

export default function Board({ boardConfig, roomCode, onSubmitWord, wordSubmissionState, onReselecting }: BoardProps) {

    const [selectedLetterIds, setSelectedLetterIds] = useState<number[]>([]);
    const [isSelecting, setIsSelecting] = useState<boolean>(false);
    const boardRef = useRef<HTMLDivElement | null>(null);
    const [_, setHasFirstRenderHappened] = useState(false);

    const userId = useUserIdContext();
    const channelName = ablyChannelName(roomCode);

    const isSelectionDisabled =
        wordSubmissionState == WordSubmissionState.Submitting ||
        wordSubmissionState == WordSubmissionState.Confirming ||
        wordSubmissionState == WordSubmissionState.Confirmed;

    const handleSelectionStarted = (e: PointerEvent, letterBlockId: number) => {
        if (isSelectionDisabled) return;
        setIsSelecting(true);
        setSelectedLetterIds([letterBlockId]);
        onReselecting();
    }

    // force re-render in order to pass DOM refs to children
    useEffect(() => {
        setHasFirstRenderHappened(true);
    }, [])

    const handleLetterBlockEnter = (e: PointerEvent, letterBlockId: number) => {
        if (!isSelecting || letterBlockId == undefined || selectedLetterIds.includes(letterBlockId) || isSelectionDisabled) return;
        const lastBlockSelected = selectedLetterIds.slice(-1)[0];
        if (lastBlockSelected == undefined) return;
        const lastCellSelected = getCellIdFromLetterId(boardConfig, lastBlockSelected);
        const currCellSelected = getCellIdFromLetterId(boardConfig, letterBlockId);
        if (lastCellSelected != undefined && currCellSelected != undefined) {
            const isNeighbor = getNeighbors(lastCellSelected)?.includes(currCellSelected);
            if (!isNeighbor) return;
        }
        setSelectedLetterIds([...selectedLetterIds, letterBlockId]);
    }

    const handleSelectionFinished = (e: PointerEvent) => {
        if (isSelectionDisabled) return; // TODO: there shouldn't be a mutation until selection is finished
        setIsSelecting(false);
        if (selectedLetterIds.length >= MIN_WORD_LENGTH) {
            onSubmitWord(selectedLetterIds.map(lid => getCellIdFromLetterId(boardConfig, lid)),);
        } else {
            setSelectedLetterIds([]);
        }
    }

    // TODO: letterIds or sourceCellIds?


    // when pointerup happens outside a letter
    const windowRef = useRef<EventTarget>(window);
    useSelectionDrag(windowRef, [isSelecting, selectedLetterIds], {
        onPointerUp: handleSelectionFinished,
    }, 'window');

    // prevent tap-and-hold browser context menu from appearing
    const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
    }
    useEffect(() => {
        window.addEventListener('contextmenu', handleContextMenu, true);
        return () => {
            window.removeEventListener('contextmenu', handleContextMenu, true);
        }
    }, []);



    return (
        <>
            <div className="board flex flex-col mb-6" ref={boardRef}>
                {rows.map((row) =>
                    <div key={row} className="board-row flex justify-center">
                        {rows.map(col => {
                            const i = (boardWidth * row) + col;
                            const letterBlock = boardConfig[i]?.letterBlock;
                            if (letterBlock != undefined) {
                                return (
                                    <LetterBlock key={letterBlock.id.toString() + ":" + letterBlock.numTimesRolled.toString()}
                                                 id={letterBlock.id} letters={letterBlock.letters}
                                                 onPointerDown={handleSelectionStarted} onPointerUp={handleSelectionFinished}
                                                 onPointerEnter={handleLetterBlockEnter}
                                                 isSelected={selectedLetterIds.includes(letterBlock.id)}
                                                 wordSubmissionState={wordSubmissionState}
                                                 numTimesRolled={letterBlock.numTimesRolled}
                                    />
                                )
                            }

                        })}
                    </div>
                )}

            </div>
        </>
    );
}

const boardWidth = Math.sqrt(BoggleDice.length);
if (![4, 5, 6].includes(boardWidth)) {
    throw new Error('Board must be square');
}
const rows = [...Array(boardWidth).keys()]


const neighborMap = [
    [1, 4, 5],
    [0, 4, 5, 6, 2],
    [1, 5, 6, 7, 3],
    [2, 6, 7],
    [0, 1, 5, 9, 8],
    [0, 1, 2, 4, 6, 8, 9, 10],
    [1, 2, 3, 5, 7, 9, 10, 11],
    [3, 2, 6, 10, 11],
    [4, 5, 9, 12, 13],
    [4, 5, 6, 8, 10, 12, 13, 14],
    [5, 6, 7, 9, 11, 13, 14, 15],
    [6, 7, 10, 14, 15],
    [8, 9, 13],
    [12, 8, 9, 10, 14],
    [13, 9, 10, 11, 15],
    [14, 10, 11]
];

function getNeighbors(cellId: number) {
    if (cellId < 0 || cellId >= neighborMap.length) throw new Error('Letter block index out of bounds');
    return neighborMap[cellId];
}