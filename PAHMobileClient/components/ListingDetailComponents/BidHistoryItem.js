import React, { useState, useEffect } from 'react';
import {
    Text,
    StyleSheet,
    View
} from 'react-native';
import { colors, fontSizes, fonts } from '../../constants';
import TimeLeft from '../TimeLeft';
import { numberWithCommas } from '../../utilities/PriceFormat';

function BidHistoryItem(props) {
    const { bid } = props;
    const { id, bidder, bidAmount, bidDate, status } = bid;
    const { name, email } = bidder

    return <View key={id}>
        {status != 3 && <>
            <View style={{
                flexDirection: 'row',
                marginVertical: 5
            }}>
                <View style={{ flex: 5 }}>
                    <Text style={{
                        color: 'black',
                        fontFamily: fonts.MontserratMedium,
                        fontSize: fontSizes.h4
                    }}>₫{numberWithCommas(bidAmount)}</Text>
                    <Text style={{
                        color: colors.darkGreyText,
                        fontFamily: fonts.MontserratMedium,
                        fontSize: fontSizes.h4
                    }}>{name}</Text>
                </View>
                <View style={{ flex: 4, flexDirection: 'row' }}>
                    <Text style={{
                        color: 'black',
                        fontFamily: fonts.MontserratMedium,
                        fontSize: fontSizes.h4
                    }}>Đặt</Text>
                    <TimeLeft showText={false} closedTime={bidDate}
                        textStyle={{
                            color: 'black',
                            fontFamily: fonts.MontserratMedium,
                            fontSize: fontSizes.h4
                        }} />
                </View>
            </View>
            <View style={styles.separator}></View>
        </>}
    </View>
}

const styles = StyleSheet.create({
    separator: {
        height: 1,
        backgroundColor: colors.darkGrey,
        marginRight: 10
    },
    feedbackLabel: {
        color: colors.darkGreyText,
        fontFamily: fonts.MontserratMedium,
        fontSize: fontSizes.h5
    },
    feedbackContent: {
        color: 'black',
        fontFamily: fonts.MontserratMedium,
        fontSize: fontSizes.h4,
        marginVertical: 15,
    }
})

export default BidHistoryItem