import React from 'react';
import {
    Text,
    Image,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import { colors, fontSizes, fonts, images } from '../../constants';
import { numberWithCommas } from '../../utilities/PriceFormat';

function HomeItemCard(props) {
    const { item, onPress, index } = props;
    const { name, imageUrl = images.defaultAvatar, price } = item;

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
            style={styles.itemTitle}>{name}</Text>
        <Text numberOfLines={2}
            ellipsizeMode='tail'
            style={styles.itemPrice}>₫{numberWithCommas(price)}</Text>
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

export default HomeItemCard;