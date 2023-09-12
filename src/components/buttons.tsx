
interface ButtonProps {
    onClick: () => void,
}
export default function BackspaceButton({ onClick }: ButtonProps) {
    return (
        <button onClick={onClick}>Backspace</button>
    )
}

export function ClearButton({ onClick }: ButtonProps) {
    return (
        <button onClick={onClick}>Clear</button>
    )
}

