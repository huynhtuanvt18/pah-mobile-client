import React, { useContext, useState, useEffect } from 'react';
import {
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Image,
    ActivityIndicator,
    NativeModules,
    NativeEventEmitter,
    RefreshControl
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { AxiosContext } from '../../context/AxiosContext';
import { colors, fontSizes, fonts } from '../../constants';
import IconFeather from 'react-native-vector-icons/Feather';
import Modal from 'react-native-modal';
import {
    Product as ProductRepository,
    Address as AddressRepository,
    Shipping as ShippingRepository,
    Order as OrderRepository,
    Wallet as WalletRepository,
    Auction as AuctionRepository
} from '../../repositories';
import moment from 'moment';
import "moment/min/locales";
import CryptoJS from 'crypto-js';
import { useIsFocused } from '@react-navigation/native';
import config from '../../config';
import { numberWithCommas } from '../../utilities/PriceFormat';
import Toast from 'react-native-toast-message';

const { PayZaloBridge } = NativeModules;

const payZaloBridgeEmitter = new NativeEventEmitter(PayZaloBridge);

function CheckoutNow(props) {
    moment.locale('vi');
    //// AUTH AND NAVIGATION
    // Auth Context
    const authContext = useContext(AuthContext);
    const axiosContext = useContext(AxiosContext);

    // Navigation
    const { navigation, route } = props;

    // Function of navigate to/back
    const { navigate, goBack } = navigation;

    //// Data
    // On focus
    const isFocused = useIsFocused();

    // Get product_id from routes
    const { product_id, isAuction = false, currentPrice = 0, auction_id = 0 } = props.route.params;

    // Data for product, payment methods and shipping address
    const [product, setProduct] = useState({
        seller: {},
        feedbacks: [],
        imageUrls: [],
        price: 0
    });
    const [quantity, setQuantity] = useState(1);

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(isAuction ?
        {
            id: 1,
            text: 'Số dư ví PAH'
        } : {
            id: 0,
            text: ''
        });
    const [paymentMethods, setPaymentMethods] = useState(isAuction ?
        [
            {
                id: 1,
                text: 'Số dư ví PAH'
            }
        ] : [
            {
                id: 1,
                text: 'Số dư ví PAH'
            },
            {
                id: 2,
                text: 'ZaloPay'
            }
        ]);

    const [shippingAddress, setShippingAddress] = useState([]);
    const [currentShippingAddress, setCurrentShippingAddress] = useState({});

    // Calculate data for shipping price
    const [shippingPrice, setShippingPrice] = useState(0);
    const [shippingDate, setShippingDate] = useState(0);
    const totalPrice = () => product.price * quantity + shippingPrice;

    // Data modal
    const [addressModal, setAddressModal] = useState(false);
    const [paymentModal, setPaymentModal] = useState(false);

    // Data for loading and refreshing
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Validating
    const validation = () => selectedPaymentMethod.id != 0 && shippingAddress.length > 0;

    //// FUNCTION
    // Get product detail from current product id
    function getProductDetail() {
        setIsLoading(true);
        ProductRepository.getProductDetail(axiosContext, product_id)
            .then(responseProduct => {
                setProduct(responseProduct);

                AddressRepository.getAllAdrressCurrentUser(axiosContext)
                    .then(responseAddress => {
                        setShippingAddress(responseAddress);
                        if (responseAddress.length > 0) {
                            // Set default shipping address
                            const defaultAddress = responseAddress.filter(address => {
                                return address.isDefault;
                            }).at(0)
                            if(defaultAddress){
                                setCurrentShippingAddress(defaultAddress);
                                getShippingCost(defaultAddress, responseProduct);
                                getShippingDate(defaultAddress, responseProduct);
                            } else {
                                setCurrentShippingAddress(responseAddress.at(0));
                                getShippingCost(responseAddress.at(0), responseProduct);
                                getShippingDate(responseAddress.at(0), responseProduct);
                            }
                        }
                        setIsLoading(false);
                    })
                    .catch(error => {
                        setIsLoading(false);
                    })
            })
            .catch(error => {
                setIsLoading(false);
            })
    }

    useEffect(() => {
        AddressRepository.getAllAdrressCurrentUser(axiosContext)
            .then(responseAddress => {
                setShippingAddress(responseAddress);
                if (responseAddress.length > 0) {
                    // Set default shipping address
                    const defaultAddress = responseAddress.filter(address => {
                        return address.isDefault;
                    }).at(0)
                    if(defaultAddress){
                        setCurrentShippingAddress(defaultAddress);
                        getShippingCost(defaultAddress, responseProduct);
                        getShippingDate(defaultAddress, responseProduct);
                    } else {
                        setCurrentShippingAddress(responseAddress.at(0));
                        getShippingCost(responseAddress.at(0), responseProduct);
                        getShippingDate(responseAddress.at(0), responseProduct);
                    }
                }
            })
            .catch(error => {
            })
    }, [isFocused]);

    function getShippingCost(responseAddress, responseProduct) {
        ShippingRepository.calculateShippingCost({
            service_type_id: 2,
            from_district_id: responseProduct.seller.districtId,
            from_ward_code: responseProduct.seller.wardCode,
            to_district_id: responseAddress.districtId,
            to_ward_code: responseAddress.wardCode,
            weight: responseProduct.weight
        })
            .then(responseShip => {
                setShippingPrice(responseShip.total);
            })
            .catch(error => {
                console.log(error.response.data);
            })
    }

    function getShippingDate(responseAddress, responseProduct) {
        ShippingRepository.calculateShippingDate({
            service_id: 53320,
            from_district_id: responseProduct.seller.districtId,
            from_ward_code: responseProduct.seller.wardCode,
            to_district_id: responseAddress.districtId,
            to_ward_code: responseAddress.wardCode
        })
            .then(responseShip => {
                setShippingDate(responseShip.leadtime);
            })
            .catch(error => {
                console.log(error.response.data);
            })
    }

    // Create auction order function
    function createOrderAuction() {
        WalletRepository.getWalletCurrentUser(axiosContext)
            .then(response => {
                if (shippingPrice < response.availableBalance) {
                    AuctionRepository.createOrder(axiosContext, {
                        auctionId: auction_id,
                        shippingPrice: shippingPrice,
                        addressId: currentShippingAddress.id
                    }).then(response => {
                        setIsLoadingPayment(false);
                        navigation.pop();
                        navigate('CheckoutComplete', { returnCode: 1 });
                    }).catch(err => {
                        console.log(err.response);
                        setIsLoadingPayment(false);
                        navigation.pop();
                        navigate('CheckoutComplete', { returnCode: 2 });
                    })
                }
                else {
                    setIsLoadingPayment(false);
                    Toast.show({
                        type: 'error',
                        text1: 'Số dư trong tài khoản không đủ',
                        position: 'bottom',
                        autoHide: true,
                        visibilityTime: 2000
                    });
                }
            })
            .catch(error => {
                setIsLoadingPayment(false);
            });
    }

    // Create order function
    function createOrder() {
        WalletRepository.getWalletCurrentUser(axiosContext)
            .then(response => {
                if (((product.price * quantity + shippingPrice) < response.availableBalance) || selectedPaymentMethod.id == 2) {
                    OrderRepository.checkout(axiosContext, {
                        order: [
                            {
                                sellerId: product.seller.id,
                                products: [
                                    {
                                        id: product.id,
                                        price: product.price,
                                        amount: quantity
                                    }
                                ],
                                total: product.price * quantity,
                                shippingCost: shippingPrice
                            }
                        ],
                        total: product.price * quantity,
                        paymentType: selectedPaymentMethod.id,
                        addressId: currentShippingAddress.id
                    }).then(response => {
                        setIsLoadingPayment(false);
                        navigation.pop();
                        navigate('CheckoutComplete', { returnCode: 1 });
                    }).catch(err => {
                        console.log(err.response);
                        setIsLoadingPayment(false);
                        navigation.pop();
                        navigate('CheckoutComplete', { returnCode: 2 });
                    })
                }
                else {
                    setIsLoadingPayment(false);
                    Toast.show({
                        type: 'error',
                        text1: 'Số dư trong tài khoản không đủ',
                        position: 'bottom',
                        autoHide: true,
                        visibilityTime: 2000
                    });
                }
            })
            .catch(error => {
                setIsLoadingPayment(false);
            });
    }
    // Zalopayment
    const [token, setToken] = useState('')
    const [returncode, setReturnCode] = useState(0)
    useEffect(() => {
        getProductDetail();
        const subscription = payZaloBridgeEmitter.addListener(
            'EventPayZalo',
            (data) => {
                // 1: SUCCESS, -1: FAILED, 4: CANCELLED
                // If returncode = 1, create order with zalopay method
                if (data.returnCode == 1) {
                    setReturnCode(data.returnCode);
                } else {
                    setIsLoadingPayment(false);
                    navigation.pop();
                    navigate('CheckoutComplete', { returnCode: data.returnCode });
                }
            }
        );
    }, []);

    useEffect(() => {
        if (returncode == 1) {
            createOrder();
        }
    }, [returncode]);

    // Scroll view refresh
    const onRefresh = () => {
        setRefreshing(true);
        getProductDetail();
        setRefreshing(false);
    };

    // Get current time for transaction id
    function getCurrentDateYYMMDD() {
        const todayDate = new Date().toISOString().slice(2, 10);
        return todayDate.split('-').join('');
    }

    async function payOrder() {
        setIsLoadingPayment(true);
        let apptransid = getCurrentDateYYMMDD() + '_' + new Date().getTime();

        let appid = 2553
        let amount = parseInt(totalPrice())
        let appuser = "PAHUser"
        let apptime = (new Date).getTime()
        let embeddata = "{}"
        let item = "[]"
        let description = `Thanh toán đơn hàng ${apptransid}`
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

    // Checkout function
    function checkout() {
        if (selectedPaymentMethod.id === 2) {
            // If method == ZALOPAY, create order
            payOrder();
        } else {
            // If method == COD || PAH_WALLET, create order and send to server (handle insufficient pah wallet available credits)
            setIsLoadingPayment(true);
            if (isAuction) {
                createOrderAuction();
            } else {
                createOrder();
            }
        }
    }

    return <View style={styles.container}>
        {/* Fixed screen title: Checkout */}
        <View style={styles.titleContainer}>
            <TouchableOpacity style={styles.iconButton}
                onPress={() => {
                    goBack()
                }}>
                <IconFeather name='x' size={30} color={'black'} />
            </TouchableOpacity>
            <Text style={styles.titleText}>Thanh toán</Text>
        </View>

        {isLoading ? <View style={{
            flex: 1,
            justifyContent: 'center'
        }}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View> : <ScrollView refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
            {/* Product basic info section */}
            <View style={{
                paddingHorizontal: 15,
                marginBottom: 15
            }}>
                <Text style={{
                    color: 'black',
                    fontFamily: fonts.MontserratBold,
                    fontSize: fontSizes.h4,
                    marginVertical: 15
                }}>Người bán: {product.seller.name}</Text>
                <View style={{
                    flexDirection: 'row',
                    gap: 10
                }}>
                    <Image source={{ uri: product.imageUrls.at(0) }}
                        style={{
                            resizeMode: 'cover',
                            width: 100,
                            height: 100,
                            borderRadius: 15
                        }} />
                    <View style={{
                        flex: 1,
                        gap: 10
                    }}>
                        <Text
                            numberOfLines={2}
                            ellipsizeMode='tail'
                            style={{
                                color: 'black',
                                fontFamily: fonts.MontserratMedium,
                                fontSize: fontSizes.h3
                            }}>{product.name}</Text>
                        <Text style={{
                            color: 'black',
                            fontFamily: fonts.MontserratBold,
                            fontSize: fontSizes.h2
                        }}>{isAuction ? `Sản phẩm đấu giá` : `₫${numberWithCommas(product.price)}`}</Text>
                        <Text style={{
                            color: colors.darkGreyText,
                            fontFamily: fonts.MontserratMedium,
                            fontSize: fontSizes.h4
                        }}>Số lượng: {quantity}</Text>
                    </View>
                </View>
                <View style={{
                    marginTop: 10,
                    gap: 5
                }}>
                    <Text style={{
                        color: 'black',
                        fontFamily: fonts.MontserratBold,
                        fontSize: fontSizes.h4
                    }}>Vận chuyển</Text>
                    <Text style={{
                        color: colors.darkGreyText,
                        fontFamily: fonts.MontserratMedium,
                        fontSize: fontSizes.h4
                    }}>Thông qua Giao hàng nhanh</Text>
                    <View style={{ gap: 5 }}>
                        {shippingDate != 0 && <Text style={{
                            color: colors.darkGreyText,
                            fontFamily: fonts.MontserratMedium,
                            fontSize: fontSizes.h4
                        }}>Giao dự kiến: {moment(shippingDate * 1000).format('dd, Do MMMM YYYY')}</Text>}
                        {shippingPrice != 0 && !isAuction && <Text style={{
                            color: 'black',
                            fontFamily: fonts.MontserratMedium,
                            fontSize: fontSizes.h4
                        }}>Phí vận chuyển: ₫{numberWithCommas(shippingPrice)} </Text>}
                    </View>
                </View>
            </View>
            <View style={styles.separator}></View>

            {/* Shipping information section */}
            <View style={{
                paddingHorizontal: 15,
                gap: 10,
                marginVertical: 10
            }}>
                <Text style={styles.sectionTitle}>Vận chuyển tới</Text>
                <TouchableOpacity style={{
                    marginTop: 5,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginEnd: 15
                }}
                    onPress={() => setAddressModal(!addressModal)}>
                    <View style={{
                        flexDirection: 'row'
                    }}>
                        <Text style={{
                            color: 'black',
                            fontFamily: fonts.MontserratBold,
                            fontSize: fontSizes.h4,
                            flex: 1
                        }}>Vận chuyển tới</Text>
                        {shippingAddress.length > 0 ? <View style={{ flex: 2, gap: 5 }}>
                            <Text style={{
                                color: 'black',
                                fontFamily: fonts.MontserratMedium,
                                fontSize: fontSizes.h4
                            }}
                            >{currentShippingAddress.recipientName}</Text>
                            <Text style={{
                                color: 'black',
                                fontFamily: fonts.MontserratMedium,
                                fontSize: fontSizes.h4
                            }}
                            >{`${currentShippingAddress.street}, ${currentShippingAddress.ward}, ${currentShippingAddress.district}, ${currentShippingAddress.province}`}</Text>
                            <Text style={{
                                color: 'black',
                                fontFamily: fonts.MontserratMedium,
                                fontSize: fontSizes.h4
                            }}
                            >{currentShippingAddress.recipientPhone}</Text>
                        </View> : <View style={{ flex: 2, gap: 5 }}>
                            <Text style={{
                                color: 'red',
                                fontFamily: fonts.MontserratMedium,
                                fontSize: fontSizes.h4
                            }}
                            >Xin hãy thêm địa chỉ nhận hàng</Text>
                        </View>}
                    </View>
                    <IconFeather name='chevron-right' size={30} color='black' />
                </TouchableOpacity>
                {!isAuction && <TouchableOpacity style={{
                    marginTop: 5,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginEnd: 15
                }}
                    onPress={() => setPaymentModal(!paymentModal)}>
                    <View style={{
                        flexDirection: 'row'
                    }}>
                        <Text style={{
                            color: 'black',
                            fontFamily: fonts.MontserratBold,
                            fontSize: fontSizes.h4,
                            flex: 1
                        }}>Phương thức thanh toán</Text>
                        <View style={{ flex: 2, gap: 5 }}>
                            <Text style={{
                                color: selectedPaymentMethod.id === 0 ? 'red' : 'black',
                                fontFamily: fonts.MontserratMedium,
                                fontSize: fontSizes.h4
                            }}
                            >{selectedPaymentMethod.id === 0 ? 'Xin hãy chọn phương thức thanh toán' : selectedPaymentMethod.text}</Text>
                        </View>
                    </View>
                    <IconFeather name='chevron-right' size={30} color='black' />
                </TouchableOpacity>}
            </View>
            <View style={styles.separator}></View>

            {/* Price section */}
            {!isAuction && <View style={{
                paddingHorizontal: 15,
                marginVertical: 10
            }}>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                }}>
                    <Text style={{
                        color: colors.darkGreyText,
                        fontFamily: fonts.MontserratMedium,
                        fontSize: fontSizes.h4
                    }}>Sản phẩm (1)</Text>
                    <Text style={{
                        color: 'black',
                        fontFamily: fonts.MontserratMedium,
                        fontSize: fontSizes.h4
                    }}>{isAuction ? 'Đã trả trước' : `₫${numberWithCommas(product.price)}`}</Text>
                </View>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                }}>
                    <Text style={{
                        color: colors.darkGreyText,
                        fontFamily: fonts.MontserratMedium,
                        fontSize: fontSizes.h4
                    }}>Phí vận chuyển</Text>
                    <Text style={{
                        color: 'black',
                        fontFamily: fonts.MontserratMedium,
                        fontSize: fontSizes.h4
                    }}>₫{numberWithCommas(shippingPrice)}</Text>
                </View>
                <View style={styles.separator}></View>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                }}>
                    <Text style={{
                        color: 'black',
                        fontFamily: fonts.MontserratBold,
                        fontSize: fontSizes.h3
                    }}>Tổng giá thành</Text>
                    <Text style={{
                        color: 'black',
                        fontFamily: fonts.MontserratBold,
                        fontSize: fontSizes.h3
                    }}>{isAuction ? `₫${numberWithCommas(shippingPrice)}` : `₫${numberWithCommas(totalPrice())}`}</Text>
                </View>
            </View>}
            <Text style={{
                color: colors.darkGreyText,
                fontFamily: fonts.MontserratMedium,
                fontSize: fontSizes.h5,
                marginVertical: 20,
                marginHorizontal: 15
            }}>
                Bằng cách xác nhận đơn đặt hàng của bạn, bạn đồng ý với các điều khoản và điều kiện Vận chuyển của PAH.
            </Text>
        </ScrollView>}


        {/* Checkout button */}
        <TouchableOpacity style={{
            borderRadius: 5,
            backgroundColor: validation() ? colors.primary : colors.grey,
            paddingVertical: 10,
            marginVertical: 5,
            marginHorizontal: 15
        }}
            disabled={!validation()}
            onPress={() => checkout()}>
            <Text style={{
                fontSize: fontSizes.h3,
                fontFamily: fonts.MontserratBold,
                color: validation() ? 'white' : colors.greyText,
                textAlign: 'center'
            }}>Xác nhận đặt hàng</Text>
        </TouchableOpacity>

        {/* Address modal */}
        <Modal
            animationIn="slideInRight"
            animationOut="slideOutRight"
            isVisible={addressModal}
            onRequestClose={() => {
                setAddressModal(!addressModal);
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
                            setAddressModal(!addressModal);
                        }}>
                        <IconFeather name='x' size={30} color={'black'} />
                    </TouchableOpacity>
                    <Text style={styles.titleText}>Địa chỉ</Text>
                </View>

                {/* All address information */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{
                        gap: 10,
                        marginHorizontal: 20,
                        marginBottom: 30
                    }}>
                    {/* Address options */}
                    <View>
                        {shippingAddress.map(item =>
                            <View key={item.id} style={{
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}>
                                <TouchableOpacity style={[styles.sortModalOptionContainer, { flex: 1 }]}
                                    onPress={() => {
                                        setCurrentShippingAddress(item);
                                        getShippingCost(item, product);
                                        getShippingDate(item, product);
                                        setAddressModal(!addressModal);
                                    }}>
                                    <View style={[{
                                        borderColor: item.id === currentShippingAddress.id ? colors.primary : 'black',
                                    }, styles.radioButtonOuter]}>
                                        <View style={[{
                                            backgroundColor: item.id === currentShippingAddress.id ? colors.primary : 'white',
                                        }, styles.radioButtonInner]}></View>
                                    </View>
                                    <View style={{ flexShrink: 1 }}>
                                        <Text style={styles.radioTextSecondary}>{item.recipientName}</Text>
                                        <Text style={styles.radioTextSecondary}>{item.recipientPhone}</Text>
                                        <Text style={styles.radioTextSecondary}>{`${item.street}, ${item.ward}, ${item.district}, ${item.province}`}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity onPress={() => {
                        navigate('AddAddress');
                        setAddressModal(false);
                    }}>
                        <Text style={{
                            color: colors.primary,
                            fontSize: fontSizes.h4,
                            fontFamily: fonts.MontserratMedium,
                            alignSelf: 'flex-end'
                        }}>Thêm địa chỉ mới</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </Modal>

        {/* Payment method modal */}
        <Modal
            animationIn="slideInRight"
            animationOut="slideOutRight"
            isVisible={paymentModal}
            onRequestClose={() => {
                setPaymentModal(!paymentModal);
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
                            setPaymentModal(!paymentModal)
                        }}>
                        <IconFeather name='x' size={30} color={'black'} />
                    </TouchableOpacity>
                    <Text style={styles.titleText}>Phương thức thanh toán</Text>
                </View>

                {/* Payment methods information */}
                <View style={{
                    gap: 10,
                    marginHorizontal: 20,
                    marginBottom: 30
                }}>
                    {/* Payment options */}
                    <View>
                        {paymentMethods.map(item =>
                            <View key={item.id}>
                                <TouchableOpacity style={styles.sortModalOptionContainer}
                                    onPress={() => {
                                        setSelectedPaymentMethod(item);
                                        setPaymentModal(!paymentModal);
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
                </View>
            </View>
        </Modal>

        {/* Loading overlay for payment */}
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
    descriptionText: {
        color: 'black',
        fontFamily: fonts.MontserratMedium,
        fontSize: fontSizes.h3,
        alignSelf: 'center'
    },
    sectionTitle: {
        color: 'black',
        fontFamily: fonts.MontserratBold,
        fontSize: fontSizes.h2
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
    radioTextSecondary: {
        color: colors.darkGreyText,
        fontSize: fontSizes.h4,
        fontFamily: fonts.MontserratMedium
    }
});

export default CheckoutNow;