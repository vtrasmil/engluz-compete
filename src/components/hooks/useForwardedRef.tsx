import { MutableRefObject, useEffect, useRef } from "react";

const useForwardedRef = (ref: MutableRefObject<unknown> | ((arg: unknown) => unknown)) => {
    const innerRef = useRef(null);

    useEffect(() => {
        if (!ref) return;
        if (typeof ref === "function") {
            ref(innerRef.current);
        } else {
            ref.current = innerRef.current;
        }
    });

    return innerRef;
};