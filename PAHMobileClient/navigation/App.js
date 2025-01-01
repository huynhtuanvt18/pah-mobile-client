import React, { useContext, useCallback, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UITabs from './UITabs';
import {
    Cart,
    ListingDetail,
    Login,
    Register,
    Search,
    ListingDescription,
    ListingFeedback,
    Profile,
    AuctionDetail,
    AuctionDescription,
    AuctionBidding,
    BidderAuctionHistoryListing,
    SellerAuctionHistoryListing,
    BiddingHistory,
    CheckoutNow,
    CheckoutCart,
    CheckoutComplete,
    EditAccount,
    Address,
    AddAddress,
    Wallet,
    PaymentResult,
    EditAddress,
    ProductListing,
    BuyerOrderList,
    BuyerOrderDetail,
    SellerOrderList,
    SellerOrderDetail,
    AuctionDetailSeller,
    SellerProductListing,
    ListingDetailSeller,
    TransactionHistory,
    TransactionDetail,
    EmailConfirm,
    ForgetPassword,
    EditProduct,
    ChangePassword,
    Withdraw,
    WithdrawHistory,
    UserAgreement,
    PrivacyPolicy
} from '../screens';
import { uuidv4 } from '../utilities/UUIDGenerate';
import { AuthContext } from '../context/AuthContext';
import { SignalRContext } from '../context/SignalRContext';
import { PushNotificationContext } from '../context/PushNotificationContext';
import * as Keychain from 'react-native-keychain';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { fonts, fontSizes } from '../constants';
import SplashScreen from 'react-native-splash-screen';
import { Provider } from 'react-redux';
import CartStore from '../stores/CartStore';
import { HubConnectionBuilder } from '@microsoft/signalr';
import config from '../config';
import axios from 'axios';
const Stack = createNativeStackNavigator();
import { requestUserPermission, NotificationListener, subscribe, unsubscribe  } from '../utilities/PushNotificationHelper';
const toastConfig = {
    success: (props) => (
        <BaseToast
            {...props}
            style={{ borderLeftColor: 'green' }}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{
                fontSize: fontSizes.h5,
                fontFamily: fonts.MontserratRegular
            }}
        />
    ),
    error: (props) => (
        <ErrorToast
            {...props}
            style={{ borderLeftColor: 'red' }}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{
                fontSize: fontSizes.h5,
                fontFamily: fonts.MontserratRegular
            }}
        />
    ),
};

