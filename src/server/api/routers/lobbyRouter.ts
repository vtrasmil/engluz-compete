import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const totalPlayers = 4;

export const lobbyRouter = createTRPCRouter({
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



  hostGame: publicProcedure
    .meta({
      openapi: {
        enabled: false,
        method: 'GET',
        path: '/host-game'
      }
    })
    .mutation(async (opts) => {
      const redis = opts.ctx.redis;
      const gameId = await redis.createGameId();
      const roomCode = await redis.createRoomCode(gameId);

      return {
        roomCode: roomCode,
        gameId: gameId,
      }

    }),

  joinGame: publicProcedure
    // TODO: map room codes to gameIds in redis hash
    .input(z.object({
      roomCode: z.string().optional(),
    }))
    .mutation(async (opts) => {

      const redis = opts.ctx.redis;
      const roomCode = opts.input.roomCode;
      if (roomCode == undefined) throw new Error(`Please enter a room code`);
      const isRoomCodeActive = await redis.isRoomCodeActive(roomCode);
      if (!isRoomCodeActive) throw new Error(`Room code ${roomCode} is not currently active`);
      const gameId = await redis.getGameId(roomCode);
      if (gameId == undefined) throw new Error(`No game is associated with room code ${roomCode}`);

      return {
        roomCode: roomCode,
        gameId: gameId,
      }
    }),

  startGame: publicProcedure
    .input(z.object({
      gameId: z.string(),
    }))
    .mutation(async (opts) => {
      const redis = opts.ctx.redis;
      const boardArray = await redis.createDice(opts.input.gameId);
      const boardConfig = boardArray.map((lb, i) => (
        {
          cellId: i,
          letterBlock: lb
        }));
      return {
        board: boardConfig,
        gameId: opts.input.gameId,
      }
    }),
});




