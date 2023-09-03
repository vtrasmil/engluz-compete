import { TRPCError } from "@trpc/server";
import { Types } from "ably";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { toFaceUpValues } from "~/server/diceManager";

import { uniqueId } from "~/utils/helpers";
import Ably from "ably/promises";
import { env } from "~/env.mjs";


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
      
      // const userId = opts.input.userId;
      // const userId = uniqueId();
      // const client = new Ably.Realtime(env.ABLY_API_KEY);
      const tokenParams = {
        clientId: 'boggle-battle-react'
      };   

      const authOptions = {

      }

      const tokenRequest = opts.ctx.ably.auth.createTokenRequest(tokenParams);
      // const tokenRequest = client.auth.createTokenRequest(tokenParams);
      
      return tokenRequest.then(
        (req) => {
          // response.setHeader("Content-Type", "application/json");
          console.log(`Token request created with clientId: ${req.clientId}`);
          // return req;
        },
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




