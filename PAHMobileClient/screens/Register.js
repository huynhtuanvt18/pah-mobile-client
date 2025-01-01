import React, { useState, useContext } from 'react';
import {
  KeyboardAvoidingView,
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import { colors, fontSizes, fonts } from '../constants';
import { RegisterView2, RegisterView1 } from '../components';
import IconFeather from 'react-native-vector-icons/Feather';
import { AxiosContext } from '../context/AxiosContext';
import { Auth as AuthRepository } from '../repositories';

function Register(props) {
  //// AXIOS AND NAVIGATION
  // Axios Context
  const axiosContext = useContext(AxiosContext);
  // Navigation
  const { navigation, route } = props;
  // Function of navigate to/back
  const { navigate, goBack } = navigation;

  //// DATA
  // Data for switching between views
  const [emailCheck, setEmailCheck] = useState(false);

  // Loading states
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  // Data for register
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  //// FUNCTION
  // register function
  async function register() {
    setIsRegisterLoading(true);
    setErrorMessage('');
    await AuthRepository.register(axiosContext, {
      name: name,
      email: email,
      password: password,
      phone: phone,
      gender: 1,
      dob: "1970-01-01T00:00:00.000Z"
    })
      .then(response => {
        setIsRegisterLoading(false);
        console.log('a')
        navigation.pop();
        navigate('EmailConfirm',{_email:email});
      })
      .catch(error => {
        setIsRegisterLoading(false);
        console.log(error.response);
        if (error.response.data.Message) {
          setErrorMessage(error.response.data.Message);
        }
        if (error.response.data.message) {
          setErrorMessage(error.response.data.message);
        }
      });
  }

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
        <Text style={styles.titleText}>Tạo tài khoản</Text>
      </View>

      {emailCheck ? <RegisterView2 password={password} setPassword={setPassword}
        errorMessage={errorMessage}
        setEmailCheck={setEmailCheck}
        onAccountCreate={register}
        onPressUser={()=>{navigate('UserAgreement')}}
        onPressPrivacy={()=>{navigate('PrivacyPolicy')}}
      />
        : <RegisterView1 setEmailCheck={setEmailCheck}
          email={email} setEmail={setEmail}
          name={name} setName={setName}
          phone={phone} setPhone={setPhone}
        />}
      {isRegisterLoading && <View style={{
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
    gap: 10
  },
  titleText: {
    color: 'black',
    fontFamily: fonts.MontserratBold,
    fontSize: fontSizes.h1,
    alignSelf: 'center',
    marginLeft:5
  }
});

export default Register;
