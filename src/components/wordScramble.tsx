import { useRef } from "react";
import useDrag from "./useDrag.tsx";



interface LetterBlockProps {
    id: number,
    letter: string,
    isSelected: boolean,
    onPointerDown: (e: PointerEvent, i: number) => void,
    onPointerUp: (e: PointerEvent, i: number) => void,
    onPointerEnter: (e: PointerEvent, i: number) => void,
    isPointerDown?: boolean,
    isPointerOver: boolean,
    blocksSelected: number[],



}




export function LetterBlock({
    id, letter, isSelected,
    onPointerDown, onPointerUp, onPointerEnter,
    isPointerOver, isPointerDown, blocksSelected,
}: LetterBlockProps) {
    const classNames: string[] = [];
    if (isSelected) classNames.push('isSelected');
    const className = classNames.join(' ');

    const eventTargetRef = useRef<HTMLDivElement>(null);

    const handlePointerUp = (e: PointerEvent) => {
        onPointerUp(e, id);
    };

    const handlePointerDown = (e: PointerEvent) => {
        onPointerDown(e, id);
    };

    const handlePointerEnter = (e: PointerEvent) => {
        onPointerEnter(e, id);
    };

    const drag = useDrag(eventTargetRef, [isPointerDown && isPointerOver], {
        onPointerDown: handlePointerDown,
        onPointerUp: handlePointerUp,
        onPointerEnter: handlePointerEnter,
    }, id);

    return (
        <div
            id={`letter-block-${id}`}
            ref={eventTargetRef}
            // variant="outlined"
            className={'border border-gray-400 letter-block m-2 flex justify-center items-center select-none' + ' ' + className}
            style={{
                width: "50px",
                height: "50px"
            }}
        >
            {letter.toUpperCase()}
        </div>
    );
}

interface PlayerInputProps {
    guess: string,
    solutions: string[]
}

function PlayerInput({guess, solutions} : PlayerInputProps) {

    let classNames = ['player-input', 'something'];
    if (solutions.includes(guess)) {
        classNames = classNames.concat('guess-correct');

    }
    const className = classNames.join(' ');

    return (
        <div className={className}>
            {guess}
        </div>
    );
}




