import React from 'react';
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { colors, fontSizes, images, fonts } from '../constants';

function UnauthorizedAccountScreen(props) {
    // Navigation
    const { navigation, route } = props;

    // Function of navigate to/back
    const { navigate, goBack } = navigation;

    return <View style={{
        flex: 1
    }}>
        {/* Login and register button */}
        <View style={{
            paddingTop: 10,
            paddingHorizontal: 25
        }}>
            <Text style={styles.mainText}>Hãy đăng nhập để trải nghiệm tối đa nền tảng của chúng tôi</Text>
            <View style={{
                marginTop: 20,
                gap: 10
            }}>
                <TouchableOpacity style={styles.loginButton}
                    onPress={() => {
                        navigate('Login')
                    }}>
                    <Text style={styles.loginText}>Đăng nhập</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.registerButton}
                    onPress={() => {
                        navigate('Register')
                    }}>
                    <Text style={styles.registerText}>Đăng ký</Text>
                </TouchableOpacity>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginTop: 10
                }}>
                    <Text style={{
                        color: 'black',
                        fontFamily: fonts.MontserratMedium,
                        fontSize: fontSizes.h5
                    }}>Mở tài khoản người bán? </Text>
                    <TouchableOpacity onPress={() => {
                        navigate('Register')
                    }}>
                        <Text style={{
                            color: colors.primary,
                            fontFamily: fonts.MontserratMedium,
                            fontSize: fontSizes.h5
                        }}>Đăng ký tài khoản</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
        <View style={styles.separator}></View>
        <View style={{
            flex: 1,
            gap: 25,
            marginTop: 25
        }}>
            <View style={styles.benefitContainer}>
                <Image source={images.benefit1}
                    style={styles.benefitImage} />
                <Text style={styles.benefitText}>Tham gia mua sắm và đấu giá những món đồ cổ, đồ thủ công mỹ nghệ quý hiếm</Text>
            </View>
            <View style={styles.benefitContainer}>
                <Image source={images.benefit2}
                    style={styles.benefitImage} />
                <Text style={styles.benefitText}>Quản lý và kiểm tra trạng thái các đơn hàng của mình</Text>
            </View>
            <View style={styles.benefitContainer}>
                <Image source={images.benefit3}
                    style={styles.benefitImage} />
                <Text style={styles.benefitText}>Nhận thông báo về các sản phẩm mới và các cuộc đấu giá đang diễn ra</Text>
            </View>
        </View>
    </View>
}

const styles = StyleSheet.create({
    loginButton: {
        borderWidth: 1.2,
        borderColor: colors.primary,
        borderRadius: 5,
        backgroundColor: colors.primary,
        paddingVertical: 15
    },
    loginText: {
        fontSize: fontSizes.h3,
        fontFamily: fonts.MontserratBold,
        color: 'white',
        textAlign: 'center'
    },
    registerButton: {
        borderWidth: 1.2,
        borderColor: colors.primary,
        borderRadius: 5,
        paddingVertical: 15,
    },
    registerText: {
        fontSize: fontSizes.h3,
        fontFamily: fonts.MontserratMedium,
        color: colors.primary,
        textAlign: 'center'
    },
    separator: {
        height: 1,
        backgroundColor: colors.greyText,
        marginHorizontal: 25,
        marginTop: 25
    },
    benefitContainer: {
        flexDirection: 'row',
        paddingHorizontal: 30,
        gap: 20
    },
    benefitImage: {
        width: 80,
        height: 80,
        resizeMode: 'cover'
    },
    benefitText: {
        flex: 1,
        color: 'black',
        fontFamily: fonts.MontserratMedium,
        fontSize: fontSizes.h4,
        alignSelf: 'center'
    },
    mainText: {
        color: 'black',
        fontSize: fontSizes.h3,
        textAlign: 'center',
        fontFamily: fonts.MontserratMedium,
        marginTop: 20
    }
});


export default UnauthorizedAccountScreen;