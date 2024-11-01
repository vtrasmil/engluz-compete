import { useUserIdContext } from "~/components/hooks/useUserIdContext";
import Lobby from "~/components/Lobby";


interface HomeProps {
  onSetSessionInfo: (playerName: string, isHost: boolean, roomCode: string) => void,
}

export default function Home({ onSetSessionInfo, }: HomeProps) {
  const userId = useUserIdContext();

  return (
    <>
      <Lobby userId={userId} onSetSessionInfo={onSetSessionInfo} />
    </>
  );
}
