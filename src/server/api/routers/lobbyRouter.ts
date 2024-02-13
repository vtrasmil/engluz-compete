import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { GameStartedMessageData } from "~/components/Types";
import { ablyChannelName } from "~/server/ably/ablyHelpers";
import { AblyMessageType } from "~/components/Types";
import shuffleArrayCopy from "~/components/helpers";
import { simplePlayerInfoSchema } from "~/components/Types";
import { MAX_NUM_PLAYERS_PER_ROOM, UNKNOWN_ERROR_MESSAGE } from "~/components/Constants";

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
      const { userId, playerName } = opts.input;
      let gameId, roomCode;
      try {
        gameId = await redis.createGameId();
        roomCode = await redis.createRoomCode(gameId);
        await redis.createRoomInfo(
          roomCode,
          {
            userId: userId,
            playerName: playerName,
            isHost: true
          }
        );
      } catch (e) {
        throw new Error(UNKNOWN_ERROR_MESSAGE);
      }
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
      const { roomCode, userId, playerName } = opts.input;
      if (roomCode == undefined) throw new Error(`Please enter a room code`);

      const isRoomCodeActive = await redis.isRoomCodeActive(roomCode);
      if (!isRoomCodeActive) throw new Error(`Room code ${roomCode} is not currently active`);

      const gameId = await redis.getGameId(roomCode);
      if (gameId == undefined) throw new Error(`No game is associated with room code ${roomCode}`);

      if ((await redis.fetchRoomInfo(roomCode)).players.length >= MAX_NUM_PLAYERS_PER_ROOM)
        throw new Error(`Max. number of players per room is ${MAX_NUM_PLAYERS_PER_ROOM}`);

      try {
        await redis.addPlayer({
          userId: userId,
          playerName: playerName,
          isHost: false
        }, gameId);
      } catch (e) {
        throw new Error(UNKNOWN_ERROR_MESSAGE);
      }
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
      players: simplePlayerInfoSchema.array(),
    }))
    .mutation(async (opts) => {
      const { redis, ably } = opts.ctx;
      const { players, roomCode, gameId, userId } = opts.input;
      const channelName = ablyChannelName(roomCode);
      let game;
      try {
        game = await redis.createGameInfo(gameId, roomCode);
        const playersOrdered = shuffleArrayCopy(players);
        const gameStartedMsg: GameStartedMessageData = {
          userId: userId,
          messageType: AblyMessageType.GameStarted,
          initBoard: game.state.board,
          players: playersOrdered
        }
        await redis.initGameScore(gameId, playersOrdered);
        const channel = ably.channels.get(channelName);
        await channel.publish(AblyMessageType.GameStarted, gameStartedMsg);
      } catch (e) {
        throw new Error(UNKNOWN_ERROR_MESSAGE);
      }

    }),
  fetchGameInfo: publicProcedure
    .input(z.object({
      gameId: z.string().optional()
    }))
    .query(async (opts) => {
      const { gameId } = opts.input;
      const { redis } = opts.ctx;
      if (gameId == undefined) throw new Error('gameId should not be undefined - check gameInfoQuery')
      return await redis.fetchGameInfo(gameId);
    }),
  fetchRoomInfo: publicProcedure
    .input(z.object({
      roomCode: z.string().optional()
    }))
    .query(async (opts) => {
      const { roomCode } = opts.input;
      const { redis } = opts.ctx;
      if (roomCode == undefined) throw new Error('gameId should not be undefined - check roomInfoQuery')
      return await redis.fetchRoomInfo(roomCode);
    }),
});