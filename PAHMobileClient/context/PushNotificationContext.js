import React, {createContext, useState} from 'react';

const PushNotificationContext = createContext(null);
const {Provider} = PushNotificationContext;

const PushNotificationProvider = ({children}) => {
  const [messageState, setMessageState] = useState([]);

  return (
    <Provider
      value={{
        messageState,
        setMessageState
      }}>
      {children}
    </Provider>
  );
};

export {PushNotificationContext, PushNotificationProvider};