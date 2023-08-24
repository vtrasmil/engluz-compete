import { log } from "console";
import { type } from "os";
import { array, object } from "zod";
import { proseWrap } from "prettier.config.cjs";
import { MutableRefObject, Ref, useEffect, useRef, useState, RefObject } from "react";
import BackspaceButton, { ClearButton } from './buttons.tsx';
import shuffleArrayCopy from "./helpers.tsx";
import KeyboardInputHandler from "./KeyboardInputHandler.tsx";
import {
    useWhatChanged,
} from '@simbathesailor/use-what-changed';
import { api } from "~/utils/api.ts";
import { useContext } from 'react';
import { useChannel } from "@ably-labs/react-hooks";
import { useUserIdContext } from "./useUserIdContext.tsx";
import { Button } from "@mui/material";
import GameManager from "./GameManager.tsx";
import useDrag from "./useDrag.tsx";



interface LetterBlockProps {
    id: number,
    letter: string,
    isSelected: boolean,
    onPointerDown: (e: PointerEvent, i: number) => void,
    onPointerOver: (e: PointerEvent, i: number) => void,
    onPointerUp: (e: PointerEvent, i: number) => void,
    onPointerLeave: (e: PointerEvent, i: number) => void,
    isPointerDown: boolean,
    isPointerOver: boolean,
    blocksSelected: number[],

    
}




export function LetterBlock({
    id, letter, isSelected,
    onPointerDown, onPointerOver, onPointerUp, onPointerLeave,
    isPointerOver, isPointerDown, blocksSelected,
}: LetterBlockProps) {
    const classNames: string[] = [];
    if (isSelected) classNames.push('isSelected');
    const className = classNames.join(' ');

    const eventTargetRef = useRef<HTMLDivElement>(null);

    const handlePointerDown = (e: PointerEvent) => {
        onPointerDown(e, id);
    };
    
    const handlePointerOver = (e: PointerEvent) => {
        onPointerOver(e, id);
    };

    const handlePointerLeave = (e: PointerEvent) => {
        onPointerLeave(e, id);
    }
    
    const handlePointerUp = (e: PointerEvent) => {
        onPointerUp(e, id);
    };

    
    let drag;
    if (eventTargetRef !== null) {
    
        drag = useDrag(eventTargetRef, [isPointerOver, isPointerDown, blocksSelected], {
            onPointerMove: handlePointerOver,
            onPointerUp: handlePointerUp,
            onPointerDown: handlePointerDown
        });
    }
    
    
    
    return (      
        <div
            id={`letter-block-${id}`}
            ref={eventTargetRef}
            // variant="outlined"
            className={'border border-gray-400 letter-block m-0.5 flex justify-center items-center select-none ' + className}
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




