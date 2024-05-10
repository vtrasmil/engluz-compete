import { useEffect, useRef, useState } from "react";
import { GameplayMessageData } from "./Types.tsx";
import { LetterDieSchema } from "~/server/diceManager.tsx";
import useSelectionDrag from "./useSelectionDrag.tsx";
import clsx from 'clsx';
import { ResolvedValues, easeInOut, motion } from "framer-motion";
import useTransformAnimation from "~/components/hooks/useTransformAnimation.tsx";



export interface LetterBlockProps {
    id: number,
    letters: string;
    isSelected: boolean;
    isPointerDown?: boolean;
    blocksSelected: number[];
    boardDiv: HTMLDivElement | null;
    numTimesRolled: number;
    latestMsg: GameplayMessageData | undefined;

    onPointerDown: (e: PointerEvent, i: number) => void;
    onPointerUp: (e: PointerEvent, i: number) => void;
    onPointerEnter: (e: PointerEvent, i: number) => void;
}

export interface DraggedLetter extends LetterDieSchema {
    currCell: number,
}


export function LetterBlock({
    id, letters, isSelected, onPointerDown, onPointerUp, onPointerEnter,
    isPointerDown, blocksSelected, boardDiv, numTimesRolled, latestMsg
}: LetterBlockProps) {
    const eventTargetRef = useRef<HTMLDivElement>(null);
    const [isPointerOver, setIsPointerOver] = useState(false);
    const [prevNumTimesRolled, setPrevNumTimesRolled] = useState(numTimesRolled);
    const [prevLetters, setPrevLetters] = useState(letters); // hang onto prev letters for reroll animation
    const [animationEndState, setAnimationEndState] = useState("visible");

    const transformAnimScope = useTransformAnimation(sourceCell, boardDiv, isPointerOver, isSelected, latestMsg);

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
    }, id);

    const style = {
        fontFamily: `Poppins, sans-serif`,
        fontWeight: 400,
        fontSize: `x-large`,
        boxShadow: isPointerOver ? '2px 2px 5px rgba(0,0,0,0.10)' : '2px 2px 0 rgba(0,0,0,0.10)',
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

    const transition = {
        duration: 0.3,
        easeInOut
    }

    return (
        <>
            <motion.div id={`letter-block-${id}`} data-letter={prevLetters[0]}
                className={clsx('border',
                    'border-gray-400 letter-block select-none', 'w-[50px] h-[50px]')
                }
                variants={variants} animate={animationEndState}
                onUpdate={onUpdate} transition={transition} style={style} ref={transformAnimScope}>

                <div ref={eventTargetRef} className={`w-full h-full flex justify-center items-center`}>
                    {prevLetters.at(0)?.toUpperCase().replace('Q', 'Qu')}
                </div>
            </motion.div>
        </>
    );
}

