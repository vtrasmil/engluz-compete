import { isOverlapping } from "~/utils/helpers";

export const useOverlapDetector =
    (target: HTMLDivElement | undefined,
    objects: Map<number, HTMLDivElement> | null) => {
        // const [overlappedObjects, setOverlappedObjects] = useState<RefObject<HTMLElement>[]>();

        if (target == undefined || objects == undefined) return;
        let overlap: number[] = [];
        objects.forEach((v, k) => {
            if (isOverlapping(target, v, 0.60))
            {
                overlap = [...overlap, k];
            }

        });
        console.log(overlap);
        return overlap;
    };