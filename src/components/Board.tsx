import { LetterBlock } from "./LetterBlock";
import { BoggleDice, LetterDieSchema } from "~/server/diceManager";
import { useEffect, useRef, useState } from "react";
import useCustomDrag from "./useDrag";
import { useUserIdContext } from "./hooks/useUserIdContext";
import { useChannel } from "@ably-labs/react-hooks";
import { DiceSwappedMessageData, WordSubmittedMessageData } from "~/server/api/routers/gameplayRouter";
import { ablyChannelName } from "~/server/ably/ablyHelpers";
import { api } from "~/utils/api";
import { MaterialUISwitch } from "./MUISwitch";
import LetterDropTarget from "./LetterDropTarget";
import { boardArrayToMap, swapCells } from "~/utils/helpers";

interface BoardProps {
    boardConfig: BoardConfiguration,
    roomCode: string,
    gameId: string,
}

export enum DragMode {
    DragToSelect = 'dragToSelect',
    DragNDrop = 'dragNDrop'
}

export enum AblyMessageType {
    WordSubmitted = 'wordSubmitted',
    DiceSwapped = 'diceSwapped',
};

export interface SwappedLetterState {
    swappedLetter: LetterDieSchema | undefined,
    dragSourceCell: number,
    dropTargetCell: number,
}

export type BoardConfiguration = Map<number, LetterDieSchema>;

