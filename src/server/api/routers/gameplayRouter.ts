import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { getWordFromBoard, isWordValid } from "~/server/wordListManager";
import { rollDice } from "~/server/diceManager";
import { ablyChannelName } from "~/server/ably/ablyHelpers";

export interface WordSubmittedMessageData {
    newBoard: string[]
}

export const gameplayRouter = createTRPCRouter({

    submitWord: publicProcedure
        .input(z.object({
            userId: z.string().min(1),
            gameId: z.string().min(1),
            letterBlocks: z.number().array(),
            roomCode: z.string().min(1),
        }))
        .mutation(async (opts) => {
            const { userId, gameId } = opts.input;
            const dice = await opts.ctx.redis.getDice(gameId);
            const word = getWordFromBoard(opts.input.letterBlocks, dice)
            const isValid = await isWordValid(word, opts.ctx.redis);
            if (isValid) {
                const reroll = rollDice(dice, opts.input.letterBlocks);
                await opts.ctx.redis.setDice(opts.input.gameId, reroll);
                const ably = opts.ctx.ably;
                const channel = ably.channels.get(ablyChannelName(opts.input.roomCode));
                const wordSubmittedMsg : WordSubmittedMessageData = {
                    newBoard: reroll
                }
                await channel.publish('wordSubmitted', wordSubmittedMsg);
                return { isValid: true, newBoard: reroll, wordSubmitted: word};
            } else {
                return { isValid: false, wordSubmitted: word };
            }
    }),

})