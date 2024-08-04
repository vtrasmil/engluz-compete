import { type NextApiRequest, type NextApiResponse } from "next";
import { env } from "~/env.mjs";
import * as Ably from 'ably';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let client;
    const userId = req.headers.userid as string;
    const tokenParams = {
        clientId: userId
    };
    try {
        client = new Ably.Realtime(env.ABLY_API_KEY);
    } catch (error) {
        console.error('Ably client not created')
    }

    if (client != undefined && req.method === 'GET') {
        await client.auth.createTokenRequest(tokenParams)
            .then((tokenRequestData) => {
                res.status(200).json(tokenRequestData);
            })
            .catch((err) => {
                res.status(500).send("Error requesting token: " + JSON.stringify(err))
            });
    }
}

