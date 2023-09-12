import { useEffect, useState } from "react";
import { useTimer } from "react-use-precision-timer";






interface CountDownTimerProps {
    round: number,
    totalRounds: number,
    duration: number,
    onTimeUp: () => void,
}
export function CountDownTimer({ round, totalRounds, duration, onTimeUp }: CountDownTimerProps) {
    const timerCallbackEvery = 1;
    const timer = useTimer({ delay: timerCallbackEvery * 1000 }, updateTimerVisual);
    const [timeLeft, setTimeLeft] = useState(duration);

    
    
    function updateTimerVisual() {
        const newTimeLeft = timeLeft - timerCallbackEvery;
        setTimeLeft(newTimeLeft);
        if (newTimeLeft <= 0 && round <= totalRounds) {
            setTimeLeft(duration);
            onTimeUp();
        }
    }

    useEffect(() => {
        if (round > totalRounds) {
            timer.stop();
        } else {
            timer.start();
            setTimeLeft(duration);
        }
    }, [round]);
    

    return (
        
        <div>
            Time left: {timeLeft}
        </div >
    )
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