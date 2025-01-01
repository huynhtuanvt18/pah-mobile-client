import React, { useState, useContext, useEffect } from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { colors, fonts, fontSizes, images } from '../../constants';
import IconFeather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/FontAwesome6';
import DatePicker from 'react-native-date-picker';
import { AxiosContext } from '../../context/AxiosContext';
import { Account as AccountRepository } from '../../repositories';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import Toast from 'react-native-toast-message';

function EditAccount(props) {
  //// AUTH AND NAVIGATION
  const axiosContext = useContext(AxiosContext);

  // Navigation
  const { navigation, route } = props;

  // Function of navigate to/back
  const { navigate, goBack } = navigation;

  //// RN Image Picker handling
  //Photos
  let options = {
    cameraType: 'front',
    saveToPhotos: true,
    mediaType: 'photo',
    quality: 1,
  };

  const [errorMessage, setErrorMessage] = useState('');

  // Get image from gallery
  const openGallery = async () => {
    try {
      const result = await launchImageLibrary(options);
      setPhoto(result.assets[0].uri);
      setPhotoUrl(result.assets[0].uri);
      setEnabledSave(true);
    } catch (error) {
      console.log(error);
    }
  };

  //// DATA
  //Date picker
  const [openDatePicker, setOpenDatePicker] = useState(false);
  //Enable save
  const [isEnabledSave, setEnabledSave] = useState(false);

  // User data
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState(0);
  const [photo, setPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(images.defaultAvatar);

  // Data for loading and refreshing
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);

  //// FUNCTION
  // Function for getting currentuser info
  function getCurrentUserInfo() {
    AccountRepository.getInfoCurrentUser(axiosContext)
      .then(response => {
        setEmail(response.email);
        setName(response.name);
        setPhone(response.phone);
        setDob(response.dob);
        setGender(response.gender);
        setPhotoUrl(response.profilePicture);
        setIsLoading(false);
      })
      .catch(err => {
        setIsLoading(false);
      });
  }

  // Upload image
  const uploadImage = async () => {
    if (photo == null) {
      console.log('No photo to upload');
      return;
    }

    const filename =
      new Date().getTime() + '_' + photo.substring(photo.lastIndexOf('/') + 1);
    const uploadUri =
      Platform.OS === 'ios' ? photo.replace('file://', '') : photo;
    const imageRef = storage().ref(`profilePicture/${filename}`);
    await imageRef
      .putFile(uploadUri, { contentType: 'image/jpg' })
      .catch(error => {
        console.log(error);
        setIsUpdateLoading(false);
      });

    const url = await imageRef.getDownloadURL().catch(error => {
      console.log(error);
    });
    setPhotoUrl(url);
    return url;
  };

  // Create seller profile
  const updateProfile = async () => {
    setIsUpdateLoading(true);
    setErrorMessage('');
    const url = photo == null ? photoUrl : await uploadImage();
    const updateInfo = {
      name: name,
      phone: phone,
      profilePicture: url,
      gender: gender,
      dob: dob,
    };

    AccountRepository.updateProfile(axiosContext, updateInfo)
      .then(response => {
        setIsUpdateLoading(false);
        Toast.show({
          type: 'success',
          text1: 'Cập nhật hồ sơ thành công!',
          position: 'bottom',
          autoHide: true,
          visibilityTime: 2000,
        });
      })
      .catch(error => {
        console.log(error);
        if (error.response.data.message) {
          setErrorMessage(error.response.data.message);
        }
        if (error.response.data.Message) {
          setErrorMessage(error.response.data.Message);
        }
        Toast.show({
          type: 'error',
          text1: 'Không thể cập nhật hồ sơ của bạn!',
          text2: 'Hãy kiểm tra lại thông tin',
          position: 'bottom',
          autoHide: true,
          visibilityTime: 2000,
        });
        setIsUpdateLoading(false);
      });
  };

  useEffect(() => {
    setIsLoading(true);
    getCurrentUserInfo();
  }, []);

  return (
    <TouchableWithoutFeedback
      style={styles.container}
      onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ backgroundColor: 'white', flex: 1 }}>
        {/* Fixed screen title: Edit account */}
        <View style={styles.titleContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              goBack();
            }}>
            <IconFeather name="chevron-left" size={25} color={'black'} />
          </TouchableOpacity>
          <Text style={styles.titleText}>Chỉnh sửa tài khoản</Text>
        </View>
        {isLoading ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
            }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View>
            {/* Avatar and username container */}
            <View style={styles.infoContainer}>
              {/* Avatar section */}
              <View
                style={{
                  justifyContent: 'center',
                }}>
                <Image
                  source={{ uri: photoUrl }}
                  style={{
                    resizeMode: 'cover',
                    width: 80,
                    height: 80,
                    borderRadius: 50,
                  }}
                />
                <TouchableOpacity
                  style={styles.penIconButton}
                  onPress={() => {
                    openGallery();
                  }}>
                  <Icon
                    style={{
                      alignSelf: 'center',
                    }}
                    name="pen"
                    size={15}
                    color={'black'}
                  />
                </TouchableOpacity>
              </View>
              {/* Username section */}
              <View style={styles.usernameSectionStyle}>
                <Text
                  style={{
                    color: colors.black,
                    fontFamily: fonts.MontserratBold,
                    fontSize: fontSizes.h5,
                  }}>
                  {email}
                </Text>
                <TouchableOpacity
                  onPress={() => { navigate('ChangePassword') }}
                  style={{ position: 'absolute', right: 0, bottom: 0 }}>
                  <Text
                    style={{
                      color: colors.primary,
                      fontFamily: fonts.MontserratMedium,
                      fontSize: fontSizes.h5,
                      textDecorationLine: 'underline',
                    }}>
                    Đổi mật khẩu
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Info title*/}
            <View
              style={{
                paddingHorizontal: 15,
              }}>
              <View>
                <Text
                  style={{
                    color: colors.black,
                    fontFamily: fonts.MontserratBold,
                    fontSize: fontSizes.h2,
                    paddingTop: 15,
                  }}>
                  Thông tin cá nhân
                </Text>
              </View>
            </View>
            {errorMessage == '' ? null : (
              <View style={styles.errorContainer}>
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              </View>
            )}
            {/* Info detail */}

            <ScrollView
              style={{
                paddingHorizontal: 15,
                paddingTop: 5
              }}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputTitle}>Tên</Text>
                <TextInput
                  value={name}
                  onChangeText={text => {
                    setName(text);
                    setEnabledSave(true);
                  }}
                  style={styles.inputBox}
                  placeholder="Nhập tên của bạn"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputTitle}>Điện thoại</Text>
                <TextInput
                  value={phone}
                  onChangeText={text => {
                    setPhone(text);
                    setEnabledSave(true);
                  }}
                  style={styles.inputBox}
                  placeholder="Nhập số điện thoại"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputTitle}>Ngày sinh</Text>
                <TouchableOpacity
                  onPress={() => {
                    setOpenDatePicker(true);
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                    }}>
                    <Text style={styles.labelDateStyle}>Ngày</Text>
                    <Text style={styles.dateStyle}>
                      {new Date(dob).getDate()}
                    </Text>
                    <Text style={styles.labelDateStyle}>Tháng</Text>
                    <Text style={styles.dateStyle}>
                      {new Date(dob).getMonth() + 1}
                    </Text>
                    <Text style={styles.labelDateStyle}>Năm</Text>
                    <Text style={styles.dateStyle}>
                      {new Date(dob).getFullYear()}
                    </Text>
                  </View>
                </TouchableOpacity>
                <DatePicker
                  modal
                  mode={'date'}
                  open={openDatePicker}
                  date={new Date(dob)}
                  maximumDate={new Date()}
                  onConfirm={newDate => {
                    setDob(newDate);
                    setEnabledSave(true);
                    setOpenDatePicker(false);
                  }}
                  onCancel={() => {
                    setOpenDatePicker(false);
                  }}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputTitle}>Giới tính</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    marginTop: 5,
                  }}>
                  <TouchableOpacity
                    disabled={gender == 1}
                    onPress={() => {
                      setGender(1);
                      setEnabledSave(true);
                    }}
                    style={{
                      flexDirection: 'row',
                      gap: 10,
                    }}>
                    <Text style={styles.labelGendersStyle}>Nam</Text>
                    {gender == 1 ? (
                      <Icon name="circle-dot" size={30} color={colors.black} />
                    ) : (
                      <Icon name="circle" size={30} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={gender == 0}
                    onPress={() => {
                      setGender(0);
                      setEnabledSave(true);
                    }}
                    style={{
                      flexDirection: 'row',
                      gap: 10,
                    }}>
                    <Text style={styles.labelGendersStyle}>Nữ</Text>
                    {gender == 0 ? (
                      <Icon name="circle-dot" size={30} color={colors.black} />
                    ) : (
                      <Icon name="circle" size={30} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                disabled={!isEnabledSave}
                onPress={() => {
                  setEnabledSave(false);
                  updateProfile();
                }}
                style={[
                  styles.saveButton,
                  {
                    backgroundColor:
                      isEnabledSave == true
                        ? colors.primary
                        : colors.darkGreyText,
                  },
                ]}>
                <Text
                  style={[
                    {
                      color: colors.greyText,
                    },
                    styles.saveText,
                  ]}>
                  Lưu
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  goBack();
                }}
                style={styles.cancelButton}>
                <Text
                  style={[
                    {
                      color: colors.greyText,
                    },
                    styles.cancelText,
                  ]}>
                  Hủy
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
        {isUpdateLoading && (
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
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  infoContainer: {
    backgroundColor: colors.grey,
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 10
  },
  usernameSectionStyle: {
    flexGrow: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingStart: 5,
  },
  penIconButton: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    height: 20,
    width: 20,
    right: 5,
    top: 5,
  },
  iconButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: colors.grey,
  },
  saveButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    paddingVertical: 10,
    marginTop: 10,
  },
  saveText: {
    fontSize: fontSizes.h3,
    fontFamily: fonts.MontserratMedium,
    color: 'white',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    paddingVertical: 10,
    marginTop: 10,
  },
  cancelText: {
    fontSize: fontSizes.h3,
    fontFamily: fonts.MontserratMedium,
    color: 'blue',
    textAlign: 'center',
  },
  titleContainer: {
    height: 70,
    flexDirection: 'row',
    paddingLeft: 15,
    paddingRight: 10,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  titleText: {
    color: 'black',
    fontFamily: fonts.MontserratBold,
    fontSize: fontSizes.h1,
    alignSelf: 'center',
    marginLeft: 5,
  },
  inputContainer: {
    justifyContent: 'center',
    marginBottom: 20,
  },
  inputBox: {
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    borderColor: colors.black,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: fontSizes.h4,
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  inputTitle: {
    fontSize: fontSizes.h3,
    color: colors.black,
    fontFamily: fonts.MontserratBold,
    marginBottom: 5,
  },
  dateStyle: {
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: fontSizes.h4,
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
  },
  labelDateStyle: {
    fontSize: fontSizes.h4,
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  labelGendersStyle: {
    fontSize: fontSizes.h3,
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
  },
  errorContainer: {
    paddingHorizontal: 10,
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
export default EditAccount;
