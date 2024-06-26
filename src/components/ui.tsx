import { useEffect, useState } from "react";
import { useTimer } from "react-use-precision-timer";

interface CountDownTimerProps {
    startDateTime: number,
    durationSeconds: number,
    onTimeUp: () => void,
}
export function CountDownTimer({ startDateTime, durationSeconds, onTimeUp }: CountDownTimerProps) {
    const timerCallbackEvery = 1;
    const timer = useTimer({ delay: timerCallbackEvery * 1000 }, updateTimerVisual);
    const [timeLeft, setTimeLeft] = useState((durationSeconds * 1000) - (Date.now() - startDateTime));

    function updateTimerVisual() {
        const newTimeLeft = (durationSeconds * 1000) - (Date.now() - startDateTime);
        setTimeLeft(newTimeLeft); // re-render to update visual
        if (timeLeft <= 0) {
            onTimeUp();
        }
    }

    useEffect(() => {
        timer.start();
    }, [timer]);


    return (
        <span>
            {timeLeft}
        </span >
    )
}


