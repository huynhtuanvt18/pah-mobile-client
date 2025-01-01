import React, { useContext, useState, useEffect } from 'react';
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { AxiosContext } from '../context/AxiosContext';
import { colors, fontSizes, images, fonts } from '../constants';
import IconFeather from 'react-native-vector-icons/Feather';
import { useDispatch, useSelector } from 'react-redux';
import { numberWithCommas } from '../utilities/PriceFormat';
import {
    Address as AddressRepository,
    Shipping as ShippingRepository
} from '../repositories';
import { removeFromCart } from '../reducers/CartReducer';

function Cart(props) {
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

    // Default address
    const [userAddress, setUserAddress] = useState({});

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

    // Remove item from Cart
    const removeItemFromCart = (item) => {
        dispatch(removeFromCart(item));
    }

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
    function calculateCart() {
        setCartGrouped(cartGroupedComputed());
        if (authContext?.authState?.authenticated && cart.length > 0) {
            setCartGrouped([]);
            setIsLoading(true);
            AddressRepository.getAdrressCurrentUser(axiosContext)
                .then(responseAddress => {
                    setUserAddress(responseAddress);
                    // After get default address successfully, iterate grouped cart and calculate shipping cost for each seller
                    cartGroupedComputed().forEach((seller, index, array) => {
                        seller.total = seller.products.reduce((accumulator, object) => {
                            return accumulator + object.price * object.amount;
                        }, 0)
                        ShippingRepository.calculateShippingCost({
                            service_type_id: 2,
                            from_district_id: seller.districtId,
                            from_ward_code: seller.wardCode,
                            to_district_id: responseAddress.districtId,
                            to_ward_code: responseAddress.wardCode,
                            weight: seller.products.reduce((accumulator, object) => {
                                return accumulator + object.weight * object.amount;
                            }, 0)
                        })
                            .then(responseShip => {
                                seller.shippingCost = responseShip.total;
                                setTotalShippingPrice(oldShippingCost => oldShippingCost + responseShip.total);
                                setCartGrouped(oldArray => [...oldArray, seller]);
                                if (index === array.length - 1) {
                                    setIsLoading(false);
                                }
                            })
                            .catch(error => {
                                console.log(error);
                            })
                    });
                })
                .catch(error => {
                    // console.log('a')
                    // console.log(error);
                    // setIsLoading(false);
                    // After get default address successfully, iterate grouped cart and calculate shipping cost for each seller
                    cartGroupedComputed().forEach((seller, index, array) => {
                        seller.total = seller.products.reduce((accumulator, object) => {
                            return accumulator + object.price * object.amount;
                        }, 0)
                        seller.shippingCost = 0;
                        setCartGrouped(oldArray => [...oldArray, seller]);
                        if (index === array.length - 1) {
                            setIsLoading(false);
                        }
                    });
                    setTotalShippingPrice(0);
                });
        } else {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        calculateCart();
    }, [cart.length]);

    return <View style={styles.container}>
        {/* Fixed screen title: Cart */}
        <View style={styles.titleContainer}>
            <TouchableOpacity style={styles.iconButton}
                onPress={() => {
                    goBack()
                }}>
                <IconFeather name="chevron-left" size={25} color={'black'} />
            </TouchableOpacity>
            <Text style={styles.titleText}>Giỏ hàng</Text>
        </View>

        {isLoading ? <View style={{
            flex: 1,
            justifyContent: 'center'
        }}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View> : <View style={{
            flex: 1
        }}>
            {/* Cart View */}
            {(Array.isArray(cartGrouped) && cartGrouped.length) ? <ScrollView style={{
                flex: 1,
            }}>
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

                {/* Cart title view */}
                <View style={{
                    paddingVertical: 15
                }}>
                    <Text style={{
                        color: 'black',
                        fontFamily: fonts.MontserratBold,
                        fontSize: fontSizes.h3,
                        marginLeft: 15,
                        marginBottom: 10
                    }}>Giỏ hàng của bạn ({sumQuantity()})</Text>
                    <View style={{
                        height: 1,
                        backgroundColor: colors.darkGreyText
                    }}></View>
                </View>

                {/* Cart list: items by seller */}

                {cartGrouped.map((seller) =>
                    <View key={seller.sellerId} style={{ marginBottom: 10 }}>
                        <Text style={{
                            color: 'black',
                            fontFamily: fonts.MontserratBold,
                            fontSize: fontSizes.h3,
                            marginHorizontal: 15
                        }}>Người bán {seller.name}</Text>
                        <Text style={{
                            color: colors.darkGreyText,
                            fontFamily: fonts.MontserratMedium,
                            fontSize: fontSizes.h5,
                            marginHorizontal: 15,
                            marginTop: 5
                        }}>{`${seller.ward}, ${seller.district}, ${seller.province}`}</Text>
                        <Text style={{
                            color: 'black',
                            fontFamily: fonts.MontserratMedium,
                            fontSize: fontSizes.h4,
                            marginHorizontal: 15,
                            marginTop: 15,
                            marginBottom: 10
                        }}>{seller.shippingCost != 0 ? `₫${numberWithCommas(seller.shippingCost)} giao hàng` : 'Thêm địa chỉ mặc định để xem phí giao hàng'}</Text>
                        {seller.products.map((cart_item) =>
                            <View key={cart_item.id}>
                                <TouchableOpacity
                                    style={{
                                        flexDirection: 'row',
                                        marginTop: 10
                                    }}
                                    onPress={() => navigate('ListingDetail', { product_id: cart_item.id })}>
                                    <Image source={{ uri: cart_item.imageUrls[0] }}
                                        style={{
                                            width: 120,
                                            height: 120,
                                            margin: 5,
                                            marginLeft: 15,
                                            resizeMode: 'cover',
                                            borderRadius: 20
                                        }} />
                                    <View style={{
                                        flex: 1
                                    }}>
                                        <Text
                                            numberOfLines={3}
                                            ellipsizeMode='tail'
                                            style={{
                                                color: 'black',
                                                fontFamily: fonts.MontserratMedium,
                                                fontSize: fontSizes.h4,
                                                marginHorizontal: 5
                                            }}>{cart_item.name}</Text>
                                        <Text
                                            numberOfLines={3}
                                            ellipsizeMode='tail'
                                            style={{
                                                color: 'black',
                                                fontFamily: fonts.MontserratBold,
                                                fontSize: fontSizes.h3,
                                                marginHorizontal: 5
                                            }}>₫{numberWithCommas(cart_item.price)}</Text>
                                    </View>
                                </TouchableOpacity>

                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    paddingHorizontal: 20,
                                    marginTop: 5,
                                    marginBottom: 10,
                                    alignItems: 'center'
                                }}>
                                    <Text style={{
                                        color: colors.darkGreyText,
                                        fontFamily: fonts.MontserratMedium,
                                        fontSize: fontSizes.h4
                                    }}>Số lượng: {cart_item.amount}</Text>
                                    <TouchableOpacity onPress={() => {
                                        removeItemFromCart(cart_item);
                                    }}>
                                        <Text style={{
                                            color: colors.primary,
                                            fontFamily: fonts.MontserratMedium,
                                            fontSize: fontSizes.h4
                                        }}>Xóa khỏi giỏ hàng</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{
                                    height: 1,
                                    backgroundColor: colors.darkGrey
                                }}></View>
                            </View>
                        )}
                    </View>
                )}

                {/* Pricing */}
                <View>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingHorizontal: 20,
                        marginTop: 5,
                        marginBottom: 15
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
                        justifyContent: 'space-between',
                        paddingHorizontal: 20,
                        marginBottom: 15
                    }}>
                        <Text style={{
                            color: colors.darkGreyText,
                            fontFamily: fonts.MontserratMedium,
                            fontSize: fontSizes.h4,
                            marginRight: 15
                        }}>Phí giao hàng</Text>
                        <Text style={{
                            color: 'black',
                            fontFamily: fonts.MontserratMedium,
                            fontSize: fontSizes.h4,
                            flex: 1,
                            flexWrap: 'wrap',
                            textAlign: 'right'
                        }}>{totalShippingPrice != 0 ? `₫${numberWithCommas(totalShippingPrice)}` : 'Thêm địa chỉ mặc định để xem'}</Text>
                    </View>
                    <View style={{
                        height: 1,
                        backgroundColor: colors.darkGrey
                    }}></View>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingHorizontal: 20,
                        marginTop: 15
                    }}>
                        <Text style={{
                            color: 'black',
                            fontFamily: fonts.MontserratMedium,
                            fontSize: fontSizes.h3,
                            marginRight: 15
                        }}>Tổng</Text>
                        <Text style={{
                            color: 'black',
                            fontFamily: totalShippingPrice != 0 ? fonts.MontserratBold : fonts.MontserratMedium,
                            fontSize: totalShippingPrice != 0 ? fontSizes.h3 : fontSizes.h4,
                            flex: 1,
                            flexWrap: 'wrap',
                            textAlign: 'right'
                        }}>{totalShippingPrice != 0 ? `₫${numberWithCommas(totalShippingPrice + sumTotal())}` : "Thêm địa chỉ mặc định để xem tổng đơn hàng"}</Text>
                    </View>
                </View>

                {/* Checkout button */}
                <TouchableOpacity style={{
                    borderWidth: 1.2,
                    borderColor: colors.primary,
                    borderRadius: 5,
                    backgroundColor: colors.primary,
                    paddingVertical: 10,
                    margin: 20
                }}
                    onPress={() => {
                        if (authContext?.authState?.authenticated) {
                            navigate('CheckoutCart')
                        } else {
                            navigate('Login')
                        }
                    }}>
                    <Text style={{
                        fontSize: fontSizes.h3,
                        fontFamily: fonts.MontserratBold,
                        color: 'white',
                        textAlign: 'center'
                    }}>Tiến hành thanh toán</Text>
                </TouchableOpacity>
            </ScrollView> : <View style={{
                flex: 1,
                alignItems: 'center',
                paddingTop: 150
            }}>
                <Image source={images.cartImage} style={{
                    resizeMode: 'cover',
                    width: 140,
                    height: 140
                }} />
                <Text style={{
                    fontSize: fontSizes.h4,
                    fontFamily: fonts.MontserratMedium,
                    color: 'black',
                    textAlign: 'center',
                    marginHorizontal: 35,
                    marginTop: 10
                }}>Giỏ hàng của bạn hiện đang trống. Hãy lướt một vài sản phẩm trên PAH nào!</Text>
            </View>}
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
        marginLeft: 5,
        color: 'black',
        fontFamily: fonts.MontserratBold,
        fontSize: fontSizes.h1,
        alignSelf: 'center'
    },
    titleButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8
    },
    separator: {
        height: 1.5,
        backgroundColor: colors.darkGreyText,
        marginRight: 10
    }
});

export default Cart;