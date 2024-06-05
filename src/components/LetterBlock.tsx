import { useEffect, useRef, useState } from "react";
import { GameplayMessageData } from "./Types.tsx";
import { LetterDieSchema } from "~/server/diceManager.tsx";
import useSelectionDrag from "./useSelectionDrag.tsx";
import clsx from 'clsx';
import { ResolvedValues, easeInOut, motion, AnimatePresence } from "framer-motion";
import useTransformAnimation from "~/components/hooks/useTransformAnimation.tsx";
import {SELECTED_COLOR} from "~/components/Constants.tsx";



export interface LetterBlockProps {
    id: number,
    sourceCell: number,
    letters: string;
    isSelected: boolean;
    isPointerDown?: boolean;
    blocksSelected: number[];
    boardDiv: HTMLDivElement | null;
    numTimesRolled: number;

    onPointerDown: (e: PointerEvent, i: number) => void;
    onPointerUp: (e: PointerEvent, i: number) => void;
    onPointerEnter: (e: PointerEvent, i: number) => void;
}

export interface DraggedLetter extends LetterDieSchema {
    currCell: number,
}


export function LetterBlock({
    id, sourceCell, letters, isSelected, onPointerDown, onPointerUp, onPointerEnter,
    isPointerDown, blocksSelected, boardDiv, numTimesRolled
}: LetterBlockProps) {
    const eventTargetRef = useRef<HTMLDivElement>(null);
    const [isPointerOver, setIsPointerOver] = useState(false);
    const [prevIsSelected, setPrevIsSelected] = useState(isSelected);
    const [prevNumTimesRolled, setPrevNumTimesRolled] = useState(numTimesRolled);
    const [prevLetters, setPrevLetters] = useState(letters); // hang onto prev letters for reroll animation
    const [animationState, setAnimationState] = useState("visible");

    // const transformAnimScope = useTransformAnimation(sourceCell, boardDiv, isPointerOver, isSelected, latestMsg);

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
        // hidden: { opacity: 0, scale: 0 },
        default: { opacity: 1, scale: 1 },
        selected: { scale: 1.15, backgroundColor: SELECTED_COLOR },
    }

    const transition = {
        duration: 0.3,
        easeInOut
    }

    const currVariant = isSelected ? 'selected' : 'default';

    if (prevNumTimesRolled != numTimesRolled) {
        setPrevNumTimesRolled(numTimesRolled);
        setAnimationState('hidden');
    }

    if (prevIsSelected != isSelected) {
        setAnimationState(isSelected ? 'selected' : 'visible');
        setPrevIsSelected(isSelected);
    }

    return (
        <AnimatePresence>
            <motion.div id={`letter-block-${id}`} data-letter={prevLetters[0]}
                className={clsx('border', 'letter-block select-none', 'w-[50px] h-[50px] m-2')}
                variants={variants} animate={currVariant} exit={{scale: 0}} initial={{scale: 0}}
                transition={transition} style={style} //ref={transformAnimScope}
            >
                <div ref={eventTargetRef} className={`w-full h-full flex justify-center items-center`}>
                    {prevLetters.at(0)?.toUpperCase().replace('Q', 'Qu')}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

