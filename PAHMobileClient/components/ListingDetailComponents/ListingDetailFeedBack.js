import React, { useState, useEffect } from 'react';
import {
    Text,
    StyleSheet,
    View
} from 'react-native';
import { colors, fontSizes, fonts } from '../../constants';
import TimeLeft from '../TimeLeft';

function ListingDetailFeedback(props) {
    const { feedback, index, length } = props;
    const { id, ratings, buyerFeedback, timestamp, buyerName } = feedback;

    return <View key={id} style={{
        marginBottom: 15
    }}>
        <View style={{
            flexDirection: 'row'
        }}>
            <Text style={styles.feedbackLabel}>{buyerName} -</Text>
            <TimeLeft closedTime={ timestamp} textStyle={styles.feedbackLabel} showText={false}/>
        </View>
        <Text style={styles.feedbackContent}>{buyerFeedback}</Text>
        {index != length && <View style={styles.separator}></View>}
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

export default ListingDetailFeedback