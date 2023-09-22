import { ReactNode } from "react";
import { useDrop } from "react-dnd";

interface LetterDropTargetType {
    id: number,
    children: ReactNode
}

const LetterDropTarget = ({children, id }: LetterDropTargetType) => {

    function hover(item: HTMLElement) {
        console.log(`Hovering over DropTarget ${id} with ${item.id}`)
    }

    function drop(item: HTMLElement) {
        console.log(`Dropped ${item}`);
    }

    const [{ isOver: boolean }, dropRef] = useDrop(() => ({
        accept: 'letter',
        hover: hover,
        drop: drop,
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));


    return (
        <div ref={dropRef} id={`letter-drop-target-${id.toString()}`}
            className={'m-2'}>
            {children}
        </div> );
}

export default LetterDropTarget;