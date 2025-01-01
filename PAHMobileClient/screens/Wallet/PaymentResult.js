import React, { useContext } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    Image
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { colors, fontSizes, fonts, images } from '../../constants';
import IconFeather from 'react-native-vector-icons/Feather';

function PaymentResult(props) {
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
            <Text style={styles.titleText}>Nạp tiền</Text>
        </View>

        <View style={{
            alignItems: 'center',
            paddingTop: 150
        }}>
            <Image source={returnCode == 1 ? images.successImage : images.failedImage} style={{
                resizeMode: 'cover',
                width: 100,
                height: 100,
                marginBottom: 15
            }} />
            <Text style={{
                fontSize: fontSizes.h3,
                fontFamily: fonts.MontserratMedium,
                color: 'black',
                textAlign: 'center',
                marginHorizontal: 35,
                marginTop: 10
            }}>{returnCode == 1 ? 'Nạp tiền vào ví PAH thành công!' : 'Nạp tiền vào ví PAH thất bại'}</Text>
            <TouchableOpacity onPress={() => goBack()}>
                <Text style={{
                    fontSize: fontSizes.h5,
                    fontFamily: fonts.MontserratMedium,
                    color: colors.primary,
                    textAlign: 'center',
                    marginHorizontal: 35,
                    marginTop: 20
                }}>Quay lại</Text>
            </TouchableOpacity>
        </View>
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
});

export default PaymentResult;