export default function Board({boardConfig, roomCode, gameId}: BoardProps) {
    const [letterBlocks, setLetterBlocks] = useState<BoardConfiguration>(boardConfig);
    const [selectedLetters, setSelectedLetters] = useState<number[]>([]);
    const [isPointerDown, setIsPointerDown] = useState<boolean>(false);
    const [pointerOver, setPointerOver] = useState<number>(); // pointerover
    const [lastSubmittedLetters, setLastSubmittedLetters] = useState<number[]>();

    const [dragMode, setDragMode] = useState<DragMode>(DragMode.DragNDrop);
    const [swappedLetterState, setSwappedLetterState] = useState<SwappedLetterState | undefined>();
    const dropTargetsRef = useRef<Map<number, HTMLDivElement> | null>(null);
    const [_, setHasFirstRenderHappened] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const userId = useUserIdContext();

    function getDropTargetsMap() {
        if (!dropTargetsRef.current) {
            dropTargetsRef.current = new Map();
        }
        return dropTargetsRef.current;
    }

    const submitWord = api.gameplay.submitWord.useMutation({
        onSettled: () => {
            setSelectedLetters([]);
        }
    });

    const swapDice = api.gameplay.swapDice.useMutation({

    });

    useChannel(ablyChannelName(roomCode), AblyMessageType.WordSubmitted, (message) => {
        const msgData = message.data as WordSubmittedMessageData;
        // sent to all clients
        setLetterBlocks(boardArrayToMap(msgData.newBoard));
    });

    useChannel(ablyChannelName(roomCode), AblyMessageType.DiceSwapped, (message) => {
        const msgData = message.data as DiceSwappedMessageData;
        if (msgData.userId == userId) return;
        setLetterBlocks(boardArrayToMap(msgData.newBoard));
    });

    const handleLetterBlockDown = (e: PointerEvent, i: number) => {
        if (submitWord.isLoading) return;
        setIsPointerDown(true);
        switch (dragMode) {
            case DragMode.DragToSelect:
                setSelectedLetters([i]);
                break;
            case DragMode.DragNDrop:

                break;
            default:
                break;
        }
    }

    // force re-render in order to pass DOM refs to children
    useEffect(() => {
        setHasFirstRenderHappened(true);
    }, [])

    const handleLetterBlockEnter = (e: PointerEvent, i: number) => {
        if (!isPointerDown || i == undefined || selectedLetters.includes(i) || submitWord.isLoading) return;

        switch (dragMode) {
            case DragMode.DragToSelect:
                const lastBlockSelected = selectedLetters.slice(-1)[0];
                if (lastBlockSelected != undefined) {
                    const isNeighbor = getNeighbors(lastBlockSelected)?.includes(i);
                    if (!isNeighbor) return;
                }
                setPointerOver(i);
                setSelectedLetters([...selectedLetters, i]);
                break;
            case DragMode.DragNDrop:

                break;
            default:
                break;
        }
    }
    const handlePointerUp = (e: PointerEvent) => {

        if (submitWord.isLoading) return;
        setIsPointerDown(false);
        switch (dragMode) {
            case DragMode.DragToSelect:
                if (selectedLetters.length <= 3) {
                    setSelectedLetters([]);
                    return;
                }
                handleSubmitLetters(selectedLetters);
                break;
            case DragMode.DragNDrop:
                break;

            default:
                break;
        }
    }


    const handleOnDragStart = () => {
        setIsDragging(true);
    }

    const handleOnDragEnd = () => {
        setIsDragging(false);
        setSwappedLetterState(undefined);
    };

    const handleHoverSwapLetter = (dropTargetCell: number, dragSourceCell: number) => {
        const newSwappedLetterState: SwappedLetterState = {
            swappedLetter: letterBlocks.get(dropTargetCell),
            dragSourceCell: dragSourceCell,
            dropTargetCell: dropTargetCell,
        }

        if (!swappedLetterState || newSwappedLetterState.dropTargetCell != swappedLetterState.dropTargetCell) {
            setSwappedLetterState(newSwappedLetterState);
        }
    };

    const handleDropLetter = (dropTargetCell: number, letterBlock: LetterDieSchema) => {
        if (letterBlocks.get(dropTargetCell) == undefined)
            throw new Error('Cannot drop letter in an occupied cell.');
        if (swappedLetterState == undefined)
            throw new Error('Cannot drop letter when SwappedLetterState is undefined');
        const updated = swapCells(letterBlocks, dropTargetCell, swappedLetterState?.dragSourceCell);

        const letterBlockIdA = letterBlocks.get(dropTargetCell)?.id;
        const letterBlockIdB = letterBlocks.get(swappedLetterState.dragSourceCell)?.id;
        if (letterBlockIdA == undefined || letterBlockIdB == undefined) throw new Error('Missing LetterBlock ID(s)');

        swapDice.mutate({
            letterBlockIdA: letterBlockIdA,
            letterBlockIdB: letterBlockIdB,
            userId: userId,
            gameId: gameId,
            roomCode: roomCode,
        })
        setLetterBlocks(updated);
    };

    const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
    }

    function handleSubmitLetters(letters: number[]) {
        if (letters.length < 4) {
            setSelectedLetters([]);
            return;
        };
        submitWord.mutate({
            userId: userId,
            gameId: gameId,
            letterBlocks: letters,
            roomCode: roomCode,
        })
    }

    // when pointerup happens outside a letter
    const windowRef = useRef<EventTarget>(window);
    useCustomDrag(windowRef, [isPointerDown, selectedLetters], {
        onPointerUp: handlePointerUp,
        dragMode: dragMode
    }, 'window');



    // prevent tap-and-hold browser context menu from appearing
    useEffect(() => {
        window.addEventListener('contextmenu', handleContextMenu, true);
        return () => {
            window.removeEventListener('contextmenu', handleContextMenu, true);
        }
    }, []);

    return (
        <>
            <div className="board flex flex-col">
                <>
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
                    {/* should be rendered in order of letterBlockId -- divs should be static */}
                    {[...letterBlocks].sort((a,b)=> a[1].id - b[1].id).map((mapEntry) => {

                        const [cellId, letterBlock] = mapEntry;
                        return (
                            <LetterBlock key={letterBlock.id} id={letterBlock.id} letters={letterBlock.letters}
                                onPointerDown={handleLetterBlockDown} onPointerUp={handlePointerUp}
                                onPointerEnter={handleLetterBlockEnter}

                                isSelected={selectedLetters.includes(cellId)}
                                isPointerOver={pointerOver === cellId}
                                blocksSelected={selectedLetters}

                                currCell={cellId}
                                dragMode={dragMode}
                                onDragStart={handleOnDragStart}
                                onDragEnd={handleOnDragEnd}
                                dropTargetRefs={dropTargetsRef.current}
                                swappedLetterState={swappedLetterState}
                            />)
                    })
                    }
                </>
            </div>
            <MaterialUISwitch />
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

function getNeighbors(i: number) {
    if (i < 0 || i >= neighborMap.length) throw new Error('Letter block index out of bounds');
    return neighborMap[i];
}