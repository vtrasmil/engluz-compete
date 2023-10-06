import { forwardRef, useEffect, useRef } from "react";
import { DropTargetMonitor, useDrop } from "react-dnd";
import { LetterDieSchema } from "~/server/diceManager";
import { DraggedLetter } from "./LetterBlock";
import { SwappedLetterState } from "./Board.tsx";

interface LetterDropTargetType {
    cellId: number,
    onHover: (fromCell: number, toCell: number) => void,
    onDrop: (cell: number, letterBlock: LetterDieSchema) => void,
    childLetterBlockId: number | undefined,
    childLetter: string | undefined,
    letterBlocks: (LetterDieSchema | undefined)[],
    swappedLetterState: SwappedLetterState | undefined,


}
// {children, cellId, onHover, onDrop, childLetterBlockId, letterBlocks, swappedLetterState}
const LetterDropTarget = forwardRef<HTMLDivElement, LetterDropTargetType>(
    ({cellId, onHover, onDrop, childLetterBlockId, letterBlocks, swappedLetterState}, ref) =>
    {
        // const outerRef = useForwardedRef(ref);
        const divRef = useRef(null);

        useEffect(() => {
            if (!ref) return;
            if (typeof ref === "function") {
                ref(divRef.current);
            } else {
                ref.current = divRef.current;
            }
        }, []); //TODO: call more often?

        const [collectedProps, dropRef] = useDrop(() => ({
            accept: 'letter',
            hover: hover,
            drop: drop,
            collect: (monitor) => ({
                isOver: !!monitor.isOver(),
            }),
        }), [letterBlocks, swappedLetterState]);

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
                    className={'m-2 letter-drop-target'}>
                    <div ref={divRef} />

                </div>

        );
    }
);

export default LetterDropTarget;