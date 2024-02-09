import { useEffect, useRef, useState } from "react";
import { ablyChannelName } from "~/server/ably/ablyHelpers";
import { BoggleDice } from "~/server/diceManager";
import { api } from "~/utils/api";
import { getCellIdFromLetterId, getLetterAtCell, swapCells } from "~/utils/helpers";
import { MIN_WORD_LENGTH } from "./Constants.tsx";
import { LetterBlock } from "./LetterBlock";
import LetterDropTarget from "./LetterDropTarget";
import { BoardConfiguration, DragMode, GameplayMessageData, SwappedLetterState } from "./Types.tsx";
import { useUserIdContext } from "./hooks/useUserIdContext";
import useSelectionDrag from "./useSelectionDrag.tsx";


interface BoardProps {
    boardConfig: BoardConfiguration,
    roomCode: string,
    gameId: string,
    latestMsg: GameplayMessageData | undefined,
    onBoardChange: (arg0: BoardConfiguration) => void,
    dragMode: DragMode,
    isClientsTurn: boolean,
    onAdvanceGameState: () => void,
}

export default function Board({ boardConfig, roomCode, gameId, latestMsg,
    onBoardChange, dragMode, isClientsTurn, onAdvanceGameState }: BoardProps) {

    const [selectedLetterIds, setSelectedLetterIds] = useState<number[]>([]);
    const [isPointerDown, setIsPointerDown] = useState<boolean>(false);
    const [pointerOver, setPointerOver] = useState<number>(); // pointerover
    const [lastSubmittedLetters, setLastSubmittedLetters] = useState<number[]>();
    const [swappedLetterState, setSwappedLetterState] = useState<SwappedLetterState | undefined>();
    const dropTargetsRef = useRef<Map<number, HTMLDivElement> | null>(null);
    const boardRef = useRef<HTMLDivElement | null>(null);
    const [_, setHasFirstRenderHappened] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const userId = useUserIdContext();

    const channelName = ablyChannelName(roomCode);

    function getDropTargetsMap() {
        if (!dropTargetsRef.current) {
            dropTargetsRef.current = new Map();
        }
        return dropTargetsRef.current;
    }

    const submitWordMutation = api.gameplay.submitWord.useMutation({
        onSettled: () => {
            setSelectedLetterIds([]);
        }
    });

    const swapDiceMutation = api.gameplay.swapDice.useMutation({});

    const currDragMode = (() => {
        if (/* swapDiceMutation.isLoading ||*/ submitWordMutation.isLoading) {
            return DragMode.Disabled;
        } else {
            return dragMode;
        }
    })();

    const handleLetterBlockDown = (e: PointerEvent, letterBlockId: number) => {
        if (submitWordMutation.isLoading) return;
        setIsPointerDown(true);
        if (currDragMode == DragMode.DragToSelect) {
            setSelectedLetterIds([letterBlockId]);
        }
    }

    // force re-render in order to pass DOM refs to children
    useEffect(() => {
        setHasFirstRenderHappened(true);
    }, [])

    const handleLetterBlockEnter = (e: PointerEvent, letterBlockId: number) => {
        if (!isPointerDown || letterBlockId == undefined || selectedLetterIds.includes(letterBlockId) || submitWordMutation.isLoading) return;
        if (currDragMode === DragMode.DragToSelect) {
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
    }

    const handlePointerUp = (e: PointerEvent) => {
        if (submitWordMutation.isLoading) return;
        setIsPointerDown(false);
        handleSubmitLetters(selectedLetterIds);
    }

    const handleOnDragStart = () => {
        if (!isClientsTurn) return;
        setIsDragging(true);
    }

    const handleOnDragEnd = () => {
        setIsDragging(false);
        setSwappedLetterState(undefined);
    };

    const handleHoverSwapLetter = (dropTargetCell: number, dragSourceCell: number) => {
        const newSwappedLetterState: SwappedLetterState = {
            swappedLetter: getLetterAtCell(dropTargetCell, boardConfig),
            dragSourceCell: dragSourceCell,
            dropTargetCell: dropTargetCell,
        }

        if (!swappedLetterState || newSwappedLetterState.dropTargetCell != swappedLetterState.dropTargetCell) {
            setSwappedLetterState(newSwappedLetterState);
        }
    };

    const handleDropLetter = (dropTargetCell: number) => {
        if (swappedLetterState != undefined && dropTargetCell === swappedLetterState.dragSourceCell) return;
        if (swappedLetterState == undefined)
            throw new Error('Cannot drop letter when SwappedLetterState is undefined');
        const updated = swapCells(boardConfig, dropTargetCell, swappedLetterState?.dragSourceCell);

        const letterBlockIdA = getLetterAtCell(dropTargetCell, boardConfig).id;
        const letterBlockIdB = getLetterAtCell(swappedLetterState.dragSourceCell, boardConfig).id;
        if (letterBlockIdA == undefined || letterBlockIdB == undefined) throw new Error('Missing LetterBlock ID(s)');

        swapDiceMutation.mutate({
            letterBlockIdA: letterBlockIdA,
            letterBlockIdB: letterBlockIdB,
            userId: userId,
            gameId: gameId,
            roomCode: roomCode,
        });
        onAdvanceGameState();
        onBoardChange(updated);
    };

    function handleSubmitLetters(letterIds: number[]) {
        if (letterIds.length < MIN_WORD_LENGTH) {
            setSelectedLetterIds([]);
            return;
        }
        submitWordMutation.mutate({
            userId: userId,
            gameId: gameId,
            // cellIds: getCellIdsFromLetterIds(boardConfig, letterIds),
            cellIds: letterIds.map(lid => getCellIdFromLetterId(boardConfig, lid)),
            roomCode: roomCode,
        })
    }

    // when pointerup happens outside a letter
    const windowRef = useRef<EventTarget>(window);
    useSelectionDrag(windowRef, [isPointerDown, selectedLetterIds], {
        onPointerUp: handlePointerUp,
        dragMode: currDragMode
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
                            const i = boardWidth * row + col;
                            return (
                                <LetterDropTarget key={i} cellId={i}
                                    onHover={handleHoverSwapLetter} onDrop={handleDropLetter}
                                    swappedLetterState={swappedLetterState} isDragging={isDragging}
                                    ref={(node) => {
                                        const map = getDropTargetsMap();
                                        if (node) {
                                            map.set(i, node);
                                        } else {
                                            map.delete(i);
                                        }
                                    }}
                                />
                            )
                        })}
                    </div>
                )}
                {/* LetterBlocks must be rendered in order of letterBlockId -- divs should be static */}
                {boardConfig.sort((a, b) => a.letterBlock.id - b.letterBlock.id).map(boardLetter => {
                    const sourceCellId = boardLetter.cellId;
                    const tempCellId = () => {
                        if (swappedLetterState?.dropTargetCell === sourceCellId) {
                            return swappedLetterState.dragSourceCell;
                        } else if (swappedLetterState?.dragSourceCell === sourceCellId) {
                            return swappedLetterState.dropTargetCell;
                        }
                        return undefined;
                    }
                    const letterBlock = boardLetter.letterBlock;
                    return (
                        <LetterBlock key={letterBlock.id} id={letterBlock.id} letters={letterBlock.letters}
                            onPointerDown={handleLetterBlockDown} onPointerUp={handlePointerUp}
                            onPointerEnter={handleLetterBlockEnter}
                            isSelected={selectedLetterIds.includes(letterBlock.id)}
                            blocksSelected={selectedLetterIds}
                            sourceCell={sourceCellId}
                            temporaryCell={tempCellId()}
                            dragMode={currDragMode}
                            onDragStart={handleOnDragStart}
                            onDragEnd={handleOnDragEnd}
                            dropTargetRefs={dropTargetsRef.current}
                            swappedLetterState={swappedLetterState}
                            boardDiv={boardRef.current}
                            numTimesRolled={letterBlock.numTimesRolled}
                            latestMsg={latestMsg}
                            isClientsTurn={isClientsTurn}

                        />)
                })
                }
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