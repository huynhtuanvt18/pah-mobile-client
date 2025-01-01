import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {colors, fontSizes, fonts} from '../../constants';
import {isValidPassword} from '../../utilities/Validation';
import Icon from 'react-native-vector-icons/FontAwesome5';

function RegisterView2(props) {
  //states for validating
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const passwordValidation = () => isValidPassword(password);
  const passwordConfirmValidation = () => password === passwordConfirm;

  const validationOk = () =>
    passwordValidation() && passwordConfirmValidation();

  const [showPasswordConfirmValidation, setShowPasswordConfirmValidation] =
    useState(false);
  const {
    password,
    setPassword,
    onAccountCreate,
    setEmailCheck,
    errorMessage,
    onPressUser,
    onPressPrivacy,
  } = props;

  return (
    <View style={{padding: 15}}>
      {errorMessage != '' && (
        <Text
          style={{
            color: 'red',
            fontFamily: fonts.MontserratMedium,
            fontSize: fontSizes.h4,
          }}>
          Lỗi: {errorMessage}
        </Text>
      )}
      <Text style={styles.welcomeText}>Tạo mật khẩu</Text>
      <View style={{marginBottom: 10}}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputBox}
            value={password}
            secureTextEntry={!showPassword}
            onChangeText={text => {
              setPassword(text);
            }}
            placeholder="Nhập mật khẩu"
          />
          {!showPassword ? (
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
            style={styles.inputBox}
            value={passwordConfirm}
            secureTextEntry={!showPasswordConfirm}
            onChangeText={text => {
              setPasswordConfirm(text);
              setShowPasswordConfirmValidation(true);
            }}
            placeholder="Nhập lại mật khẩu"
          />
          {!showPasswordConfirm ? (
            <Icon
              onPress={() => {
                setShowPasswordConfirm(!showPasswordConfirm);
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
                setShowPasswordConfirm(!showPasswordConfirm);
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
        {!passwordConfirmValidation() && showPasswordConfirmValidation && (
          <Text style={styles.errorConfirmText}>
            Mật khẩu nhập lại không trùng khớp
          </Text>
        )}
        <Text style={styles.errorText}>
          Ít nhất 8 ký tự, bao gồm ít nhất 1 chữ cái thường, 1 chữ cái in hoa và
          ít nhất 1 số
        </Text>
        <View style={{marginVertical: 20}}>
          <Text style={styles.termText}>
            Khi tạo tài khoản, bạn đồng ý với các Điều khoản sử dụng và đã
            đọc rõ Chính sách bảo mật của chúng tôi
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={onPressUser} style={styles.secondaryButton}>
        <Text style={styles.secondaryText}>Điều khoản sử dụng</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onPressPrivacy} style={styles.secondaryButton}>
        <Text style={styles.secondaryText}>Chính sách bảo mật</Text>
      </TouchableOpacity>
      <TouchableOpacity
        disabled={!validationOk()}
        onPress={onAccountCreate}
        style={[
          {
            backgroundColor: validationOk() ? colors.primary : colors.grey,
          },
          styles.primaryButton,
        ]}>
        <Text
          style={[
            {
              color: validationOk() ? 'white' : colors.greyText,
            },
            styles.primaryButtonText,
          ]}>
          Tạo tài khoản
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          setEmailCheck(false);
        }}
        style={styles.backButton}>
        <Text style={styles.backButtonText}>Quay lại</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  welcomeText: {
    color: colors.black,
    fontFamily: fonts.MontserratBold,
    fontSize: fontSizes.h1 * 1.2,
    marginVertical: 10,
  },
  inputContainer: {
    justifyContent: 'center',
    marginBottom: 10,
  },
  inputBox: {
    fontFamily: fonts.MontserratMedium,
    height: 50,
    borderColor: colors.black,
    borderRadius: 5,
    borderWidth: 1,
    fontSize: fontSizes.h4,
    paddingHorizontal: 15,
  },
  errorText: {
    color: colors.darkGreyText,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h6,
    marginTop: 15,
    paddingHorizontal: 5,
  },
  errorConfirmText: {
    color: 'red',
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h6,
    paddingHorizontal: 5,
  },
  primaryButton: {
    borderRadius: 5,
    paddingVertical: 10,
  },
  primaryButtonText: {
    fontSize: fontSizes.h3,
    fontFamily: fonts.MontserratBold,
    textAlign: 'center',
  },
  backButton: {
    borderRadius: 5,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: 10,
  },
  backButtonText: {
    fontSize: fontSizes.h3,
    fontFamily: fonts.MontserratMedium,
    textAlign: 'center',
    color: colors.primary,
  },
  termText: {
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h4,
  },
  secondaryButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 20,
  },
  secondaryText: {
    fontFamily: fonts.MontserratMedium,
    padding: 10,
    fontSize: fontSizes.h4,
    color: colors.primary,
  },
});

export default RegisterView2;
