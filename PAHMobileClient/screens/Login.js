import React, { useState, useContext, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { colors, fontSizes, fonts } from '../constants';
import Icon from 'react-native-vector-icons/FontAwesome5';
import IconFeather from 'react-native-vector-icons/Feather';
import { AuthContext } from '../context/AuthContext';
import { AxiosContext } from '../context/AxiosContext';
import { Auth as AuthRepository } from '../repositories';
import * as Keychain from 'react-native-keychain';
import Toast from 'react-native-toast-message';
import {
  GoogleSignin,
  statusCodes,
} from 'react-native-google-signin';
import config from '../config';

function Login(props) {
  // Auth Context
  const authContext = useContext(AuthContext);
  const axiosContext = useContext(AxiosContext);

  // Navigation
  const { navigation, route } = props;

  // Function of navigate to/back
  const { navigate, goBack } = navigation;

  //states to store email/password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // states for validating
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const validationOk = () => email.length > 0 && password.length > 0;
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Google login
  const [userInfo, setUserInfo] = useState(null);

  // login function
  async function login() {
    setIsLoginLoading(true);
    setErrorMessage('');
    await AuthRepository.login(axiosContext, { email: email, password: password })
      .then(response => {
        const { accessToken, refreshToken } = response;

        authContext.setAuthState({
          accessToken: accessToken,
          refreshToken: refreshToken,
          authenticated: true,
        });

        Keychain.setGenericPassword(
          'token',
          JSON.stringify({
            accessToken,
            refreshToken,
          }),
        );

        Toast.show({
          type: 'success',
          text1: 'Đăng nhập thành công',
          position: 'bottom',
          autoHide: true,
          visibilityTime: 2000
        });
      })
      .catch(error => {
        setIsLoginLoading(false);
        if(error.response.data.message){
          setErrorMessage(error.response.data.message);
        }
        if(error.response.data.Message){
          setErrorMessage(error.response.data.Message);
        }
      });
  }

  // Google login function
  async function loginWithGoogle() {
    setIsLoginLoading(true);
    setErrorMessage('');
    try {
      await GoogleSignin.hasPlayServices({
        // Check if device has Google Play Services installed
        // Always resolves to true on iOS
        showPlayServicesUpdateDialog: true,
      });
      const userInfo = await GoogleSignin.signIn();

      // Call login with google api
      await AuthRepository.loginWithGoogle(axiosContext, {
        email: userInfo.user.email,
        name: userInfo.user.name,
        profilePicture: userInfo.user.photo })
        .then(response => {
          const { accessToken, refreshToken } = response;

          authContext.setAuthState({
            accessToken: accessToken,
            refreshToken: refreshToken,
            authenticated: true,
          });

          Keychain.setGenericPassword(
            'token',
            JSON.stringify({
              accessToken,
              refreshToken,
            }),
          );

          Toast.show({
            type: 'success',
            text1: 'Đăng nhập thành công',
            position: 'bottom',
            autoHide: true,
            visibilityTime: 2000
          });
        })
        .catch(error => {
          setIsLoginLoading(false);
          if(error.response.data.message){
            setErrorMessage(error.response.data.message);
          }
          if(error.response.data.Message){
            setErrorMessage(error.response.data.Message);
          }
        });
    } catch (error) {
      console.log('Message', JSON.stringify(error));
      setIsLoginLoading(false);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User Cancelled the Login Flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Signing In');
      } else if (
        error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
      ) {
        alert('Hãy tải và cập nhật Play Services lên phiên bản mới nhất');
      } else {
        alert(error.message);
      }
    }
  }

  // Use Effect
  useEffect(() => {
    // Initial configuration
    GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      webClientId: config.FIREBASE_CLIENT_ID,
    });
  })

  return (
    <KeyboardAvoidingView style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
      {/* Fixed screen title: Login */}
      <View style={styles.titleContainer}>
        <TouchableOpacity style={styles.iconButton}
          onPress={() => {
            goBack()
          }}>
          <IconFeather name='x' size={25} color={'black'} />
        </TouchableOpacity>
        <Text style={styles.titleText}>Đăng nhập</Text>
      </View>

      {/* Login form */}
      <View style={{
        paddingHorizontal: 15,
      }}>
        <Text style={styles.welcomeText}>
          Xin chào
        </Text>
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
            autoCapitalize='none'
            style={styles.inputBox}
            value={email}
            onChangeText={text => {
              setEmail(text);
            }}
            placeholder="Nhập địa chỉ Email"
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            autoCapitalize='none'
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
        <TouchableOpacity
          disabled={!validationOk()}
          onPress={() => {
            login()
          }}
          style={[{
            backgroundColor: validationOk() ? colors.primary : colors.grey,
            marginTop: 20
          }, styles.loginButton]}>
          <Text style={[{
            color: validationOk() ? 'white' : colors.greyText
          }, styles.loginText]}>
            Đăng nhập
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.googleButton}
          onPress={() => {
            loginWithGoogle()
          }} >
          <Icon style={{
            position: 'absolute',
            left: 15,
            color: colors.google,
          }}
            size={30}
            name="google"
          />
          <Text style={styles.googleText}>
            Đăng nhập bằng Google
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>{navigate('ForgetPassword')}}>
          <Text style={[styles.infoText, { marginVertical: 40, }]}>
            Quên mật khẩu?
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          navigate('Register')
        }}>
          <Text style={styles.infoText}>
            Tạo tài khoản
          </Text>
        </TouchableOpacity>
      </View>
      {isLoginLoading && <View style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.inactive
      }}>
        <ActivityIndicator size='large' />
      </View>}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  iconButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: colors.grey
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
    marginLeft:5
  },
  welcomeText: {
    color: colors.black,
    fontFamily: fonts.MontserratBold,
    fontSize: fontSizes.h1 * 1.2,
    marginTop: 10,
    marginBottom: 20
  },
  errorContainer: {
    paddingHorizontal:10,
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
    marginBottom: 20
  },
  inputBox: {
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    height: 50,
    borderColor: colors.black,
    borderRadius: 5,
    borderWidth: 1,
    fontSize: fontSizes.h4,
    paddingHorizontal: 15
  },
  loginButton: {
    borderRadius: 5,
    paddingVertical: 15
  },
  loginText: {
    fontSize: fontSizes.h3,
    fontFamily: fonts.MontserratBold,
    textAlign: 'center'
  },
  googleButton: {
    borderWidth: 1,
    marginTop: 20,
    borderRadius: 5,
    backgroundColor: 'white',
    paddingVertical: 15,
    justifyContent: 'center'
  },
  googleText: {
    fontSize: fontSizes.h3,
    fontFamily: fonts.MontserratMedium,
    color: 'black',
    textAlign: 'center'
  },
  infoText: {
    alignSelf: 'center',
    fontFamily: fonts.MontserratMedium,
    color: colors.primary,
    fontSize: fontSizes.h5,
  }
});

export default Login;
