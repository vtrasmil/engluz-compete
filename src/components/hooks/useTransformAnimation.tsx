import { useEffect, useLayoutEffect, useRef } from "react";
import { SwappedLetterState } from "../Board";



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
    swappedLetterState: SwappedLetterState | undefined)

{
    // 1st render: letterBlockDiv is null, 2nd render: sets
    const initPos = useRef<Point2D | null | undefined>(null);
    const position = useRef<Point2D | null | undefined>(getTransformPosition());
    
    useEffect(() => {
        // if (sourceCell === 0) {
        //     console.log(`useTransformAnimation: useEffect`);
        // }
        if (letterBlockDiv && !initPos.current) {
            // 1st render: doesn't run, second render: sets
            initPos.current = getXYPosition(letterBlockDiv);
        }
        position.current = getTransformPosition();
    }, [dropTargetDivMap, swappedLetterState, letterBlockDiv])

    // if (sourceCell === 0) {
    //     // console.log(`useTransformAnimation`, sourceCell, initPos, position)
    //     console.log(`useTransformAnimation: render`)
    // }

    function getTransformPosition() {
        if (!dropTargetDivMap || !initPos.current) return;
        // const letterBlockAbsPos = letterBlockDiv && getXYPosition(letterBlockDiv);
        const cell = (swappedLetterState && sourceCell === swappedLetterState.dropTargetCell) ?
            swappedLetterState.dragSourceCell : sourceCell;
        // const cell = sourceCell;
        const dropTargetRef = dropTargetDivMap.get(cell);
        const dropTargetAbsPos = dropTargetRef && getXYPosition(dropTargetRef);
        const dropTargetRelPos = dropTargetAbsPos && getPoint2DDelta(initPos.current, dropTargetAbsPos);
        return dropTargetRelPos;
    }

    return position.current;

}

