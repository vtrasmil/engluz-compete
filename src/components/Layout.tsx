import { Analytics } from "@vercel/analytics/react"
import Head from "next/head"
import { ReactNode } from "react"
import { cn } from "~/lib/utils"
import { fontSans } from "~/pages"

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
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&display=swap" rel="stylesheet" />
                <meta name="viewport" content="initial-scale=1, width=device-width" />
            </Head>

            <main className={cn("bg-gray-100 min-h-screen flex items-center justify-center touch-none text-base", fontSans.variable)}>
                <div className="max-w-lg rounded-lg shadow-md bg-white p-6 space-y-6 border-gray-400 dark:border-gray-700">
                    <div className="text-center">
                        {children}
                        <Analytics />
                    </div>
                </div>
            </main>

        </>

    )
}