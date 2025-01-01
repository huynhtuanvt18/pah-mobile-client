import React, {useState, useContext, useEffect} from 'react';
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
import {colors, fontSizes, fonts, images} from '../constants';
import Icon from 'react-native-vector-icons/FontAwesome5';
import IconFeather from 'react-native-vector-icons/Feather';
import {isValidPassword, isValidEmail} from '../utilities/Validation';
import {AxiosContext} from '../context/AxiosContext';
import {Account as AccountRepository} from '../repositories';
import {CountdownCircleTimer} from 'react-native-countdown-circle-timer';
import * as Keychain from 'react-native-keychain';
import Toast from 'react-native-toast-message';

function ChangePassword(props) {
  // Axios context
  const axiosContext = useContext(AxiosContext);

  // Navigation
  const {navigation, route} = props;

  // Function of navigate to/back
  const {navigate, goBack} = navigation;

  //input data
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  //validation
  const validationOk = () =>
    oldPassword.length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0 &&
    
    passwordConfirmValidation();
  const passwordValidation = () => isValidPassword(password);
  const passwordConfirmValidation = () => password === confirmPassword;
  const [showPasswordConfirmValidation, setShowPasswordConfirmValidation] =
    useState(false);

  // Loading states
  const [isResetLoading, setIsResetLoading] = useState(false);

  ////FUNCTION

  //Forget password request
  async function changePassword() {
    setErrorMessage('');
    setIsResetLoading(true);
    await AccountRepository.changePassword(axiosContext, {
      oldPassword: oldPassword,
      newPassword: password,
      confirmPassword: confirmPassword,
    })
      .then(response => {
        Toast.show({
          type: 'success',
          text1: 'Mật khẩu được đổi thành công',
          position: 'bottom',
          autoHide: true,
          visibilityTime: 2000,
        });
        goBack();
      })
      .catch(error => {
        setIsResetLoading(false);
        if(error.response.data.Message){
          setErrorMessage(error.response.data.Message);
        }
        if(error.response.data.message){
          setErrorMessage(error.response.data.message);
        }
      });
  }

  return (
    <KeyboardAvoidingView style={styles.container}>
      {/* Fixed screen title: logo and cart and search icon */}
      <View style={styles.titleContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            goBack();
          }}>
          <IconFeather name="chevron-left" size={25} color={'black'} />
        </TouchableOpacity>
      </View>
      {/* Content */}
      <ScrollView style={{padding: 15}}>
        <Image
          source={images.changePasswordImage}
          style={{
            resizeMode: 'contain',
            height: 100,
            width: 100,
            alignSelf: 'center',
            margin: 10,
          }}
        />
        <Text style={styles.titleText}>Đổi mật khẩu</Text>
        {errorMessage == '' ? null : (
          <View style={styles.errorContainer}>
            <Icon color='red' name="exclamation-circle" size={25} />
            <Text
              style={styles.errorMessage}>
              {errorMessage}
            </Text>
          </View>
        )}
        <View style={styles.inputContainer}>
          <TextInput
            autoCapitalize="none"
            style={styles.inputBox}
            value={oldPassword}
            secureTextEntry={!showOldPassword}
            onChangeText={text => {
              setOldPassword(text);
            }}
            placeholder="Nhập mật khẩu cũ"
          />
          {showOldPassword ? (
            <Icon
              onPress={() => {
                setShowOldPassword(!showOldPassword);
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
                setShowOldPassword(!showOldPassword);
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
        <View style={styles.inputContainer}>
          <TextInput
            autoCapitalize="none"
            style={styles.inputBox}
            value={password}
            secureTextEntry={!showPassword}
            onChangeText={text => {
              setPassword(text);
            }}
            placeholder="Nhập mật khẩu mới"
          />
          {showPassword ? (
            <Icon
              onPress={() => {
                setShowPassword(!showPassword);
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
                setShowPassword(!showPassword);
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
        <View style={styles.inputContainer}>
          <TextInput
            autoCapitalize="none"
            style={styles.inputBox}
            value={confirmPassword}
            secureTextEntry={!showConfirmPassword}
            onChangeText={text => {
              setConfirmPassword(text);
              setShowPasswordConfirmValidation(true);
            }}
            placeholder="Xác nhận mật khẩu mới"
          />
          {showConfirmPassword ? (
            <Icon
              onPress={() => {
                setShowConfirmPassword(!showConfirmPassword);
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
                setShowConfirmPassword(!showConfirmPassword);
              }}
              style={{
                position: 'absolute',
                right: 10,
              }}
              name="eye-slash"
              size={20}
            />
          )}
          {!passwordConfirmValidation() && showPasswordConfirmValidation && (
            <Text style={styles.errorConfirmText}>
              Mật khẩu nhập lại không trùng khớp
            </Text>
          )}
        </View>
        <TouchableOpacity
          disabled={!validationOk()}
          onPress={changePassword}
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
  iconButton: {
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
    margin: 20,
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
    paddingHorizontal:15,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  errorMessage: {
    color: 'red',
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h5,
    marginLeft: 5
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
  },
});
export default ChangePassword;
