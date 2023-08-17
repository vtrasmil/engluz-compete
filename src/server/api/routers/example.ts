import { TRPCError } from "@trpc/server";
import { kv } from "@vercel/kv";
import { Types } from "ably";
import { z } from "zod";
import { generateRandomString } from "~/components/helpers";
import getAblyClient from "~/server/ably/client";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { boggleDice, getDiceRoll, getDiceRollAsString } from "~/server/diceManager";
import { getRandomSolutionSet } from "~/server/wordListManager";
import { getRandomIntInclusive, uniqueId } from "~/utils/helpers";


const totalPlayers = 4;

const RedisObjects = {
  ActiveRoomsSet: 'ActiveRoomsSet',
  GamesPlayedSet: 'GamesPlayedSet',

}




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
      opts.ctx.redis.incr(`${userId}-score`);
      
      
      
      
    }),
  joinGame: publicProcedure
    // TODO: map room codes to gameIds in redis hash
    .input(z.object({
      'roomCode': z.string()
    }))
    .mutation(async (opts) => {
      const roomCode = opts.input.roomCode;
      const roomCodeActive = await opts.ctx.redis.sIsMember(RedisObjects.ActiveRoomsSet, roomCode);
      if (!roomCodeActive) throw new Error(`Room code not active: ${roomCode}`)
      
      
      const gameId = await opts.ctx.redis.get(`roomCode-${roomCode}:gameId`);
      if (!gameId) throw new Error(`No gameId found for room code: ${roomCode}`);

      const board = await opts.ctx.redis.get(`game:${gameId}:board`);
      if (board == null) throw new Error(`No board found for gameId: ${gameId}`);
      
      return {
        board: board,
        roomCode: opts.input.roomCode,
        gameId: gameId,
      }
    }),

  hostGame: publicProcedure
    .mutation(async (opts) => {
      let gameId: string | undefined;
      while (gameId == undefined) {
        const newGameId = uniqueId();
        const gameAdded = await opts.ctx.redis.sAdd(RedisObjects.GamesPlayedSet, newGameId);
        if (gameAdded) gameId = newGameId;
      }

      let roomCode: string | undefined;
      while (roomCode == undefined) {
        roomCode = generateRandomString(4);
        const roomCodeActive = await opts.ctx.redis.sIsMember(RedisObjects.ActiveRoomsSet, roomCode);
        if (roomCodeActive) continue;
        const roomCodeActiveAdded = await opts.ctx.redis.sAdd(RedisObjects.ActiveRoomsSet, roomCode);
        if (!roomCodeActiveAdded) throw new Error('room code not added to ActiveRoomsSet')

        const roomCodeGameIdAdded = await opts.ctx.redis.set(`roomCode-${roomCode}:gameId`, gameId);
        if (!roomCodeGameIdAdded) throw new Error('room code not added to roomCode-${roomCode}:gameId');

      }


      const board = getDiceRollAsString(boggleDice);
      const boardAdded = await opts.ctx.redis.set(`game:${gameId}:board`, board);
      if (!boardAdded) throw new Error(`Board not added to redis in game ${gameId}`);
      
      return {
        'board': board,
        'roomCode': roomCode,
        'gameId': gameId
      }
  
    }),
  getGameState: publicProcedure
    .input(
      z.object({
          gameId: z.string(),
        }))
    .query(async (opts) => {
      const gameId = opts.input.gameId;
      const board = await opts.ctx.redis.get(`game:${gameId}:board`);
      if (board == null) throw new Error(`Board not retrieved from Redis. GameID: ${gameId}`);
      return {
        'board': board
      }
    }),
});

// exampleRouter.authorize.contentType = 'application/json';

export async function kvTest() {
    await kv.set("user_1_session", "session_token_value");
    const session = await kv.get("user_1_session");
}


