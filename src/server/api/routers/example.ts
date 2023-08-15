import { TRPCError } from "@trpc/server";
import { kv } from "@vercel/kv";
import { Types } from "ably";
import { z } from "zod";
import getAblyClient from "~/server/ably/client";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getRandomSolutionSet } from "~/server/wordListManager";
import { getRandomIntInclusive, uniqueId } from "~/utils/helpers";


const totalPlayers = 4;






export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    // using zod schema to validate and infer input values
    .input(
      z
        .object({
          text: z.string().nullish(),
        })
        .nullish(),
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input?.text ?? 'world'}`,
      };
    }),
  
  authorize: publicProcedure
    .input(z.object({
      userId: z.string()
    }))
    .query((opts) => {
      
      const userId = opts.input.userId;

      
      const tokenParams = { clientId: userId };   
      const tokenRequest = opts.ctx.ably.auth.createTokenRequest(tokenParams);
      
      return tokenRequest.then(
        (req) => {
          // response.setHeader("Content-Type", "application/json");
          console.log(`User authenticated with id: ${userId}`);
          return req;
        },
        (err: Types.ErrorInfo) => {
          throw new TRPCError({
            message: "Error requesting token: " + JSON.stringify(err),
            code: "INTERNAL_SERVER_ERROR"
          });
      });
    }),
  
      
  playerGuessesCorrectly: publicProcedure
    .input(z.object({'userId': z.string()}))
    .mutation(async (opts) => {
      const { userId } = opts.input;
      if (userId == null) {
        throw new TRPCError({ message: `No userId found`, code: "BAD_REQUEST" });
      }
      opts.ctx.kv.incr(`${userId}-score`);
      
      
      
      
    }),
  startGame: publicProcedure
    .input(z.object({}))
    .mutation(async (opts) => {
      let gameId: string | undefined;
      while (gameId == undefined) {
        const newGameId = uniqueId();
        const addMember = await opts.ctx.kv.sadd('games-played', newGameId);
        if (addMember) gameId = newGameId;
      }

      // TODO: avoid words in other games this room has played
      // get a fresh solution
      let solutionSet;
      while (solutionSet == undefined) {
        const randomSolutionSet = getRandomSolutionSet();
        const canonicalWord = randomSolutionSet[0];
        const solutionIsFresh = !(await opts.ctx.kv.sismember(`game:${gameId}:words-used`, canonicalWord));
        if (solutionIsFresh) solutionSet = randomSolutionSet;
      }
      

      solutionSet.forEach(async (element) => {
        await opts.ctx.kv.sadd(`game:${gameId}:current-puzzle`, element);
        await opts.ctx.kv.sadd(`game:${gameId}:words-used`, element);
      });
      

      



    }),

});

// exampleRouter.authorize.contentType = 'application/json';

export async function kvTest() {
    await kv.set("user_1_session", "session_token_value");
    const session = await kv.get("user_1_session");
}


