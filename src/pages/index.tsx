import Head from "next/head";
import { useUserIdContext } from "~/components/hooks/useUserIdContext";
import dynamic from "next/dynamic";
import { Analytics } from '@vercel/analytics/react';
import { cn } from "~/lib/utils";
import { Inter as FontSans } from "next/font/google";


const Lobby = dynamic(() => import('../components/Lobby'), { ssr: false });



// setUseWhatChange(process.env.NODE_ENV === 'development');

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})
export default function Home() {



  const userId = useUserIdContext();
  if (userId != undefined) {

  }

  return (
    <>
      <Head>
        <title>WORDS WORDS WORDS</title>
        <meta name="description" content="A word game-in-progress" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin={""} />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&display=swap" rel="stylesheet"/>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      <main className={cn("bg-gray-100 min-h-screen flex items-center justify-center touch-none text-base", fontSans.variable)}>
        <div className="max-w-sm rounded-lg shadow-lg bg-white p-6 space-y-6 border border-gray-400 dark:border-gray-700">
            <div className="space-y-2 text-center">
              <Lobby userId={userId} />
              <Analytics />
            </div>
          </div>
      </main>

    </>
  );
}
