import { type NextApiRequest, type NextApiResponse } from "next";
import Ably from "ably/promises";
import { env } from "~/env.mjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const client = new Ably.Realtime(env.ABLY_API_KEY);
    
    await client.auth.createTokenRequest()
        .then((tokenRequestData) => {
            res.status(200).json(tokenRequestData);
        })
        .catch((err) => {
            res.status(500).send("Error requesting token: " + JSON.stringify(err))
        });
    
    
    
}