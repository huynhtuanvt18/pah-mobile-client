import React, {createContext, useState} from 'react';

const SignalRContext = createContext(null);
const {Provider} = SignalRContext;

const SignalRProvider = ({children}) => {
  const [connection, setConnection] = useState();

  return (
    <Provider
      value={{
        connection,
        setConnection
      }}>
      {children}
    </Provider>
  );
};

export {SignalRContext, SignalRProvider};