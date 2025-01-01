import React, { useState, useContext, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { colors, fontSizes, fonts, images } from '../../constants';
import Icon from 'react-native-vector-icons/FontAwesome5';
import IconFeather from 'react-native-vector-icons/Feather';
import { AxiosContext } from '../../context/AxiosContext';
import { Dropdown } from 'react-native-element-dropdown';
import { Wallet as WalletRepository } from '../../repositories';
import * as Keychain from 'react-native-keychain';
import Toast from 'react-native-toast-message';

function Withdraw(props) {
  // Axios context
  const axiosContext = useContext(AxiosContext);

  // Navigation
  const { navigation, route } = props;

  // Function of navigate to/back
  const { navigate, goBack } = navigation;

  //Data state
  const [bank, setBank] = useState(null);
  const [bankValue, setBankValue] = useState(null);
  const [bankNumber, setBankNumber] = useState('');
  const [amount, setAmount] = useState('50000');
  const [errorMessage, setErrorMessage] = useState('');

  //Validation
  const validationAmount = () => amount >= 50000;
  const validationOk = () =>
    bank != null && bankNumber.length > 0 && validationAmount();
  const [showBankNumber, setShowBankNumber] = useState(false);
  const [isBankFocus, setBankFocus] = useState(false);
  const bankData = [
    { label: 'Agribank', value: '1' },
    { label: 'CB', value: '2' },
    { label: 'Oceanbank', value: '3' },
    { label: 'BIDV', value: '4' },
    { label: 'VietinBank', value: '5' },
    { label: 'Viecombank', value: '6' },
    { label: 'VPBank', value: '7' },
    { label: 'MB', value: '8' },
    { label: 'Techcombank', value: '9' },
    { label: 'ACB', value: '10' },
    { label: 'SHB', value: '11' },
    { label: 'HDBank', value: '12' },
    { label: 'SCB', value: '13' },
    { label: 'Sacombank', value: '14' },
    { label: 'TPBank', value: '15' },
    { label: 'VIB', value: '16' },
    { label: 'MSB', value: '17' },
    { label: 'SeABank', value: '18' },
    { label: 'OCB', value: '19' },
    { label: 'Eximbank', value: '20' },
    { label: 'LPBank', value: '21' },
    { label: 'PVcombank', value: '22' },
    { label: 'Bac A Bank', value: '23' },
    { label: 'ABBank', value: '24' },
    { label: 'Dong A Bank', value: '25' },
    { label: 'BaoViet Bank', value: '26' },
    { label: 'Nam A Bank', value: '27' },
    { label: 'VietBank', value: '28' },
    { label: 'Viet A Bank', value: '29' },
    { label: 'NCB', value: '30' },
    { label: 'BVBank', value: '31' },
    { label: 'Kienlongbank', value: '32' },
    { label: 'Saigonbank', value: '33' },
    { label: 'PG Bank', value: '34' },
  ];

  // Loading states
  const [isResetLoading, setIsResetLoading] = useState(false);

  ////Function
  //Withdraw
  async function withdraw() {
    setErrorMessage('');
    setIsResetLoading(true);
    await WalletRepository.withdraw(axiosContext, {
      amount: parseInt(amount),
      bank: bank,
      bankNumber: bankNumber,
    })
      .then(response => {
        Toast.show({
          type: 'success',
          text1: 'Yêu cầu rút tiền đã được gửi',
          position: 'bottom',
          autoHide: true,
          visibilityTime: 2000,
        });
        goBack();
      })
      .catch(error => {
        setIsResetLoading(false);
        if(error.response.data.message){
          setErrorMessage(error.response.data.message);
        }
        if(error.response.data.Message){
          setErrorMessage(error.response.data.Message);
        }
        console.log(error)
      });
  }

  return (
    <KeyboardAvoidingView style={styles.container}>
      {/* Title */}
      <View style={styles.titleContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            goBack();
          }}>
          <IconFeather name="chevron-left" size={25} color={'black'} />
        </TouchableOpacity>
        <Text style={styles.titleText}>Rút tiền</Text>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            navigate('WithdrawHistory')
          }}>
          <IconFeather name="list" size={25} color={'black'} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={{ padding: 15 }}>
        <Image
          source={images.withdrawRequestImage}
          style={{
            resizeMode: 'contain',
            height: 100,
            width: 100,
            alignSelf: 'center',
            margin: 10,
          }}
        />
        {errorMessage == '' ? null : (
          <View style={styles.errorContainer}>
            <Icon color="red" name="exclamation-circle" size={25} />
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          </View>
        )}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Tên ngân hàng</Text>
          <Dropdown
            disable={bankData.length == 0}
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            itemTextStyle={styles.itemTextStyle}
            searchPlaceholder="Tìm ngân hàng..."
            placeholder={!isBankFocus ? 'Chọn ngân hàng' : '...'}
            search
            data={bankData}
            labelField="label"
            valueField="value"
            onFocus={() => setBankFocus(true)}
            onBlur={() => setBankFocus(false)}
            value={bankValue}
            onChange={item => {
              setBank(item.label);
              setBankValue(item.value)

              setBankFocus(false);
            }}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>số tài khoản</Text>
          <View style={{ justifyContent: 'center' }}>
            <TextInput
              autoCapitalize="none"
              style={styles.inputBox}
              value={bankNumber}
              secureTextEntry={!showBankNumber}
              keyboardType="numeric"
              onChangeText={text => {
                setBankNumber(text);
              }}
              placeholder="0123456789"
            />
            {showBankNumber ? (
              <Icon
                onPress={() => {
                  setShowBankNumber(!showBankNumber);
                }}
                style={{
                  position: 'absolute',
                  right: 10,
                }}
                name="eye"
                size={20}
              />
            ) : (
              <Icon
                onPress={() => {
                  setShowBankNumber(!showBankNumber);
                }}
                style={{
                  position: 'absolute',
                  right: 10,
                }}
                name="eye-slash"
                size={20}
              />
            )}
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Số tiền muốn rút</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              autoCapitalize="none"
              style={styles.inputBox}
              value={amount}
              keyboardType="numeric"
              onChangeText={text => {
                setAmount(text);
              }}
              placeholder="500000"
            />
            <Text style={[styles.inputLabel, { marginLeft: 5 }]}>VNĐ</Text>
          </View>
          {!validationAmount() && <Text style={{
              fontFamily: fonts.MontserratMedium,
              fontSize: fontSizes.h4,
              color: 'red'
            }}>Số tiền rút tối thiểu là 50,000 VNĐ</Text>}
        </View>
        <TouchableOpacity
          onPress={withdraw}
          disabled={!validationOk()}
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: validationOk() ? colors.primary : colors.inactive,
            marginHorizontal: 20,
            marginTop: 40,
            padding: 10,
            borderRadius: 10,
          }}>
          <Text style={styles.confirmText}>Xác nhận</Text>
        </TouchableOpacity>
      </ScrollView>
      {isResetLoading && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.inactive,
          }}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </KeyboardAvoidingView>
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
  iconButton: {
    marginLeft: 'auto',
    padding: 8,
    borderRadius: 5,
    backgroundColor: colors.grey,
  },
  titleContainer: {
    height: 70,
    flexDirection: 'row',
    paddingLeft: 15,
    paddingRight: 10,
    alignItems: 'center',
  },
  titleText: {
    color: 'black',
    fontFamily: fonts.MontserratBold,
    fontSize: fontSizes.h1,
    alignSelf: 'center',
    marginLeft: 5,
  },
  contentText: {
    color: 'white',
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h5,
    textAlign: 'center',
  },
  confirmText: {
    color: 'white',
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h3,
    textAlign: 'center',
  },
  errorConfirmText: {
    color: 'red',
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h6,
    paddingHorizontal: 5,
  },
  errorText: {
    color: 'red',
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h6,
    paddingHorizontal: 5,
  },
  errorContainer: {
    paddingHorizontal: 15,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  errorMessage: {
    color: 'red',
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h5,
    marginLeft: 5,
  },
  inputContainer: {
    justifyContent: 'center',
    marginBottom: 20,
  },
  inputBox: {
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    height: 50,
    borderColor: colors.black,
    borderRadius: 5,
    borderWidth: 1,
    fontSize: fontSizes.h4,
    paddingHorizontal: 15,
    flex: 1,
  },
  inputLabel: {
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h4,
    marginBottom: 5,
  },
  dropdown: {
    height: 50,
    borderColor: colors.black,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 5,
  },
  placeholderStyle: {
    color: colors.greyText,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h4,
    marginLeft: 10,
  },
  selectedTextStyle: {
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h4,
    marginLeft: 10,
  },
  inputSearchStyle: {
    color: colors.darkGreyText,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h4,
    marginLeft: 10,
  },
  itemTextStyle: {
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h4,
    marginLeft: 10,
  },
});
export default Withdraw;
