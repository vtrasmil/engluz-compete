import {useEffect, useRef, useState} from "react";
import {ablyChannelName} from "~/server/ably/ablyHelpers";
import {BoggleDice} from "~/server/diceManager";
import {api} from "~/utils/api";
import {getCellIdFromLetterId} from "~/utils/helpers";
import {MIN_WORD_LENGTH} from "./Constants.tsx";
import {LetterBlock} from "./LetterBlock";
import {AblyMessageType, BoardConfiguration, GameEventMessageData, GameplayMessageData} from "./Types.tsx";
import {useUserIdContext} from "./hooks/useUserIdContext";
import useSelectionDrag from "./useSelectionDrag.tsx";


interface BoardProps {
    boardConfig: BoardConfiguration,
    roomCode: string,
    gameId: string,
    latestMsg: GameplayMessageData | GameEventMessageData | undefined,
    onSubmitWord: (cellIds: number[]) => void,
    isMutationLoading: boolean,
}

export default function Board({ boardConfig, roomCode, gameId, latestMsg, onSubmitWord, isMutationLoading }: BoardProps) {

    const [selectedLetterIds, setSelectedLetterIds] = useState<number[]>([]);
    const [isPointerDown, setIsPointerDown] = useState<boolean>(false);
    const [pointerOver, setPointerOver] = useState<number>(); // pointerover
    const boardRef = useRef<HTMLDivElement | null>(null);
    const [_, setHasFirstRenderHappened] = useState(false);
    const userId = useUserIdContext();

    const channelName = ablyChannelName(roomCode);


    const handleLetterBlockDown = (e: PointerEvent, letterBlockId: number) => {
        if (isMutationLoading) return;
        setIsPointerDown(true);
        setSelectedLetterIds([letterBlockId]);
    }

    // force re-render in order to pass DOM refs to children
    useEffect(() => {
        setHasFirstRenderHappened(true);
    }, [])

    const handleLetterBlockEnter = (e: PointerEvent, letterBlockId: number) => {
        if (!isPointerDown || letterBlockId == undefined || selectedLetterIds.includes(letterBlockId) || isMutationLoading) return;
        const lastBlockSelected = selectedLetterIds.slice(-1)[0];
        if (lastBlockSelected == undefined) return;
        const lastCellSelected = getCellIdFromLetterId(boardConfig, lastBlockSelected);
        const currCellSelected = getCellIdFromLetterId(boardConfig, letterBlockId);
        if (lastCellSelected != undefined && currCellSelected != undefined) {
            const isNeighbor = getNeighbors(lastCellSelected)?.includes(currCellSelected);
            if (!isNeighbor) return;
        }
        setPointerOver(letterBlockId);
        setSelectedLetterIds([...selectedLetterIds, letterBlockId]);
    }

    const handlePointerUp = (e: PointerEvent) => {
        if (isMutationLoading) return;
        setIsPointerDown(false);
        handleSubmitLetters(selectedLetterIds);
    }

    function handleSubmitLetters(letterIds: number[]) {
        if (letterIds.length < MIN_WORD_LENGTH) {
            setSelectedLetterIds([]);
            return;
        }
        onSubmitWord(letterIds.map(lid => getCellIdFromLetterId(boardConfig, lid)),);
    }

    // TODO: letterIds or sourceCellIds?


    // when pointerup happens outside a letter
    const windowRef = useRef<EventTarget>(window);
    useSelectionDrag(windowRef, [isPointerDown, selectedLetterIds], {
        onPointerUp: handlePointerUp,
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
                                                 sourceCell={i} id={letterBlock.id} letters={letterBlock.letters}
                                                 onPointerDown={handleLetterBlockDown} onPointerUp={handlePointerUp}
                                                 onPointerEnter={handleLetterBlockEnter}
                                                 isSelected={selectedLetterIds.includes(letterBlock.id)}
                                                 blocksSelected={selectedLetterIds}
                                                 boardDiv={boardRef.current}
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