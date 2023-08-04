import { z } from "zod";
import getAblyClient from "~/server/ably/client";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

let totalPlayers = 4;

const uniqueId = function () {
    return "id-" + totalPlayers + Math.random().toString(36).substring(2, 16);
};

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      // ablyTest();
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  getAll: publicProcedure.query(({ ctx }) => {
      return ctx.prisma.example.findMany();  
  }),
  authorize: publicProcedure.query(() => {
    const ably = getAblyClient(); // need to await
    const tokenParams = { clientId: uniqueId() };
    
    let totalPlayers = 0;

    
    // ably.auth.createTokenRequest(tokenParams, (err, tokenRequest) => {
    //     if (err) {
    //       response
    //           .status(500)
    //           .send("Error requesting token: " + JSON.stringify(err));
    //     } else {
    //       response.setHeader("Content-Type", "application/json");
    //       response.send(JSON.stringify(tokenRequest));
    //     }
    // });
  }),
  playerGuessesCorrectly: publicProcedure
    // .input(z.string())
    .mutation(async (opts) => {
      const { input } = opts;
      let numLettersPressed: number;
      if (!await opts.ctx.redis.exists('numLettersPressed')) {
        await opts.ctx.redis.set('numLettersPressed', 1);

      } else {
        // exists
        // check for null, NaN
        numLettersPressed = Number(await opts.ctx.redis.get('numLettersPressed'));
        if ([null, NaN].includes(numLettersPressed)) {
          await opts.ctx.redis.set('numLettersPressed', 1);
        } else {
          await opts.ctx.redis.set('numLettersPressed', numLettersPressed + 1);
        }
      }
      console.log(`numLettersPressed: ${Number(await opts.ctx.redis.get('numLettersPressed'))}`); 
      
      

      
      
      return {
        message: 'mutation complete',
      }
      // add a point
      
      
    }),

});


