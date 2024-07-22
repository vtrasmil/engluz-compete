import {z} from "zod";
import {AblyMessageType, type BeginIntermissionMessageData, type WordSubmissionResponse} from "~/components/Types";
import {ablyChannelName} from "~/server/ably/ablyHelpers";
import {getWordFromBoard, isWordValid} from "~/server/wordListManager";
import {createTRPCRouter, publicProcedure} from "../trpc";

export const gameplayRouter = createTRPCRouter({

    submitWord: publicProcedure
        .input(z.object({
            userId: z.string().min(1),
            gameId: z.string().min(1),
            cellIds: z.number().array(),
            roomCode: z.string().min(1),
        }))
        .mutation(async (opts) => {
            const { roomCode, cellIds, userId } = opts.input;
            const { redis, ably } = opts.ctx;

            const channelName = ablyChannelName(roomCode);
            const [game, room] = await Promise.all([redis.fetchGameInfo(roomCode, userId), redis.fetchRoomInfo(roomCode)]);
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
            const [game, room] = await Promise.all([redis.fetchGameInfo(roomCode, userId), redis.fetchRoomInfo(roomCode)]);
            const board = game.state.board;
            const { word, score } = getWordFromBoard(cellIds, board);

            // tell redis about confirmed word
            const players = await redis.getPlayers(roomCode);
            // TODO: put a lock on this resource
            const confirmedWords =
                await redis.addConfirmedWord(gameId, userId, word, cellIds, score, game.state.round);

            if (confirmedWords.length > players.length) {
                throw new Error(`Too many confirmed words for number of players: ${players.length} players, ${confirmedWords.length} confirmed words`);
            }

            // all players have confirmed
            return confirmedWords.length === players.length;
        }),
    fetchGameInfo: publicProcedure
        .input(z.object({
            userId: z.string().min(1),
            roomCode: z.string().min(1),
        }))
        .query(async (opts) => {
            const { userId, roomCode } = opts.input;
            const { redis } = opts.ctx;
            return await redis.fetchGameInfo(roomCode, userId);
        }),
    triggerEndOfRoundAndPublishResults: publicProcedure
        .input(z.object({
            userId: z.string().min(1),
            roomCode: z.string().min(1),
        }))
        .mutation(async (opts) => {
            const { userId, roomCode } = opts.input;
            const { redis, ably } = opts.ctx;
            const channelName = ablyChannelName(roomCode);
            const channel = ably.channels.get(channelName);
            const [game] = await Promise.all([redis.fetchGameInfo(roomCode, userId)]);

            const processEndOfRound = await redis.processEndOfRound(game, roomCode, userId, game.state.round);

            if (processEndOfRound != undefined) {
                const endOfRoundMsg: BeginIntermissionMessageData = {
                    messageType: AblyMessageType.BeginIntermission,
                    words: processEndOfRound.confirmedWords,
                    dateTimePublished: Date.now(),
                    game: processEndOfRound.updatedGameInfo,
                }
                await channel.publish(AblyMessageType.BeginIntermission, endOfRoundMsg);
            }
        }),

})