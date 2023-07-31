import { useRef, useState } from 'react';
import { Puzzle } from './wordScramble.tsx'
import UIPanel from './ui.tsx';

interface WordListManagerProps {
    children?: React.ReactNode
}

export default function WordListManager({ children }: WordListManagerProps) {
    
    const [solutionSetIndex, setSolutionSetIndex] = useState(0);
    
    const wordList = {
        data: [
            ["resist", "sister"],
            ["wander", "warden", "warned"],
            ["unpack"],
            ["course", "source"],
            ["soviet"],
            ["cheeps", "speech"],
            ["speedy"],
            ["plains", "spinal"],
        ]
    };
    function getSolutionSet(index: number) {
        const wordSet = wordList.data[index];
        if (wordSet == undefined) {
            throw new Error('No word found')
        }
        return wordSet;
    };

    let currentSolutionSet = useRef(getSolutionSet(solutionSetIndex));
    
    
    function handleCorrectGuess() {
        setSolutionSetIndex(solutionSetIndex + 1);  
        currentSolutionSet.current = getSolutionSet(solutionSetIndex + 1);
    }

    return (
        <>
            <Puzzle solutions={currentSolutionSet.current} onCorrectGuess={handleCorrectGuess} />
            <UIPanel />
        </>  
    );
}