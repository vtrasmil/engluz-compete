import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import Ably from "ably/promises";
import { env } from "~/env.mjs";



// const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//     // Create context and caller
//     const ctx = await createTRPCContext({ req, res });
//     const caller = appRouter.createCaller(ctx);
//     try {
//         const tokenRequestData = await caller.lobby.createTokenRequest();
//         res.status(200).json(tokenRequestData);
//     } catch (cause) {
//         if (cause instanceof TRPCError) {
//         // An error from tRPC occured
//         const httpCode = getHTTPStatusCodeFromError(cause);
//         return res.status(httpCode).json(cause);
//         }
//         // Another error occured
//         console.error(cause);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };

// export default handler;
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const client = new Ably.Realtime(env.ABLY_API_KEY);
    
    client.auth.createTokenRequest()
        .then((tokenRequestData) => {
            res.status(200).json(tokenRequestData);
        })
        .catch((err) => {
            res.status(500).send("Error requesting token: " + JSON.stringify(err))
        });
    
    
    
};