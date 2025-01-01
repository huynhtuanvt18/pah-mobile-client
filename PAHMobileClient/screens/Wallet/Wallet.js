import React, { useContext, useState, useEffect } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    Image,
    TextInput,
    NativeModules,
    NativeEventEmitter,
    ActivityIndicator,
    RefreshControl,
    ScrollView
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { AxiosContext } from '../../context/AxiosContext';
import { colors, fontSizes, fonts } from '../../constants';
import IconFeather from 'react-native-vector-icons/Feather';
import Modal from 'react-native-modal';
import CryptoJS from 'crypto-js';
import {
    Account as AccountRepository,
    Wallet as WalletRepository
} from '../../repositories';
import config from '../../config';
import { numberWithCommas } from '../../utilities/PriceFormat';
import { useIsFocused } from '@react-navigation/native';

const { PayZaloBridge } = NativeModules;

const payZaloBridgeEmitter = new NativeEventEmitter(PayZaloBridge);

function Wallet(props) {
    //// AUTH AND NAVIGATION
    // Auth Context
    const authContext = useContext(AuthContext);
    const axiosContext = useContext(AxiosContext);

    // Navigation
    const { navigation, route } = props;

    // Function of navigate to/back
    const { navigate, goBack } = navigation;

    // On focus
    const isFocused = useIsFocused();

    //// DATA
    // User
    const [userProfile, setUserProfile] = useState({});

    // Wallet
    const [wallet, setWallet] = useState({});
    const [appidRequest, setAppidRequest] = useState(0);
    const [apptransidRequest, setApptransidRequest] = useState('');
    const [hmacRequest, setHmacRequest] = useState('');
    // Payment methods
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState({
        id: '',
        text: ''
    });
    const [paymentMethods, setPaymentMethods] = useState([
        {
            id: 'ZALOPAY',
            text: 'ZaloPay'
        }
    ]);

    // Data for loading and refreshing
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // modal data
    const [topupModal, setTopupModal] = useState(false);

    // Payment
    const [topupAmount, setTopupAmount] = useState('20000');
    const [token, setToken] = useState('')
    const [returncode, setReturnCode] = useState(0)


    let appTransIdTemp = '';

    //// FUNCTION

    // Get current time for transaction id
    function getCurrentDateYYMMDD() {
        const todayDate = new Date().toISOString().slice(2, 10);
        return todayDate.split('-').join('');
    }

    // topup function
    async function payOrder() {
        setIsLoadingPayment(true);
        let apptransid = getCurrentDateYYMMDD() + '_' + new Date().getTime()

        let appid = 2553
        let amount = parseInt(topupAmount)
        let appuser = "PAHUser"
        let apptime = (new Date).getTime()
        let embeddata = "{}"
        let item = "[]"
        let description = "Nạp tiền vào ví PAH"
        let hmacInput = appid + "|" + apptransid + "|" + appuser + "|" + amount + "|" + apptime + "|" + embeddata + "|" + item
        let mac = CryptoJS.HmacSHA256(hmacInput, "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL")

        let hmacInput2 = appid + "|" + apptransid + "|" + "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL";
        let mac2 = CryptoJS.HmacSHA256(hmacInput2, "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL")
        console.log('====================================');
        console.log("hmacInput: " + hmacInput);
        console.log("mac: " + mac)
        console.log('====================================');
        console.log('====================================');
        console.log("hmacInput2: " + hmacInput2);
        console.log("mac2: " + mac2)
        console.log('====================================');

        // Set state
        setAppidRequest(appid);
        setApptransidRequest(apptransid);
        setHmacRequest("" + mac2);
        appTransIdTemp = apptransid;
        var order = {
            'app_id': appid,
            'app_user': appuser,
            'app_time': apptime,
            'amount': amount,
            'app_trans_id': apptransid,
            'embed_data': embeddata,
            'item': item,
            'description': description,
            'mac': mac
        }

        console.log(order)

        let formBody = []
        for (let i in order) {
            var encodedKey = encodeURIComponent(i);
            var encodedValue = encodeURIComponent(order[i]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");

        await fetch(`${config.ZALOPAY_SB_API}/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: formBody
        })
            .then(response => response.json())
            .then(resJson => {
                setToken(resJson.zp_trans_token);
                var payZP = NativeModules.PayZaloBridge;
                payZP.payOrder(resJson.zp_trans_token);
            })
            .catch((error) => {
                console.log("error ", error)
            });
    }

    function topup() {
        WalletRepository.topup(axiosContext, {
            topup: topupAmount,
            appId: appidRequest,
            appTransId: apptransidRequest,
            mac: hmacRequest
        })
            .then(response => {
                setIsLoadingPayment(false);
                setTopupModal(false);
                navigate('PaymentResult', { returnCode: 1 })
            })
            .catch(err => {
                console.log(err);
                setIsLoadingPayment(false);
                setTopupModal(false);
                navigate('PaymentResult', { returnCode: 2 })
            })
    }

    // validating
    const validationTopupAmount = () => parseInt(topupAmount) >= 20000;
    const validationAll = () => (validationTopupAmount() && selectedPaymentMethod.id !== '');

    // Fetch user data and wallet data
    function initData() {
        setIsLoading(true);

        // Get User
        const promiseUser = AccountRepository.getInfoCurrentUser(axiosContext)
            .then(response => {
                setUserProfile(response);
            })

        // Get Wallet
        const promiseWallet = WalletRepository.getWalletCurrentUser(axiosContext)
            .then(response => {
                setWallet(response);
            });

        Promise.all([promiseUser, promiseWallet])
            .then((values) => {
                setIsLoading(false);
            })
            .catch(error => {
                setIsLoading(false);
            });
    }

    useEffect(() => {
        const subscription = payZaloBridgeEmitter.addListener(
            'EventPayZalo',
            (data) => {
                // 1: SUCCESS, -1: FAILED, 4: CANCELLED
                // If returncode = 1, add money to wallet
                if (data.returnCode == 1) {
                    //topup();
                    setReturnCode(data.returnCode)
                }
                else {
                    setIsLoadingPayment(false);
                    setTopupModal(false);
                    navigate('PaymentResult', { returnCode: data.returnCode })
                }
            }
        );

        // Init data
        initData()
    }, [isFocused])

    useEffect(() => {
        if (returncode == 1) {
            topup();
        }
    }, [returncode]);

    // Scroll view refresh
    const onRefresh = () => {
        setRefreshing(true);
        initData();
        setRefreshing(false);
    };

    return <View style={styles.container}>
        {/* Fixed screen title: Wallet */}
        <View style={styles.titleContainer}>
            <TouchableOpacity style={styles.iconButton}
                onPress={() => {
                    goBack()
                }}>
                <IconFeather name='x' size={20} color={'black'} />
            </TouchableOpacity>
            <Text style={styles.titleText}>Ví PAH</Text>
        </View>

        {isLoading ? <View style={{
            flex: 1,
            justifyContent: 'center'
        }}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View> : <ScrollView style={{ flex: 1 }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            {/* User profile */}
            <View style={{
                flexDirection: 'row',
                gap: 15,
                paddingHorizontal: 25,
                paddingVertical: 15,
                backgroundColor: colors.grey
            }}>
                <Image source={{ uri: userProfile.profilePicture }}
                    style={{
                        resizeMode: 'cover',
                        width: 75,
                        height: 75,
                        borderRadius: 50
                    }} />
                <View style={{ gap: 2 }}>
                    <Text style={{
                        color: 'black',
                        fontFamily: fonts.MontserratBold,
                        fontSize: fontSizes.h3
                    }}>{userProfile.name}</Text>
                    <Text style={{
                        color: 'black',
                        fontFamily: fonts.MontserratMedium,
                        fontSize: fontSizes.h4
                    }}>{userProfile.email}</Text>
                </View>
            </View>

            {/* Wallet information complete */}
            <View style={{
                marginHorizontal: 25,
                marginTop: 15
            }}>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginVertical: 10
                }}>
                    <Text style={{
                        color: colors.darkGreyText,
                        fontFamily: fonts.MontserratMedium,
                        fontSize: fontSizes.h3,
                    }}>Số dư khả dụng</Text>
                    <Text style={{
                        color: 'black',
                        fontFamily: fonts.MontserratMedium,
                        fontSize: fontSizes.h3,
                    }}>{numberWithCommas(wallet.availableBalance)} VNĐ</Text>
                </View>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                }}>
                    <Text style={{
                        color: colors.darkGreyText,
                        fontFamily: fonts.MontserratMedium,
                        fontSize: fontSizes.h3,
                    }}>Số dư đang bị khóa</Text>
                    <Text style={{
                        color: 'black',
                        fontFamily: fonts.MontserratMedium,
                        fontSize: fontSizes.h3,
                    }}>{numberWithCommas(wallet.lockedBalance)} VNĐ</Text>
                </View>
            </View>

            <View style={{
                flex: 1,
                marginTop: 50,
                marginBottom: 15
            }}>
                <Text style={{
                    fontFamily: fonts.MontserratMedium,
                    fontSize: fontSizes.h5,
                    color: colors.darkGreyText,
                    marginHorizontal: 25
                }}>* Số dư bị khóa là lượng tiền bạn đã sử dụng để tham gia vào các cuộc đấu giá.
                    Lượng tiền này sẽ bị khóa cho đến khi cuộc đấu giá đó kết thúc hoặc bạn rút khỏi cuộc đấu giá.</Text>

                <TouchableOpacity style={styles.primaryButton}
                    onPress={() => setTopupModal(!topupModal)}>
                    <Text style={styles.primaryButtonText}>Nạp tiền vào ví</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton}
                    onPress={() => {navigate('Withdraw') }}>
                    <Text style={styles.secondaryButtonText}>Rút tiền khỏi ví</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>}

        {/* Top up modal */}
        <Modal
            animationIn="slideInRight"
            animationOut="slideOutRight"
            isVisible={topupModal}
            onRequestClose={() => {
                setTopupModal(!topupModal);
            }}
            style={{ margin: 0 }}>
            <View style={{
                flex: 1,
                backgroundColor: 'white'
            }}>
                {/* Title */}
                <View style={styles.titleContainer}>
                    <TouchableOpacity style={styles.iconButton}
                        onPress={() => {
                            setTopupModal(!topupModal)
                        }}>
                        <IconFeather name='x' size={30} color={'black'} />
                    </TouchableOpacity>
                    <Text style={styles.titleText}>Nạp tiền vào ví</Text>
                </View>

                {/* Payment methods information */}
                <View style={{
                    gap: 10,
                    marginHorizontal: 20,
                    marginBottom: 30,
                    flex: 1
                }}>
                    {/* Amount of money to topup */}
                    <View style={{
                        paddingHorizontal: 15,
                        alignItems: 'center',
                        marginTop: 70,
                        gap: 5
                    }}>
                        <Text style={{
                            fontFamily: fonts.MontserratBold,
                            fontSize: fontSizes.h2,
                            color: 'black'
                        }}>Số tiền bạn muốn nạp</Text>
                        <View style={{
                            flexDirection: 'row',
                            gap: 5,
                            alignItems: 'center'
                        }}>
                            <TextInput
                                value={topupAmount}
                                keyboardType='number-pad'
                                onChangeText={(text) => setTopupAmount(text)}
                                autoFocus={true}
                                style={{
                                    fontFamily: fonts.MontserratMedium,
                                    fontSize: fontSizes.h1 * 2,
                                    color: 'black'
                                }} />
                            <Text style={{
                                fontFamily: fonts.MontserratMedium,
                                fontSize: fontSizes.h1,
                                color: 'black'
                            }}>VNĐ</Text>
                        </View>
                        {!validationTopupAmount() && <Text style={{
                            fontFamily: fonts.MontserratMedium,
                            fontSize: fontSizes.h4,
                            color: 'red'
                        }}>Số tiền nạp tối thiểu là 20,000 VNĐ</Text>}
                    </View>

                    {/* Payment options */}
                    <View>
                        {paymentMethods.map(item =>
                            <View key={item.id}>
                                <TouchableOpacity style={styles.sortModalOptionContainer}
                                    onPress={() => {
                                        setSelectedPaymentMethod(item);
                                    }}>
                                    <View style={[{
                                        borderColor: item === selectedPaymentMethod ? colors.primary : 'black',
                                    }, styles.radioButtonOuter]}>
                                        <View style={[{
                                            backgroundColor: item === selectedPaymentMethod ? colors.primary : 'white',
                                        }, styles.radioButtonInner]}></View>
                                    </View>
                                    <Text style={styles.radioText}>{item.text}</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Confirm buttons */}
                    <View style={{
                        paddingHorizontal: 20,
                        gap: 10,
                        marginBottom: 20,
                        flex: 1,
                        justifyContent: 'flex-end'
                    }}>
                        <Text style={{
                            fontSize: fontSizes.h5,
                            fontFamily: fonts.MontserratMedium,
                            color: 'black',
                        }}>Khi bạn xác nhận nạp tiền vào ví PAH, điều đó có nghĩa là bạn đã đọc và đồng ý với Điều khoản của PAH.</Text>
                        <TouchableOpacity
                            disabled={!validationAll()}
                            style={{
                                borderRadius: 5,
                                backgroundColor: validationAll() ? colors.primary : colors.grey,
                                paddingVertical: 10
                            }}
                            onPress={() => {
                                payOrder()
                            }}>
                            <Text style={{
                                fontSize: fontSizes.h3,
                                fontFamily: fonts.MontserratBold,
                                color: validationAll() ? 'white' : colors.greyText,
                                textAlign: 'center'
                            }}>Xác nhận nạp tiền</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {isLoadingPayment && <View style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.inactive
                }}>
                    <ActivityIndicator size='large' color={colors.primary} />
                </View>}
            </View>
        </Modal>
    </View>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    iconButton: {
        padding: 8,
        borderRadius: 5,
        backgroundColor: colors.grey
    },
    titleContainer: {
        height: 70,
        flexDirection: 'row',
        paddingLeft: 15,
        paddingRight: 10,
        alignItems: 'center'
    },
    titleText: {
        color: 'black',
        fontFamily: fonts.MontserratBold,
        fontSize: fontSizes.h1,
        alignSelf: 'center',
        marginLeft:5
    },
    titleButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8
    },
    separator: {
        height: 1.2,
        backgroundColor: colors.darkGrey,
        marginVertical: 10
    },
    primaryButton: {
        borderWidth: 1.2,
        borderColor: colors.primary,
        borderRadius: 5,
        backgroundColor: colors.primary,
        paddingVertical: 10,
        marginHorizontal: 15,
        marginTop: 20
    },
    primaryButtonText: {
        fontSize: fontSizes.h3,
        fontFamily: fonts.MontserratBold,
        color: 'white',
        textAlign: 'center'
    },
    secondaryButton: {
        borderWidth: 1.2,
        borderColor: colors.primary,
        borderRadius: 5,
        paddingVertical: 10,
        marginHorizontal: 15,
        marginTop: 20
    },
    secondaryButtonText: {
        fontSize: fontSizes.h3,
        fontFamily: fonts.MontserratMedium,
        color: colors.primary,
        textAlign: 'center'
    },
    sortModalOptionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 30,
        marginVertical: 20,
        paddingHorizontal: 10
    },
    radioButtonOuter: {
        height: 20,
        width: 20,
        borderWidth: 2,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center'
    },
    radioButtonInner: {
        height: 10,
        width: 10,
        borderRadius: 30
    },
    radioText: {
        color: 'black',
        fontSize: fontSizes.h3,
        fontFamily: fonts.MontserratMedium
    },
});

export default Wallet;