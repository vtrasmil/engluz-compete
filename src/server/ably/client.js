import { env } from "../../env.mjs";




export default async function getAblyClient() {
    require('dotenv').config();
    const Ably = require('ably');
    const ably = new Ably.Realtime.Promise(env.ABLY_API_KEY);
    await ably.connection.once('connected');
    console.log('Connected to Ably!');
    return ably;
}
