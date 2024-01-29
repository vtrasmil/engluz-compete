
import { GamePlayerInfo } from "./Types";


interface ScoreboardProps {
    playerInfos: GamePlayerInfo[]
}
export default function Scoreboard({ playerInfos }: ScoreboardProps) {

    return (
        <div id="scoreboard">
            {playerInfos.map(p => {
                return (
                    <div key={p.userId}>
                        {p.playerName} {p.readyStatus}
                    </div>
                )
            })}
        </div>
    );
}