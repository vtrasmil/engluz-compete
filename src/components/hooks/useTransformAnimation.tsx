import { useEffect, useRef, useState } from "react";
import { SwappedLetterState } from "../Board";
import { useWindowSize } from "@react-hooks-library/core";
import { useSpring } from "@react-spring/web";



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
    prevSourceCell: number,
    letterBlockDiv: HTMLDivElement | null,
    dropTargetDivMap: Map<number, HTMLDivElement> | null,
    swappedLetterState: SwappedLetterState | undefined,
    boardDiv: HTMLDivElement | null,
)
{
    // generate vector based on where cell should be according to swappedLetterState or sourceCell
    const getTransformVector = () => {
        if (!dropTargetDivMap || !boardDiv) return;
        let cellId;
        if (swappedLetterState == undefined) {
            cellId = sourceCell;
        }
        else if (sourceCell === swappedLetterState.dropTargetCell) {
            cellId = swappedLetterState.dragSourceCell;
        }
        else if (sourceCell === swappedLetterState.dragSourceCell) {
            cellId = swappedLetterState.dropTargetCell;
        } else {
            cellId = sourceCell;
        }
        const dropTargetDiv = dropTargetDivMap.get(cellId);
        const boardAbsPos = boardDiv && getXYPosition(boardDiv);
        const dropTargetAbsPos = dropTargetDiv && getXYPosition(dropTargetDiv);
        const deltaPos = boardAbsPos && dropTargetAbsPos && getPoint2DDelta(boardAbsPos, dropTargetAbsPos);
        return deltaPos;
    }
    // 1st render: letterBlockDiv and boardDiv are null, 2nd render: sets
    const prevVectorRef = useRef<Point2D | undefined>(getTransformVector());
    const [currVector, setCurrVector] = useState<Point2D | undefined>(getTransformVector());
    const windowSize = useWindowSize({ initialWidth: window.innerWidth, initialHeight: window.innerHeight });

    // it's difficult to change the animation on source cell change since it
    // takes an additional render for vector change to take effect
    useEffect(() => {
        const newVec = getTransformVector();

        setCurrVector(newVec);
        prevVectorRef.current = currVector;

    }, [dropTargetDivMap, swappedLetterState, letterBlockDiv, sourceCell, windowSize.width, windowSize.height,
        // getTransformVector, setCurrVector, setCurrSourceCell
    ])

    const springs = useSpring({
        from: { x: prevVectorRef.current?.x, y: prevVectorRef.current?.y },
        to: { x: currVector?.x, y: currVector?.y }
    });

    const setPosAtCell = (cellId: number) => {
        // api.set(to);
    }

    /**
     *  Since blocks are rendered initially at top-left of board, we use board div
     * as our anchor point.
     */



    return { springs, setPosAtCell };

}

