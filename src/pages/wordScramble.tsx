import { log } from "console";
import { type } from "os";
import { array, object } from "zod";
import { proseWrap } from "prettier.config.cjs";
import { useEffect, useState } from "react";
import { BackspaceButton, ClearButton } from './buttons.tsx';
import { shuffleArrayCopy } from "./helpers.tsx";
import KeyboardInputHandler from "./KeyboardInputHandler.tsx";
import WordListManager from "./WordListManager.tsx";
import {
  useWhatChanged,
} from '@simbathesailor/use-what-changed';




export default function WordScrambleGame() {


    


    
    return (
        <main className="flex justify-center h-screen">
            <div className="flex flex-col h-full w-full border-x md:max-w-2xl mt-52">
                <WordListManager />
                
            </div>
        </main>
    );

    
}

interface PuzzleProps {
    solutions: string[],
    onCorrectGuess: () => void,
}

export function Puzzle({solutions, onCorrectGuess}: PuzzleProps) {
    const firstSolution = solutions[0];
    if (typeof firstSolution == 'undefined') {
        throw new Error("No solutions specified");
    }
    
    const [letterBlocks, setLetterBlocks] = useState<string[]>([]);
    const [blocksTypedIndexes, setBlocksTypedIndexes] = useState<number[]>([]);

    

    const lettersTyped = (() => {
        return blocksTypedIndexes.map((i): string => {
            const letterBlock = letterBlocks[i];
            if (letterBlock == null) {
                throw new Error('LetterBlock is undefined')
            } else {
                return letterBlock;
            }
        }).join('');
    })();

    

    useEffect(() => {
        const firstSolutionScrambled = shuffleArrayCopy([...firstSolution]) as string[];
        setLetterBlocks(firstSolutionScrambled);
    }, [solutions]);

    
    

    
    function handleEnterLetter(index: number) {
        if (blocksTypedIndexes.includes(index)) return;
        setBlocksTypedIndexes ([...blocksTypedIndexes, index]);
        // console.log(`Pressed ${letterBlocks[index]}. Letter # ${blocksTypedIndices.length}.`);
        if (solutions.includes(lettersTyped + letterBlocks[index])) {
            onCorrectGuess();
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

    function handleShuffle() {

    }

    

    return (
        <div>
            <div className="flex">
                <BackspaceButton onClick={handleDeleteLetter} />
                <ClearButton onClick={handleClearLetters} />
            </div>
            <LetterBlocks>
                {[...letterBlocks].map((block, index) => 
                    <Block id={index} letter={block} isTyped={blocksTypedIndexes.includes(index)}
                        onBlockClick={() => handleEnterLetter(index)} key={block+index}
                        
                    
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

interface BlockProps {
    id: number,
    letter: string,
    isTyped: boolean,
    onBlockClick: () => void,
}

function Block({ letter, isTyped, onBlockClick }: BlockProps) {
    let classNames: string[] = ['letter-block'];
    if (isTyped) classNames.push('isTyped');
    const className = classNames.join(' ');
    
    return <button
        className={className}
        onClick={onBlockClick}
        style={{
            width: "50px",
            height: "50px"
        }}
    >
        {letter.toUpperCase()}
    </button>;
    
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




