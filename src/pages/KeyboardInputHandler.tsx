import { useEffect, useState } from "react";

const inputtableLetters = ['r', 'e', 's', 'i', 't'];

interface KeyboardInputHandlerProps {
    onDeleteLetter: () => void,
    onTypeLetter: (arg0: string) => void,
    guess: string
    puzzleLetters: string[]
}


export default function KeyboardInputHandler({ guess, onDeleteLetter, onTypeLetter, puzzleLetters }: KeyboardInputHandlerProps) {
    const [lastEvent, setLastEvent] = useState<KeyboardEvent>();
    // console.log('KeyboardInputHandler render: ' + lastEvent?.key);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (puzzleLetters.includes(e.key)) {
                onTypeLetter(e.key);
                return;
            }
            switch (e.key) {
                case 'Backspace':
                    onDeleteLetter();
                    break;
                default: 
                    
            }
            setLastEvent(e);
        };
            
        document.addEventListener('keydown', handleKeyDown);
        // console.log('add listener')
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            // console.log('remove listener')
        };
    }, [guess, puzzleLetters]);

    
    return <></>;
    
}