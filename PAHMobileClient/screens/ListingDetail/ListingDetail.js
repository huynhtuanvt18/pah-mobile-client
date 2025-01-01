import React, {useContext, useState, useEffect} from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  TextInput,
} from 'react-native';
import {AuthContext} from '../../context/AuthContext';
import {AxiosContext} from '../../context/AxiosContext';
import {colors, fontSizes, fonts, images} from '../../constants';
import IconFeather from 'react-native-vector-icons/Feather';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import IconAntDesign from 'react-native-vector-icons/AntDesign';
import {SliderBox} from 'react-native-image-slider-box';
import Modal from 'react-native-modal';
import {ListingDetailInfoText, ListingDetailFeedback} from '../../components';
import {
  Product as ProductRepository,
  Address as AddressRepository,
  Shipping as ShippingRepository,
  Feedback as FeedbackRepository,
} from '../../repositories';
import {conditionText} from '../../utilities/Condition';
import moment from 'moment';
import {numberWithCommas} from '../../utilities/PriceFormat';
import {useDispatch, useSelector} from 'react-redux';
import {addToCart} from '../../reducers/CartReducer';
import Toast from 'react-native-toast-message';

function ListingDetail(props) {
  //// CART REDUX STORE
  const dispatch = useDispatch();

  //// AUTH AND NAVIGATION
  // Auth Context
  const authContext = useContext(AuthContext);
  const axiosContext = useContext(AxiosContext);

  // Navigation
  const {navigation, route} = props;

  // Function of navigate to/back
  const {navigate, goBack} = navigation;

  // Get product_id from routes
  const {product_id} = props.route.params;

  //// DATA
  // Data for product detail
  const [product, setProduct] = useState({
    seller: {},
    feedbacks: [],
    imageUrls: [],
  });

  const [feedback, setfeedBack] = useState(null);

  // Calculate data for shipping price
  const [userAddress, setUserAddress] = useState({});
  const [shippingPrice, setShippingPrice] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // Modal data
  const [shippingModalVisible, setShippingModalVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);

  // Data for loading and refreshing
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingCreate, setIsLoadingCreate] = useState(false);

  //// FUNCTION
  // Get product detail from current product id
  function getProductDetail() {
    setIsLoading(true);

    // If authenticated, get default address and shipping price
    if (authContext?.authState?.authenticated) {
      ProductRepository.getProductDetail(axiosContext, product_id)
        .then(responseProduct => {
          setProduct(responseProduct);
          AddressRepository.getAdrressCurrentUser(axiosContext)
            .then(responseAddress => {
              setUserAddress(responseAddress);
              // Shipping cost calculate
              getShippingCost(responseAddress, responseProduct);
            })
            .catch(error => {
              console.log(error);
              setIsLoading(false);
            });
        })
        .catch(error => {
          setIsLoading(false);
        });
    } else {
      ProductRepository.getProductDetail(axiosContext, product_id)
        .then(response => {
          setProduct(response);
          setIsLoading(false);
        })
        .catch(error => {
          setIsLoading(false);
        });
    }
  }

  function getShippingCost(responseAddress, responseProduct) {
    ShippingRepository.calculateShippingCost({
      service_type_id: 2,
      from_district_id: product.seller.districtId,
      from_ward_code: product.seller.wardCode,
      to_district_id: responseAddress.districtId,
      to_ward_code: responseAddress.wardCode,
      weight: responseProduct.weight,
    })
      .then(responseShip => {
        setShippingPrice(responseShip.total);
        setIsLoading(false);
      })
      .catch(error => {
        console.log(error);
        setIsLoading(false);
      });
  }

  // Create new feedback
  async function createFeedback() {
    setErrorMessage('');
    setFeedbackModalVisible(false);
    setIsLoadingCreate(true);
    FeedbackRepository.createFeedback(axiosContext, {
      productId: product_id,
      ratings: 0,
      buyerFeedback: feedback,
    })
      .then(response => {
        Toast.show({
          type: 'success',
          text1: 'Bạn đã gửi đánh giá thành công',
          position: 'bottom',
          autoHide: true,
          visibilityTime: 2000,
        });
        setfeedBack('');
        setIsLoadingCreate(false);
        onRefresh();
      })
      .catch(error => {
        console.log(error);
        if (error.response.data.message) {
          Toast.show({
            type: 'error',
            text1: error.response.data.message,
            position: 'bottom',
            autoHide: true,
            visibilityTime: 2000,
          });
        }
        if (error.response.data.Message) {
          Toast.show({
            type: 'error',
            text1: error.response.data.Message,
            position: 'bottom',
            autoHide: true,
            visibilityTime: 2000,
          });
        }
        setIsLoadingCreate(false);
      });
  }

  // Add item to cart
  const addItemToCart = item => {
    dispatch(addToCart(item));
  };

  useEffect(() => {
    getProductDetail();
  }, []);

  // Scroll view refresh
  const onRefresh = () => {
    setRefreshing(true);
    getProductDetail();
    setRefreshing(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      {/* Fixed screen title: Product detail */}
      <View style={styles.titleContainer}>
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              goBack();
            }}>
            <IconFeather name="chevron-left" size={25} color={'black'} />
          </TouchableOpacity>
          <Text style={styles.titleText}>Sản phẩm</Text>
        </View>
        <View style={styles.titleButtonContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              navigate('Search');
            }}>
            <IconFeather name="search" size={18} color={'black'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              navigate('Cart');
            }}>
            <IconFeather name="shopping-cart" size={18} color={'black'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              if (authContext?.authState?.authenticated) {
                setFeedbackModalVisible(true);
              } else {
                navigate('Login');
              }
            }}>
            <IconMaterial name="feedback" size={18} color={'black'} />
          </TouchableOpacity>
        </View>
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
          {product.name ? (
            <ScrollView
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }>
              {/* Images slider */}
              <SliderBox
                images={product.imageUrls}
                sliderBoxHeight={400}
                dotColor={colors.primary}
                inactiveDotColor="#90A4AE"
              />

              {/* Product name */}
              <Text style={styles.productName}>{product.name}</Text>

              {/* Pricing section */}
              <View style={styles.priceContainer}>
                <Text style={styles.pricePrimary}>
                  ₫{numberWithCommas(product.price)}
                </Text>

                {!authContext?.authState?.authenticated ? (
                  <Text style={styles.priceSecondary}>
                    Đăng nhập để xem cước phí vận chuyển
                  </Text>
                ) : (
                  <View>
                    {shippingPrice != 0 && userAddress != '' ? (
                      <View>
                        <Text style={styles.priceSecondary}>
                          ₫{numberWithCommas(shippingPrice)} cước vận chuyển
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.priceSecondary}>
                        Thêm địa chỉ mặc định để xem phí vận chuyển
                      </Text>
                    )}
                  </View>
                )}
              </View>

              {/* Buy and add to cart buttons */}
              {product.type == 1 && (
                <View
                  style={{
                    paddingHorizontal: 15,
                    gap: 10,
                    marginVertical: 10,
                  }}>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => {
                      if (authContext?.authState?.authenticated) {
                        navigate('CheckoutNow', {product_id: product.id});
                      } else {
                        navigate('Login');
                      }
                    }}>
                    <Text style={styles.primaryButtonText}>Mua ngay</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => {
                      addItemToCart(product);
                      Toast.show({
                        type: 'success',
                        text1: 'Đã thêm sản phẩm vào giỏ hàng',
                        position: 'bottom',
                        autoHide: true,
                        visibilityTime: 2000,
                      });
                    }}>
                    <Text style={styles.secondaryButtonText}>
                      Thêm vào giỏ hàng
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Item information section */}
              <View
                style={{
                  paddingHorizontal: 15,
                  gap: 10,
                  marginVertical: 20,
                }}>
                <Text style={styles.sectionTitle}>Thông tin sản phẩm</Text>
                <View style={{gap: 10, marginTop: 5}}>
                  <ListingDetailInfoText
                    label="Bao gồm"
                    text={product.packageContent}
                  />
                  <ListingDetailInfoText
                    label="Tình trạng"
                    text={conditionText(product.condition)}
                  />
                  <ListingDetailInfoText
                    label="Danh mục"
                    text={product.categoryName}
                  />
                  <ListingDetailInfoText
                    label="Chất liệu"
                    text={product.materialName}
                  />
                  <ListingDetailInfoText
                    label="Xuất xứ"
                    text={product.origin}
                  />
                  <ListingDetailInfoText
                    label="Kích thước"
                    text={product.dimension + ' cm'}
                  />
                  <ListingDetailInfoText
                    label="Khối lượng"
                    text={product.weight + ' g'}
                  />
                  <ListingDetailInfoText
                    label="Đóng gói"
                    text={product.packageMethod}
                  />
                </View>
              </View>

              {/* Item description section */}
              <View
                style={{
                  paddingHorizontal: 15,
                  gap: 10,
                  marginVertical: 20,
                }}>
                <Text style={styles.sectionTitle}>
                  Thông tin thêm từ người bán
                </Text>
                <TouchableOpacity
                  style={{
                    marginTop: 5,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  onPress={() =>
                    navigate('ListingDescription', {
                      description: product.description,
                    })
                  }>
                  <View
                    style={{
                      flex: 1,
                      gap: 10,
                    }}>
                    <Text
                      numberOfLines={3}
                      ellipsizeMode="tail"
                      style={styles.descriptionText}>
                      {product.description}
                    </Text>
                    <Text style={styles.descriptionLink}>
                      Xem đầy đủ thông tin thêm
                    </Text>
                  </View>
                  <IconFeather name="chevron-right" size={30} color="black" />
                </TouchableOpacity>
              </View>

              {/* Shipping information section */}
              <View
                style={{
                  paddingHorizontal: 15,
                  gap: 10,
                  marginVertical: 20,
                }}>
                <Text style={styles.sectionTitle}>
                  Vận chuyển và thanh toán
                </Text>
                <TouchableOpacity
                  style={{
                    marginTop: 5,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  onPress={() =>
                    setShippingModalVisible(!shippingModalVisible)
                  }>
                  <View style={{gap: 10, flex: 1}}>
                    <ListingDetailInfoText
                      label="Giao hàng"
                      text={
                        'Từ ' +
                        `${product.seller.ward}, ${product.seller.district}, ${product.seller.province}`
                      }
                      secondText="Thông qua Giao hàng nhanh"
                    />
                    <ListingDetailInfoText
                      label="Thanh toán"
                      text="Ví PAH, Zalopay"
                    />
                  </View>
                  <IconFeather name="chevron-right" size={30} color="black" />
                </TouchableOpacity>
              </View>

              {/* Bottom seller section */}
              <View
                style={{
                  paddingHorizontal: 15,
                  gap: 10,
                  marginVertical: 15,
                }}>
                <Text style={styles.sectionTitle}>Về người bán</Text>
                <View style={{gap: 10, marginTop: 5}}>
                  <TouchableOpacity
                    onPress={() =>
                      navigate('Profile', {user_id: product.seller.id})
                    }>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 15,
                      }}>
                      <Image
                        source={{uri: product.seller.profilePicture}}
                        style={styles.bottomSellerImage}
                      />
                      <View style={{gap: 2}}>
                        <Text style={styles.bottomSellerPrimary}>
                          {product.seller.name}
                        </Text>
                        <Text style={styles.bottomSellerSecondary}>
                          {product.seller.province}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginVertical: 15,
                        gap: 10,
                      }}>
                      <IconFeather name="calendar" size={20} color="black" />
                      <Text style={styles.descriptionText}>
                        Tham gia ngày{' '}
                        {moment(product.seller.registeredAt).format(
                          'DD/MM/YYYY',
                        )}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Product feedback section */}
              {product.type == 1 && (
                <View
                  style={{
                    paddingHorizontal: 15,
                    gap: 10,
                    marginTop: 10,
                    marginBottom: 100,
                  }}>
                  <Text style={styles.sectionTitle}>Phản hồi về sản phẩm</Text>
                  <View style={{marginTop: 5}}>
                    {Array.isArray(product.feedbacks) &&
                    product.feedbacks.length ? (
                      <View>
                        {product.feedbacks.map((feedback, index) => (
                          <ListingDetailFeedback
                            feedback={feedback}
                            key={feedback.id}
                            index={index}
                            length={product.feedbacks.length - 1}
                          />
                        ))}
                        <TouchableOpacity
                          style={styles.secondaryButton}
                          onPress={() =>
                            navigate('ListingFeedback', {
                              product_id: product.id,
                            })
                          }>
                          <Text style={styles.secondaryButtonText}>
                            Xem tất cả phản hồi
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View>
                        <Text style={styles.emptyText}>
                          Không có phản hồi về sản phẩm này
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
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

      {/* Shipping modal */}
      <Modal
        animationIn="slideInUp"
        animationOut="slideOutDown"
        isVisible={shippingModalVisible}
        onRequestClose={() => {
          setShippingModalVisible(!shippingModalVisible);
        }}
        style={{margin: 0}}>
        <View
          style={{
            flex: 1,
          }}>
          <TouchableOpacity
            style={{flex: 1}}
            onPress={() => {
              setShippingModalVisible(!shippingModalVisible);
            }}></TouchableOpacity>
          <View style={styles.modalContainer}>
            {/* Shipping modal title */}
            <Text style={styles.modalTitle}>Giao hàng và thanh toán</Text>

            {/* Shipping information */}
            <View
              style={{
                gap: 10,
                marginHorizontal: 20,
                marginBottom: 30,
              }}>
              <ListingDetailInfoText
                label="Giao từ"
                text={`${product.seller.ward}, ${product.seller.district}, ${product.seller.province}`}
              />
              <ListingDetailInfoText
                label="Giao đến"
                text={
                  userAddress.province
                    ? `${userAddress.ward}, ${userAddress.district}, ${userAddress.province}`
                    : 'Cài đặt địa chỉ mặc định để thấy cước vận chuyển'
                }
              />
              <ListingDetailInfoText
                label="Thanh toán"
                text="Ví PAH, Zalopay"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* feedback modal */}
      <Modal
        animationIn="slideInUp"
        animationOut="slideOutDown"
        isVisible={feedbackModalVisible}
        onRequestClose={() => {
          setFeedbackModalVisible(!feedbackModalVisible);
        }}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
          }}>
          <View style={styles.feedbackModalContainer}>
            <TouchableOpacity
              style={{position: 'absolute', top: 10, right: 10}}
              onPress={() => {
                setFeedbackModalVisible(!feedbackModalVisible);
              }}>
              <IconAntDesign name="closecircle" size={18} color={'black'} />
            </TouchableOpacity>
            {/* feedback modal title */}
            <Text style={styles.feedbackModalTitle}>Đánh giá sản phẩm</Text>

            {/* feedback information */}
            <View
              style={{
                marginHorizontal: 20,
              }}>
              <Text
                style={{
                  color: colors.black,
                  fontFamily: fonts.MontserratRegular,
                  fontSize: fontSizes.h5,
                  marginBottom: 5,
                }}>
                Bạn có chia sẻ gì về sản phẩm?
              </Text>
              <TextInput
                value={feedback}
                returnKeyType="done"
                autoCapitalize="none"
                autoFocus={true}
                multiline
                numberOfLines={6}
                onChangeText={text => {
                  setfeedBack(text);
                }}
                style={{
                  textAlignVertical: 'top',
                  borderWidth: 1,
                  borderRadius: 5,
                  color: 'black',
                  fontFamily: fonts.MontserratMedium,
                  fontSize: fontSizes.h5,
                }}
              />
              <TouchableOpacity
                disabled={feedback == ''}
                onPress={() => {
                  if (authContext?.authState?.authenticated) {
                    createFeedback();
                  } else {
                    navigate('Login');
                  }
                }}
                style={{
                  backgroundColor:
                    feedback != '' ? colors.info : colors.inactive,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  marginVertical: 10,
                  borderRadius: 5,
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontFamily: fonts.MontserratMedium,
                    fontSize: fontSizes.h4,
                  }}>
                  Gửi đánh giá
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {isLoadingCreate && (
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
  titleContainer: {
    height: 70,
    flexDirection: 'row',
    paddingLeft: 15,
    paddingRight: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleText: {
    color: 'black',
    fontFamily: fonts.MontserratBold,
    fontSize: fontSizes.h1,
    alignSelf: 'center',
    marginLeft: 5,
  },
  titleButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  separator: {
    height: 1,
    backgroundColor: colors.darkGrey,
    marginRight: 10,
  },
  iconButton: {
    backgroundColor: colors.grey,
    padding: 12,
    borderRadius: 5,
  },
  primaryButton: {
    borderWidth: 1.2,
    borderColor: colors.primary,
    borderRadius: 5,
    backgroundColor: colors.primary,
    paddingVertical: 10,
  },
  primaryButtonText: {
    fontSize: fontSizes.h3,
    fontFamily: fonts.MontserratBold,
    color: 'white',
    textAlign: 'center',
  },
  secondaryButton: {
    borderWidth: 1.2,
    borderColor: colors.primary,
    borderRadius: 5,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    fontSize: fontSizes.h3,
    fontFamily: fonts.MontserratMedium,
    color: colors.primary,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.greyText,
    fontSize: fontSizes.h4,
    textAlign: 'center',
    fontFamily: fonts.MontserratMedium,
    marginVertical: 30,
  },
  productName: {
    color: 'black',
    fontFamily: fonts.MontserratBold,
    fontSize: fontSizes.h2,
    marginHorizontal: 15,
    marginVertical: 10,
  },
  topSellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    gap: 15,
    marginVertical: 10,
  },
  topSellerImage: {
    resizeMode: 'cover',
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  topSellerName: {
    color: 'black',
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h5,
  },
  topSellerInformation: {
    color: colors.darkGreyText,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h5,
  },
  priceContainer: {
    paddingHorizontal: 15,
    gap: 5,
    marginVertical: 10,
    alignItems: 'baseline',
  },
  pricePrimary: {
    color: 'black',
    fontFamily: fonts.MontserratBold,
    fontSize: fontSizes.h1,
  },
  priceSecondary: {
    color: colors.darkGreyText,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h4,
  },
  sectionTitle: {
    color: 'black',
    fontFamily: fonts.MontserratBold,
    fontSize: fontSizes.h2,
  },
  descriptionText: {
    color: 'black',
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h4,
  },
  descriptionLink: {
    color: 'black',
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h4,
    textDecorationLine: 'underline',
  },
  bottomSellerImage: {
    resizeMode: 'cover',
    width: 80,
    height: 80,
    borderRadius: 50,
  },
  bottomSellerPrimary: {
    color: 'black',
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h5,
  },
  bottomSellerSecondary: {
    color: colors.darkGreyText,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h5,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  modalTitle: {
    color: 'black',
    fontSize: fontSizes.h3,
    fontFamily: fonts.MontserratBold,
    marginHorizontal: 20,
    marginVertical: 20,
  },
  feedbackModalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'center',
    padding: 10,
    width: 300,
  },
  feedbackModalTitle: {
    color: 'black',
    fontSize: fontSizes.h3,
    fontFamily: fonts.MontserratBold,
    marginHorizontal: 20,
    marginVertical: 20,
    alignSelf: 'center',
  },
});

export default ListingDetail;
