import { forwardRef, useEffect, useRef } from "react";
import { DropTargetMonitor, useDrop } from "react-dnd";
import { LetterDieSchema } from "~/server/diceManager";
import { DraggedLetter } from "./LetterBlock";
import { SwappedLetterState } from "./Board.tsx";

interface LetterDropTargetType {
    cellId: number,
    onHover: (fromCell: number, toCell: number) => void,
    onDrop: (cell: number, letterBlock: LetterDieSchema) => void,
    swappedLetterState: SwappedLetterState | undefined,
    isDragging: boolean,


}
// {children, cellId, onHover, onDrop, childLetterBlockId, letterBlocks, swappedLetterState}
const LetterDropTarget = forwardRef<HTMLDivElement, LetterDropTargetType>(
    ({cellId, onHover, onDrop, swappedLetterState, isDragging}, ref) =>
    {
        // const outerRef = useForwardedRef(ref);
        const divRef = useRef(null);

        // for forwarding ref
        useEffect(() => {
            if (!ref) return;
            if (typeof ref === "function") {
                ref(divRef.current);
            } else {
                ref.current = divRef.current;
            }
        }, []); //TODO: call more often?

        const [collectedProps, dropRef] = useDrop(() => {
            return {
                accept: 'letter',
                hover: hover,
                drop: drop,
                collect: (monitor) => ({
                    isOver: !!monitor.isOver(),
                })
            }
        }, [swappedLetterState]);



        function hover(item: DraggedLetter, monitor: DropTargetMonitor) {
            onHover(cellId, item.currCell);
        }

        function drop(item: DraggedLetter) {
            // console.log(`Dropped item ${item.id}`);
            const letter = { letters: item.letters, id: item.id } as LetterDieSchema;
            onDrop(cellId, letter);
        }

        return (

                <div ref={dropRef} id={`letter-drop-target-${cellId.toString()}`}
                    style={{
                        width: '50px', height: '50px'
                    }}
                className={
                    `m-2 ${isDragging && 'z-10'}
                    letter-drop-target
                    ${collectedProps.isOver && `bg-slate-500 && opacity-25`}`}>

                    <div ref={divRef} className={`h-full`} />

                </div>

        );
    }
);

export default LetterDropTarget;