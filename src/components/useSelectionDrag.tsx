import { useState, useEffect, RefObject } from 'react';
import { isPointerEvent } from '~/utils/helpers';
import { DragMode } from "./Types";
import * as console from "node:console";


interface DragOptions {
    onPointerDown?: (e: PointerEvent) => void,
    onPointerUp?: (e: PointerEvent) => void,
    onPointerMove?: (e: PointerEvent) => void,
    onPointerOver?: (e: PointerEvent) => void,
    onPointerEnter?: (e: PointerEvent) => void,
    onPointerLeave?: (e: PointerEvent) => void,
    onDrag?: (e: PointerEvent) => void,
}

// should accept ref to window and HTMLElement
// https://javascript.plainenglish.io/how-to-make-a-simple-custom-usedrag-react-hook-6b606d45d353
export const useSelectionDrag = (ref: RefObject<HTMLDivElement | EventTarget>, deps: any[], options: DragOptions, blockId: number | string) => {
    const {
        onPointerDown = (e: PointerEvent) => undefined,
        onPointerUp = (e: PointerEvent) => undefined,
        onPointerEnter = (e: PointerEvent) => undefined,
        onDrag = (e: PointerEvent) => undefined,

    } = options;

    const [isDragging, setIsDragging] = useState(false);

    const handlePointerDown = (e: Event) => {
        e.stopPropagation();
        if (!isPointerEvent(e)) throw new Error('Event is not a PointerEvent');
        onPointerDown(e);
        if (ref.current instanceof HTMLDivElement) {
            ref.current.releasePointerCapture(e.pointerId);
        }
    };

    const handlePointerUp = (e: Event) => {
        e.stopPropagation();
        if (!isPointerEvent(e)) throw new Error('Event is not a PointerEvent');
        onPointerUp(e);
    };

    const handlePointerEnter = (e: Event) => {
        if (!isPointerEvent(e)) throw new Error('Event is not a PointerEvent');
        onPointerEnter(e);

    }

    const handlePointerMove = (e: Event) => {
        if (!isPointerEvent(e)) throw new Error('Event is not a PointerEvent');
        if (isDragging) {
            onDrag(e);
        }
    };

    const handleGotPointerCapture = (e: Event) => {
        if (!isPointerEvent(e)) throw new Error('Event is not a PointerEvent');
        // e.target?.addEventListener('pointermove', handlePointerMove);
        // e.target?.addEventListener('pointerenter', handlePointerEnter);
    }

    const handleLostPointerCapture = (e: Event) => {
        if (!isPointerEvent(e)) throw new Error('Event is not a PointerEvent');
        // e.target?.removeEventListener('pointermove', handlePointerMove);
        // e.target?.removeEventListener('pointerenter', handlePointerEnter);
    }


    useEffect(() => {
        const element = ref.current;
        if (element) {

            // console.log(`${blockId}: ${deps}`);
            element.addEventListener('pointerdown', handlePointerDown);
            element.addEventListener('pointerup', handlePointerUp);
            element.addEventListener('pointerenter', handlePointerEnter);
            element.addEventListener('pointermove', handlePointerMove);
            /* if (isHTMLDivElement(element)) {
                element.addEventListener('gotpointercapture', handleGotPointerCapture);
                element.addEventListener('lostpointercapture', handleLostPointerCapture);
            } */


            return () => {
                element.removeEventListener('pointerdown', handlePointerDown);
                element.removeEventListener('pointerup', handlePointerUp);
                element.removeEventListener('pointerenter', handlePointerEnter);
                element.removeEventListener('pointermove', handlePointerMove);
                /* if (isHTMLDivElement(element)) {
                    element.removeEventListener('gotpointercapture', handleGotPointerCapture);
                    element.removeEventListener('lostpointercapture', handleLostPointerCapture);
                } */
            };
        }
    }, ); // TODO: bring back deps to improve performance

    return { isDragging };
}

export default useSelectionDrag;