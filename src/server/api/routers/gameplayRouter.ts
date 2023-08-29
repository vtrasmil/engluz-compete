import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { getWordFromBoard, isWordValid } from "~/server/wordListManager";
import { rollAndShuffleDice, rollDice, toStoredDiceRollString } from "~/server/diceManager";


export const gameplayRouter = createTRPCRouter({

    submitWord: publicProcedure
        .input(z.object({
            userId: z.string(),
            gameId: z.string(),
            letterBlocks: z.number().array(),
        }))
        .mutation(async (opts) => {
            const { userId, gameId } = opts.input;
            if (userId == null) {
                throw new TRPCError({ message: `No userId found`, code: "BAD_REQUEST" });
            }
            
            const dice = await opts.ctx.redis.getDice(gameId);
            
            // let dice = getDiceRollString(board, false);
            const word = getWordFromBoard(opts.input.letterBlocks, dice)
            const isValid = await isWordValid(word, opts.ctx.redis);
            if (isValid) {
                const reroll = rollDice(dice, opts.input.letterBlocks);
                const setDice = await opts.ctx.redis.setDice(opts.input.gameId, reroll);
                if (setDice) {
                    opts.ctx.ably.
                }

                return { isValid: true };
            } else {
                return { isValid: false };
            }


            
            
            // opts.ctx.redis.sIsMember('', )
    }),

})