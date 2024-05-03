import { z } from "zod";
import type { DiceSwappedMessageData, WordSubmittedMessageData } from "~/components/Types";
import { AblyMessageType, DragMode } from "~/components/Types";
import { ablyChannelName } from "~/server/ably/ablyHelpers";
import { rollDice } from "~/server/diceManager";
import { getWordFromBoard, isWordValid } from "~/server/wordListManager";
import { swapCells } from "~/utils/helpers";
import { createTRPCRouter, publicProcedure } from "../trpc";
import advanceGameState from "../gameState";

export const gameplayRouter = createTRPCRouter({

    submitWord: publicProcedure
        .input(z.object({
            userId: z.string().min(1),
            gameId: z.string().min(1),
            cellIds: z.number().array(),
            roomCode: z.string().min(1),
        }))
        .mutation(async (opts) => {
            const { userId, gameId, roomCode, cellIds } = opts.input;
            const { redis, ably } = opts.ctx;

            const channelName = ablyChannelName(roomCode);
            const channel = ably.channels.get(channelName);
            const [game, room] = await Promise.all([redis.fetchGameInfo(roomCode), redis.fetchRoomInfo(roomCode)]);
            const board = game.state.board;
            const { word, score } = getWordFromBoard(cellIds, board);
            const isValid = await isWordValid(word);
            if (isValid) {
                const reroll = rollDice(board, cellIds);
                game.state.board = reroll;
                advanceGameState(game.state, room.players);
                await redis.updateGameInfo(gameId, roomCode, { state: game.state });

                const newScores = await redis.updateGameScore(gameId, userId, score);
                const wordSubmittedMsg: WordSubmittedMessageData = {
                    userId: userId,
                    messageType: AblyMessageType.WordSubmitted,
                    game: game,
                    word: word,
                    sourceCellIds: cellIds,
                    newScores: newScores,
                    isValid: true,
                    score: score,
                }
                await channel.publish(AblyMessageType.WordSubmitted, wordSubmittedMsg);
                return { isValid: true, wordSubmitted: word };
            } else {
                const wordSubmittedMsg: WordSubmittedMessageData = {
                    userId: userId,
                    messageType: AblyMessageType.WordSubmitted,
                    word: word,
                    sourceCellIds: cellIds,
                    isValid: false,
                }
                await channel.publish(AblyMessageType.WordSubmitted, wordSubmittedMsg);
                return { isValid: false, wordSubmitted: word };
            }
        }),
})