import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import WordScrambleGame from "~/components/wordScramble";
import {
  setUseWhatChange,
} from '@simbathesailor/use-what-changed';
import { ablyTest, kvTest } from  '~/server/redis/test';

setUseWhatChange(process.env.NODE_ENV === 'development');


export default function Home() {
  // const hello = api.example.hello.useQuery({ text: "from tRPC" });
  // const authorized = api.example.authorize.useQuery();
  
  

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <WordScrambleGame />
    </>
  );
}


