import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { getWordFromBoard, isWordValid } from "~/server/wordListManager";
import { rollDice } from "~/server/diceManager";
import { ablyChannelName } from "~/server/ably/ablyHelpers";
import { swap } from "~/utils/helpers";
import { AblyMessageType, BoardConfiguration } from "~/components/Board";
import { Score } from "~/components/Types";

interface DefaultAblyMessageData {
    userId: string,
    messageType: AblyMessageType,
}

// NOTE: Ably only allows serialized data in messages
export type WordSubmittedMessageData = {
    newBoard: BoardConfiguration,
    wordSubmitted: string,
    sourceCellIds: number[],
} & DefaultAblyMessageData;

export type DiceSwappedMessageData = {
    newBoard: BoardConfiguration,
    sourceCellIds: number[],
} & DefaultAblyMessageData;

export type GameStartedMessageData = {
    initBoard: BoardConfiguration,
} & DefaultAblyMessageData;

export type ScoreUpdatedMessageData = {
    scores: Score[],
} & DefaultAblyMessageData;



export type MessageData = WordSubmittedMessageData | DiceSwappedMessageData;

export const gameplayRouter = createTRPCRouter({

    submitWord: publicProcedure
        .input(z.object({
            userId: z.string().min(1),
            gameId: z.string().min(1),
            cellIds: z.number().array(),
            roomCode: z.string().min(1),
        }))
        .mutation(async (opts) => {
            const { userId, gameId } = opts.input;
            const dice = await opts.ctx.redis.getDice(gameId);
            const word = getWordFromBoard(opts.input.cellIds, dice).replace('Q', 'QU');
            const isValid = await isWordValid(word, opts.ctx.redis);
            // const isValid = true;
            if (isValid) {
                const reroll = rollDice(dice, opts.input.cellIds);
                await opts.ctx.redis.setDice(opts.input.gameId, reroll);
                const ably = opts.ctx.ably;
                const channel = ably.channels.get(ablyChannelName(opts.input.roomCode));
                const wordSubmittedMsg: WordSubmittedMessageData = {
                    userId: userId,
                    newBoard: reroll.map((lb, i) => ({
                        cellId: i,
                        letterBlock: lb
                    })),
                    wordSubmitted: word,
                    messageType: AblyMessageType.WordSubmitted,
                    sourceCellIds: opts.input.cellIds
                }
                await channel.publish(AblyMessageType.WordSubmitted, wordSubmittedMsg);
                return { isValid: true };
            } else {
                return { isValid: false, wordSubmitted: word };
            }
        }),

    swapDice: publicProcedure
        .input(z.object({
            letterBlockIdA: z.number(),
            letterBlockIdB: z.number(),
            userId: z.string().min(1),
            gameId: z.string().min(1),
            roomCode: z.string().min(1),
        }))
        .mutation(async (opts) => {
            const { userId, gameId, letterBlockIdA, letterBlockIdB } = opts.input;
            const dice = await opts.ctx.redis.getDice(gameId);
            const indexA = dice.findIndex(x => x.id === letterBlockIdA);
            const indexB = dice.findIndex(x => x.id === letterBlockIdB);
            if (indexA === -1 || indexB === -1) throw new Error(`Dice swap failed: Index not found in dice`)
            const swappedDice = swap(dice, indexA, indexB);
            await opts.ctx.redis.setDice(opts.input.gameId, swappedDice);
            const ably = opts.ctx.ably;
            const channel = ably.channels.get(ablyChannelName(opts.input.roomCode));
            const diceSwappedMsg: DiceSwappedMessageData = {
                userId: userId,
                newBoard: swappedDice.map((lb, i) => ({
                    cellId: i,
                    letterBlock: lb
                })),
                messageType: AblyMessageType.DiceSwapped,
                sourceCellIds: [indexA, indexB]
            }
            const publish = await channel.publish(AblyMessageType.DiceSwapped, diceSwappedMsg);
            return diceSwappedMsg;

        }),

})