import { useState } from "react";
import WordListManager from "./WordListManager";
import GameOverModal from "./GameOverModal";


export default function GameManager() {
    const [round, setRound] = useState(1);
    const totalRounds = 1;
    const duration = 10;

    function onNextRound() {
        const currRound = round + 1;
        setRound(currRound);
    }

    return (
        <>
            
            <WordListManager onNextRound={onNextRound} round={round} totalRounds={totalRounds}
                duration={duration} />
            
            {round > totalRounds && <GameOverModal />}
            
            
            
        </>
    )
}