function App(props) {
    const authContext = useContext(AuthContext);
    const signalRContext = useContext(SignalRContext);
    const pushNotificationContext= useContext(PushNotificationContext);

    const loadJWT = useCallback(async () => {
        try {
            const value = await Keychain.getGenericPassword();
            const jwt = JSON.parse(value.password);

            if (jwt.accessToken && jwt.refreshToken) {
                const refreshToken = async () => {
                    console.log('refresh auth logic');
                    const data = {
                        accessToken: jwt.accessToken,
                        refreshToken: jwt.refreshToken,
                    };
                    const options = {
                        method: 'POST',
                        data,
                        url: `${config.BASE_API_URL}/refresh`,
                    };

                    try {
                        const tokenRefreshResponse = await axios(options);

                        authContext.setAuthState({
                            refreshToken: tokenRefreshResponse.data.data.refreshToken,
                            accessToken: tokenRefreshResponse.data.data.accessToken,
                            authenticated: true
                        });

                        await Keychain.setGenericPassword(
                            'token',
                            JSON.stringify({
                                accessToken: tokenRefreshResponse.data.data.accessToken,
                                refreshToken: tokenRefreshResponse.data.data.refreshToken,
                            }));
                    } catch (e) {
                        console.log('refresh token fail');
                        authContext.logout();
                    }
                };

                refreshToken();
            } else {
                authContext.setAuthState({
                    accessToken: jwt.accessToken || null,
                    refreshToken: jwt.refreshToken || null,
                    authenticated: jwt.accessToken !== null,
                });
            }

            console.log(jwt);
        } catch (error) {
            console.log(`Keychain Error: ${error.message}`);
            authContext.setAuthState({
                accessToken: null,
                refreshToken: null,
                authenticated: false,
            });
        }
    }, []);

    useEffect(() => {
        loadJWT();
    }, [loadJWT]);

    useEffect(() => {
        if (authContext?.authState.authenticated) {
            const connect = new HubConnectionBuilder()
                .withUrl(config.SIGNAL_R_URL, { accessTokenFactory: () => authContext.authState.accessToken })
                .withAutomaticReconnect()
                .build();

            signalRContext?.setConnection(connect);
        } else if (signalRContext?.connection) {
            signalRContext.connection.stop()
                .then(() => {
                    console.log('stop connection');
                })
                .catch(err => {
                    console.log(err);
                })
        }
    }, [authContext?.authState.authenticated]);

    useEffect(() => {
        SplashScreen.hide();
        requestUserPermission();
        NotificationListener();
    }, []);

    useEffect(() => {
        if (signalRContext?.connection) {
            signalRContext.connection.start()
                .then(() => {
                    console.log('connect to chatHub successfully');
                })
                .catch(err => {
                    console.log('connect to hub fail');
                    console.log(err);
                })
        }

        signalRContext?.connection?.on("ReceiveMessage", function (user, message) {
            console.log(`'${message}' - ${user}`);
        });

        signalRContext?.connection?.on("ReceiveSubscribe", function (message) {
            subscribe(message);
            pushNotificationContext?.setMessageState(oldState => [...oldState, message]);
        });

        signalRContext?.connection?.on("ReceiveNewBid", function (userName, auctionTitle) {
            console.log(`${userName} Da dat bid moi trong cuoc dau gia '${auctionTitle}'`);
            Toast.show({
                type: 'success',
                text1: `${auctionTitle}`,
                text2: `${userName} đã trả giá cao nhất`,
                position: 'top',
                autoHide: true,
                visibilityTime: 2000
            });
        });

        // signalRContext?.connection?.on("ReceiveAuctionOpen", function (auctionTitle) {
        //     console.log(`'${auctionTitle}' da mo ra`);
        //     Toast.show({
        //         type: 'success',
        //         text1: `${auctionTitle}`,
        //         text2: `Cuộc đấu giá đã bắt đầu, hãy tham gia nào!`,
        //         position: 'top',
        //         autoHide: true,
        //         visibilityTime: 2000
        //     });
        // });

        // signalRContext?.connection?.on("ReceiveAuctionEnd", function (auctionTitle) {
        //     console.log(`'${auctionTitle}' da ket thuc`);
        //     Toast.show({
        //         type: 'success',
        //         text1: `${auctionTitle}`,
        //         text2: `Cuộc đấu giá đã kết thúc, hãy cùng xem người thắng cuộc nào!`,
        //         position: 'top',
        //         autoHide: true,
        //         visibilityTime: 2000
        //     });
        // });

        // signalRContext?.connection?.on("ReceiveAuctionAboutToEnd", function (auctionTitle) {
        //     console.log(`'${auctionTitle}' sap ket thuc`);
        //     Toast.show({
        //         type: 'success',
        //         text1: `${auctionTitle}`,
        //         text2: `Cuộc đấu giá chuẩn bị kết thúc!`,
        //         position: 'top',
        //         autoHide: true,
        //         visibilityTime: 2000
        //     });
        // });

    }, [signalRContext?.connection]);

    return (
        <Provider store={CartStore}>
            <NavigationContainer>
                <Stack.Navigator
                    screenOptions={{
                        headerShown: false
                    }}>
                    <Stack.Screen name={"UITabs"} component={UITabs} />
                    <Stack.Screen name={"Search"} component={Search} />
                    <Stack.Screen name={"ListingDetail"} component={ListingDetail}
                        getId={() => uuidv4()} />
                    <Stack.Screen name={"Cart"} component={Cart} />
                    <Stack.Screen name={"ListingDescription"} component={ListingDescription} />
                    <Stack.Screen name={"ListingFeedback"} component={ListingFeedback} />
                    <Stack.Screen name={"Profile"} component={Profile} />
                    <Stack.Screen name={"AuctionDetail"} component={AuctionDetail} />
                    <Stack.Screen name={"AuctionDescription"} component={AuctionDescription} />
                    <Stack.Screen name={"AuctionBidding"} component={AuctionBidding} />
                    <Stack.Screen name={"BiddingHistory"} component={BiddingHistory} />
                    {authContext?.authState?.authenticated ? (
                        <>
                            <Stack.Screen name={"Address"} component={Address} />
                            <Stack.Screen name={"AddAddress"} component={AddAddress} />
                            <Stack.Screen name={"EditAddress"} component={EditAddress} />
                            <Stack.Screen name={"CheckoutNow"} component={CheckoutNow} />
                            <Stack.Screen name={"CheckoutCart"} component={CheckoutCart} />
                            <Stack.Screen name={"CheckoutComplete"} component={CheckoutComplete} />
                            <Stack.Screen name={"EditAccount"} component={EditAccount} />
                            <Stack.Screen name={"Wallet"} component={Wallet} />
                            <Stack.Screen name={"PaymentResult"} component={PaymentResult} />
                            <Stack.Screen name={"BuyerOrderList"} component={BuyerOrderList} />
                            <Stack.Screen name={"BuyerOrderDetail"} component={BuyerOrderDetail} />
                            <Stack.Screen name={"SellerOrderList"} component={SellerOrderList} />
                            <Stack.Screen name={"SellerOrderDetail"} component={SellerOrderDetail} />
                            <Stack.Screen name={"ProductListing"} component={ProductListing} />
                            <Stack.Screen name={"BidderAuctionHistoryListing"} component={BidderAuctionHistoryListing} />
                            <Stack.Screen name={"SellerAuctionHistoryListing"} component={SellerAuctionHistoryListing} />
                            <Stack.Screen name={"AuctionDetailSeller"} component={AuctionDetailSeller} />
                            <Stack.Screen name={"SellerProductListing"} component={SellerProductListing} />
                            <Stack.Screen name={"ListingDetailSeller"} component={ListingDetailSeller} />
                            <Stack.Screen name={"TransactionHistory"} component={TransactionHistory} />
                            <Stack.Screen name={"TransactionDetail"} component={TransactionDetail} />
                            <Stack.Screen name={"EditProduct"} component={EditProduct} />
                            <Stack.Screen name={"ChangePassword"} component={ChangePassword} />
                            <Stack.Screen name={"Withdraw"} component={Withdraw} />
                            <Stack.Screen name={"WithdrawHistory"} component={WithdrawHistory} />
                            <Stack.Screen name={"UserAgreement"} component={UserAgreement} />
                            <Stack.Screen name={"PrivacyPolicy"} component={PrivacyPolicy} />
                        </>
                    ) : (
                        <>
                            <Stack.Screen name={"Login"} component={Login} />
                            <Stack.Screen name={"Register"} component={Register} />
                            <Stack.Screen name={"EmailConfirm"} component={EmailConfirm} />
                            <Stack.Screen name={"ForgetPassword"} component={ForgetPassword} />
                            <Stack.Screen name={"UserAgreement"} component={UserAgreement} />
                            <Stack.Screen name={"PrivacyPolicy"} component={PrivacyPolicy} />
                        </>
                    )}
                </Stack.Navigator>
            </NavigationContainer>
            <Toast config={toastConfig} />
        </Provider>
    )
}

export default App;
