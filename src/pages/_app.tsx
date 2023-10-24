import { type AppType } from "next/app";
import { api, getBaseUrl } from "~/utils/api";
import "~/styles/globals.css";
import { UserIdProvider } from "~/components/hooks/useUserIdContext";
import { getUserIdFromSessionStorage } from "~/utils/helpers";
import { CssBaseline } from "@mui/material";
import { DndProvider, usePreview } from 'react-dnd-multi-backend';
import { HTML5toTouch } from 'rdndmb-html5-to-touch'; // or any other pipeline



import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { useIsClient } from "~/components/hooks/useIsClient";
import { configureAbly } from "@ably-labs/react-hooks";
import { DraggedLetter } from "~/components/LetterBlock";
import { CSSProperties } from "react";

const MyDragPreview = () => {
  const preview = usePreview<DraggedLetter, HTMLDivElement>();
  if (!preview.display) {
    return null;
  }
  const { itemType, item, style } = preview;
  const newStyle: CSSProperties = {...style, width: '50px', height: '50px'}
  return (
    <div className="item-list__item border border-gray-400" style={newStyle}>
      <div className={'w-full h-full flex justify-center items-center'}>{item.letters[0]}</div>
    </div>
  )
}

const MyApp: AppType = ({ Component, pageProps }) => {
  const isClient = useIsClient(); // to avoid sessionStorage-related hydration errors
  if (!isClient) {
      return null;
  }
  const userId = getUserIdFromSessionStorage();

  configureAbly({
    authUrl: `${getBaseUrl()}/api/createTokenRequest`,
        useTokenAuth: true,
  });

  if (userId !== undefined)
    return (

      <DndProvider options={HTML5toTouch}>
        <UserIdProvider userId={userId}>
          <CssBaseline>
            {<MyDragPreview />}
            <Component {...pageProps} />
          </CssBaseline>
        </UserIdProvider>
      </DndProvider>
    )
};

export default api.withTRPC(MyApp);
