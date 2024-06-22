import { useAnimate } from "framer-motion";
import { useEffect, useState } from "react";
import { useUserIdContext } from "./useUserIdContext";
import { CELL_CHANGE_COLOR, ROLL_CHANGE_COLOR, SELECTED_COLOR } from "../Constants";

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
    sourceCell: number,
    boardDiv: HTMLDivElement | null,
    isPointerOver: boolean,
    isSelected: boolean,
) {

    // 1st render: letterBlockDiv and boardDiv are null, 2nd render: sets
    const [scope, animate] = useAnimate();
    const [rollChange, setRollChange] = useState(false);
    const [cellChange, setCellChange] = useState(false);
    const userId = useUserIdContext();
    // const [animationEndState, setAnimationEndState] = useState("visible");

    useEffect(() => {
        const animScale = async () => {
            await animate(scope.current,
                {
                    scale: (isPointerOver || isSelected) ? 1.15 : 1,
                },
                {
                    type: 'tween',
                    duration: 0.1,
                });
        };
        void animScale();
    }, [isPointerOver, isSelected, scope, animate]);




    let color = 'white';
    if (isSelected) {
        color = SELECTED_COLOR;
    }
    if (rollChange) {
        color = ROLL_CHANGE_COLOR;
    } else if (cellChange) {
        color = CELL_CHANGE_COLOR;
    }

    useEffect(() => {
        const animColor = async () => {
            await animate(scope.current,
                {
                    backgroundColor: color
                },
                {
                    type: 'tween',
                    duration: 0.5,
                });
        };
        void animColor();
    }, [color, scope, animate]);

    /**
     *  Since blocks are rendered initially at top-left of board, we use board div
     * as our anchor point.
     */
    return scope;

}

