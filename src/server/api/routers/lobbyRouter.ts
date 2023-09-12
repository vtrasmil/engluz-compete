import { TRPCError } from "@trpc/server";
import { Types } from "ably";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { toFaceUpValues } from "~/server/diceManager";



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
  
  createTokenRequest: publicProcedure
    // .input(z.object({
    //   userId: z.string()
    // }))
    .query((opts) => {
      const tokenParams = {
        clientId: 'boggle-battle-react'
      };   

      const tokenRequest = opts.ctx.ably.auth.createTokenRequest(tokenParams);
      
      return tokenRequest.then(
        (req) => undefined,
        (err: Types.ErrorInfo) => {
          throw new TRPCError({
            message: "Error requesting token: " + JSON.stringify(err),
            code: "INTERNAL_SERVER_ERROR"
          });
      });
    }),
  
      
  
  joinGame: publicProcedure
    // TODO: map room codes to gameIds in redis hash
    .input(z.object({
      roomCode: z.string(),
      userId: z.string(),
    }))
    .mutation(async (opts) => {
      

      const roomCode = opts.input.roomCode;
      const isRoomCodeActive = await opts.ctx.redis.isRoomCodeActive(opts.input.roomCode);
      if (!isRoomCodeActive) throw new Error(`Room code ${roomCode} is not currently active`);
      const gameId = await opts.ctx.redis.getGameId(roomCode);
      const board = await opts.ctx.redis.getDice(gameId);
      const faceUpValues = toFaceUpValues(board);

      return {
        board: faceUpValues,
        roomCode: opts.input.roomCode,
        gameId: gameId,
      }
    }),

  hostGame: publicProcedure
    .mutation(async (opts) => {
      const gameId = await opts.ctx.redis.createGameId();
      const roomCode = await opts.ctx.redis.createRoomCode(gameId);
      const board = await opts.ctx.redis.createDice(gameId);
      const faceUpValues = toFaceUpValues(board);
      
      return {
        'board': faceUpValues,
        'roomCode': roomCode,
        'gameId': gameId
      }
  
    }),
  
  ablySubscribeTest: publicProcedure
    .mutation(async (opts) => {
      const ably = opts.ctx.ably;
      const channel = ably.channels.get('quickstart');
      await channel.subscribe('greeting', (message) => {
          if (typeof message.data === 'string') {
              console.log('Received a greeting message in realtime: ' + message.data)
          }
      });
      await channel.publish('greeting', 'hello!');
    })
  // getGameState: publicProcedure
  //   .input(
  //     z.object({
  //         gameId: z.string(),
  //       }))
  //   .query(async (opts) => {
  //     const gameId = opts.input.gameId;
  //     const board = await opts.ctx.redis.get(`game:${gameId}:board`);
  //     if (board == null) throw new Error(`Board not retrieved from Redis. GameID: ${gameId}`);
  //     return {
  //       'board': board
  //     }
  //   }),
});




