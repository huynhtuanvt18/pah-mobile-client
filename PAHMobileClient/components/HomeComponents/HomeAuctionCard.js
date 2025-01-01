import React from 'react';
import {
    Text,
    Image,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import { fontSizes, fonts, images, colors } from '../../constants';
import TimeLeft from '../TimeLeft';
import { numberWithCommas } from '../../utilities/PriceFormat';

function HomeAuctionCard(props) {
    const { item, onPress, index } = props;
    const { title, registrationEnd, currentPrice, imageUrl = images.defaultAvatar } = item;

    return <TouchableOpacity
        onPress={onPress}
        style={{
            marginHorizontal: 15,
            marginLeft: index == 0 ? 15 : 0
        }}>
        <Image source={{ uri: imageUrl }}
            style={styles.itemImage} />
        <Text numberOfLines={2}
            ellipsizeMode='tail'
            style={styles.itemTitle}>{title}</Text>
        <Text numberOfLines={2}
            ellipsizeMode='tail'
            style={styles.itemPrice}>₫{numberWithCommas(currentPrice)}</Text>
        {registrationEnd != undefined && <TimeLeft prefixText={'Đóng đăng ký trong'} width={160} closedTime={registrationEnd} />}
    </TouchableOpacity>
}

const styles = StyleSheet.create({
    itemImage: {
        width: 170,
        height: 170,
        resizeMode: 'cover',
        borderRadius: 5,
        marginBottom: 10
    },
    itemTitle: {
        width: 160,
        height: 45,
        color: 'black',
        fontFamily: fonts.MontserratMedium,
        fontWeight: '600',
        fontSize: fontSizes.h4
    },
    itemPrice: {
        width: 160,
        color: colors.primary,
        fontFamily: fonts.MontserratMedium,
        fontSize: fontSizes.h3
    }
})

export default HomeAuctionCard;