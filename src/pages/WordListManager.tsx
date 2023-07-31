import { useState } from 'react';
import { Puzzle } from './wordScramble.tsx'
import UIPanel from './ui.tsx';

interface WordListManagerProps {
    children?: React.ReactNode
}

export default function WordListManager({ children }: WordListManagerProps) {
    
    const [currentWordSetIndex, setCurrentWordSetIndex] = useState(0);
    
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
    const currentWordSet = (() => {
        const wordSet = wordList.data[currentWordSetIndex];
        if (wordSet == undefined) {
            throw new Error('No word found')
        }
        return wordSet;
    })();
    
    
    function handleCorrectGuess() {
        setCurrentWordSetIndex(currentWordSetIndex + 1);        
    }

    return (
        <>
            <Puzzle solutions={currentWordSet} onCorrectGuess={handleCorrectGuess} />
            <UIPanel />
        </>  
    );
}