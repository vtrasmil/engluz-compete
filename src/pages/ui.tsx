import { useState } from "react";

export function UIPanel() {
    return (
        <CountDownTimer/>    
    );
}

function CountDownTimer() {
    return <div>
        60
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