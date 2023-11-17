import { LetterBlock } from "./LetterBlock";
import { BoggleDice, LetterDieSchema } from "~/server/diceManager";
import { useEffect, useRef, useState } from "react";
import useSelectionDrag from "./useSelectionDrag.tsx";
import { useUserIdContext } from "./hooks/useUserIdContext";
import { useChannel } from "@ably-labs/react-hooks";
import { DiceSwappedMessageData, MessageData, WordSubmittedMessageData } from "~/server/api/routers/gameplayRouter";
import { ablyChannelName } from "~/server/ably/ablyHelpers";
import { api } from "~/utils/api";
import LetterDropTarget from "./LetterDropTarget";
import { getCellIdFromLetterId, getLetterAtCell, swapCells } from "~/utils/helpers";
import { FormGroup, Stack, Typography } from "@mui/material";
import { AntSwitch } from "./AntSwitch";
import { MIN_WORD_LENGTH } from "./Constants.tsx";


interface BoardProps {
    initBoardConfig: BoardConfiguration,
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
}

export interface SwappedLetterState {
    swappedLetter: LetterDieSchema | undefined,
    dragSourceCell: number,
    dropTargetCell: number,
}

export type BoardLetterDie = {
    cellId: number,
    letterBlock: LetterDieSchema
}
export type BoardConfiguration = BoardLetterDie[];

export type LatestMessage = {
    messageType: AblyMessageType,

}


