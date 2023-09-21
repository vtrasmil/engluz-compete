
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

export function isHTMLElement(element: EventTarget): element is HTMLElement {
    return element instanceof HTMLElement;
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