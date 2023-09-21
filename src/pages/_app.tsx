import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { UserIdProvider } from "~/components/hooks/useUserIdContext";
import { getUserIdFromSessionStorage } from "~/utils/helpers";
import { CssBaseline } from "@mui/material";


import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { useIsClient } from "~/components/hooks/useIsClient";
import { configureAbly } from "@ably-labs/react-hooks";



const MyApp: AppType = ({ Component, pageProps }) => {
  const isClient = useIsClient(); // to avoid sessionStorage-related hydration errors
  if (!isClient) {
      return null;
  }
  const userId = getUserIdFromSessionStorage();

  const ablyAuthUrlHost = process.env.NEXT_PUBLIC_VERCEL_URL ?? `localhost:${process.env.PORT ?? 3000}`;
  configureAbly({
        authUrl: `http${process.env.NEXT_PUBLIC_VERCEL_URL ? 's' : ''}:\/\/${ablyAuthUrlHost}/api/createTokenRequest`,
        useTokenAuth: true,
  });

  if (userId !== undefined)
    return (
      <UserIdProvider userId={userId}>
        <CssBaseline>
          <Component {...pageProps} />
        </CssBaseline>
      </UserIdProvider>
    )
};

export default api.withTRPC(MyApp);
