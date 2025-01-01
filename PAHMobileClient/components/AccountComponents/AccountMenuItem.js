import React from 'react';
import {
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { colors, fontSizes, fonts } from '../../constants';
import IconFeather from 'react-native-vector-icons/Feather';

function AccountMenuItem(props) {
    // Navigation
    const { onPress, iconName, text } = props;

    return <TouchableOpacity style={styles.menuContainer}
        onPress={onPress}>
        <IconFeather name={iconName} size={25} color={colors.darkGreyText} />
        <Text style={styles.menuText}>{text}</Text>
    </TouchableOpacity>
}

const styles = StyleSheet.create({
    menuContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10
    },
    menuText: {
        color: colors.darkGreyText,
        fontFamily: fonts.MontserratMedium,
        fontSize: fontSizes.h4,
        marginLeft: 10
    }
});

export default AccountMenuItem;