import Head from "next/head";
import { useUserIdContext } from "~/components/hooks/useUserIdContext";
import dynamic from "next/dynamic";
import { Analytics } from '@vercel/analytics/react';


const Lobby = dynamic(() => import('../components/Lobby'), { ssr: false });



// setUseWhatChange(process.env.NODE_ENV === 'development');


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

      <main className="flex justify-center h-full touch-none">
          <div className="flex flex-col w-full md:max-w-2xl mt-10">
            <Lobby userId={userId} />
            <Analytics />
          </div>
      </main>

    </>
  );
}
