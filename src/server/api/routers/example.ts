import { TRPCError } from "@trpc/server";
import { kv } from "@vercel/kv";
import { Types } from "ably";
import { z } from "zod";
import getAblyClient from "~/server/ably/client";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";


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

});

// exampleRouter.authorize.contentType = 'application/json';

export async function kvTest() {
    await kv.set("user_1_session", "session_token_value");
    const session = await kv.get("user_1_session");
}


