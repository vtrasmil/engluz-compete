import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { UserIdProvider } from "~/components/useUserIdContext";
import { uniqueId } from "~/utils/helpers";

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

let userId: string;
if (typeof window !== 'undefined') {
  const sessionUserId = sessionStorage.getItem('userId');
  userId = sessionUserId ?? uniqueId();
  if (sessionUserId !== userId)
    sessionStorage.setItem('userId', userId);
}

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <UserIdProvider userId={userId}>
      <Component {...pageProps} />
    </UserIdProvider>
  )
};

export default api.withTRPC(MyApp);
