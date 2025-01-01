import React, { useContext, useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { colors, fonts, fontSizes } from '../../constants';
import IconFeather from 'react-native-vector-icons/Feather';
import { AxiosContext } from '../../context/AxiosContext';
import { Address as AddressRepository } from '../../repositories';
import { useIsFocused } from '@react-navigation/native';

function Address(props) {
  //// Axios AND NAVIGATION
  // Axios Context
  const axiosContext = useContext(AxiosContext);

  // Navigation
  const { navigation, route } = props;

  // Function of navigate to/back
  const { navigate, goBack } = navigation;

  // On focus
  const isFocused = useIsFocused();

  //// DATA
  // Address
  const [addresses, setAddresses] = useState([]);

  // Data for loading and refreshing
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  //// FUNCTION
  // Get all address
  function getAllAddress() {
    setIsLoading(true);
    AddressRepository.getAllAdrressCurrentUser(axiosContext)
      .then(response => {
        setAddresses(response);
        setIsLoading(false);
      })
      .catch(error => {
        setIsLoading(false);
      })
  }

  useEffect(() => {
    getAllAddress();
  }, []);

  useEffect(() => {
    getAllAddress();
  }, [isFocused]);

  // Scroll view refresh
  const onRefresh = () => {
    setRefreshing(true);
    getAllAddress();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <View style={styles.titleContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              goBack();
            }}>
            <IconFeather name="chevron-left" size={25} color={'black'} />
          </TouchableOpacity>
          <Text style={styles.titleText}>Địa chỉ</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              navigate('AddAddress');
            }}>
            <IconFeather name="plus" size={25} color={'black'} />
          </TouchableOpacity>
        </View>
        {isLoading ? <View style={{
          flex: 1,
          justifyContent: 'center'
        }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View> : <View>
          {addresses.length > 0 ? <ScrollView
            style={{
              paddingHorizontal: 15,
            }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }><View style={{ marginBottom: 100 }}>
              {addresses.map(address => (
                <TouchableOpacity
                  disabled={address.type == 2}
                  onPress={() => {
                    navigate('EditAddress', {
                      id: address.id,
                      recipientName: address.recipientName,
                      recipientPhone: address.recipientPhone,
                      streetParam: address.street,
                      provinceParam: address.province,
                      provinceIdParam: address.provinceId,
                      districtParam: address.district,
                      districtIdParam: address.districtId,
                      wardParam: address.ward,
                      wardCodeParam: address.wardCode,
                      typeParam: address.type,
                      isDefaultParam: address.isDefault
                    })
                  }}
                  key={address.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderColor: colors.darkGrey,
                    paddingVertical: 10,
                    paddingHorizontal: 5,
                    borderBottomWidth: 1,
                  }}>
                  <View style={{ alignItems: 'baseline' }}>
                    {address.isDefault ? (
                      <Text
                        style={{
                          color: colors.black,
                          fontFamily: fonts.MontserratBold,
                          fontSize: fontSizes.h6,
                          borderWidth: 1,
                          paddingHorizontal: 10,
                          marginBottom: 5
                        }}>
                        Địa chỉ {address.type == 1 ? 'giao hàng' : 'lấy hàng'} mặc định
                      </Text>
                    ) : null}
                    <Text
                      style={{
                        color: colors.black,
                      }}>
                      {address.recipientName}
                    </Text>
                    <Text
                      style={{
                        color: colors.black,
                      }}>
                      {address.street}
                    </Text>
                    <Text
                      style={{
                        color: colors.black,
                      }}>
                      {address.ward}, {address.district}
                    </Text>
                    <Text
                      style={{
                        color: colors.black,
                      }}>
                      {address.province}
                    </Text>
                    <Text
                      style={{
                        color: colors.black,
                      }}>
                      {address.recipientPhone}
                    </Text>
                    <Text
                      style={{
                        color: colors.black,
                        marginTop: 5
                      }}>
                      {address.type == 1 ? "Địa chỉ nhận hàng" : "Địa chỉ lấy hàng"}
                    </Text>
                  </View>
                  <View style={{
                    marginLeft: 'auto'
                  }}>
                    <IconFeather
                      name="chevron-right"
                      size={20}
                      color={'black'}
                    />
                  </View>
                </TouchableOpacity>
              ))}</View>
          </ScrollView> : <View>
            <Text style={styles.emptyText}>Không có địa chỉ nào để hiển thị</Text>
          </View>}
        </View>}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: colors.grey,
  },
  addButton: {
    marginLeft: 'auto',
    padding: 8,
    borderRadius: 5,
    backgroundColor: colors.grey,
  },
  titleContainer: {
    height: 70,
    flexDirection: 'row',
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  titleText: {
    color: 'black',
    fontFamily: fonts.MontserratBold,
    fontSize: fontSizes.h1,
    alignSelf: 'center',
    marginLeft:5
  },
  emptyText: {
    color: colors.greyText,
    fontSize: fontSizes.h4,
    textAlign: 'center',
    fontFamily: fonts.MontserratMedium,
    marginVertical: 30
  }
});
export default Address;
