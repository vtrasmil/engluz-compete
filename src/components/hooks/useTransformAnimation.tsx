import { SwappedLetterState } from "../Types";
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
    temporaryCell: number | undefined,
    letterBlockDiv: HTMLDivElement | null,
    dropTargetDivMap: Map<number, HTMLDivElement> | null,
    swappedLetterState: SwappedLetterState | undefined,
    boardDiv: HTMLDivElement | null,
    isPointerOver: boolean,
    isSelected: boolean
) {
    const getTransformVector = () => {
        if (!dropTargetDivMap || !boardDiv) return;
        const cellId = temporaryCell != undefined ? temporaryCell : sourceCell;
        const dropTargetDiv = dropTargetDivMap.get(cellId);
        const boardAbsPos = boardDiv && getXYPosition(boardDiv);
        const dropTargetAbsPos = dropTargetDiv && getXYPosition(dropTargetDiv);
        const deltaPos = boardAbsPos && dropTargetAbsPos && getPoint2DDelta(boardAbsPos, dropTargetAbsPos);
        return deltaPos;
    };
    // 1st render: letterBlockDiv and boardDiv are null, 2nd render: sets

    useWindowSize({ initialWidth: window.innerWidth, initialHeight: window.innerHeight });

    const currVector = getTransformVector();

    const posSpring = useSpring({
        x: currVector?.x,
        y: currVector?.y,
        immediate: temporaryCell == undefined && swappedLetterState == undefined,
        config: {
            tension: 300,
            friction: 26,
            mass: 1
        },
    });

    const scaleSpring = useSpring({
        scale: (isPointerOver || isSelected) ? 1.15 : 1,
        config: {
            tension: 500,
            friction: 30,
            clamp: true,
        }
    });

    /**
     *  Since blocks are rendered initially at top-left of board, we use board div
     * as our anchor point.
     */
    return { ...posSpring, ...scaleSpring };

}

