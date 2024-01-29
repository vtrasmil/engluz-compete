
import { RoomPlayerInfo, Score } from "./Types";


interface ScoreboardProps {
    playerInfos: RoomPlayerInfo[]
    scores: Score[]
}
export default function Scoreboard({ playerInfos, scores }: ScoreboardProps) {


    return (
        <div id="scoreboard">
            {playerInfos.map(p => {
                const score = scores.find(s => s.userId === p.userId);
                return (
                    <div key={p.userId}>
                        {p.playerName} {score?.score}
                    </div>
                )
            })}
        </div>
    );
}