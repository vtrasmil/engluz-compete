import { ReactNode } from "react";
import { DropTargetMonitor, useDrop } from "react-dnd";

interface LetterDropTargetType {
    cell: number,
    children: ReactNode,
    onDragOver: (letterBlockId: number, fromCell: number, toCell: number) => void,
    childLetterBlockId: number,
    childLetter: string | undefined,

}

const LetterDropTarget = ({children, cell, onDragOver, childLetterBlockId, childLetter}: LetterDropTargetType) => {



    const [{ isOver: boolean }, dropRef] = useDrop(() => ({
        accept: 'letter',
        hover: hover,
        drop: drop,
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),


        }),
    }), [childLetterBlockId]);

    function hover(item: any, monitor: DropTargetMonitor) {
        console.log(`LetterDropTarget:${cell}: dragging (${item.id}/${item.letter}) over (${childLetterBlockId}/${childLetter})`)
        if (childLetterBlockId === item.id) return;
        onDragOver(childLetterBlockId, cell, item.currCell);
    }

    function drop(item: HTMLElement) {
        console.log(`Dropped ${item}`);
    }

    if (cell === 2) {
        console.log(`LetterDropTarget: rendering cell 2: ${childLetterBlockId}/${childLetter}`)
    }


    return (
        <div ref={dropRef} id={`letter-drop-target-${cell.toString()}`}
            style={{
                width: '50px', height: '50px'
            }}
            className={'m-2'}>
            {children}

        </div> );
}

export default LetterDropTarget;