import React, {useState, useContext, useEffect, useCallback} from 'react';
import {
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {colors, fontSizes, images, fonts} from '../constants';
import IconFeather from 'react-native-vector-icons/Feather';
import disclaimer from '../utilities/disclaimer.json';

function UserAgreement(props) {
  // Navigation
  const {navigation, route} = props;

  // Function of navigate to/back
  const {navigate, goBack} = navigation;
  return (
    <View style={styles.container}>
      {/* Fixed title*/}
      <View style={styles.titleContainer}>
        <View style={styles.titleButtonContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              goBack();
            }}>
            <IconFeather name="x" size={18} color={'black'} />
          </TouchableOpacity>
        </View>
        <Text style={styles.titleText} numberOfLines={1} ellipsizeMode="tail">
          Điều khoản sử dụng
        </Text>
      </View>

      {/*Content*/}
      <ScrollView style={styles.contentContainer}>
        {disclaimer.map(dis => (
          <View style={styles.sectionContainer} key={dis.title}>
            <Text style={styles.sectionTitle}>{dis.title}</Text>
            {dis.subTitle.map(disSub=>(
              <Text style={styles.sectionContent}>
              {disSub.name != null ?<Text style={{fontWeight:'bold'}}>{'\t'}{disSub.name}{'\n'}</Text>:null}
              {disSub.content.map(disContent=>(
                <Text>- {disContent}{'\n'}</Text>
              ))}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  titleText: {
    color: 'black',
    fontFamily: fonts.MontserratBold,
    fontSize: fontSizes.h1,
    alignSelf: 'center',
    marginLeft: 10,
  },
  titleButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    padding: 12,
    borderRadius: 5,
    backgroundColor: colors.grey,
  },
  titleContainer: {
    height: 70,
    flexDirection: 'row',
    paddingLeft: 15,
    paddingRight: 15,
  },
  contentContainer: {
    paddingHorizontal: 15,
  },
  sectionTitle: {
    color: colors.black,
    fontFamily: fonts.MontserratBold,
    fontSize: fontSizes.h3,
    textTransform: 'uppercase',
    marginBottom:10
  },
  sectionContent: {
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h5,
    textAlign: 'justify',
  },
});

export default UserAgreement;
