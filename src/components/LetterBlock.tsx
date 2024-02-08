import { animated } from '@react-spring/web';
import { useEffect, useRef, useState } from "react";
import { useDrag } from "react-dnd";
import { GameplayMessageData } from "./Types.tsx";
import { LetterDieSchema } from "~/server/diceManager.tsx";
import { DragMode, SwappedLetterState } from "./Types.tsx";
import useTransformAnimation from "./hooks/useTransformAnimation.tsx";
import useSelectionDrag from "./useSelectionDrag.tsx";
import clsx from 'clsx';
import { ResolvedValues, easeInOut, motion } from "framer-motion";
import useColorAnim from './hooks/useColorAnim.tsx';



export interface LetterBlockProps {
    id: number,
    sourceCell: number,
    temporaryCell: number | undefined,
    letters: string;
    isSelected: boolean;
    isPointerDown?: boolean;
    blocksSelected: number[];
    dragMode: DragMode;
    dropTargetRefs: Map<number, HTMLDivElement> | null;
    swappedLetterState: SwappedLetterState | undefined;
    boardDiv: HTMLDivElement | null;
    numTimesRolled: number;
    latestMsg: GameplayMessageData | undefined;
    isClientsTurn: boolean;

    onPointerDown: (e: PointerEvent, i: number) => void;
    onPointerUp: (e: PointerEvent, i: number) => void;
    onPointerEnter: (e: PointerEvent, i: number) => void;
    onDragStart: () => void;
    onDragEnd: () => void;
}

export interface DraggedLetter extends LetterDieSchema {
    currCell: number,
}


export function LetterBlock({
    id, sourceCell, temporaryCell, letters, isSelected, onPointerDown, onPointerUp, onPointerEnter,
    isPointerDown, blocksSelected, dragMode, dropTargetRefs, onDragStart, onDragEnd,
    swappedLetterState, boardDiv, numTimesRolled, latestMsg, isClientsTurn
}: LetterBlockProps) {
    const eventTargetRef = useRef<HTMLDivElement>(null);
    const prevCell = useRef(sourceCell);
    const [isPointerOver, setIsPointerOver] = useState(false);
    const [prevNumTimesRolled, setPrevNumTimesRolled] = useState(numTimesRolled);
    const [prevLetters, setPrevLetters] = useState(letters); // hang onto prev letters for reroll animation
    const [animationEndState, setAnimationEndState] = useState("visible");


    const [{ isDragging }, drag, dragPreview] = useDrag(() => {
        const draggedLetter: DraggedLetter = { id: id, letters: letters, currCell: sourceCell, numTimesRolled: numTimesRolled };
        return {
            type: 'letter',
            item: draggedLetter,
            canDrag: () => dragMode === DragMode.DragNDrop && isClientsTurn,
            collect: (monitor) => ({
                isDragging: !!monitor.isDragging(),
            }),
            end: () => onDragEnd()
        }
    }, [sourceCell, dragMode]);

    useEffect(() => {
        if (isDragging) onDragStart();
    }, [isDragging, onDragStart])

    const transformAnim = useTransformAnimation(isDragging, sourceCell, prevCell.current, temporaryCell, eventTargetRef.current,
        dropTargetRefs, swappedLetterState, boardDiv, isPointerOver, isSelected);
    const colorAnim = useColorAnim(numTimesRolled, sourceCell, isSelected, latestMsg);

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

    useSelectionDrag(eventTargetRef, [isPointerDown && isPointerOver], {
        onPointerDown: handlePointerDown,
        onPointerUp: handlePointerUp,
        onPointerEnter: handlePointerEnter,
        onDrag: handleDrag,
        dragMode: dragMode,
    }, id);

    const style = {
        width: `50px`, height: `50px`,
        fontFamily: `Poppins, sans-serif`,
        fontWeight: 400,
        fontSize: `x-large`,
        boxShadow: isPointerOver ? '2px 2px 5px rgba(0,0,0,0.10)' : '2px 2px 0 rgba(0,0,0,0.10)',
        ...transformAnim,
        ...colorAnim,
    }

    const variants = {
        hidden: { opacity: 0, scale: 0 },
        visible: { opacity: 1, scale: 1 }
    }

    if (prevNumTimesRolled != numTimesRolled) {
        setPrevNumTimesRolled(numTimesRolled);
        setAnimationEndState('hidden');
    }

    function onUpdate(latest: ResolvedValues) {
        if (latest.opacity === 0) {
            console.log('opacity is 0!')
            setAnimationEndState("visible");
            setPrevLetters(letters);
        }
    }

    /* function onAnimationComplete(definition: AnimationDefinition) {
        if (definition.toString() === "visible") {
            // re-render

        }
    } */

    const transition = {
        duration: 0.3,
        easeInOut
    }

    return (
        <>
            <motion.div className='absolute' variants={variants} animate={animationEndState}
                onUpdate={onUpdate} transition={transition}>
                <animated.div id={`letter-block-${id}`} data-current-cell={sourceCell} data-letter={prevLetters[0]}
                    ref={drag}
                    className={clsx(
                        'absolute border', isDragging ? 'z-10' : '', isClientsTurn ? 'cursor-pointer' : '',
                        'border-gray-400 letter-block select-none',
                        isDragging ? 'hidden' : '')
                    }
                    style={style}
                >
                    <div ref={eventTargetRef} className={`w-full h-full flex justify-center items-center`}>
                        {prevLetters.at(0)?.toUpperCase().replace('Q', 'Qu')}
                    </div>
                </animated.div>
            </motion.div>
        </>
    );
}

