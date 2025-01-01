import React from 'react';
import {
    Text,
    View,
    Image,
    TouchableOpacity,
} from 'react-native';
import { colors, fontSizes, fonts, images } from '../../constants';
import { numberWithCommas } from '../../utilities/PriceFormat';

function ProductListingCard(props) {
    const { product, onPress, index } = props;
    const { name, imageUrl = images.defaultAvatar, price } = product;

    return <View style={{
        paddingHorizontal: 15
    }}>
        {index != 0 && <View style={{
            height: 1.2,
            backgroundColor: colors.darkGrey,
            marginTop: 10,
            marginBottom: 15
        }}></View>}
        <TouchableOpacity style={{
            flexDirection: 'row'
        }}
            onPress={onPress}
        >
            <Image source={{ uri: imageUrl }}
                style={{
                    resizeMode: 'cover',
                    width: 140,
                    height: 140,
                    borderRadius: 5
                }} />
            <View style={{
                flex: 1,
                marginLeft: 15
            }}>
                <Text
                    numberOfLines={3}
                    ellipsizeMode='tail'
                    style={{
                        color: 'black',
                        fontFamily: fonts.MontserratMedium,
                        fontSize: fontSizes.h4,
                        marginBottom: 5
                    }}>{name}</Text>
                <Text
                    numberOfLines={2}
                    ellipsizeMode='tail'
                    style={{
                        color: colors.primary,
                        fontFamily: fonts.MontserratMedium,
                        fontSize: fontSizes.h3
                    }}>₫{numberWithCommas(price)}</Text>
            </View>
        </TouchableOpacity>
    </View>
}

export default ProductListingCard;