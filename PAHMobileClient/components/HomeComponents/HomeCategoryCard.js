import React from 'react';
import {
    Text,
    Image,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import { colors, fontSizes, fonts } from '../../constants';

function HomeCategoryCard(props) {
    const { item, onPress, index } = props;
    const { name, imageUrl } = item;

    return <TouchableOpacity
        onPress={onPress}
        style={{
            alignItems: 'center',
            backgroundColor: colors.grey,
            marginHorizontal: 10,
            borderRadius: 5,
            paddingBottom: 15,
            paddingHorizontal: 5,
            marginLeft: index == 0 ? 15 : 5
        }}>
        <Image source={{ uri: imageUrl }}
            style={styles.itemImage} />
        <Text numberOfLines={2}
            ellipsizeMode='tail'
            style={styles.itemTitle}>{name}</Text>
    </TouchableOpacity>
}

const styles = StyleSheet.create({
    itemImage: {
        width: 100,
        height: 100,
        margin: 10,
        resizeMode: 'cover'
    },
    itemTitle: {
        marginTop: 5,
        width: 100,
        height: 40,
        color: 'black',
        fontFamily: fonts.MontserratMedium,
        fontSize: fontSizes.h5,
        textAlign: 'center'
    }
})

export default HomeCategoryCard;