import {type AblyMessageType, type BeginIntermissionMessageData, type GameStartedMessageData} from "~/components/Types.tsx";
import {type Rest} from "ably";


export const ablyChannelName = (roomCode: string) =>`boggleBattle:${roomCode}`;

// TODO: no link between messageType and the message's type
export async function publishToAblyChannel(ably: Rest, roomCode: string, messageType: AblyMessageType,
                                           message: BeginIntermissionMessageData | GameStartedMessageData | Record<string, never>) {
    const channelName = ablyChannelName(roomCode);
    const channel = ably.channels.get(channelName);
    try {
        await channel.publish(messageType, message);
    } catch (e) {
        console.error(`Ably message not published: ${messageType}`)
    }
}
