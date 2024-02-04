import { config, useSpring } from "@react-spring/web";
import { useEffect, useState } from "react";
import { CELL_CHANGE_COLOR, ROLL_CHANGE_COLOR, SELECTED_COLOR } from "../Constants";
import { MessageData } from "~/server/api/routers/gameplayRouter";
import { AblyMessageType } from "../Types";
import { useUserIdContext } from "./useUserIdContext";

export default function useChangeAnim(numTimesRolled: number, sourceCell: number, isSelected: boolean, latestMsg: MessageData | undefined) {

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

    const spring = useSpring({
        // backgroundColor: 'green',
        // backgroundColor: rollChange ? 'green' : 'white',
        backgroundColor: color,
        config: isSelected ? config.stiff : changeConfig,
    });

    useEffect(() => {
        if (latestMsg?.messageType === AblyMessageType.WordSubmitted &&
            latestMsg.sourceCellIds.includes(sourceCell)) {
            setRollChange(true);
            setTimeout(() => setRollChange(false), 700);
        } else if (latestMsg?.messageType === AblyMessageType.DiceSwapped &&
            latestMsg.sourceCellIds.includes(sourceCell) &&
            latestMsg.userId !== userId) {
            setCellChange(true);
            setTimeout(() => setCellChange(false), 700);
        }

    }, [latestMsg, sourceCell, userId]);

    return spring;
}