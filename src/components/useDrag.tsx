import { useState, useEffect, RefObject } from 'react';
import { isPointerEvent } from '~/utils/helpers';

interface DragOptions {
    onPointerDown?: (e: PointerEvent) => void,
    onPointerUp?: (e: PointerEvent) => void,
    onPointerMove?: (e: PointerEvent) => void,
    onPointerOver?: (e: PointerEvent) => void,
    onDrag?: (e: PointerEvent) => void,
}

// should accept ref to window and HTMLElement
// https://javascript.plainenglish.io/how-to-make-a-simple-custom-usedrag-react-hook-6b606d45d353
export const useDrag = (ref: RefObject<EventTarget>, deps: any[], options: DragOptions) => {
    
    

    const {
        onPointerDown = (e: PointerEvent) => {},
        onPointerUp = (e: PointerEvent) => {},
        onPointerMove = (e: PointerEvent) => { },
        onPointerOver = (e: PointerEvent) => { },
        onDrag = (e: PointerEvent) => {},
    } = options;

    const [isDragging, setIsDragging] = useState(false);

    const handlePointerDown = (e: Event) => {
        e.stopPropagation();
        if (!isPointerEvent(e)) throw new Error('Event is not a PointerEvent');
        setIsDragging(true);
        onPointerDown(e);
    };

    const handlePointerUp = (e: Event) => {
        e.stopPropagation();
        if (!isPointerEvent(e)) throw new Error('Event is not a PointerEvent');
        setIsDragging(false);
        onPointerUp(e);
    };

    const handlePointerMove = (e: Event) => {
        e.stopPropagation();
        if (!isPointerEvent(e)) throw new Error('Event is not a PointerEvent');
        onPointerMove(e);
        if (isDragging) {
            onDrag(e);
        }
    };

    const handlePointerOver = (e: Event) => {
        e.stopPropagation();
        if (!isPointerEvent(e)) throw new Error('Event is not a PointerEvent');
        onPointerOver(e);
        if (isDragging) {
            onDrag(e);
        }
    };

    useEffect(() => {
        const element = ref.current;
        if (element) {
            element.addEventListener('pointerdown', handlePointerDown);
            element.addEventListener('pointerup', handlePointerUp);
            element.addEventListener('pointermove', handlePointerMove);
            element.addEventListener('pointerover', handlePointerOver);
            
            return () => {
                element.removeEventListener('pointerdown', handlePointerDown);
                element.removeEventListener('pointerup', handlePointerUp);
                element.removeEventListener('pointermove', handlePointerMove);
                element.removeEventListener('pointerover', handlePointerOver);
                
            };
        }
        
        return () => {};
    }, [...deps, isDragging]);

    return { isDragging };
};

export default useDrag;