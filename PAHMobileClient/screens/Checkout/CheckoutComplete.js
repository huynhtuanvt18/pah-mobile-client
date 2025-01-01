import React, { useContext, useState } from 'react';
import {
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Image
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { colors, fontSizes, fonts, images } from '../../constants';
import IconFeather from 'react-native-vector-icons/Feather';
import Modal from 'react-native-modal';

function CheckoutComplete(props) {
    // Auth Context
    const authContext = useContext(AuthContext);

    // Navigation
    const { navigation, route } = props;

    // Function of navigate to/back
    const { navigate, goBack } = navigation;

    // Get returnCode from routes
    const { returnCode } = props.route.params;

    return <View style={styles.container}>
        {/* Fixed screen title: Checkout */}
        <View style={styles.titleContainer}>
            <TouchableOpacity style={styles.iconButton}
                onPress={() => {
                    goBack()
                }}>
                <IconFeather name='x' size={30} color={'black'} />
            </TouchableOpacity>
            <Text style={styles.titleText}>{returnCode == 1 ? 'Thanh toán thành công' : 'Không thành công'}</Text>
        </View>

        {returnCode == 1 ?
            <View style={{
                flex: 1,
                paddingTop: 80
            }}>
                <Image source={images.orderSuccessImage} style={{
                    resizeMode: 'cover',
                    width: 140,
                    height: 140,
                    alignSelf: 'center'
                }} />
                <Text style={{
                    color: 'black',
                    fontFamily: fonts.MontserratMedium,
                    fontSize: fontSizes.h4,
                    marginHorizontal: 50,
                    textAlign: 'center',
                    marginTop: 20,
                    alignSelf: 'center'
                }}>Đơn hàng của bạn đã được thanh toán thành công</Text>
                <Text style={{
                    color: colors.darkGreyText,
                    fontFamily: fonts.MontserratMedium,
                    fontSize: fontSizes.h4,
                    marginHorizontal: 50,
                    textAlign: 'center',
                    marginTop: 20,
                    alignSelf: 'center'
                }}>Bạn sẽ nhận được email thông báo trong thời gian ngắn</Text>
                <TouchableOpacity style={styles.secondaryButton}
                    onPress={() => {
                        navigate('Listing')
                    }}>
                    <Text style={styles.secondaryButtonText}>Tiếp tục mua sắm</Text>
                </TouchableOpacity>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginTop: 15
                }}>
                    <Text style={{
                        color: colors.darkGreyText,
                        fontFamily: fonts.MontserratMedium,
                        fontSize: fontSizes.h5
                    }}>Kiểm tra đơn hàng của bạn</Text>
                    <TouchableOpacity onPress={() => {
                        navigate('BuyerOrderList')
                    }}>
                        <Text style={{
                            color: colors.primary,
                            fontFamily: fonts.MontserratMedium,
                            fontSize: fontSizes.h5
                        }}> tại đây</Text>
                    </TouchableOpacity>
                </View>
            </View> : <View style={{
                flex: 1,
                paddingTop: 80
            }}>
                <Image source={images.orderFailImage} style={{
                    resizeMode: 'cover',
                    width: 140,
                    height: 140,
                    alignSelf: 'center'
                }} />
                <Text style={{
                    color: 'black',
                    fontFamily: fonts.MontserratMedium,
                    fontSize: fontSizes.h4,
                    marginHorizontal: 50,
                    textAlign: 'center',
                    marginTop: 20,
                    alignSelf: 'center'
                }}>Thanh toán đơn hàng không thành công</Text>
                <Text style={{
                    color: colors.darkGreyText,
                    fontFamily: fonts.MontserratMedium,
                    fontSize: fontSizes.h4,
                    marginHorizontal: 50,
                    textAlign: 'center',
                    marginTop: 20,
                    alignSelf: 'center'
                }}>Hãy kiểm tra lại số dư của bạn và thanh toán lại</Text>
                <TouchableOpacity style={styles.secondaryButton}
                    onPress={() => {
                        navigate('Listing')
                    }}>
                    <Text style={styles.secondaryButtonText}>Tiếp tục mua sắm</Text>
                </TouchableOpacity>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginTop: 15
                }}>
                    <TouchableOpacity onPress={() => goBack()}>
                        <Text style={{
                            color: colors.primary,
                            fontFamily: fonts.MontserratMedium,
                            fontSize: fontSizes.h5
                        }}>Quay lại</Text>
                    </TouchableOpacity>
                </View>
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
});

export default CheckoutComplete;