export default function Board({initBoardConfig, roomCode, gameId}: BoardProps) {
    const [boardConfig, setBoardConfig] = useState<BoardConfiguration>(initBoardConfig);
    const [selectedLetterIds, setSelectedLetterIds] = useState<number[]>([]);
    const [isPointerDown, setIsPointerDown] = useState<boolean>(false);
    const [pointerOver, setPointerOver] = useState<number>(); // pointerover
    const [lastSubmittedLetters, setLastSubmittedLetters] = useState<number[]>();

    const [dragMode, setDragMode] = useState<DragMode>(DragMode.DragNDrop);
    const [swappedLetterState, setSwappedLetterState] = useState<SwappedLetterState | undefined>();
    const dropTargetsRef = useRef<Map<number, HTMLDivElement> | null>(null);
    const boardRef = useRef<HTMLDivElement | null>(null);
    const [_, setHasFirstRenderHappened] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [latestMsg, setLatestMsg] = useState<MessageData>();
    const userId = useUserIdContext();

    function getDropTargetsMap() {
        if (!dropTargetsRef.current) {
            dropTargetsRef.current = new Map();
        }
        return dropTargetsRef.current;
    }

    const submitWord = api.gameplay.submitWord.useMutation({
        onSettled: () => {
            setSelectedLetterIds([]);
        }
    });

    const swapDice = api.gameplay.swapDice.useMutation({

    });



    useChannel(ablyChannelName(roomCode), AblyMessageType.WordSubmitted, (message) => {
        const msgData = message.data as WordSubmittedMessageData;
        setLatestMsg(msgData);
        // sent to all clients
        setBoardConfig(msgData.newBoard);
    });

    useChannel(ablyChannelName(roomCode), AblyMessageType.DiceSwapped, (message) => {
        const msgData = message.data as DiceSwappedMessageData;
        setLatestMsg(msgData);
        if (msgData.userId == userId) return;
        setBoardConfig(msgData.newBoard);
    });

    const handleLetterBlockDown = (e: PointerEvent, letterBlockId: number) => {
        if (submitWord.isLoading) return;
        setIsPointerDown(true);
        if (dragMode == DragMode.DragToSelect) {
            setSelectedLetterIds([letterBlockId]);
        }
    }

    // force re-render in order to pass DOM refs to children
    useEffect(() => {
        setHasFirstRenderHappened(true);
    }, [])

    const handleLetterBlockEnter = (e: PointerEvent, letterBlockId: number) => {
        if (!isPointerDown || letterBlockId == undefined || selectedLetterIds.includes(letterBlockId) || submitWord.isLoading) return;
        if (dragMode === DragMode.DragToSelect)
        {
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

        if (submitWord.isLoading) return;
        setIsPointerDown(false);
        handleSubmitLetters(selectedLetterIds);
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
            swappedLetter: getLetterAtCell(dropTargetCell, boardConfig),
            dragSourceCell: dragSourceCell,
            dropTargetCell: dropTargetCell,
        }

        if (!swappedLetterState || newSwappedLetterState.dropTargetCell != swappedLetterState.dropTargetCell) {
            setSwappedLetterState(newSwappedLetterState);
        }
    };

    const handleDropLetter = (dropTargetCell: number, letterBlock: LetterDieSchema) => {
        if (swappedLetterState == undefined)
            throw new Error('Cannot drop letter when SwappedLetterState is undefined');
        const updated = swapCells(boardConfig, dropTargetCell, swappedLetterState?.dragSourceCell);

        const letterBlockIdA = getLetterAtCell(dropTargetCell, boardConfig).id;
        const letterBlockIdB = getLetterAtCell(swappedLetterState.dragSourceCell, boardConfig).id;
        if (letterBlockIdA == undefined || letterBlockIdB == undefined) throw new Error('Missing LetterBlock ID(s)');

        swapDice.mutate({
            letterBlockIdA: letterBlockIdA,
            letterBlockIdB: letterBlockIdB,
            userId: userId,
            gameId: gameId,
            roomCode: roomCode,
        })
        setBoardConfig(updated);
    };

    const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
    }

    function handleSubmitLetters(letterIds: number[]) {
        if (letterIds.length < MIN_WORD_LENGTH) {
            setSelectedLetterIds([]);
            return;
        }
        submitWord.mutate({
            userId: userId,
            gameId: gameId,
            // cellIds: getCellIdsFromLetterIds(boardConfig, letterIds),
            cellIds: letterIds.map(lid => getCellIdFromLetterId(boardConfig, lid)),
            roomCode: roomCode,
        })
    }

    function handleDragModeChange() {
        dragMode === DragMode.DragNDrop ?
            setDragMode(DragMode.DragToSelect) :
            setDragMode(DragMode.DragNDrop);
    }

    // when pointerup happens outside a letter
    const windowRef = useRef<EventTarget>(window);
    useSelectionDrag(windowRef, [isPointerDown, selectedLetterIds], {
        onPointerUp: handlePointerUp,
        dragMode: dragMode
    }, 'window');

    const smallText = {
        color: '#ABB'
    }

    // prevent tap-and-hold browser context menu from appearing
    useEffect(() => {
        window.addEventListener('contextmenu', handleContextMenu, true);
        return () => {
            window.removeEventListener('contextmenu', handleContextMenu, true);
        }
    }, []);

    return (
        <>
            <div className="board flex flex-col" ref={boardRef}>
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
                    {/* LetterBlocks must be rendered in order of letterBlockId -- divs should be static */}
                    {boardConfig.sort((a,b) => a.letterBlock.id - b.letterBlock.id).map(boardLetter => {
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
                                dragMode={dragMode}
                                onDragStart={handleOnDragStart}
                                onDragEnd={handleOnDragEnd}
                                dropTargetRefs={dropTargetsRef.current}
                                swappedLetterState={swappedLetterState}
                                boardDiv={boardRef.current}
                                numTimesRolled={letterBlock.numTimesRolled}
                                latestMsg={latestMsg}
                            />)
                    })
                    }
                </>
            </div>
            {<FormGroup className="flex items-center">
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography  sx={dragMode === DragMode.DragNDrop ? smallText : {}}>Select Words</Typography>
                        <AntSwitch checked={dragMode === DragMode.DragNDrop} onChange={handleDragModeChange} inputProps={{ 'aria-label': 'ant design' }} />
                    <Typography sx={dragMode === DragMode.DragToSelect ? smallText : {}}>Swap Letters</Typography>
                </Stack>
            </FormGroup>}
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