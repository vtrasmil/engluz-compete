import {z} from "zod";
import {AblyMessageType, AllWordsConfirmedMessageData, WordSubmittedMessageData} from "~/components/Types";
import {ablyChannelName} from "~/server/ably/ablyHelpers";
import {rollDice} from "~/server/diceManager";
import {getWordFromBoard, isWordValid} from "~/server/wordListManager";
import {createTRPCRouter, publicProcedure} from "../trpc";
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
                return { wordSubmitted: word, score: score, cellIds: cellIds };
            } else {
                throw new Error(`${word} is not valid`);
            }
        }),
    confirmWord: publicProcedure
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

            // tell redis about confirmed word
            const players = await redis.getPlayers(gameId);
            const confirmedWords =
                await redis.addConfirmedWord(gameId, userId, word, cellIds, score, game.state.round);


            if (confirmedWords.length > players.length) {
                throw new Error(`Too many confirmed words for number of players: ${players.length} players, ${confirmedWords.length} confirmed words`);
            }
            if (confirmedWords.length === players.length) {
                const allWordsConfirmedMsg: AllWordsConfirmedMessageData = {
                    messageType: AblyMessageType.AllWordsConfirmed,
                    words: confirmedWords,

                }
                await channel.publish(AblyMessageType.AllWordsConfirmed, allWordsConfirmedMsg);

                // TODO: rerolling and advancing game state
                const reroll = rollDice(board, cellIds);
                game.state.board = reroll;
                advanceGameState(game.state);
                await Promise.allSettled([
                    redis.updateGameInfo(gameId, roomCode, {state: game.state}),
                    await redis.updateGameScore(gameId, userId, score)
                ]);
            }
        })

})