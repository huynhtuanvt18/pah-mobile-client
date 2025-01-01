import React, { useState, useEffect } from 'react';
import {
    Text,
    StyleSheet,
    View
} from 'react-native';
import { colors, fontSizes, fonts } from '../../constants';

function ListingDetailInfoText(props) {
    const { label, text, secondText, thirdText } = props;

    return <View style={{
        flexDirection: 'row',
        gap: 5
    }}>
        <Text style={styles.productInformationLabel}>{label}</Text>
        <View style={{ flex: 3, gap: 5 }}>
            <Text style={styles.productInformationText}
            >{text}</Text>
            {secondText && <Text style={styles.secondText}
            >{secondText}</Text>}
            {thirdText && <Text style={styles.thirdText}
            >Thông qua Giao hàng nhanh</Text>}
        </View>
    </View>
}

const styles = StyleSheet.create({
    productInformationLabel: {
        color: colors.darkGreyText,
        fontFamily: fonts.MontserratMedium,
        fontSize: fontSizes.h4,
        flex: 2
    },
    productInformationText: {
        color: 'black',
        fontFamily: fonts.MontserratMedium,
        fontSize: fontSizes.h4
    },
    secondText: {
        color: colors.darkGreyText,
        fontFamily: fonts.MontserratMedium,
        fontSize: fontSizes.h4,
    },
    thirdText: {
        color: 'black',
        fontFamily: fonts.MontserratMedium,
        fontSize: fontSizes.h4,
    }
})

export default ListingDetailInfoText