
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

export function assert(condition: unknown, msg?: string): asserts condition {
    if (condition === false) throw new Error(msg)
}
