import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { GameStartedMessageData } from "./gameplayRouter";
import { ablyChannelName } from "~/server/ably/ablyHelpers";
import { AblyMessageType } from "~/components/Board";

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
    .input(z.object({
      userId: z.string(),
      playerName: z.string(),
    }))
    .mutation(async (opts) => {
      const redis = opts.ctx.redis;
      const gameId = await redis.createGameId();
      const roomCode = await redis.createRoomCode(gameId);
      const player = await redis.createPlayer({
        userId: opts.input.userId,
        playerName: opts.input.playerName,
        isHost: true,
      }, gameId);

      return {
        roomCode: roomCode,
        gameId: gameId,
      }

    }),

  joinGame: publicProcedure
    // TODO: map room codes to gameIds in redis hash
    .input(z.object({
      roomCode: z.string().optional(),
      userId: z.string(),
      playerName: z.string(),
    }))
    .mutation(async (opts) => {

      const redis = opts.ctx.redis;
      const roomCode = opts.input.roomCode;
      if (roomCode == undefined) throw new Error(`Please enter a room code`);
      const isRoomCodeActive = await redis.isRoomCodeActive(roomCode);
      if (!isRoomCodeActive) throw new Error(`Room code ${roomCode} is not currently active`);
      const gameId = await redis.getGameId(roomCode);
      if (gameId == undefined) throw new Error(`No game is associated with room code ${roomCode}`);

      const player = await redis.createPlayer({
        userId: opts.input.userId,
        playerName: opts.input.playerName,
        isHost: false,
      }, gameId);

      return {
        roomCode: roomCode,
        gameId: gameId,
      }
    }),

  startGame: publicProcedure
    .input(z.object({
      userId: z.string(),
      gameId: z.string(),
      roomCode: z.string(),
    }))
    .mutation(async (opts) => {
      const redis = opts.ctx.redis;
      const boardArray = await redis.createDice(opts.input.gameId);
      const boardConfig = boardArray.map((lb, i) => (
        {
          cellId: i,
          letterBlock: lb
        }));
      const ably = opts.ctx.ably;
      const gameStartedMsg: GameStartedMessageData = {
        userId: opts.input.userId,
        initBoard: boardConfig,
        messageType: AblyMessageType.GameStarted
      }
      const channel = ably.channels.get(ablyChannelName(opts.input.roomCode));
      await channel.publish(AblyMessageType.GameStarted, gameStartedMsg);
      return {
        board: boardConfig,
        gameId: opts.input.gameId,
      }
    }),
});




