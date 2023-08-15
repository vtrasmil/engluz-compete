import { useRef, useState } from 'react';
import { Puzzle } from './wordScramble.tsx'
import { CountDownTimer } from './ui.tsx';
import { number } from 'zod';


interface WordListManagerProps {
    onNextRound: () => void
    round: number,
    totalRounds: number,
    duration: number,
}

export default function WordListManager( { onNextRound, round, totalRounds, duration }: WordListManagerProps) {
    
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
            throw new Error('No word found in WordListManager')
        }
        return wordSet;
    }

    const currentSolutionSet = useRef(getSolutionSet(solutionSetIndex))
    
    
    function handleCorrectGuess() {
        setSolutionSetIndex(i => i + 1);  
        currentSolutionSet.current = getSolutionSet(solutionSetIndex + 1);
        onNextRound();
    }

    return (
        <>    
            <Puzzle solutions={currentSolutionSet.current} onCorrectGuess={handleCorrectGuess} />
            <CountDownTimer round={round} totalRounds={totalRounds} duration={duration} onTimeUp={onNextRound} />    
            {round <= totalRounds &&
                <div>Round: {round}/{totalRounds}</div>
            }
        </>  
    );
}