import messaging from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';
export async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        console.log('Authorization status:', authStatus);
    }
}

export async function getFCMToken() {
    const fcmToken = await messaging().getToken();
    console.log(fcmToken);
}

export function subscribe(topicName) {
    messaging()
        .subscribeToTopic(topicName)
        .then(() => console.log('Subscribed to topic ' + topicName));
}

export function unsubscribe(topicName) {
    messaging()
        .unsubscribeFromTopic(topicName)
        .then(() => console.log('Unsubscribed from topic ' + topicName));
}

export const NotificationListener = () => {
    messaging().onNotificationOpenedApp(remoteMessage => {
        console.log(
            'Notification caused app to open from background state:',
            remoteMessage.notification,
        );
    });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Message handled in the background!', remoteMessage);
      });

    messaging()
        .getInitialNotification()
        .then(remoteMessage => {
            if (remoteMessage) {
                console.log(
                    'Notification caused app to open from quit state:',
                    remoteMessage.notification,
                );
            }
        });

    messaging().onMessage(async remoteMessage => {
        console.log("notification on foreground state....", remoteMessage);
        Toast.show({
            type: 'success',
            text1: remoteMessage.notification.title,
            text2: remoteMessage.notification.body,
            position: 'top',
            autoHide: true,
            visibilityTime: 2000
        });
    })
}