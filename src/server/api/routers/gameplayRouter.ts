import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { getWordFromBoard, isWordValid } from "~/server/wordListManager";
import { rollDice } from "~/server/diceManager";

export interface WordSubmittedMessageData {
    newBoard: string[]
}

export const gameplayRouter = createTRPCRouter({

    submitWord: publicProcedure
        .input(z.object({
            userId: z.string(),
            gameId: z.string(),
            letterBlocks: z.number().array(),
        }))
        .mutation(async (opts) => {
            let before = Date.now();
            const { userId, gameId } = opts.input;
            if (userId == null) {
                throw new TRPCError({ message: `No userId found`, code: "BAD_REQUEST" });
            }

            const dice = await opts.ctx.redis.getDice(gameId);

            console.log(`getDice: ${Date.now() - before}ms`);
            before = Date.now();

            // let dice = getDiceRollString(board, false);
            const word = getWordFromBoard(opts.input.letterBlocks, dice)
            const isValid = await isWordValid(word, opts.ctx.redis);

            // console.log(`isWordValid: ${Date.now() - before}ms`);
            before = Date.now();

            // console.log(`isWordValid: ${(Date.now() - before)}ms`)

            if (isValid) {
                const reroll = rollDice(dice, opts.input.letterBlocks);
                await opts.ctx.redis.setDice(opts.input.gameId, reroll);



                const ably = opts.ctx.ably;
                const channel = ably.channels.get('boggleBattle');
                const wordSubmittedMsg : WordSubmittedMessageData = {
                    newBoard: reroll
                }
                await channel.publish('wordSubmitted', wordSubmittedMsg);



                return { isValid: true, newBoard: reroll };

            } else {
                return { isValid: false };
            }




            // opts.ctx.redis.sIsMember('', )
    }),

})