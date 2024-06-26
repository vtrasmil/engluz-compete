import {z} from "zod";
import {AblyMessageType, type EndOfRoundMessageData, type Score, type WordSubmissionResponse} from "~/components/Types";
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
            const { roomCode, cellIds } = opts.input;
            const { redis, ably } = opts.ctx;

            const channelName = ablyChannelName(roomCode);
            const channel = ably.channels.get(channelName);
            const [game, room] = await Promise.all([redis.fetchGameInfo(roomCode), redis.fetchRoomInfo(roomCode)]);
            const board = game.state.board;
            const { word, score } = getWordFromBoard(cellIds, board);
            const isValid = await isWordValid(word);
            return { wordSubmitted: word, score: score, cellIds: cellIds, isValid: isValid } satisfies WordSubmissionResponse;
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
            const players = await redis.getPlayers(roomCode);
            const confirmedWords =
                await redis.addConfirmedWord(gameId, userId, word, cellIds, score, game.state.round);

            if (confirmedWords.length > players.length) {
                throw new Error(`Too many confirmed words for number of players: ${players.length} players, ${confirmedWords.length} confirmed words`);
            }

            // all players have confirmed
            if (confirmedWords.length === players.length) {
                game.state.board = rollDice(board);
                advanceGameState(game.state);

                const updatedScores = game.scores.map((score) => {
                    const word = confirmedWords.find(word => word.userId === score.userId);
                    if (word != undefined) {
                        return {
                            ...score,
                            score: score.score += word.score,
                        } satisfies Score;
                    } else {
                        return score;
                    }
                });
                game.scores = updatedScores;

                const endOfRoundMsg: EndOfRoundMessageData = {
                    messageType: AblyMessageType.EndOfRound,
                    words: confirmedWords,
                    dateTimePublished: Date.now(),
                    game: game,
                }

                await Promise.allSettled([
                    redis.updateGameInfo(gameId, roomCode, {state: game.state, scores: updatedScores}),
                    channel.publish(AblyMessageType.EndOfRound, endOfRoundMsg)
                ]);
            }
        })

})