import React, { useContext, useState, useEffect } from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { AxiosContext } from '../context/AxiosContext';
import { colors, fontSizes, fonts, images } from '../constants';
import IconFeather from 'react-native-vector-icons/Feather';
import { UnauthorizedAccountScreen, SellerHomeView, SellerRegisterView } from '../components';
import {
  Account as AccountRepository
} from '../repositories';
import { useIsFocused } from '@react-navigation/native';

function Seller(props) {
  //// AUTH AND NAVIGATION
  const authContext = useContext(AuthContext);
  const axiosContext = useContext(AxiosContext);

  // Navigation
  const { navigation, route } = props;

  // Function of navigate to/back
  const { navigate, goBack } = navigation;

  //// DATA
  const [user, setUser] = useState({ role: 1 });
  // Data for loading and refreshing
  const [isLoading, setIsLoading] = useState(true);

  // Data for failedFetch
  const [isEmpty, setIsEmpty] = useState(false);

  // On focus
  const isFocused = useIsFocused();

  //// FUNCTION
  // Function for getting currentuser info
  function getCurrentUserInfo() {
    AccountRepository.getInfoCurrentUser(axiosContext)
      .then(response => {
        setUser(response);
        setIsLoading(false);
        setIsEmpty(false);
      })
      .catch(err => {
        setIsLoading(false);
        setIsEmpty(true);
      })
  }

  useEffect(() => {
    // If user is logined
    if (authContext?.authState?.authenticated) {
      setIsLoading(true);
      getCurrentUserInfo();
    }
  }, [])

  useEffect(() => {
    // If user is logined
    if (authContext?.authState?.authenticated) {
      setIsLoading(true);
      getCurrentUserInfo();
    }
  }, [isFocused]);

  return (
    <View style={styles.container}>
      {/* Fixed screen title: logo and cart and search icon */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Bán hàng</Text>
        <View style={styles.titleButtonContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              navigate('Search');
            }}>
            <IconFeather name="search" size={18} color={'black'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              navigate('Cart');
            }}>
            <IconFeather name="shopping-cart" size={18} color={'black'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Check if logined? If guest, show login/register navigation page. If logined,
      check for role: buyer: show seller registration page, seller: show seller dashboard  */}
      {!authContext?.authState?.authenticated ? (
        <UnauthorizedAccountScreen navigation={navigation} route={route} />
      ) : <View style={{ flex: 1 }}>
        {isLoading ? <View style={{
          flex: 1,
          justifyContent: 'center'
        }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View> : <View style={{ flex: 1 }}>
          {isEmpty ? <View style={{
            flex: 1,
            alignItems: 'center',
            paddingTop: 150
          }}>
            <Image source={images.warningImage} style={{
              resizeMode: 'cover',
              width: 140,
              height: 140
            }} />
            <Text style={{
              fontSize: fontSizes.h4,
              fontFamily: fonts.MontserratMedium,
              color: 'black',
              textAlign: 'center',
              marginHorizontal: 35,
              marginTop: 10
            }}>Không thể kết nối tới máy chủ.</Text>
            <TouchableOpacity onPress={() => getCurrentUserInfo()}>
              <Text style={{
                fontSize: fontSizes.h5,
                fontFamily: fonts.MontserratMedium,
                color: colors.primary,
                textAlign: 'center',
                marginHorizontal: 35,
                marginTop: 20
              }}>Tải lại</Text>
            </TouchableOpacity>
          </View> : <View
            style={{
              flex: 1,
              paddingHorizontal: 5,
            }}>
            {user.role != 2 ? (
              <SellerRegisterView navigation={navigation} route={route}/>
            ) : (
              <SellerHomeView user={user} navigation={navigation} route={route} />
            )}
          </View>}
        </View>}
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  iconButton: {
    padding: 12,
    borderRadius: 5,
    backgroundColor: colors.grey
},
  titleContainer: {
    height: 70,
    flexDirection: 'row',
    paddingLeft: 15,
    paddingRight: 10,
    justifyContent: 'space-between',
  },
  titleText: {
    color: 'black',
    fontFamily: fonts.MontserratBold,
    fontSize: fontSizes.h1,
    alignSelf: 'center',
    marginLeft:5
  },
  titleButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  separator: {
    height: 1.5,
    backgroundColor: colors.darkGreyText,
    marginRight: 10,
  },
  listItemButtonStyle: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    padding: 15,
    marginHorizontal: 15
  },
  totalMoneyStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  totalTextStyle: {
    fontSize: fontSizes.h1 * 2,
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
  },
  subtotalTextStyle: {
    fontSize: fontSizes.h6,
    color: colors.darkGreyText,
    fontFamily: fonts.MontserratMedium,
  },
  statStyle: {
    fontSize: fontSizes.h1 * 1.5,
    color: colors.primary,
    fontFamily: fonts.MontserratMedium,
  },
  statTitleStyle: {
    fontSize: fontSizes.h6,
    color: colors.darkGreyText,
    fontFamily: fonts.MontserratMedium,
  },
});

export default Seller;
