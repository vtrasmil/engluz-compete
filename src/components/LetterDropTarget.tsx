import { ReactNode } from "react";
import { DropTargetMonitor, useDrop } from "react-dnd";
import { LetterDieSchema } from "~/server/diceManager";
import { DraggedLetter } from "./LetterBlock";
import { SwappedLetterState } from "./Board";

interface LetterDropTargetType {
    cellId: number,
    children: ReactNode,
    onDragOver: (letterBlockId: number, fromCell: number, toCell: number) => void,
    onDrop: (cell: number, letterBlock: LetterDieSchema) => void,
    childLetterBlockId: number | undefined,
    childLetter: string | undefined,
    letterBlocks: (LetterDieSchema | undefined)[],
    swappedLetterState: SwappedLetterState | undefined,
    // onHover: (hoveredCell: number) => void,

}

const LetterDropTarget = ({children, cellId, onDragOver, onDrop, childLetterBlockId, letterBlocks, swappedLetterState}: LetterDropTargetType) => {

    const [collectedProps, dropRef] = useDrop(() => ({
        accept: 'letter',
        hover: hover,
        drop: drop,
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }), [letterBlocks, swappedLetterState]);



    function hover(item: DraggedLetter, monitor: DropTargetMonitor) {
        // console.log(`LetterDropTarget:${cellId}: dragging (${item.id}/${item.letters[0]}) over (${childLetterBlockId})`)

        if (childLetterBlockId === item.id || childLetterBlockId == undefined) return;

        onDragOver(childLetterBlockId, cellId, item.currCell);
    }

    function drop(item: DraggedLetter) {
        // console.log(`Dropped item ${item.id}`);
        const letter = { letters: item.letters, id: item.id } as LetterDieSchema;
        onDrop(cellId, letter);
    }

    /* if (cell === 2) {
        console.log(`LetterDropTarget: rendering cell 2: ${childLetterBlockId}/${childLetter}`)
    } */


    return (
        <div ref={dropRef} id={`letter-drop-target-${cellId.toString()}`}
            style={{
                width: '50px', height: '50px'
            }}
            className={'m-2'}>
            {children}

        </div> );
}

export default LetterDropTarget;