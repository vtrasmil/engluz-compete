import { appRouter } from "~/server/api/root";
import { lobbyRouter } from "~/server/api/routers/lobbyRouter";
import { api } from "~/utils/api";
import { getUserIdFromSessionStorage } from "~/utils/helpers";

export default function AblyAuthorization() {
    const userId = getUserIdFromSessionStorage();
    if (userId === undefined) return;
    const { isLoading, isError, data, error } = api.lobby.auth.useQuery({ userId: userId });
}
