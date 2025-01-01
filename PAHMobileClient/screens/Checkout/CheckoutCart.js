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
    NativeEventEmitter
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { AxiosContext } from '../../context/AxiosContext';
import { colors, fontSizes, fonts } from '../../constants';
import IconFeather from 'react-native-vector-icons/Feather';
import Modal from 'react-native-modal';
import { useSelector, useDispatch } from 'react-redux';
import { numberWithCommas } from '../../utilities/PriceFormat';
import {
    Address as AddressRepository,
    Shipping as ShippingRepository,
    Wallet as WalletRepository,
    Order as OrderRepository
} from '../../repositories';
import moment from 'moment';
import CryptoJS from 'crypto-js';
import config from '../../config';
import Toast from 'react-native-toast-message';
import { emptyCart } from '../../reducers/CartReducer';
import { useIsFocused } from '@react-navigation/native';

const { PayZaloBridge } = NativeModules;

const payZaloBridgeEmitter = new NativeEventEmitter(PayZaloBridge);

function CheckoutCart(props) {
    //// CART REDUX STORE
    const cart = useSelector((state) => state.cart.cart)
    const dispatch = useDispatch();

    //// AUTH AND NAVIGATION
    // Auth Context
    const authContext = useContext(AuthContext);
    const axiosContext = useContext(AxiosContext);

    // Navigation
    const { navigation, route } = props;

    // Function of navigate to/back
    const { navigate, goBack } = navigation;

    //// DATA
    // Loading
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);

    // On focus
    const isFocused = useIsFocused();

    // Cart data
    const cartGroupedComputed = () => {
        return Object.values(groupItemBy(cart, 'seller.id'));
    }
    const [cartGrouped, setCartGrouped] = useState([]);

    // Cart sum quantity
    const sumQuantity = () =>
        cart.reduce((accumulator, object) => {
            return accumulator + object.amount;
        }, 0);

    // Cart sum price
    const sumTotal = () =>
        cart.reduce((accumulator, object) => {
            return accumulator + object.amount * object.price;
        }, 0);

    // Total shipping price
    const [totalShippingPrice, setTotalShippingPrice] = useState(0);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState({
        id: 0,
        text: ''
    });
    const [paymentMethods, setPaymentMethods] = useState([
        {
            id: 1,
            text: 'Số dư ví PAH'
        },
        {
            id: 2,
            text: 'ZaloPay'
        }
    ]);
    const [paymentModal, setPaymentModal] = useState(false);
    const [shippingAddress, setShippingAddress] = useState([]);
    const [currentShippingAddress, setCurrentShippingAddress] = useState({});
    const [addressModal, setAddressModal] = useState(false);
    // validating
    const validation = () => selectedPaymentMethod.id != 0 && shippingAddress.length > 0;

    //// FUNCTIONS
    // Get cart group by seller
    function groupItemBy(array, property) {
        let hash = [];
        for (const element of array) {
            if (hash.filter(item => item.sellerId == element.seller.id).length == 0) {
                hash.push({
                    sellerId: element.seller.id,
                    name: element.seller.name,
                    province: element.seller.province,
                    district: element.seller.district,
                    districtId: element.seller.districtId,
                    ward: element.seller.ward,
                    wardCode: element.seller.wardCode,
                    shippingCost: 0,
                    shippingDate: '',
                    total: 0,
                    products: []
                })
            }

            const foundSeller = hash.find(item => item.sellerId == element.seller.id);
            if (foundSeller) {
                foundSeller.products.push(element);
            }
        }

        return hash;
    }

    //// FUNCTIONS

    // Insert shipping cost and shipping date
    async function calculateCart() {
        setIsLoading(true);
        let defaultAddress;
        const responseAddress = await AddressRepository.getAllAdrressCurrentUser(axiosContext)
            .catch(error => {
                console.log(error);
                setIsLoading(false);
            });
        setShippingAddress(responseAddress);
        // After get default address successfully, iterate grouped cart and calculate shipping cost for each seller
        if (responseAddress.length > 0) {
            // Set default shipping address
            defaultAddress = responseAddress.filter(address => {
                return address.isDefault;
            }).at(0)
            if(defaultAddress){
                setCurrentShippingAddress(defaultAddress);
                getShippingCost(defaultAddress);
            } else {
                setCurrentShippingAddress(responseAddress.at(0));
                getShippingCost(responseAddress.at(0));
            }
        } else {
            await Promise.all(cartGroupedComputed().map(async (seller, index, array) => {
                seller.total = seller.products.reduce((accumulator, object) => {
                    return accumulator + object.price * object.amount;
                }, 0)
    
                seller.shippingCost = 0;
                seller.shippingDate = 0;
    
                setCartGrouped(oldArray => [...oldArray, seller]);
                if (index === array.length - 1) {
                    setIsLoading(false);
                }
    
            }))
            .catch(err => {
                console.log('getShippingCost');
                setIsLoading(false);
            });
        }
    }

    // Recalculate shipping cost
    async function getShippingCost(defaultAddress) {
        setIsLoading(true);
        let cartArray = [];
        let shippingPriceTemp = 0;

        // Foreach loop
        await Promise.all(cartGroupedComputed().map(async (seller, index, array) => {
            seller.total = seller.products.reduce((accumulator, object) => {
                return accumulator + object.price * object.amount;
            }, 0)

            // Calculate shipping cost for each seller
            const responseShip = await ShippingRepository.calculateShippingCost({
                service_type_id: 2,
                from_district_id: seller.districtId,
                from_ward_code: seller.wardCode,
                to_district_id: defaultAddress.districtId,
                to_ward_code: defaultAddress.wardCode,
                weight: seller.products.reduce((accumulator, object) => {
                    return accumulator + object.weight * object.amount;
                }, 0)
            })
                .catch(error => {
                    console.log(error);
                });

            seller.shippingCost = responseShip.total;
            shippingPriceTemp += responseShip.total;

            // Calculate shipping date for each seller
            const responseDate = await ShippingRepository.calculateShippingDate({
                service_id: 53320,
                from_district_id: seller.districtId,
                from_ward_code: seller.wardCode,
                to_district_id: defaultAddress.districtId,
                to_ward_code: defaultAddress.wardCode
            })
                .catch(error => {
                    console.log(error.response.data);
                })

            seller.shippingDate = responseDate.leadtime;
            cartArray.push(seller);
        }))
        .catch(err => {
            console.log('getShippingCost');
            setIsLoading(false);
        });
        setTotalShippingPrice(shippingPriceTemp)
        setCartGrouped(cartArray);
        setIsLoading(false);
    }

    // Zalopayment
    const [token, setToken] = useState('')
    const [returncode, setReturnCode] = useState(0);

    useEffect(() => {
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
        calculateCart();
    }, [isFocused]);

    // Empty cart
    function emptyCartItems(){
        dispatch(emptyCart());
    }

    // Create order function
    function createOrder() {
        WalletRepository.getWalletCurrentUser(axiosContext)
            .then(response => {
                if (((sumTotal() + totalShippingPrice) < response.availableBalance) || selectedPaymentMethod.id == 2) {
                    OrderRepository.checkout(axiosContext, {
                        order: cartGrouped,
                        total: sumTotal(),
                        paymentType: selectedPaymentMethod.id,
                        addressId: currentShippingAddress.id
                    }).then(response => {
                        emptyCartItems();
                        setIsLoadingPayment(false);
                        navigation.pop();
                        navigate('CheckoutComplete', { returnCode: 1 });
                    }).catch(err => {
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

    // Get current time for transaction id
    function getCurrentDateYYMMDD() {
        const todayDate = new Date().toISOString().slice(2, 10);
        return todayDate.split('-').join('');
    }

    async function payOrder() {
        setIsLoadingPayment(true);
        let apptransid = getCurrentDateYYMMDD() + '_' + new Date().getTime();

        let appid = 2553
        let amount = parseInt(sumTotal() + totalShippingPrice)
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

    useEffect(() => {
        if (returncode == 1) {
            createOrder();
        }
    }, [returncode]);

    // Checkout function
    function checkout() {
        if (selectedPaymentMethod.id === 2) {
            // If method == ZALOPAY, create order
            payOrder();
        } else {
            // If method == COD || PAH_WALLET, create order and send to server (handle insufficient pah wallet available credits)
            setIsLoadingPayment(true);
            createOrder();
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
        </View> : <ScrollView>
            {/* Optional: if cart contain items from different seller information */}
            {cartGrouped.length > 1 && <View style={{
                backgroundColor: colors.info,
                flexDirection: 'row',
                paddingHorizontal: 15,
                paddingVertical: 15,
                gap: 15
            }}>
                <IconFeather name='info' size={25} color={'white'} />
                <Text style={{
                    color: 'white',
                    fontFamily: fonts.MontserratMedium,
                    fontSize: fontSizes.h5,
                    flex: 1
                }}>Giỏ hàng của bạn chứa các sản phẩm từ hai hoặc nhiều người bán khác nhau. Do đó, các đơn hàng của bạn sẽ được tách ra theo người bán sau khi thanh toán giỏ hàng.</Text>
            </View>}
            {/* Product basic info section */}
            <View>
                {cartGrouped.map((seller) =>
                    //<View key={seller.sellerId}>
                    <View key={Math.floor(Math.random() * 1000)}>
                        <View style={{
                            paddingHorizontal: 15,
                            marginBottom: 10
                        }}>
                            <Text style={{
                                color: 'black',
                                fontFamily: fonts.MontserratBold,
                                fontSize: fontSizes.h4,
                                marginVertical: 15
                            }}>Người bán: {seller.name}</Text>
                            {seller.products.map((item) =>
                                <View key={item.id} style={{
                                    flexDirection: 'row',
                                    gap: 10,
                                    marginBottom: 10
                                }}>
                                    <Image source={{ uri: item.imageUrls[0] }}
                                        style={{
                                            resizeMode: 'cover',
                                            width: 120,
                                            height: 120,
                                            borderRadius: 15
                                        }} />
                                    <View style={{
                                        flex: 1,
                                    }}>
                                        <Text
                                            numberOfLines={2}
                                            ellipsizeMode='tail'
                                            style={{
                                                color: 'black',
                                                fontFamily: fonts.MontserratMedium,
                                                fontSize: fontSizes.h3
                                            }}>{item.name}</Text>
                                        <Text style={{
                                            color: 'black',
                                            fontFamily: fonts.MontserratBold,
                                            fontSize: fontSizes.h3
                                        }}>₫{numberWithCommas(item.price)}</Text>
                                        <Text style={{
                                            color: colors.darkGreyText,
                                            fontFamily: fonts.MontserratMedium,
                                            fontSize: fontSizes.h4
                                        }}>Số lượng: {item.amount}</Text>
                                    </View>
                                </View>
                            )}
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
                                {seller.shippingDate != 0 && <Text style={{
                                    color: colors.darkGreyText,
                                    fontFamily: fonts.MontserratMedium,
                                    fontSize: fontSizes.h4
                                }}>Giao dự kiến: {moment(seller.shippingDate * 1000).format('DD/MM/YYYY')}</Text>}
                                {seller.shippingCost != 0 && <Text style={{
                                    color: 'black',
                                    fontFamily: fonts.MontserratMedium,
                                    fontSize: fontSizes.h4
                                }}>Phí vận chuyển: ₫{numberWithCommas(seller.shippingCost)} </Text>}
                            </View>
                        </View>
                        <View style={styles.separator}></View>
                    </View>
                )}
            </View>

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
                <TouchableOpacity style={{
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
                </TouchableOpacity>
            </View>
            <View style={styles.separator}></View>

            {/* Price section */}
            <View style={{
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
                    }}>Sản phẩm ({sumQuantity()})</Text>
                    <Text style={{
                        color: 'black',
                        fontFamily: fonts.MontserratMedium,
                        fontSize: fontSizes.h4
                    }}>₫{numberWithCommas(sumTotal())}</Text>
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
                    }}>₫{numberWithCommas(totalShippingPrice)}</Text>
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
                    }}>{numberWithCommas(totalShippingPrice + sumTotal())} VNĐ</Text>
                </View>
            </View>
            <Text style={{
                color: colors.darkGreyText,
                fontFamily: fonts.MontserratMedium,
                fontSize: fontSizes.h5,
                marginVertical: 50,
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
            }}>Xác nhận thanh toán</Text>
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
                                        getShippingCost(item);
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

export default CheckoutCart;