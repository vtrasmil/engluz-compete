import { useRef, useState } from "react";
import useCustomDrag, { DragMode } from "./useDrag.tsx";
import { useDrag } from "react-dnd";

export interface LetterBlockProps {
    id: number,
    currCell: number,
    letter: string;
    isSelected: boolean;
    onPointerDown: (e: PointerEvent, i: number) => void;
    onPointerUp: (e: PointerEvent, i: number) => void;
    onPointerEnter: (e: PointerEvent, i: number) => void;
    isPointerDown?: boolean;
    isPointerOver: boolean;
    blocksSelected: number[];
    dragMode: DragMode;




}

export function LetterBlock({
    id, currCell, letter, isSelected, onPointerDown, onPointerUp, onPointerEnter,
    isPointerOver, isPointerDown, blocksSelected, dragMode
}: LetterBlockProps) {
    const classNames: string[] = ['letterBlock'];
    if (isSelected) classNames.push('isSelected');

    const className = classNames.join(' ');
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const eventTargetRef = useRef<HTMLDivElement>(null);

    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'letter',
        item: { id: id, currCell: currCell, letter: letter },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));
    if (isDragging) classNames.push('hidden');


    const handlePointerUp = (e: PointerEvent) => {
        setTranslate({
            x: 0,
            y: 0
        });
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
        setTranslate({
            x: translate.x + e.movementX,
            y: translate.y + e.movementY
        });
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

    let style = {
        width: `50px`, height: `50px`,
        transform: `translateX(${translate.x}px) translateY(${translate.y}px)`,
        zIndex: `${customDrag.isDragging ? 10 : 0}`
    }



    return (
        <div id={`letter-block-${id}`} data-current-cell={currCell}
            ref={drag}
            className={`border border-gray-400 letter-block flex justify-center items-center select-none ${isDragging ? 'hidden' : ''} ${isSelected ? 'isSelected' : ''}`}
                style={style}>
            {/* <div ref={eventTargetRef}> */}
                {/* <div ref={divRef}> */}
                    {letter.toUpperCase()}
                {/* </div> */}
            {/* </div> */}
        </div>
    );
};

