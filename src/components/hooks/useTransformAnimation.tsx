import { AblyMessageType, GameplayMessageData, SwappedLetterState } from "../Types";
import { useWindowSize } from "@react-hooks-library/core";
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
    isDragging: boolean,
    sourceCell: number,
    prevSourceCell: number,
    temporaryCell: number | undefined,
    letterBlockDiv: HTMLDivElement | null,
    dropTargetDivMap: Map<number, HTMLDivElement> | null,
    swappedLetterState: SwappedLetterState | undefined,
    boardDiv: HTMLDivElement | null,
    isPointerOver: boolean,
    isSelected: boolean,
    latestMsg: GameplayMessageData | undefined
) {

    // 1st render: letterBlockDiv and boardDiv are null, 2nd render: sets
    const [scope, animate] = useAnimate();

    const getTransformVector = () => {
        if (!dropTargetDivMap || !boardDiv) return;
        const cellId = temporaryCell != undefined ? temporaryCell : sourceCell;
        const dropTargetDiv = dropTargetDivMap.get(cellId);
        const boardAbsPos = boardDiv && getXYPosition(boardDiv);
        const dropTargetAbsPos = dropTargetDiv && getXYPosition(dropTargetDiv);
        const deltaPos = boardAbsPos && dropTargetAbsPos && getPoint2DDelta(boardAbsPos, dropTargetAbsPos);
        return deltaPos;
    };
    useWindowSize({ initialWidth: window.innerWidth, initialHeight: window.innerHeight });
    const currVector = getTransformVector();

    useEffect(() => {
        const immediate = temporaryCell == undefined && swappedLetterState == undefined;
        const animPosition = async () => {
            await animate(scope.current,
                {
                    x: currVector?.x,
                    y: currVector?.y
                },
                {
                    type: 'tween',
                    duration: immediate ? 0 : 0.2,
                });
        };
        void animPosition();
    }, [temporaryCell, swappedLetterState, isPointerOver, isSelected, currVector, scope, animate]);

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

    // COLOR
    const [rollChange, setRollChange] = useState(false);
    const [cellChange, setCellChange] = useState(false);
    const userId = useUserIdContext();

    const changeConfig = { tension: 100, friction: 10 };

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

    useEffect(() => {
        if (latestMsg?.messageType === AblyMessageType.WordSubmitted &&
            latestMsg.sourceCellIds.includes(sourceCell)) {
            setRollChange(true);
            setTimeout(() => setRollChange(false), 300);
        } else if (latestMsg?.messageType === AblyMessageType.DiceSwapped &&
            latestMsg.sourceCellIds.includes(sourceCell) &&
            latestMsg.userId !== userId) {
            setCellChange(true);
            setTimeout(() => setCellChange(false), 300);
        }

    }, [latestMsg, sourceCell, userId]);



    /**
     *  Since blocks are rendered initially at top-left of board, we use board div
     * as our anchor point.
     */
    return scope;

}

