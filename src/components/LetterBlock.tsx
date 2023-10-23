import { useEffect, useRef } from "react";
import useSelectionDrag from "./useSelectionDrag.tsx";
import { useDrag } from "react-dnd";
import { LetterDieSchema } from "~/server/diceManager.tsx";
import useTransformAnimation from "./hooks/useTransformAnimation.tsx";
import { DragMode, SwappedLetterState } from "./Board.tsx";

export interface LetterBlockProps {
    id: number,
    currCell: number,
    letters: string;
    isSelected: boolean;
    onPointerDown: (e: PointerEvent, i: number) => void;
    onPointerUp: (e: PointerEvent, i: number) => void;
    onPointerEnter: (e: PointerEvent, i: number) => void;
    isPointerDown?: boolean;
    isPointerOver: boolean;
    blocksSelected: number[];
    dragMode: DragMode;
    onDragStart: () => void;
    onDragEnd: () => void;
    dropTargetRefs: Map<number, HTMLDivElement> | null;
    swappedLetterState: SwappedLetterState | undefined;
    boardDiv: HTMLDivElement | null;
}

export interface DraggedLetter extends LetterDieSchema {
    currCell: number,
}


export function LetterBlock({
    id, currCell, letters, isSelected, onPointerDown, onPointerUp, onPointerEnter,
    isPointerOver, isPointerDown, blocksSelected, dragMode, dropTargetRefs, onDragStart, onDragEnd,
    swappedLetterState, boardDiv,
}: LetterBlockProps) {
    const eventTargetRef = useRef<HTMLDivElement>(null);

    const [{ isDragging }, drag, dragPreview] = useDrag(() => {
        const draggedLetter: DraggedLetter = { id: id, letters: letters, currCell: currCell };
        return {
            type: 'letter',
            item: draggedLetter,
            canDrag: () => dragMode === DragMode.DragNDrop,
            collect: (monitor) => ({
                isDragging: !!monitor.isDragging(),
            }),
        }
    }, [currCell, dragMode]);

    useEffect(() => {
        isDragging ? onDragStart() : onDragEnd();
    }, [isDragging])

    const positionVector = useTransformAnimation(isDragging, currCell, eventTargetRef.current,
        dropTargetRefs, swappedLetterState, boardDiv);

    const handlePointerUp = (e: PointerEvent) => {
        onPointerUp(e, id);
    };

    const handlePointerDown = (e: PointerEvent) => {
        onPointerDown(e, id);
    };

    const handlePointerEnter = (e: PointerEvent) => {
        onPointerEnter(e, id);
    };

    const handleDrag = (e: PointerEvent) => {
        eventTargetRef.current?.setPointerCapture(e.pointerId);
    };

    const customDrag = useSelectionDrag(eventTargetRef, [isPointerDown && isPointerOver], {
        onPointerDown: handlePointerDown,
        onPointerUp: handlePointerUp,
        onPointerEnter: handlePointerEnter,
        onDrag: handleDrag,
        dragMode: dragMode,
    }, id);

    const style = {
        width: `50px`, height: `50px`,
        transform: positionVector ? `translateX(${positionVector.x}px) translateY(${positionVector.y}px)` : undefined,
        transition: `background-color 0.3s, transform 0.5s`,
        fontFamily: `Poppins, sans-serif`,
        fontWeight: 400,
        fontSize: `x-large`,
    }

    return (
        <>
            <div id={`letter-block-${id}`} data-current-cell={currCell}
                ref={drag}
                className={
                    `absolute border ${isDragging ? 'z-10' : ''}
                    border-gray-400 letter-block select-none
                    ${isDragging ? 'hidden' : ''}
                    ${isSelected ? `bg-blue-200` : ''}`
                }
                style={style}
            >
                <div ref={eventTargetRef} className={`w-full h-full flex justify-center items-center `}>
                    {letters.at(0)?.toUpperCase().replace('Q', 'Qu')}
                </div>
            </div>
        </>
    );
}

