import { useCallback, useEffect, useState } from "react";
import { SwappedLetterState } from "../Board";
import { useWindowSize } from "@react-hooks-library/core";



export type Point2D = {
    x: number,
    y: number
}

function getXYPosition(el: HTMLDivElement | null) {
    if (!el) return;
    const pos: Point2D = {
        x: el.getBoundingClientRect().x,
        y: el.getBoundingClientRect().y
    };


    return pos;
}

function getPoint2DDelta(a: Point2D, b: Point2D) {
    const delta: Point2D = {
        x: b.x - a.x,
        y: b.y - a.y
    };
    return delta;
}

export default function useTransformAnimation(
    isDragging: boolean,
    sourceCell: number,
    letterBlockDiv: HTMLDivElement | null,
    dropTargetDivMap: Map<number, HTMLDivElement> | null,
    swappedLetterState: SwappedLetterState | undefined,
    boardDiv: HTMLDivElement | null,
)

{

    const getTransformVector = useCallback(
        () => {
            if (!dropTargetDivMap || !boardDiv) return;
            const cellId = (swappedLetterState && sourceCell === swappedLetterState.dropTargetCell) ?
                swappedLetterState.dragSourceCell : sourceCell;
            const dropTargetDiv = dropTargetDivMap.get(cellId);
            const boardAbsPos = boardDiv && getXYPosition(boardDiv);
            const dropTargetAbsPos = dropTargetDiv && getXYPosition(dropTargetDiv);
            const deltaPos = boardAbsPos && dropTargetAbsPos && getPoint2DDelta(boardAbsPos, dropTargetAbsPos);
            return deltaPos;
        }
        , [dropTargetDivMap, boardDiv, swappedLetterState, sourceCell]);

    // 1st render: letterBlockDiv and boardDiv are null, 2nd render: sets
    const [vector, setVector] = useState<Point2D | undefined>(getTransformVector());
    const windowSize = useWindowSize({initialWidth: window.innerWidth, initialHeight: window.innerHeight});

    useEffect(() => {
        const newVec = getTransformVector();
        setVector(newVec);
    }, [dropTargetDivMap, swappedLetterState, letterBlockDiv, sourceCell,
        windowSize.width, windowSize.height, getTransformVector])


    /**
     *  Since blocks are rendered initially at top-left of board, we use board div
     * as our anchor point.
     */


    return vector;

}

