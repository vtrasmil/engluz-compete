import { useUserIdContext } from "~/components/hooks/useUserIdContext";
import { Inter as FontSans } from "next/font/google";
import Lobby from "~/components/Lobby";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

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
