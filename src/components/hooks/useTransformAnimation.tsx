import { useState } from "react";



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

export default function useTransformAnimation(
    isDragging: boolean, sourceCell: number,
    dropTargetRefs: Map<number, HTMLDivElement> | null) {

    const [position, setPosition] = useState<Point2D | undefined>(getInitialPosition);

    function getInitialPosition(): Point2D | undefined {
        const dropTargetRef = dropTargetRefs?.get(sourceCell);
        return dropTargetRef ? getXYPosition(dropTargetRef) : undefined;
    }

}

