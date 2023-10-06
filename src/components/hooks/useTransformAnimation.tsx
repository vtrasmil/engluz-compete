import { useEffect, useState } from "react";



export type Point2D = {
    x: number,
    y: number
}

function getXYPosition(el: HTMLDivElement) {
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
    dropTargetDivMap: Map<number, HTMLDivElement> | null)
{
    const [position, setPosition] = useState<Point2D | null | undefined>(getDropTargetPosition());

    useEffect(() => {
        setPosition(getDropTargetPosition());
    }, [dropTargetDivMap])

    function getDropTargetPosition() {
        const letterBlockAbsPos = letterBlockDiv && getXYPosition(letterBlockDiv);
        const dropTargetRef = dropTargetDivMap?.get(sourceCell);
        const dropTargetAbsPos = dropTargetRef && getXYPosition(dropTargetRef);
        const dropTargetRelPos = letterBlockAbsPos && dropTargetAbsPos && getPoint2DDelta(letterBlockAbsPos, dropTargetAbsPos);
        console.log(`cell ${sourceCell}`,letterBlockAbsPos, dropTargetAbsPos)
        return dropTargetRelPos;
    }

    return position;

}

