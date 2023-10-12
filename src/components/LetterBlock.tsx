import { useEffect, useRef, useState } from "react";
import useCustomDrag, { DragMode } from "./useDrag.tsx";
import { useDrag } from "react-dnd";
import { LetterDieSchema } from "~/server/diceManager.tsx";
import useTransformAnimation from "./hooks/useTransformAnimation.tsx";
import { SwappedLetterState } from "./Board.tsx";

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
    onDrag: () => void;
    onEnd: () => void;
    dropTargetRefs: Map<number, HTMLDivElement> | null;
    swappedLetterState: SwappedLetterState | undefined;
}

export interface DraggedLetter extends LetterDieSchema {
    currCell: number,
}

export function LetterBlock({
    id, currCell, letters, isSelected, onPointerDown, onPointerUp, onPointerEnter,
    isPointerOver, isPointerDown, blocksSelected, dragMode, onEnd, dropTargetRefs, onDrag,
    swappedLetterState
}: LetterBlockProps) {
    // const [translate, setTranslate] = useState({ x: 0, y: 0 });
    // const divRef = useRef<HTMLDivElement>(null);
    const eventTargetRef = useRef<HTMLDivElement>(null);
    const [hasRefSet, setHasRefSet] = useState(false);

    if (currCell === 0) {
        console.log(`LetterBlock ${currCell} render ${eventTargetRef.current}`)
    }

    // force re-render when divRef value changes
    useEffect(() => {
        setHasRefSet(true);
    }, [eventTargetRef.current])

    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'letter',
        item: { id: id, letters: letters, currCell: currCell } as DraggedLetter,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),

        end: (item, monitor) => {
            onEnd();
        }
    }));
    if (isDragging) {
        onDrag();
    }

    // const isAnimating = useReparentAnimation(eventTargetRef, isDragging, currCell);
    const position = useTransformAnimation(isDragging, currCell, eventTargetRef.current,
        dropTargetRefs, swappedLetterState);

    // if (currCell === 0) console.log(position);


    const handlePointerUp = (e: PointerEvent) => {
        /* setTranslate({
            x: 0,
            y: 0
        }); */
        onPointerUp(e, id);
    };

    const handlePointerDown = (e: PointerEvent) => {
        onPointerDown(e, id);
    };

    const handlePointerEnter = (e: PointerEvent) => {
        // console.log(`pointerenter: ${id}`)
        onPointerEnter(e, id);
    };

    const handleDrag = (e: PointerEvent) => {
        /* setTranslate({
            x: translate.x + e.movementX,
            y: translate.y + e.movementY
        }); */
        eventTargetRef.current?.setPointerCapture(e.pointerId);
        // console.log(`${translate.x} ${translate.y} hasPointerCapture: ${eventTargetRef.current?.hasPointerCapture(e.pointerId)}`)
    };

    const customDrag = useCustomDrag(eventTargetRef, [isPointerDown && isPointerOver], {
        onPointerDown: handlePointerDown,
        onPointerUp: handlePointerUp,
        onPointerEnter: handlePointerEnter,
        onDrag: handleDrag,
        dragMode: dragMode,
    }, id);

    const style = {
        width: `50px`, height: `50px`,
        transform: position ? `translateX(${position.x}px) translateY(${position.y}px)` : undefined,
        // transition: 'translateX 0.5'
    }

    if (currCell === 0) console.log(style);




    return (
        <div id={`letter-block-${id}`} data-current-cell={currCell}
            ref={drag}
            className={`absolute border ${isDragging && 'z-10'} border-gray-400 letter-block select-none ${isDragging ? 'hidden' : ''} ${isSelected ? 'isSelected' : ''}`}
                style={style}>
            <div ref={eventTargetRef} className={`w-full h-full flex justify-center items-center `}>
                {/* <div ref={divRef}> */}
                    {letters?.[0]?.toUpperCase()}
                {/* </div> */}
            </div>
        </div>
    );
}

