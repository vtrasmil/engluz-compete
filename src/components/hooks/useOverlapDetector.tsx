import { useEffect, useState } from "react";
import { isOverlapping } from "~/utils/helpers";

export const useOverlapDetector =
    (target: HTMLDivElement | null,
        objects: Map<number, HTMLDivElement> | null,
        deps: any[]
    ) => {
        // const [overlappedObjects, setOverlappedObjects] = useState<RefObject<HTMLElement>[]>();
        const [overlap, setOverlap] = useState<number[]>([]);
        useEffect(() => {
            if (target == undefined || objects == undefined) return;

            objects.forEach((v, k) => {
                if (isOverlapping(target, v, 0.60))
                {
                    setOverlap([...overlap, k]);
                }

            });
            console.log(overlap);
            return () => setOverlap([]);
        }, [deps])

        return overlap;
    };