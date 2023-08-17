import { log } from "console";
import { type } from "os";
import { array, object } from "zod";
import { proseWrap } from "prettier.config.cjs";
import { useEffect, useState } from "react";
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








interface PuzzleProps {
    solutions: string[],
    onCorrectGuess: () => void,
}

export function Puzzle({solutions, onCorrectGuess}: PuzzleProps) {
    const userId = useUserIdContext();
    if (userId == undefined) {
        throw new Error("No userId found");
    }
    const firstSolution = solutions[0];
    if (firstSolution == undefined) {
        throw new Error("No solutions specified");
    }
    
    const [letterBlocks, setLetterBlocks] = useState<string[]>([]);
    const [blocksTypedIndexes, setBlocksTypedIndexes] = useState<number[]>([]);
    const correctGuessMutation = api.example.playerGuessesCorrectly.useMutation();
    // const channel = useChannel()
    

    const lettersTyped = (() => {
        return blocksTypedIndexes.map((i): string => {
            return getLetterBlock(i);
        }).join('');
    })();

    

    useEffect(() => {
        const firstSolutionScrambled = shuffleArrayCopy([...firstSolution]);
        setLetterBlocks(firstSolutionScrambled);
    }, [solutions]);

    function getLetterBlock(index: number) {
        const block = letterBlocks[index];
        if (block == undefined) throw new Error('LetterBlock is undefined');
        return block;
    }
    

    
    function handleEnterLetter(index: number) {
        if (blocksTypedIndexes.includes(index)) return;
        setBlocksTypedIndexes ([...blocksTypedIndexes, index]);
        if (solutions.includes(lettersTyped + getLetterBlock(index))) {
            onCorrectGuess();
            if (userId != undefined)
                correctGuessMutation.mutate({'userId': userId});
            setBlocksTypedIndexes([]);
            setLetterBlocks([]);           
        }
    }

    function handleTypeLetter(s: string) {
        const lettersRemaining = letterBlocks.slice().map(
            (letter, index) => blocksTypedIndexes.includes(index) ? null : letter
        );

        for (let i = 0; i < lettersRemaining.length; i++) {
            if (lettersRemaining[i] === s) {
                handleEnterLetter(i);
                break;
            }
        }
    }

    function handleDeleteLetter() {
        const updatedIndices = blocksTypedIndexes.slice(0, -1);
        if (typeof updatedIndices != undefined && blocksTypedIndexes.length > 0) {
            setBlocksTypedIndexes(updatedIndices);
            console.log(`Backspace: ${lettersTyped}.`);
        }
    }

    function handleClearLetters() {
        setBlocksTypedIndexes([]);
    }

    

    return (
        <div>
            <div className="flex">
                <Button variant="contained" onClick={handleDeleteLetter}>Delete</Button>
                <Button variant="outlined" onClick={handleClearLetters}>Clear</Button>
            </div>
            <LetterBlocks>
                {[...letterBlocks].map((block, index) => 
                    <LetterBlock id={index} letter={block} isTyped={blocksTypedIndexes.includes(index)}
                        onBlockClick={() => handleEnterLetter(index)} key={block+index.toString()}
                    />
                )}
            </LetterBlocks>
            <PlayerInput guess={lettersTyped} solutions={solutions} />
            <KeyboardInputHandler
                guess={lettersTyped}
                puzzleLetters={letterBlocks.map((s) => s.toLowerCase())}
                onDeleteLetter={handleDeleteLetter}
                onTypeLetter={(s: string) => handleTypeLetter(s)}
                onClearLetter={handleClearLetters}
            />
        </div>
    );
}

interface SolutionTextProps {
    solution: string,
    hidden: boolean
}

function SolutionText({ solution, hidden }: SolutionTextProps) {
    if (hidden) return null;
    return solution;
}

interface LetterBlocksProps {
    children?: React.ReactNode
}

function LetterBlocks({ children } : LetterBlocksProps) {
    
    return (
        <div>
            {children}
        </div>
    );
}

interface LetterBlockProps {
    id: number,
    letter: string,
    isTyped: boolean,
    onBlockClick: () => void,
}

export function LetterBlock({ letter, isTyped, onBlockClick }: LetterBlockProps) {
    const classNames: string[] = ['letter-block'];
    if (isTyped) classNames.push('isTyped');
    const className = classNames.join(' ');
    
    return <Button
        variant="outlined"
        className={className}
        onClick={onBlockClick}
        style={{
            width: "50px",
            height: "50px"
        }}
    >
        {letter.toUpperCase()}
    </Button>;
    
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




