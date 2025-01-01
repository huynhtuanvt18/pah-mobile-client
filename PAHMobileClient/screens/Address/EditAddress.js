import React, { useContext, useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { colors, fonts, fontSizes } from '../../constants';
import { Dropdown } from 'react-native-element-dropdown';
import IconFeather from 'react-native-vector-icons/Feather';
import { AxiosContext } from '../../context/AxiosContext';
import {
  Address as AddressRepository
} from '../../repositories';
import Modal from 'react-native-modal';

function EditAddress(props) {
  //// AXIOS AND NAVIGATION
  const axiosContext = useContext(AxiosContext);
  // Navigation
  const { navigation, route } = props;
  // Function of navigate to/back
  const { navigate, goBack } = navigation;

  //// DATA
  // Get addressID from routes
  const { id, recipientName, recipientPhone, streetParam, provinceParam,
    provinceIdParam, districtParam, districtIdParam, wardParam, wardCodeParam,
    typeParam, isDefaultParam } = props.route.params;

  //Input state
  const [name, setName] = useState(recipientName);
  const [phone, setPhone] = useState(recipientPhone);
  const [street, setStreet] = useState(streetParam);

  //Dropdown input state
  const [province, setProvince] = useState(provinceParam);
  const [provinceId, setProvinceId] = useState(provinceIdParam);
  const [district, setDistrict] = useState(districtParam);
  const [districtId, setDistrictId] = useState(districtIdParam);
  const [ward, setWard] = useState(wardParam);
  const [wardCode, setWardCode] = useState(wardCodeParam);

  const [isProvinceFocus, setProvinceFocus] = useState(false);
  const [isDistrictFocus, setDistrictFocus] = useState(false);
  const [isWardFocus, setWardFocus] = useState(false);

  // Default address validate
  const [isDefault, setDefault] = useState(isDefaultParam);

  //Province data
  const [provinceList, setProvinceList] = useState([]);
  //District data
  const [districtList, setDistrictList] = useState([]);
  //Ward data
  const [wardList, setWardList] = useState([]);
  // Data for loading and refreshing
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCreate, setIsLoadingCreate] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);

  // Validating
  const validate = () => name.length > 0 && phone.length > 0 && street.length > 0
    && province != null && district != null && districtId != null
    && ward != null && wardCode != null;
  const [errorMessage, setErrorMessage] = useState('');

  // Delete confirm modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  //// FUNCTION
  // Get Province list
  function getProvinceList() {
    AddressRepository.getProvinceList()
      .then(response => {
        setProvinceList(response);
      })
  }

  // Get District list by province id
  function getDistrictList(provinceId) {
    AddressRepository.getDistrictListByProvinceId(provinceId)
      .then(response => {
        setDistrictList(response);
      })
  }

  // Get ward list by district id
  function getWardList(districtId) {
    AddressRepository.getWardListByDistrictId(districtId)
      .then(response => {
        setWardList(response);
      })
  }

  // Create address
  function updateAddress() {
    setErrorMessage('');
    setIsLoadingCreate(true);
    AddressRepository.updateAddress(axiosContext, {
      id: id,
      recipientName: name,
      recipientPhone: phone,
      province: province,
      provinceId: provinceId,
      district: district,
      districtId: districtId,
      ward: ward,
      wardCode: wardCode,
      street: street,
      type: typeParam,
      isDefault: isDefault
    })
      .then(response => {
        goBack();
        setIsLoadingCreate(false);
      })
      .catch(error => {
        setIsLoadingCreate(false);
        if(error.response.data.message){
          setErrorMessage(error.response.data.message);
        }
        if(error.response.data.Message){
          setErrorMessage(error.response.data.Message);
        }
        console.log(error.response)
      })
  }

  // Delete Address
  function deleteAddress() {
    setIsLoadingDelete(true);
    AddressRepository.deleteAddress(axiosContext, id)
      .then(response => {
        setIsLoadingDelete(false);
        goBack();
      })
      .catch(err => {
        setIsLoadingDelete(false)
      })
  }

  // On init screen, get province list
  useEffect(() => {
    setIsLoading(true);
    // Get Provinces
    const promiseProvince = AddressRepository.getProvinceList()
      .then(response => {
        setProvinceList(response);
      });

    // Get Districts
    const promiseDistrict = AddressRepository.getDistrictListByProvinceId(provinceId)
      .then(response => {
        setDistrictList(response);
      });

    // Get Wards
    const promiseWard = AddressRepository.getWardListByDistrictId(districtId)
      .then(response => {
        setWardList(response);
      });

    Promise.all([promiseProvince, promiseDistrict, promiseWard])
      .then((values) => {
        setIsLoading(false);
      })
      .catch(error => {
        setIsLoading(false);
      });
  }, [])

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.titleContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            goBack();
          }}>
          <IconFeather name="chevron-left" size={25} color={'black'} />
        </TouchableOpacity>
        <Text style={styles.titleText}>Sửa địa chỉ</Text>
        <TouchableOpacity
          disabled={!validate()}
          style={styles.doneButton}
          onPress={() => {
            updateAddress()
          }}>
          <Text
            style={{
              color: validate() ? colors.primary : colors.darkGreyText,
              fontSize: fontSizes.h4,
              fontFamily: fonts.MontserratMedium,
            }}>
            Xong
          </Text>
        </TouchableOpacity>
      </View>
      {errorMessage == '' ? null : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          </View>
        )}
      {/* Input */}
      {isLoading ? <View style={{
        flex: 1,
        justifyContent: 'center'
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View> : <View style={styles.inputContainer}>
        <TextInput
          value={name}
          onChangeText={text => {
            setName(text);
          }}
          style={styles.inputBox}
          placeholder="Tên người nhận"
          placeholderTextColor={colors.darkGreyText}
        />
        <TextInput
          value={phone}
          onChangeText={text => {
            setPhone(text);
          }}
          style={styles.inputBox}
          placeholder="Số điện thoại"
          placeholderTextColor={colors.darkGreyText}
          keyboardType='phone-pad'
        />
        <TextInput
          value={street}
          onChangeText={text => {
            setStreet(text);
          }}
          style={styles.inputBox}
          placeholder="Số nhà, tên đường"
          placeholderTextColor={colors.darkGreyText}
        />
        <Dropdown
          disable={provinceList.length == 0}
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          itemTextStyle={styles.itemTextStyle}
          searchPlaceholder="Tìm thành phố..."
          placeholder={!isProvinceFocus ? 'Chọn thành phố' : '...'}
          search
          data={provinceList}
          labelField="provinceName"
          valueField="provinceId"
          value={provinceId}
          onFocus={() => setProvinceFocus(true)}
          onBlur={() => setProvinceFocus(false)}
          onChange={item => {
            setProvince(item.provinceName);
            setProvinceId(item.provinceId);
            setDistrictList([]);
            setDistrict(null);
            setDistrictId(null);

            setWardList([]);
            setWard(null);
            setWardCode(null);

            getDistrictList(item.provinceId);
            setProvinceFocus(false);
          }}
        />
        <Dropdown
          disable={districtList.length == 0}
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          itemTextStyle={styles.itemTextStyle}
          searchPlaceholder="Tìm quận, huyện..."
          placeholder={!isDistrictFocus ? 'Chọn quận, huyện' : '...'}
          search
          data={districtList}
          value={districtId}
          labelField="districtName"
          valueField="districtId"
          onFocus={() => setDistrictFocus(true)}
          onBlur={() => setDistrictFocus(false)}
          dropdownPosition='top'
          onChange={item => {
            setDistrict(item.districtName);
            setDistrictId(item.districtId);

            setWardList([]);
            setWard(null);
            setWardCode(null);

            getWardList(item.districtId);

            setDistrictFocus(false);
          }}
        />
        <Dropdown
          disable={wardList.length == 0}
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          itemTextStyle={styles.itemTextStyle}
          searchPlaceholder="Tìm phường, xã"
          placeholder={!isWardFocus ? 'Chọn phường, xã' : '...'}
          search
          data={wardList}
          value={wardCode}
          labelField="wardName"
          valueField="wardCode"
          onFocus={() => setWardFocus(true)}
          onBlur={() => setWardFocus(false)}
          dropdownPosition='top'
          onChange={item => {
            setWard(item.wardName);
            setWardCode(item.wardCode);
            setWardFocus(false);
          }}
        />
        {!isDefaultParam ? <View>
          <TouchableOpacity
            onPress={() => {
              setDefault(!isDefault);
            }}
            style={{
              flexDirection: 'row',
              gap: 10,
            }}>
            {isDefault === true ? (
              <IconFeather name="check-square" size={20} color={colors.black} />
            ) : (
              <IconFeather name="square" size={20} color={colors.black} />
            )}
            <Text
              style={{
                color: colors.black,
                fontSize: fontSizes.h4,
                fontFamily: fonts.MontserratMedium,
              }}>
              Đặt làm địa chỉ giao hàng mặc định
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: 30 }}
            onPress={() => { setDeleteModalVisible(!deleteModalVisible) }}>
            <Text
              style={{
                color: 'red',
                fontSize: fontSizes.h4,
                fontFamily: fonts.MontserratMedium,
              }}>
              Xóa địa chỉ này
            </Text>
          </TouchableOpacity>
        </View> : <Text
          style={{
            color: colors.black,
            fontSize: fontSizes.h4,
            fontFamily: fonts.MontserratMedium,
            marginLeft: 5
          }}>
          Địa chỉ hiện tại đang là địa chỉ {typeParam == 1 ? 'giao hàng' : 'lấy hàng'} mặc định
        </Text>}
      </View>}
      {isLoadingCreate && <View style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.inactive
      }}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>}

      {/* Delete confirm Modal */}
      <Modal
        animationIn='fadeIn'
        animationOut='fadeOut'
        isVisible={deleteModalVisible}
        onRequestClose={() => {
          setDeleteModalVisible(!deleteModalVisible)
        }}
        style={{ margin: 0 }}>
        <View style={{
          flex: 1,
          flexDirection: 'row'
        }}>
          <TouchableOpacity style={{ flex: 1 }}
            onPress={() => {
              setDeleteModalVisible(!deleteModalVisible)
            }}></TouchableOpacity>
          <View style={{
            position: 'absolute',
            top: '40%',
            left: '10%',
            width: '80%',
            height: '15%',
            backgroundColor: 'white',
            justifyContent: 'center'
          }}>
            <Text style={{
              color: 'black',
              fontFamily: fonts.MontserratMedium,
              fontSize: fontSizes.h4,
              marginHorizontal: 15
            }}>Bạn có chắc chắn muốn xóa địa chỉ này không?</Text>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              gap: 30,
              marginTop: 15,
              marginHorizontal: 15,
              alignItems: 'center'
            }}>
              <TouchableOpacity onPress={() => {
                setDeleteModalVisible(!deleteModalVisible)
              }}>
                <Text style={{
                  color: 'black',
                  fontFamily: fonts.MontserratMedium,
                  fontSize: fontSizes.h4
                }}>Không</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={isLoadingDelete}
                onPress={() => { deleteAddress() }}>
                <Text style={{
                  color: 'red',
                  fontFamily: fonts.MontserratMedium,
                  fontSize: fontSizes.h4,
                }}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  doneButton: {
    marginLeft: 'auto',
    padding: 8,
    borderRadius: 5,
  },
  titleContainer: {
    height: 70,
    flexDirection: 'row',
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  titleText: {
    color: colors.black,
    fontFamily: fonts.MontserratBold,
    fontSize: fontSizes.h1,
    alignSelf: 'center',
    marginLeft:5
  },
  inputContainer: {
    flex: 1,
    backgroundColor: 'white',
    gap: 40,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  inputBox: {
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    height: 50,
    borderColor: colors.black,
    borderRadius: 8,
    borderBottomWidth: 1,
    fontSize: fontSizes.h4
  },
  dropdown: {
    height: 50,
    borderColor: colors.black,
    borderBottomWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 5,
  },
  placeholderStyle: {
    color: colors.darkGreyText,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h4,
  },
  selectedTextStyle: {
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h4,
  },
  inputSearchStyle: {
    color: colors.darkGreyText,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h4,
  },
  itemTextStyle: {
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h4,
  },
  errorContainer: {
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
  },
  errorMessage: {
    color: 'red',
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h5,
    marginLeft: 5,
  },
});
export default EditAddress;
