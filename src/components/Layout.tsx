import { Analytics } from "@vercel/analytics/react"
import Head from "next/head"
import { ReactNode } from "react"
import { cn } from "~/lib/utils"
import { fontSans } from "~/pages"
import { SpeedInsights } from "@vercel/speed-insights/next"

interface LayoutProps {
    children: ReactNode
}
export default function Layout({ children }: LayoutProps) {
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
                <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap"
                      rel="stylesheet"/>
                <meta name="viewport" content="initial-scale=1, width=device-width"/>
            </Head>
            <SpeedInsights/>
            <main
                className={cn("bg-gray-100 min-h-screen flex items-center justify-center touch-none text-base text-center", fontSans.variable)}>
                    {children}
                    <Analytics />
            </main>

        </>

    )
}