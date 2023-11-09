import { config, useSpring } from "@react-spring/web";
import { useEffect, useState } from "react";

export default function useChangeAnim(numTimesRolled: number, sourceCell: number, isSelected: boolean) {

    const [rollChange, setRollChange] = useState(false);
    const [cellChange, setCellChange] = useState(false);

    const changeConfig = { tension: 100, friction: 10 };

    let color = 'white';
    if (isSelected) {
        color = 'lightskyblue';
    }
    if (rollChange) {
        color = 'lightgreen';
    } else if (cellChange) {
        color = 'gold';
    }

    const spring = useSpring({
        // backgroundColor: 'green',
        // backgroundColor: rollChange ? 'green' : 'white',
        backgroundColor: color,
        config: isSelected ? config.stiff : changeConfig,
    });

    useEffect(() => {
        setRollChange(true);
        setTimeout(() => setRollChange(false), 700);
    }, [numTimesRolled]);

    useEffect(() => {
        setCellChange(true);
        setTimeout(() => setCellChange(false), 700);
    }, [sourceCell]);

    // ${isSelected ? `bg-blue-200` : ''}

    return spring;
}