import { useEffect, useRef } from "react";

const useForwardedRef = (ref: any) => {
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