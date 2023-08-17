import { Button } from "@mui/material";

interface ButtonProps {
    
    disabled?: boolean,
}


export function HostGameButton({} : ButtonProps) {
    
    
    return <Button type="submit">Host Game</Button>;
}

export function JoinGameButton({disabled} : ButtonProps) {

    return <Button type="submit" className="flex-1" disabled={disabled}>Join Game</Button>
}