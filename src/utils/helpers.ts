import { BoardConfiguration } from "~/components/Board";
import { LetterDieSchema } from "~/server/diceManager";

export const uniqueId = function () {
    return "id-" + Math.random().toString(36).substring(2, 16);
    // TODO: include totalPlayers
};

export function getUserIdFromSessionStorage() {
    let userId: string;
    if (typeof window !== 'undefined') {
        const sessionUserId = sessionStorage.getItem('userId');
        userId = sessionUserId ?? uniqueId();
        if (sessionUserId !== userId)
            sessionStorage.setItem('userId', userId);
        return userId;
    }
}

export function getRandomIntInclusive(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

export function isPointerEvent(event: Event): event is PointerEvent {
    return event instanceof PointerEvent;
}

export function isEventTarget(element: EventTarget | HTMLDivElement): element is EventTarget {
    return element instanceof EventTarget;
}

export function isHTMLDivElement(element: EventTarget): element is HTMLDivElement {
    return element instanceof HTMLDivElement;
}

export function assert(condition: unknown, msg?: string): asserts condition {
    if (condition === false) throw new Error(msg)
}

export const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))



export function isOverlapping(element1: HTMLElement, element2: HTMLElement, threshold: number): boolean {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    // Calculate the area of overlap.
    const overlappingArea = (rect1.top < rect2.bottom ? rect1.bottom - rect2.top : 0) *
        (rect1.left < rect2.right ? rect1.right - rect2.left : 0);

    // Calculate the total area of both elements.
    const totalArea = rect1.width * rect1.height + rect2.width * rect2.height;

    // Calculate the percentage of overlap.
    const overlapPercentage = overlappingArea / totalArea * 100;

    // Return true if the percentage of overlap is greater than or equal to the threshold.
    return overlapPercentage >= threshold;
}

export function safeStringToInt(str: string): number | typeof NaN {
  // Trim the string to remove leading and trailing whitespace.
    str = str.trim();

    // If the string is empty, return NaN.
    if (str === '') {
        return NaN;
    }

    // Try to parse the string as an integer. If the parse fails, return NaN.
    const num = parseInt(str, 10);
    if (isNaN(num)) {
        return NaN;
    }

    // Return the parsed integer.
    return num;
}

function cloneMap<K, V>(map: Map<K, V>): Map<K, V> {
    const newMap = new Map<K, V>();
    for (const [key, value] of map.entries()) {
    newMap.set(key, value);
    }
    return newMap;
}
/**
 *
 * @param array An array
 * @param index1 The first index
 * @param index2 The second index
 * @returns A new array
 */
export function swap<T>(array: T[], index1: number, index2: number) {
    const newArray = array.slice();
    const value1 = newArray[index1];
    const value2 = newArray[index2];
    if (value1 == undefined || value2 == undefined) throw new Error('Index out of range');
    newArray.splice(index1, 1, value2);
    newArray.splice(index2, 1, value1);
    return newArray;
}

export function swapCells(map: BoardConfiguration, cell1: number, cell2: number) {
    const newMap: BoardConfiguration = cloneMap(map);
    const value1 = map.get(cell1);
    const value2 = map.get(cell2);

    if (value1 == undefined || value2 == undefined) throw new Error('Map does not contain index');
    newMap.set(cell1, value2);
    newMap.set(cell2, value1);

    return newMap;
}

export function boardArrayToMap(array: LetterDieSchema[]) {
    const map = new Map<number, LetterDieSchema>();
    array.forEach((element, i) => {
        map.set(i, element);
    });
    return map;
}

export function boardMapToArray(map: Map<number, LetterDieSchema>) {
    const array = new Array<LetterDieSchema>();
    map.forEach((v, k) => {
        array[k] = v;
    });
    return map;
}
