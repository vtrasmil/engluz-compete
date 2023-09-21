import React from 'react';
import { ReactNode } from 'react';
import { createContext, useContext } from 'react';

// TODO: use generic context instead of setting default with non-null assertion 
// https://medium.com/@rivoltafilippo/typing-react-context-to-avoid-an-undefined-default-value-2c7c5a7d5947
const UserIdContext = createContext<string>(undefined!);

interface UserIdProviderProps {
  children?: ReactNode,
  userId: string;
}

const UserIdProvider = ({children, userId}:UserIdProviderProps) => {
  return <UserIdContext.Provider value={userId}>{children}</UserIdContext.Provider>;
}

const useUserIdContext = () => {
  return useContext(UserIdContext);
};

export { UserIdProvider, useUserIdContext };