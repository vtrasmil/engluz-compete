import { Block } from "@mui/icons-material";
import { LetterBlock } from "./wordScramble";
import { boggleDice } from "~/server/diceManager";
import { useState } from "react";

export default function Board() {
    
    const boardWidth = Math.sqrt(boggleDice.length);
    if (![4, 5, 6].includes(boardWidth)) {
        throw new Error('Board must be square');
    }
    const rows = [...Array(boardWidth).keys()]
    const [letterBlocks, setLetterBlocks] = useState<string[]>([]);
    const [blocksTypedIndexes, setBlocksTypedIndexes] = useState<number[]>([]);
    
    function handleEnterLetter(index: number) {
        if (blocksTypedIndexes.includes(index)) return;
        setBlocksTypedIndexes ([...blocksTypedIndexes, index]);
        
        
    }

    function handleTypeLetter(s: string) {
        const lettersRemaining = letterBlocks.slice().map(
            (letter, index) => blocksTypedIndexes.includes(index) ? null : letter
        );

        for (let i = 0; i < lettersRemaining.length; i++) {
            if (lettersRemaining[i] === s) {
                handleEnterLetter(i);
                break;
            }
        }
    }

    function handleDeleteLetter() {
        const updatedIndices = blocksTypedIndexes.slice(0, -1);
        if (typeof updatedIndices != undefined && blocksTypedIndexes.length > 0) {
            setBlocksTypedIndexes(updatedIndices);
            console.log(`Backspace: ${lettersTyped}.`);
        }
    }

    function handleClearLetters() {
        setBlocksTypedIndexes([]);
    }

    const lettersTyped = (() => {
        return blocksTypedIndexes.map((i): string => {
            return getLetterBlock(i);
        }).join('');
    })();

    function getLetterBlock(index: number) {
        const block = letterBlocks[index];
        if (block == undefined) throw new Error('LetterBlock is undefined');
        return block;
    }

    

    return (
        <>
            {rows.map((row) => {
                <div>
                    {rows.map(col => {
                        return <LetterBlock id={5 * row + col} isTyped={false} letter={'a'}
                            onBlockClick={() => handleEnterLetter(col)} key={row.toString() + col.toString()} />
                        })}
                </div>
            })}
            
        </>);
}

interface BlockRowProps {
    row: number,
}

function BlockRow({row}: BlockRowProps) {
    const blocks = [0, 1, 2, 3, 4];
    
    return (
        <>
            
        </>)
}