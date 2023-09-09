import { useState, useEffect, RefObject } from 'react';
import { isPointerEvent } from '~/utils/helpers';

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
export const useDrag = (ref: RefObject<EventTarget>, deps: any[], options: DragOptions, blockId: number | string) => {
    
    

    const {
        onPointerDown = (e: PointerEvent) => { },
        onPointerUp = (e: PointerEvent) => { },
        onPointerEnter = (e: PointerEvent) => { },
        
    } = options;

    const [isDragging, setIsDragging] = useState(false);

    const handlePointerDown = (e: Event) => {
        
        e.stopPropagation();
        if (!isPointerEvent(e)) throw new Error('Event is not a PointerEvent');
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        setIsDragging(true);
        onPointerDown(e);
    };

    const handlePointerUp = (e: Event) => {
        e.stopPropagation();
        if (!isPointerEvent(e)) throw new Error('Event is not a PointerEvent');
        setIsDragging(false);
        onPointerUp(e);
    };

    const handlePointerEnter = (e: Event) => {
        
        e.stopPropagation();
        if (!isPointerEvent(e)) throw new Error('Event is not a PointerEvent');
        onPointerEnter(e);
    }


    useEffect(() => {
        const element = ref.current;
        if (element) {
            // console.log(`${blockId}: ${deps}`);
            element.addEventListener('pointerdown', handlePointerDown);
            element.addEventListener('pointerup', handlePointerUp);
            element.addEventListener('pointerenter', handlePointerEnter);
            
            return () => {
                element.removeEventListener('pointerdown', handlePointerDown);
                element.removeEventListener('pointerup', handlePointerUp);
                element.removeEventListener('pointerenter', handlePointerEnter);
            };
        }
        
        return () => {};
    }); // TODO: bring back deps to improve performance
    
    return { isDragging };
}




export default useDrag;