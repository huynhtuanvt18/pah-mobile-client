import React, {useState, useContext} from 'react';
import {
  KeyboardAvoidingView,
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
} from 'react-native';
import {colors, fontSizes, fonts, images} from '../constants';
import IconFeather from 'react-native-vector-icons/Feather';
import {AxiosContext} from '../context/AxiosContext';
import {Auth as AuthRepository} from '../repositories';
import Toast from 'react-native-toast-message';
import {CountdownCircleTimer} from 'react-native-countdown-circle-timer';

function EmailConfirm(props) {
  const {_email} = props.route.params;
  // Axios context
  const axiosContext = useContext(AxiosContext);
  // Navigation
  const {navigation, route} = props;
  // Function of navigate to/back
  const {navigate, goBack} = navigation;

  const [errorMessage, setErrorMessage] = useState('');
  const [resendEnable, setResendEnable] = useState(true);
  //Email resend verification
  async function resendVerify() {
    setErrorMessage('');
    setResendEnable(false);
    await AuthRepository.verifyResend(axiosContext, _email)
      .then(response => {
        Toast.show({
          type: 'success',
          text1: 'Thư xác thực đã được gửi tới email',
          position: 'bottom',
          autoHide: true,
          visibilityTime: 2000,
        });
      })
      .catch(error => {
        if(error.response.data.message){
          setErrorMessage(error.response.data.message);
        }
        if(error.response.data.Message){
          setErrorMessage(error.response.data.Message);
        }
        console.log(error);
      });
  }
  return (
    <View style={styles.container}>
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
      {/* Image */}
      <Image
        source={images.checkMailImage}
        style={{
          resizeMode: 'contain',
          height: 250,
          width: 250,
          alignSelf: 'center',
          margin: 20,
        }}
      />
      {/* Content */}
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: 15,
        }}>
        <Text
          style={[
            styles.contentText,
            {fontFamily: fonts.MontserratBold, fontSize: fontSizes.h2,marginBottom:20},
          ]}>
          Hãy xác nhận Email của bạn
        </Text>
        <Text style={[styles.contentText,{marginBottom:10}]}>Thư xác nhận đã được gửi đến:</Text>
        <Text style={[styles.contentText, {fontFamily: fonts.MontserratBold,marginBottom:10}]}>
          {_email}
        </Text>
        <Text style={styles.contentText}>
          Kiểm tra email của bạn và nhấn vào{'\n'}đường link xác nhận để tiếp
          tục
        </Text>
      </View>
      {/* footer */}
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
        <TouchableOpacity
          disabled={!resendEnable}
          onPress={resendVerify}
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
            flexDirection: 'row',
          }}>
          <Text
            style={[
              styles.contentText,
              {
                color: resendEnable == true ? colors.info : colors.inactive,
                fontFamily: fonts.MontserratBold,
                fontSize: fontSizes.h4,
                marginRight: 10,
              },
            ]}>
            Gửi lại thư
          </Text>
          {!resendEnable && (
            <CountdownCircleTimer
              isPlaying
              duration={60}
              colors={['#004777', '#F7B801', '#A30000', '#A30000']}
              colorsTime={[7, 5, 2, 0]}
              size={30}
              strokeWidth={3}
              onComplete={() => {
                setResendEnable(true);
              }}>
              {({remainingTime}) => (
                <Text style={{color: colors.black}}>{remainingTime}</Text>
              )}
            </CountdownCircleTimer>
          )}
        </TouchableOpacity>
      </View>
    </View>
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
  },
  contentText: {
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h5,
    textAlign: 'center',
    marginBottom: 5,
  },
});
export default EmailConfirm;
