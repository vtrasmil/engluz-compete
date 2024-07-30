import { useEffect, useState } from "react";
import { useTimer } from "react-use-precision-timer";
import {clsx} from "clsx";
import 'console-polyfill';

interface VisualTimerProps {
    durationMs: number,
    onTimeUp: () => void,
    initStartTime: number,
}
export function VisualTimer({ durationMs, onTimeUp, initStartTime }: VisualTimerProps) {
    const timer = useTimer({delay: 100}, timerCallback);
    const [timeLeft, setTimeLeft] = useState(initStartTime - Date.now() + durationMs);
    console.log('initStartTime', initStartTime, 'durationMs', durationMs, 'timeLeft', initStartTime - Date.now() + durationMs);

    function timerCallback() {
        const newTimeLeft = initStartTime - Date.now() + durationMs;

        setTimeLeft(newTimeLeft); // re-render to update visual
        if (newTimeLeft <= 0) {
            timer.stop();
            onTimeUp();
        }
    }

    const timeLeftPercentage = () => {
        if (timeLeft <= 0) return '0%';
        return (timeLeft / durationMs * 100).toString() + '%';
    }

    useEffect(() => {
        timer.start();
        const newTimeLeft = initStartTime - Date.now() + durationMs;
        setTimeLeft(newTimeLeft);

    }, [timer, durationMs, initStartTime]);

    return (
        <div className={`timer`}>
            <div style={{'width': timeLeftPercentage()}} className={clsx('h-5', 'bg-red-100')} />
        </div >
    )
}


