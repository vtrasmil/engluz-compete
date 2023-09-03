import { env } from "../../env.mjs";
import { configureAbly } from "@ably-labs/react-hooks";
import Ably from "ably/promises";



export default function getAblyClient() {
    // configureAbly({ key: env.ABLY_API_KEY });
    // console.log('running getAblyClient()');
    const realtime = new Ably.Realtime({
        authUrl: 'http://localhost:3000/api/createTokenRequest', // TODO: change for prod
        
        // key: env.ABLY_API_KEY,
        // clientId: 'boggle-battle-react-app1',
        // closeOnUnload: true,
        useTokenAuth: true,
        // recover: (_, cb) => {
        //     console.log(`Recovered connection: ${_}`)
        //     cb(true);
        // }
    });
    
    realtime.connection.on('connected', () => {
        console.log(`Connected to Ably with clientId ${realtime.clientId}`);
    });
    
    return realtime;
}

export async function ablyTest() {
    const ably = getAblyClient();
    
    // get the channel to subscribe to
    const channel = ably.channels.get('quickstart');
    await channel.subscribe('greeting', (message) => {
        if (typeof message.data === 'string') {
            console.log('Received a greeting message in realtime: ' + message.data)
        }
    });
    await channel.publish('greeting', 'hello!');
}