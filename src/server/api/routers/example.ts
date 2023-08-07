import { TRPCError } from "@trpc/server";
import { kv } from "@vercel/kv";
import { Types } from "ably";
import { z } from "zod";
import getAblyClient from "~/server/ably/client";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const totalPlayers = 4;

const uniqueId = function () {
    return "id-" + totalPlayers.toString() + Math.random().toString(36).substring(2, 16);
};




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
    .query(({ ctx }) => {
      const tokenParams = { clientId: uniqueId() };   
      const tokenRequest = ctx.ably.auth.createTokenRequest(tokenParams);
      return tokenRequest.then(
        (req) => {
          // response.setHeader("Content-Type", "application/json");
          console.log(`User authenticated with id: ${tokenParams.clientId}`);
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
    // .input(z.string())
    .mutation(async (opts) => {
      const { input } = opts;
      let numLettersPressed: number;
      if (!await opts.ctx.kv.exists('numLettersPressed')) {
        await opts.ctx.kv.set('numLettersPressed', 1);

      } else {
        // exists
        // check for null, NaN
        numLettersPressed = Number(await opts.ctx.kv.get('numLettersPressed'));
        if ([null, NaN].includes(numLettersPressed)) {
          await opts.ctx.kv.set('numLettersPressed', 1);
        } else {
          await opts.ctx.kv.set('numLettersPressed', numLettersPressed + 1);
        }
      }
      console.log(`numLettersPressed: ${Number(await opts.ctx.kv.get('numLettersPressed'))}`); 
      
      

      
      
      return {
        message: 'mutation complete',
      }
      // add a point
      
      
    }),

});

// exampleRouter.authorize.contentType = 'application/json';

export async function kvTest() {
    await kv.set("user_1_session", "session_token_value");
    const session = await kv.get("user_1_session");
}


