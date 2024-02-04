import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { GameStartedMessageData } from "./gameplayRouter";
import { ablyChannelName } from "~/server/ably/ablyHelpers";
import { AblyMessageType } from "~/components/Types";
import shuffleArrayCopy from "~/components/helpers";
import { basicPlayerInfoSchema } from "~/components/Types";

const totalPlayers = 4;

export const lobbyRouter = createTRPCRouter({
  hello: publicProcedure
    // using zod schema to validate and infer input values
    .input(
      z.object({
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
      const { redis } = opts.ctx;
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
      userId: z.string(),
      playerName: z.string(),
    }))
    .mutation(async (opts) => {

      const { redis } = opts.ctx;
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
      userId: z.string(),
      gameId: z.string(),
      roomCode: z.string(),
      players: basicPlayerInfoSchema.array(),
    }))
    .mutation(async (opts) => {
      const { redis, ably } = opts.ctx;
      const { players, roomCode } = opts.input;
      const boardArray = await redis.createDice(opts.input.gameId);
      const boardConfig = boardArray.map((lb, i) => (
        {
          cellId: i,
          letterBlock: lb
        }));

      const playersOrdered = shuffleArrayCopy(players);
      const gameStartedMsg: GameStartedMessageData = {
        userId: opts.input.userId,
        messageType: AblyMessageType.GameStarted,

        initBoard: boardConfig,
        players: playersOrdered
      }

      const playerIds = players.map(p => p.userId);
      await redis.initGameScore(opts.input.gameId, playersOrdered);

      const channelName = ablyChannelName(roomCode);
      const channel = ably.channels.get(channelName);
      await channel.publish(AblyMessageType.GameStarted, gameStartedMsg);
    }),
});




