import { useEffect, useRef, useState } from "react";
import { useTimer } from "react-use-precision-timer";
import { useCallback } from "react";

interface UIPanelProps {
    round: number,
    totalRounds: number,
    duration: number,
}




interface CountDownTimerProps {
    round: number,
    duration: number,
    onTimeUp: () => void,
}
export function CountDownTimer({ round, duration, onTimeUp }: CountDownTimerProps) {
    const timerCallbackEvery = 1;
    const timer = useTimer({ delay: timerCallbackEvery * 1000, startImmediately: true }, updateTimerVisual);
    const [timeLeft, setTimeLeft] = useState(duration);

    
    
    function updateTimerVisual() {
        const newTimeLeft = timeLeft - timerCallbackEvery;
        setTimeLeft(newTimeLeft);
        if (newTimeLeft <= 0) {
            setTimeLeft(duration);
            onTimeUp();
        }
    }

    useEffect(() => {
        
        timer.start;
    }, [round]);
    

    return <div>
        {timeLeft}
    </div>
}


function HintButton() {
    
    const [hintsRemaining, setHintsRemaining] = useState(2);

    function useHint() {
        if (hintsRemaining < 1) return;
        
        setHintsRemaining(hintsRemaining - 1);
    }


    
    return <>
        <button disabled={hintsRemaining < 1} onClick={useHint}>Use Hint</button>
    </>;
}