import React, { useContext, useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colors, enumConstants, fontSizes, fonts, images } from '../../constants';
import IconAntDesign from 'react-native-vector-icons/AntDesign';
import IconFeather from 'react-native-vector-icons/Feather';
import { Dropdown } from 'react-native-element-dropdown';
import { SliderBox } from 'react-native-image-slider-box';
import { AxiosContext } from '../../context/AxiosContext';
import Modal from 'react-native-modal';
import {
  Category as CategoryRepository,
  Product as ProductRepository,
  Material as MaterialRepository,
} from '../../repositories';
import { numberWithCommas } from '../../utilities/PriceFormat';
import Toast from 'react-native-toast-message';

function EditProduct(props) {
  const { product_id } = props.route.params;
  //// AUTH AND NAVIGATION
  // Auth Context
  const axiosContext = useContext(AxiosContext);

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
  const [product, setProduct] = useState({});

  // Validating data
  const validate = () =>
    product.name.length > 0 &&
    product.categoryId != 0 &&
    product.origin.length > 0 &&
    product.weight != 0 &&
    product.dimension.length > 0 &&
    product.packageContent.length > 0 &&
    product.packageMethod.length > 0 &&
    product.description.length > 0 &&
    product.price != 0 &&
    ready;

  //Data
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [materialData, setMaterialData] = useState([]);
  const conditionData = [
    { label: 'Mới', value: 0 },
    { label: 'Như mới', value: 1 },
    { label: 'Tốt', value: 2 },
    { label: 'Khá', value: 3 },
    { label: 'Cũ', value: 4 },
  ];

  //Input is enabled
  const [enableTitle, setEnableTitle] = useState(false);
  const [enableDescription, setEnableDescription] = useState(false);
  const [editPriceMode, setEditPriceMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  //Ready to list
  const [ready, setReady] = useState(false);

  // Data for loading and refreshing
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  // Get product detail from current product id
  function getProductDetail() {
    setIsLoading(true);
    ProductRepository.getProductDetail(axiosContext, product_id)
      .then(response => {
        setProduct(response);
        setIsLoading(false);
      })
      .catch(error => {
        setIsLoading(false);
      });
  }

  //update product
  async function updateProduct() {
    setErrorMessage('');
    setIsLoadingEdit(true);
    const productRequest = {
      categoryId: product.categoryId,
      materialId: product.materialId,
      sellerId: product.sellerId,
      name: product.name,
      description: product.description,
      price: product.price,
      dimension: product.dimension,
      weight: product.weight,
      origin: product.origin,
      packageMethod: product.packageMethod,
      packageContent: product.packageContent,
      condition: product.condition,
      type: product.type,
      title: product.auctionTitle,
      step: product.auctionStep,
      imageUrlLists: product.photoUrls
    }
    ProductRepository.updateProduct(axiosContext, product_id, productRequest)
      .then(response => {
        Toast.show({
          type: 'success',
          text1: 'Cập nhật thành công thông tin sản phẩm',
          position: 'bottom',
          autoHide: true,
          visibilityTime: 2000
        });
        navigate('ListingDetailSeller', { product_id: product_id })
        setIsLoadingEdit(false);
      })
      .catch(error => {
        console.log(error);
        if (error.response.data.message) {
          setErrorMessage(error.response.data.message);
        }
        if (error.response.data.Message) {
          setErrorMessage(error.response.data.Message);
        }
        setIsLoadingEdit(false);
      })
  }

  // Init
  useEffect(() => {
    getCategories();
    getMaterials();
    getProductDetail();
    setEditPriceMode(false)
  }, []);

  // Scroll view refresh
  const onRefresh = () => {
    setEditPriceMode(false)
    setRefreshing(true);
    getProductDetail();
    setRefreshing(false);
  };

  return (
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
        <Text style={styles.titleText}>Chỉnh sửa sản phẩm</Text>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            alert('faq');
          }}>
          <IconAntDesign
            name="questioncircleo"
            size={25}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* listing information */}
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
          {product ? (
            <ScrollView
              contentContainerStyle={{ paddingBottom: 60 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }>
              {/* Photos */}
              <View style={styles.sectionPhotoStyle}>
                <Text style={[styles.titleSection, { marginBottom: 10 }]}>
                  Hình ảnh
                </Text>
                <View>
                  <FlatList
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    data={product.imageUrls}
                    renderItem={({ item }) => {
                      return (
                        <View key={item}>
                          <Image
                            source={{ uri: item }}
                            style={{
                              width: 200,
                              height: 200,
                              marginVertical: 10,
                              marginRight: 10,
                              resizeMode: 'cover',
                              borderRadius: 25,
                            }}
                          />
                        </View>
                      );
                    }}
                    keyExtractor={eachImage => eachImage}
                  />
                </View>
              </View>

              {/* Title */}
              <View style={styles.sectionStyle}>
                <Text style={styles.titleSection}>Tựa đề</Text>
                <TextInput
                  placeholder="Tên sản phẩm"
                  value={product.name}
                  onChangeText={text => {
                    setProduct(p => ({
                      ...p,
                      name: text,
                    }));
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
                    <IconAntDesign
                      name="checkcircle"
                      size={20}
                      color="green"
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      setEnableTitle(true);
                    }}
                    style={styles.enableTextButtonStyle}>
                    <IconAntDesign
                      name="edit"
                      size={20}
                      color={colors.black}
                    />
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
                  value={product.categoryId}
                  onChange={item => {
                    setProduct(p => ({
                      ...p,
                      categoryId: item.value,
                    }));
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
                  value={product.materialId}
                  onChange={item => {
                    setProduct(p => ({
                      ...p,
                      materialId: item.value,
                    }));
                    setMaterialFocus(false);
                  }}
                />
              </View>

              {/* Detail */}
              <View style={styles.sectionStyle}>
                <Text style={styles.titleSection}>Chi tiết</Text>

                {/* Condition */}
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 10,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginRight: 10,
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
                    placeholderStyle={[
                      styles.placeholderStyle,
                      { textAlign: 'right' },
                    ]}
                    selectedTextStyle={[
                      styles.selectedTextStyle,
                      { textAlign: 'right' },
                    ]}
                    inputSearchStyle={[
                      styles.inputSearchStyle,
                      { textAlign: 'right' },
                    ]}
                    itemTextStyle={[
                      styles.itemTextStyle,
                      { textAlign: 'right' },
                    ]}
                    placeholder={!conditionFocus ? 'Chọn' : '...'}
                    data={conditionData}
                    labelField="label"
                    valueField="value"
                    onFocus={() => setConditionFocus(true)}
                    onBlur={() => setConditionFocus(false)}
                    value={product.condition}
                    onChange={item => {
                      setProduct(p => ({
                        ...p,
                        condition: item.value,
                      }));
                      setConditionFocus(false);
                    }}
                  />
                </View>

                {/* Origin */}
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 10,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginRight: 10,
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
                    value={product.origin}
                    onChangeText={text => {
                      setProduct(p => ({
                        ...p,
                        origin: text,
                      }));
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
                      textAlign: 'right',
                    }}
                  />
                </View>

                {/* Weight */}
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 10,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginRight: 10,
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
                      value={product.weight.toString()}
                      onChangeText={text => {
                        setProduct(p => ({
                          ...p,
                          weight: parseInt(text),
                        }));
                      }}
                      keyboardType="numeric"
                      placeholder="Nhập khối lượng"
                      style={{
                        width: 130,
                        borderColor: colors.black,
                        color: colors.black,
                        fontSize: fontSizes.h4,
                        fontFamily: fonts.MontserratMedium,
                        textAlign: 'right',
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

                {/* Dimension */}
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 10,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginRight: 10,
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
                      value={product.dimension}
                      onChangeText={text => {
                        setProduct(p => ({
                          ...p,
                          dimension: item.value,
                        }));
                      }}
                      placeholder="DàixRộngxCao"
                      style={{
                        width: 130,
                        borderColor: colors.black,
                        color: colors.black,
                        fontSize: fontSizes.h4,
                        fontFamily: fonts.MontserratMedium,
                        textAlign: 'right',
                      }}
                    />
                    <Text
                      style={{
                        color: colors.black,
                        fontSize: fontSizes.h4,
                        fontFamily: fonts.MontserratMedium,
                      }}>
                      (mm)
                    </Text>
                  </View>
                </View>
              </View>

              {/* Package detail */}
              <View style={styles.sectionStyle}>
                <Text style={styles.titleSection}>Gói hàng</Text>

                {/* Method */}
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 10,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginRight: 10,
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
                    value={product.packageMethod}
                    multiline
                    onChangeText={text => {
                      setProduct(p => ({
                        ...p,
                        packageMethod: text,
                      }));
                    }}
                    placeholder="Nhập tại đây"
                    style={{
                      width: 200,
                      borderColor: colors.black,
                      color: colors.black,
                      fontSize: fontSizes.h4,
                      fontFamily: fonts.MontserratMedium,
                      textAlign: 'right',
                    }}
                  />
                </View>

                {/* Include */}
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 10,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginRight: 10,
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
                    value={product.packageContent}
                    onChangeText={text => {
                      setProduct(p => ({
                        ...p,
                        packageContent: text,
                      }));
                    }}
                    placeholder="Nhập tại đây"
                    style={{
                      width: 200,
                      borderColor: colors.black,
                      color: colors.black,
                      fontSize: fontSizes.h4,
                      fontFamily: fonts.MontserratMedium,
                      textAlign: 'right',
                    }}
                  />
                </View>
              </View>

              {/* Description */}
              <View style={styles.sectionStyle}>
                <Text style={styles.titleSection}>Mô tả</Text>
                <TextInput
                  placeholder="Thông tin thêm về sản phẩm"
                  value={product.description}
                  onChangeText={text => {
                    setProduct(p => ({
                      ...p,
                      description: text,
                    }));
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
                    <IconAntDesign
                      name="checkcircle"
                      size={20}
                      color="green"
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      setEnableDescription(true);
                    }}
                    style={styles.enableTextButtonStyle}>
                    <IconAntDesign
                      name="edit"
                      size={20}
                      color={colors.black}
                    />
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
                </View>
                <View>
                  <Text
                    style={{
                      marginTop: 20,
                      color: colors.black,
                      fontSize: fontSizes.h4,
                      fontFamily: fonts.MontserratMedium,
                      marginBottom: 20,
                    }}>
                    Mua ngay
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: 10,
                      marginRight: 10,
                    }}>
                    <Text
                      style={{
                        color: colors.black,
                        fontSize: fontSizes.h4,
                        fontFamily: fonts.MontserratMedium,
                      }}>
                      Giá bán
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <TouchableOpacity
                        onPress={() => {
                          setEditPriceMode(true);
                        }}
                        style={{
                          marginRight: 20,
                        }}>
                        <IconFeather
                          name="edit"
                          size={20}
                          color={colors.black}
                        />
                      </TouchableOpacity>
                      <Text
                        style={{
                          color: colors.darkGreyText,
                          fontSize: fontSizes.h4,
                          fontFamily: fonts.MontserratMedium,
                        }}>
                        ₫{numberWithCommas(product.price)}
                      </Text>
                    </View>
                    <Modal isVisible={editPriceMode}>
                      <View
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 10,
                          padding: 15,
                          backgroundColor: 'white',
                        }}>
                        <Text
                          style={{
                            color: colors.black,
                            fontSize: fontSizes.h3,
                            fontFamily: fonts.MontserratBold,
                          }}>
                          Chỉnh sửa giá bán
                        </Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 10
                          }}>
                          <Text
                            style={{
                              color: colors.black,
                              fontSize: fontSizes.h4,
                              fontFamily: fonts.MontserratMedium,
                            }}>
                            Giá bán
                          </Text>
                          <TextInput
                            value={product.price.toString()}
                            onChangeText={text => {
                              setProduct(p => ({
                                ...p,
                                price: parseInt(text),
                              }));
                            }}
                            keyboardType="numeric"
                            placeholder="Nhập khối lượng"
                            style={{
                              marginLeft: 10,
                              borderColor: colors.black,
                              color: colors.black,
                              fontSize: fontSizes.h4,
                              fontFamily: fonts.MontserratMedium,
                              textAlign: 'right',
                              borderBottomWidth: 1
                            }}
                          />
                          <Text
                            style={{
                              color: colors.black,
                              fontSize: fontSizes.h4,
                              fontFamily: fonts.MontserratMedium,
                            }}>
                            ₫
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            setEditPriceMode(false);
                          }}
                          style={{
                            backgroundColor: colors.primary,
                            paddingVertical: 10,
                            borderRadius: 5,
                            paddingHorizontal: 10
                          }}
                        >
                          <Text style={{
                            fontFamily: fonts.MontserratMedium,
                            color: 'white',
                            fontSize: fontSizes.h5
                          }}>Cập nhật</Text>
                        </TouchableOpacity>
                      </View>
                    </Modal>
                  </View>
                </View>
              </View>

              {/* Start listing */}
              <View
                style={{
                  paddingHorizontal: 15,
                  marginBottom: 15,
                }}>
                <TouchableOpacity
                  disabled={!validate()}
                  onPress={updateProduct}
                  style={{
                    backgroundColor: validate()
                      ? colors.primary
                      : colors.grey,
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
                    Cập nhật sản phẩm
                  </Text>
                </TouchableOpacity>
                {errorMessage == '' ? null : (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => {
                    setReady(!ready);
                  }}
                  style={{
                    flexDirection: 'row',
                    marginVertical: 10,
                    gap: 10,
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
              </View>
            </ScrollView>
          ) : (
            <View
              style={{
                alignItems: 'center',
                paddingTop: 150,
              }}>
              <Image
                source={images.warningImage}
                style={{
                  resizeMode: 'cover',
                  width: 140,
                  height: 140,
                }}
              />
              <Text
                style={{
                  fontSize: fontSizes.h4,
                  fontFamily: fonts.MontserratMedium,
                  color: 'black',
                  textAlign: 'center',
                  marginHorizontal: 35,
                  marginTop: 10,
                }}>
                Không thể tìm thấy thông tin sản phẩm này.
              </Text>
              <TouchableOpacity onPress={() => getProductDetail()}>
                <Text
                  style={{
                    fontSize: fontSizes.h5,
                    fontFamily: fonts.MontserratMedium,
                    color: colors.primary,
                    textAlign: 'center',
                    marginHorizontal: 35,
                    marginTop: 20,
                  }}>
                  Tải lại
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {isLoadingEdit && (
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
    marginLeft: 5
  },
  titleButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  sectionPhotoStyle: {
    borderBottomWidth: 1,
    borderColor: colors.darkGrey,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  sectionStyle: {
    borderBottomWidth: 1,
    borderColor: colors.darkGrey,
    paddingVertical: 10,
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
});
export default EditProduct;
