import React, { useContext, useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  PermissionsAndroid,
  Image,
  TextInput,
  KeyboardAvoidingView,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { colors, enumConstants, fontSizes, fonts } from '../../constants';
import IconAntDesign from 'react-native-vector-icons/AntDesign';
import IconFeather from 'react-native-vector-icons/Feather';
import { Dropdown } from 'react-native-element-dropdown';
import { ProductPricing } from '../../components';
import ImagePicker from 'react-native-image-crop-picker';
import { AxiosContext } from '../../context/AxiosContext';
import {
  Category as CategoryRepository,
  Product as ProductRepository,
  Material as MaterialRepository
} from '../../repositories';
import { numberWithCommas } from '../../utilities/PriceFormat';
import storage from '@react-native-firebase/storage';
import Toast from 'react-native-toast-message';

function ProductListing(props) {
  //// AUTH AND NAVIGATION
  // Auth Context
  const axiosContext = useContext(AxiosContext);

  const { sellerId } = props.route.params;

  //Photos
  const [photoList, setPhotoList] = useState([]);

  const openCamera = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    if (granted == PermissionsAndroid.RESULTS.GRANTED) {
      ImagePicker.openCamera({}).then(image => {
        setPhotoList([...photoList, image]);
      });
    }
  };

  const openGallery = async () => {
    ImagePicker.openPicker({
      multiple: true,
      maxFiles: 10,
      mediaType: 'photo',
    })
      .then(images => {
        setPhotoList([...photoList, ...images]);
      })
      .catch(error => {
        console.log(JSON.stringify(error));
      });
  };
  // Navigation
  const { navigation, route } = props;
  // Function of navigate to/back
  const { navigate, goBack } = navigation;
  //product detail state
  const [categoryFocus, setCategoryFocus] = useState(false);
  const [materialFocus, setMaterialFocus] = useState(false);
  const [conditionFocus, setConditionFocus] = useState(false);
  const [auctionTitle, setAuctionTitle] = useState('');
  const [auctionStep, setAuctionStep] = useState('0');
  const [name, setName] = useState('');
  const [category, setCategory] = useState({});
  const [material, setMaterial] = useState({});
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState(0);
  const [origin, setOrigin] = useState('');
  const [weight, setWeight] = useState('');
  const [dimension, setDimension] = useState('');
  const [packageMethod, setPackageMethod] = useState('');
  const [packageContent, setPackageContent] = useState('');
  const [price, setPrice] = useState('0');
  const [type, setType] = useState(1);

  //Data
  const [isLoadingCreate, setIsLoadingCreate] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [materialData, setMaterialData] = useState([]);
  const conditionData = [
    { label: 'Mới tinh', value: '1' },
    { label: 'Mới', value: '2' },
    { label: 'Đã qua sử dụng', value: '3' },
    { label: 'Cũ', value: '4' },
    { label: 'Cổ', value: '5' },
  ];
  //Input is enabled
  const [enableTitle, setEnableTitle] = useState(false);
  const [enableDescription, setEnableDescription] = useState(false);
  //Ready to list
  const [ready, setReady] = useState(false);
  //Edit Pricing
  const [pricingMode, setPricingMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  // Validating data
  const validate = () => name.length > 0 && category.id && condition != 0
    && origin.length > 0 && weight.length > 0 && dimension.length > 0 && photoList.length > 0
    && packageContent.length > 0 && packageMethod.length > 0 && description.length > 0
    && ((type == enumConstants.productType.ForSale && price.length > 0 && parseInt(price) > 0) ||
      (type == enumConstants.productType.Auction && price.length > 0 && auctionTitle.length > 0
        && parseInt(price) > 0 && auctionStep.length > 0 && parseInt(auctionStep) > 0)) && ready;

  //// FUNCTION
  // Get Categories
  function getCategories() {
    // Get Categories
    CategoryRepository.getCategoriesHome(axiosContext)
      .then(response => {
        setCategoryData(response);
      })
      .catch(err => {
        console.log(err);
      });
  }

  // Get Materials
  function getMaterials() {
    // Get Categories
    MaterialRepository.getMaterials(axiosContext)
      .then(response => {
        setMaterialData(response);
      })
      .catch(err => {
        console.log(err);
      });
  }

  // Init category
  useEffect(() => {
    getCategories();
    getMaterials();
  }, []);

  // Upload image
  const uploadImage = async () => {
    if (photoList.length == 0) {
      console.log('No photo to upload');
      return;
    }

    const photoUrls = [];

    await Promise.all(photoList.map(async (photo) => {
      const filename = new Date().getTime() + '_' + photo.path.substring(photo.path.lastIndexOf('/') + 1);
      const uploadUri = Platform.OS === 'ios' ? photo.path.replace('file://', '') : photo.path;
      const imageRef = storage().ref(`productPicture/${filename}`);
      await imageRef
        .putFile(uploadUri, { contentType: 'image/jpg' })
        .catch((error) => { console.log(error) });

      const url = await imageRef.getDownloadURL().catch((error) => { console.log(error) });
      photoUrls.push(url);
    }))
      .catch(err => { console.log(err) });
    return photoUrls;
  };

  // Create new product
  async function createProduct() {
    setErrorMessage('');
    setIsLoadingCreate(true);
    const photoUrls = await uploadImage();
    const productRequest = {
      categoryId: category.id,
      materialId: material.id,
      sellerId: sellerId,
      name: name,
      description: description,
      price: price,
      dimension: dimension,
      weight: weight,
      origin: origin,
      packageMethod: packageMethod,
      packageContent: packageContent,
      condition: condition,
      type: type,
      title: auctionTitle,
      step: auctionStep,
      imageUrlLists: photoUrls
    }

    ProductRepository.createProduct(axiosContext, productRequest)
      .then(response => {
        Toast.show({
          type: 'success',
          text1: type == enumConstants.productType.ForSale ? 'Đăng sản phẩm thành công' : 'Đăng đấu giá thành công',
          text2: type == enumConstants.productType.Auction ? 'Sản phẩm đấu giá của bạn sẽ được duyệt nhanh chóng' : '',
          position: 'bottom',
          autoHide: true,
          visibilityTime: 2000
        });
        goBack();
        setIsLoadingCreate(false);
      })
      .catch(error => {
        console.log(error);
        if(error.response.data.message){
          setErrorMessage(error.response.data.message);
        }
        if(error.response.data.Message){
          setErrorMessage(error.response.data.Message);
        }
        setIsLoadingCreate(false);
      })
  }

  return pricingMode ? (
    <ProductPricing
      auctionTitle={auctionTitle}
      setAuctionTitle={setAuctionTitle}
      auctionStep={auctionStep}
      setAuctionStep={setAuctionStep}
      type={type}
      setType={setType}
      price={price}
      setPrice={setPrice}
      setPricingMode={setPricingMode}
    />
  ) : (
    <View style={styles.container}>
      {/* Fixed screen title*/}
      <View style={styles.titleContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            goBack();
          }}>
          <Text
            style={{
              color: colors.primary,
              fontFamily: fonts.MontserratMedium,
              fontSize: fontSizes.h3,
              alignSelf: 'center',
            }}>
            Hủy
          </Text>
        </TouchableOpacity>
        <Text style={styles.titleText}>Tạo sản phẩm</Text>
        <TouchableOpacity
          style={styles.iconButton}>
        </TouchableOpacity>
      </View>
      {/* listing information */}
      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}>
        <ScrollView>
          {/* Photos */}
          <View style={styles.sectionStyle}>
            <Text style={styles.titleSection}>Hình ảnh</Text>
            {photoList.length > 0 ? (
              <View>
                <FlatList
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  data={photoList}
                  renderItem={({ item }) => {
                    return (
                      <View key={item.path}>
                        <Image
                          source={{ uri: item.path }}
                          style={{
                            width: 200,
                            height: 200,
                            marginVertical: 10,
                            marginRight: 10,
                            resizeMode: 'cover',
                            borderRadius: 25,
                          }}
                        />
                        <TouchableOpacity
                          style={{
                            position: 'absolute',
                            top: 20,
                            right: 20,
                            padding: 5,
                            backgroundColor: 'white',
                            borderRadius: 20,
                          }}
                          onPress={() => {
                            setPhotoList(
                              photoList.filter(photo => photo != item),
                            );
                          }}>
                          <IconAntDesign
                            name="close"
                            size={20}
                            color={'black'}
                          />
                        </TouchableOpacity>
                      </View>
                    );
                  }}
                  keyExtractor={eachImage => eachImage.path}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    gap: 20,
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      openCamera();
                    }}>
                    <IconAntDesign
                      name="camerao"
                      size={20}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      openGallery();
                    }}>
                    <IconAntDesign
                      name="picture"
                      size={20}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setPhotoList([]);
                    }}>
                    <IconAntDesign name="delete" size={20} color={'red'} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                <View
                  style={{
                    marginTop: 10,
                    backgroundColor: colors.darkGrey,
                    padding: 15,
                    borderRadius: 5,
                    marginBottom: 10,
                  }}>
                  <Text style={styles.detailTextSection}>
                    Cung cấp hình ảnh cho sản phẩm của bạn (tối đa 5 hình ảnh)
                  </Text>
                </View>
                <View style={styles.imageZone}>
                  <TouchableOpacity
                    style={styles.imageZoneButton}
                    onPress={openCamera}>
                    <Text
                      style={{
                        color: 'white',
                        fontFamily: fonts.MontserratMedium,
                        fontSize: fontSizes.h5,
                      }}>
                      Chụp hình sản phẩm
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.imageZoneButton}
                    onPress={openGallery}>
                    <Text
                      style={{
                        color: 'white',
                        fontFamily: fonts.MontserratMedium,
                        fontSize: fontSizes.h5,
                      }}>
                      Lấy từ thư viện
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
          {/* Title */}
          <View style={styles.sectionStyle}>
            <Text style={styles.titleSection}>Tựa đề</Text>
            <TextInput
              placeholder="Tên sản phẩm"
              value={name}
              onChangeText={text => {
                setName(text);
              }}
              multiline
              editable={enableTitle == true}
              style={{
                color: colors.black,
                fontSize: fontSizes.h4,
                fontFamily: fonts.MontserratMedium,
                marginTop: 10,
                borderBottomWidth: enableTitle == true ? 1 : 0,
              }}
            />
            {enableTitle == true ? (
              <TouchableOpacity
                onPress={() => {
                  setEnableTitle(false);
                }}
                style={styles.enableTextButtonStyle}>
                <IconAntDesign name="checkcircle" size={20} color="green" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setEnableTitle(true);
                }}
                style={styles.enableTextButtonStyle}>
                <IconAntDesign name="edit" size={20} color={colors.black} />
              </TouchableOpacity>
            )}
          </View>
          {/* Category */}
          <View style={styles.sectionStyle}>
            <Text style={styles.titleSection}>Danh mục</Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              itemTextStyle={styles.itemTextStyle}
              searchPlaceholder="Tìm danh mục..."
              placeholder={!categoryFocus ? 'Chọn danh mục' : '...'}
              search
              data={categoryData}
              labelField="name"
              valueField="id"
              onFocus={() => setCategoryFocus(true)}
              onBlur={() => setCategoryFocus(false)}
              value={category.id}
              onChange={item => {
                setCategory(item);
                setCategoryFocus(false);
              }}
            />
          </View>
          {/* Material */}
          <View style={styles.sectionStyle}>
            <Text style={styles.titleSection}>Chất liệu</Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              itemTextStyle={styles.itemTextStyle}
              searchPlaceholder="Tìm chất liệu..."
              placeholder={!materialFocus ? 'Chọn chất liệu' : '...'}
              search
              data={materialData}
              labelField="name"
              valueField="id"
              onFocus={() => setMaterialFocus(true)}
              onBlur={() => setMaterialFocus(false)}
              value={material.id}
              onChange={item => {
                setMaterial(item);
                setMaterialFocus(false);
              }}
            />
          </View>
          {/* Detail */}
          <View style={styles.sectionStyle}>
            <Text style={styles.titleSection}>Chi tiết</Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                alignItems: 'center',
                justifyContent: 'space-between',
                marginRight: 10
              }}>
              <Text
                style={{
                  width: 100,
                  color: colors.black,
                  fontSize: fontSizes.h4,
                  fontFamily: fonts.MontserratMedium,
                }}>
                Tình trạng
              </Text>
              <Dropdown
                style={{
                  height: 30,
                  width: 120,
                  borderColor: colors.black,
                  borderBottomWidth: 1,
                  paddingHorizontal: 10,
                  marginStart: 20,
                }}
                placeholderStyle={[styles.placeholderStyle, { textAlign: 'right' }]}
                selectedTextStyle={[styles.selectedTextStyle, { textAlign: 'right' }]}
                inputSearchStyle={[styles.inputSearchStyle, { textAlign: 'right' }]}
                itemTextStyle={[styles.itemTextStyle, { textAlign: 'right' }]}
                placeholder={!conditionFocus ? 'Chọn' : '...'}
                data={conditionData}
                labelField="label"
                valueField="value"
                onFocus={() => setConditionFocus(true)}
                onBlur={() => setConditionFocus(false)}
                value={condition}
                onChange={item => {
                  setCondition(item.value);
                  setConditionFocus(false);
                }}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                alignItems: 'center',
                justifyContent: 'space-between',
                marginRight: 10
              }}>
              <Text
                style={{
                  width: 100,
                  color: colors.black,
                  fontSize: fontSizes.h4,
                  fontFamily: fonts.MontserratMedium,
                }}>
                Xuất xứ
              </Text>
              <TextInput
                value={origin}
                onChangeText={text => {
                  setOrigin(text);
                }}
                placeholder="Nhập tại đây"
                multiline
                style={{
                  width: 200,
                  borderColor: colors.black,
                  marginStart: 20,
                  color: colors.black,
                  fontSize: fontSizes.h4,
                  fontFamily: fonts.MontserratMedium,
                  textAlign: 'right'
                }}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                alignItems: 'center',
                justifyContent: 'space-between',
                marginRight: 10
              }}>
              <Text
                style={{
                  width: 100,
                  color: colors.black,
                  fontSize: fontSizes.h4,
                  fontFamily: fonts.MontserratMedium,
                }}>
                Khối lượng
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  value={weight}
                  onChangeText={text => {
                    setWeight(text);
                  }}
                  keyboardType="numeric"
                  placeholder="Nhập tại đây"
                  style={{
                    width: 130,
                    borderColor: colors.black,
                    color: colors.black,
                    fontSize: fontSizes.h4,
                    fontFamily: fonts.MontserratMedium,
                    textAlign: 'right'
                  }}
                />
                <Text
                  style={{
                    color: colors.black,
                    fontSize: fontSizes.h4,
                    fontFamily: fonts.MontserratMedium,
                  }}>
                  (g)
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                alignItems: 'center',
                justifyContent: 'space-between',
                marginRight: 10
              }}>
              <Text
                style={{
                  width: 100,
                  color: colors.black,
                  fontSize: fontSizes.h4,
                  fontFamily: fonts.MontserratMedium,
                }}>
                Kích thước
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  value={dimension}
                  onChangeText={text => {
                    setDimension(text);
                  }}
                  placeholder="DàixRộngxCao"
                  style={{
                    width: 130,
                    borderColor: colors.black,
                    color: colors.black,
                    fontSize: fontSizes.h4,
                    fontFamily: fonts.MontserratMedium,
                    textAlign: 'right'
                  }}
                />
                <Text
                  style={{
                    color: colors.black,
                    fontSize: fontSizes.h4,
                    fontFamily: fonts.MontserratMedium,
                  }}>
                  (cm)
                </Text>
              </View>
            </View>
          </View>
          {/* Package detail */}
          <View style={styles.sectionStyle}>
            <Text style={styles.titleSection}>Gói hàng</Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                alignItems: 'center',
                justifyContent: 'space-between',
                marginRight: 10
              }}>
              <Text
                style={{
                  width: 130,
                  color: colors.black,
                  fontSize: fontSizes.h4,
                  fontFamily: fonts.MontserratMedium,
                }}>
                Phương pháp
              </Text>
              <TextInput
                value={packageMethod}
                multiline
                onChangeText={text => {
                  setPackageMethod(text);
                }}
                placeholder="Nhập tại đây"
                style={{
                  width: 200,
                  borderColor: colors.black,
                  color: colors.black,
                  fontSize: fontSizes.h4,
                  fontFamily: fonts.MontserratMedium,
                  textAlign: 'right'
                }}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                alignItems: 'center',
                justifyContent: 'space-between',
                marginRight: 10
              }}>
              <Text
                style={{
                  width: 130,
                  color: colors.black,
                  fontSize: fontSizes.h4,
                  fontFamily: fonts.MontserratMedium,
                }}>
                Bao gồm
              </Text>
              <TextInput
                multiline
                value={packageContent}
                onChangeText={text => {
                  setPackageContent(text);
                }}
                placeholder="Nhập tại đây"
                style={{
                  width: 200,
                  borderColor: colors.black,
                  color: colors.black,
                  fontSize: fontSizes.h4,
                  fontFamily: fonts.MontserratMedium,
                  textAlign: 'right'
                }}
              />
            </View>
          </View>
          {/* Description */}
          <View style={styles.sectionStyle}>
            <Text style={styles.titleSection}>Mô tả</Text>
            <TextInput
              placeholder="Thông tin thêm về sản phẩm"
              value={description}
              onChangeText={text => {
                setDescription(text);
              }}
              multiline
              editable={enableDescription == true}
              style={{
                color: colors.black,
                fontSize: fontSizes.h4,
                fontFamily: fonts.MontserratMedium,
                marginTop: 10,
                borderBottomWidth: enableDescription == true ? 1 : 0,
              }}
            />
            {enableDescription == true ? (
              <TouchableOpacity
                onPress={() => {
                  setEnableDescription(false);
                }}
                style={styles.enableTextButtonStyle}>
                <IconAntDesign name="checkcircle" size={20} color="green" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setEnableDescription(true);
                }}
                style={styles.enableTextButtonStyle}>
                <IconAntDesign name="edit" size={20} color={colors.black} />
              </TouchableOpacity>
            )}
          </View>
          {/* Pricing */}
          <View style={styles.sectionStyle}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Text style={styles.titleSection}>Định giá</Text>
              <TouchableOpacity
                onPress={() => {
                  setPricingMode(true);
                }}
                style={{
                  marginRight: 20,
                }}>
                <IconFeather name="edit" size={20} color={colors.black} />
              </TouchableOpacity>
            </View>
            {type == 1 ? <View>
              <Text
                style={{
                  marginTop: 20,
                  color: colors.black,
                  fontSize: fontSizes.h4,
                  fontFamily: fonts.MontserratMedium,
                  marginBottom: 20
                }}>
                Mua ngay
              </Text>
              <View style={{
                flexDirection: 'row', justifyContent: 'space-between',
                marginBottom: 10, marginRight: 10
              }}>
                <Text
                  style={{
                    color: colors.black,
                    fontSize: fontSizes.h4,
                    fontFamily: fonts.MontserratMedium,
                  }}>
                  Giá
                </Text>
                <Text
                  style={{
                    color: colors.darkGreyText,
                    fontSize: fontSizes.h4,
                    fontFamily: fonts.MontserratMedium,
                  }}>
                  ₫{numberWithCommas(price)}
                </Text>
              </View>
            </View> : <View style={{ marginRight: 10 }}>
              <Text
                style={{
                  marginTop: 20,
                  color: colors.black,
                  fontSize: fontSizes.h4,
                  fontFamily: fonts.MontserratMedium,
                  marginBottom: 20
                }}>
                Đấu giá
              </Text>
              <View style={{
                flexDirection: 'row', justifyContent: 'space-between',
                marginBottom: 10, gap: 10
              }}>
                <Text
                  style={{
                    color: colors.black,
                    fontSize: fontSizes.h4,
                    fontFamily: fonts.MontserratMedium,
                  }}>
                  Tựa đề
                </Text>
                <Text
                  style={{
                    color: colors.darkGreyText,
                    fontSize: fontSizes.h4,
                    fontFamily: fonts.MontserratMedium,
                    flexWrap: 'wrap',
                    flex: 1,
                    textAlign: 'right'
                  }}>
                  {auctionTitle}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text
                  style={{
                    color: colors.black,
                    fontSize: fontSizes.h4,
                    fontFamily: fonts.MontserratMedium,
                  }}>
                  Giá khởi điểm
                </Text>
                <Text
                  style={{
                    color: colors.darkGreyText,
                    fontSize: fontSizes.h4,
                    fontFamily: fonts.MontserratMedium,
                  }}>
                  ₫{numberWithCommas(price)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text
                  style={{
                    color: colors.black,
                    fontSize: fontSizes.h4,
                    fontFamily: fonts.MontserratMedium,
                  }}>
                  Bước giá
                </Text>
                <Text
                  style={{
                    color: colors.darkGreyText,
                    fontSize: fontSizes.h4,
                    fontFamily: fonts.MontserratMedium,
                  }}>
                  ₫{numberWithCommas(auctionStep)}
                </Text>
              </View>
            </View>}


          </View>
          {/* Start listing */}
          <View
            style={{
              marginTop: 10,
              paddingHorizontal: 15,
              marginBottom: 15,
            }}>
            <Text
              style={{
                color: colors.black,
                fontFamily: fonts.MontserratMedium,
                fontSize: fontSizes.h5,
                marginTop: 10,
                marginBottom: 20,
              }}>
              Đăng bán miễn phí
            </Text>
            <TouchableOpacity
                onPress={()=> navigate('UserAgreement')} 
                style={styles.secondaryButton}>
                <Text style={styles.secondaryText}>Điều khoản sử dụng</Text>
              </TouchableOpacity>
              <TouchableOpacity
              onPress={() => {
                setReady(!ready);
              }}
              style={{
                flexDirection: 'row',
                marginVertical: 10,
              }}>
              {ready == true ? (
                <IconFeather name="check-square" size={20} />
              ) : (
                <IconFeather name="square" size={20} />
              )}
              <Text
                style={{
                  color: colors.darkGreyText,
                  fontFamily: fonts.MontserratMedium,
                  fontSize: fontSizes.h5,
                }}>
                Tôi đồng ý với các điều khoản
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!validate()}
              onPress={() => {
                createProduct();
              }}
              style={{
                backgroundColor: validate() ? colors.primary : colors.grey,
                justifyContent: 'center',
                alignItems: 'center',
                marginVertical: 15,
                padding: 10,
                borderRadius: 5,
              }}>
              <Text
                style={{
                  color: validate() ? 'white' : colors.darkGreyText,
                  fontFamily: fonts.MontserratMedium,
                  fontSize: fontSizes.h3,
                }}>
                Bắt đầu đăng bán
              </Text>
            </TouchableOpacity>
            {errorMessage == '' ? null : (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorMessage}>{errorMessage}</Text>
                </View>
              )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    </View>
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
  },
  titleContainer: {
    height: 70,
    flexDirection: 'row',
    paddingLeft: 15,
    paddingRight: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    color: 'black',
    fontFamily: fonts.MontserratBold,
    fontSize: fontSizes.h1,
    alignSelf: 'center',
  },
  titleButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  sectionStyle: {
    borderBottomWidth: 1,
    borderColor: colors.darkGrey,
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  titleSection: {
    marginTop: 10,
    color: colors.black,
    fontFamily: fonts.MontserratBold,
    fontSize: fontSizes.h3,
  },
  detailTextSection: {
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h5,
  },
  imageStyle: {
    flex: 1,
    backgroundColor: colors.darkGrey,
    marginTop: 10,
    resizeMode: 'cover',
    borderRadius: 20,
    height: 200,
    width: 200,
    alignSelf: 'center',
  },
  imageZone: {
    marginTop: 5,
    marginHorizontal: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    width: 'auto',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageZoneButton: {
    backgroundColor: colors.primary,
    borderRadius: 5,
    width: 180,
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  dropdown: {
    height: 50,
    borderColor: colors.black,
    borderBottomWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
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
  enableTextButtonStyle: {
    marginTop: 10,
    marginLeft: 'auto',
    marginRight: 20,
  },
  errorContainer: {
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
  secondaryButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  secondaryText: {
    fontFamily: fonts.MontserratMedium,
    padding: 10,
    fontSize: fontSizes.h4,
    color: colors.primary,
  },
});

export default ProductListing;
