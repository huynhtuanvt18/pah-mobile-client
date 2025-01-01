import React, { useState, useEffect } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    FlatList,
    KeyboardAvoidingView
} from 'react-native';
import { colors, fontSizes, fonts } from '../constants';
import IconFeather from 'react-native-vector-icons/Feather';
import IconSLI from 'react-native-vector-icons/SimpleLineIcons';

function Search(props) {
    // Navigation
    const { navigation, route } = props;

    // Function of navigate to/back
    const { navigate, goBack } = navigation;

    // Data
    const [searchText, setSearchText] = useState('');
    const [autocompleteSearch, setAutocompleteSearch] = useState([
        'đá',
        'dây chuyền',
        'bạc',
        'đồng',
        'hạt',
        'đồ gốm',
        'đồ gỗ'
    ]);

    useEffect(() => {
        if (route.params) {
            const { searchText } = route.params;
            setSearchText(searchText);
        }
    }, []);

    return <View style={styles.container}>
        {/* Search bar*/}
        <View style={styles.titleContainer}>
            <View style={{
                backgroundColor: colors.grey,
                flex: 1,
                borderRadius: 5,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 15
            }}>
                <TouchableOpacity onPress={() => {
                    goBack();
                }}>
                    <IconFeather name="chevron-left" size={25} color={'black'} />
                </TouchableOpacity>
                <TextInput
                    value={searchText}
                    placeholder='Tìm kiếm trên PAH...'
                    returnKeyType='search'
                    autoCapitalize='none'
                    autoFocus={true}
                    onChangeText={(text) => {
                        setSearchText(text);
                    }}
                    onSubmitEditing={() => {
                        navigate('Listing', { searchText: searchText })
                    }}
                    style={{
                        flex: 1,
                        marginHorizontal: 10,
                        color: 'black',
                        fontFamily: fonts.MontserratMedium,
                        fontSize: fontSizes.h4
                    }} />
                <TouchableOpacity onPress={()=>{
                    navigate('Listing', { searchText: searchText })
                }}>
                    <IconFeather name='search' size={20} color={'black'} />
                </TouchableOpacity>
            </View>
        </View>
        {/* Autocomplete search list */}
        <KeyboardAvoidingView style={{
            flex: 1
        }}>
            <FlatList data={autocompleteSearch}
                renderItem={({ item }) => {
                    return <TouchableOpacity style={{
                        paddingLeft: 50,
                        paddingRight: 15,
                        paddingVertical: 12,
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}
                        onPress={() => {
                            setSearchText(item)
                            navigate('Listing', { searchText: item })
                        }}>
                        <Text style={{
                            color: 'black',
                            fontFamily: fonts.MontserratMedium,
                            fontSize: fontSizes.h4
                        }}>{item}</Text>
                        <View style={{ flex: 1 }}></View>
                        <IconFeather name='arrow-up-left' size={28} color={'black'} />
                    </TouchableOpacity>
                }}
                keyExtractor={eachSearch => eachSearch} />
        </KeyboardAvoidingView>
    </View>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    iconButton: {
        padding: 12,
        borderRadius: 5,
        backgroundColor: colors.grey
    },
    titleContainer: {
        height: 70,
        flexDirection: 'row',
        padding: 10,
        justifyContent: 'space-between',
    },
    titleText: {
        color: 'black',
        fontFamily: fonts.MontserratBold,
        fontSize: fontSizes.h1,
        alignSelf: 'center'
    },
    titleButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    separator: {
        height: 1.5,
        backgroundColor: colors.darkGreyText,
        marginRight: 10
    }
});

export default Search;