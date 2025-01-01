import React, { useContext, useState, useEffect } from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { AxiosContext } from '../context/AxiosContext';
import { colors, fontSizes, images, fonts, pageParameters } from '../constants';
import IconFeather from 'react-native-vector-icons/Feather';
import { ProductListingCard } from '../components';
import {
  Product as ProductRepository,
  Seller as SellerRepository
} from '../repositories';
import moment from 'moment';

function Profile(props) {
  // Get user_id from routes
  const { user_id } = props.route.params;

  // Auth Context
  const authContext = useContext(AuthContext);
  const axiosContext = useContext(AxiosContext);

  // Navigation
  const { navigation, route } = props;

  // Function of navigate to/back
  const { navigate, goBack } = navigation;

  // Data
  // Loading and refreshing state
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [userProfile, setUserProfile] = useState({
    profilePicture: images.defaultAvatar
  });
  const [currentTab, setCurrentTab] = useState(1);

  // Data for products
  const [products, setProducts] = useState([]);

  //// FUNCTION
  // Initialize data for categories, materials and auctions on screen start
  function getAllProduct() {
    setIsLoading(true);
    setCurrentPage(1);
    setHasNext(true);

    ProductRepository.getProductsBySeller(axiosContext, user_id, 1)
      .then(response => {
        setProducts(response);
        if (response.length < pageParameters.DEFAULT_PAGE_SIZE) {
          setHasNext(false)
        }
        setIsLoading(false);
      })
      .catch(error => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    setIsLoading(true);
    setCurrentPage(1);
    setHasNext(true);

    const promiseProducts = ProductRepository.getProductsBySeller(axiosContext, user_id, 1)
      .then(response => {
        setProducts(response);
        if (response.length < pageParameters.DEFAULT_PAGE_SIZE) {
          setHasNext(false)
        }
      })

    const promiseSeller = SellerRepository.getSellerById(axiosContext, user_id)
      .then(response => {
        setUserProfile(response);
      });

    Promise.all([promiseProducts, promiseSeller])
      .then((values) => {
        setIsLoading(false);
      })
      .catch(error => {
        console.log(error);
        setIsLoading(false);
      });
  }, []);

  // Scroll view refresh
  const onRefresh = () => {
    setRefreshing(true);
    getAllProduct();
    setRefreshing(false);
  };

  // Pagination
  const loadMoreItems = () => {
    if (hasNext) {
      ProductRepository.getProductsBySeller(axiosContext, user_id, currentPage + 1)
        .then(response => {
          setProducts(products => [...products, ...response]);
          if (response.length < pageParameters.DEFAULT_PAGE_SIZE) {
            setHasNext(false)
          }
        })
        .catch(error => { });
      setCurrentPage(currentPage + 1);
    }
  }

  // Pagination loader
  const renderLoader = () => {
    return (
      <View style={{
        alignItems: 'center',
        paddingBottom: 600,
        paddingTop: 15
      }}>
        {hasNext && <ActivityIndicator size={'large'} color={colors.primary} />}
      </View>
    )
  }

  return <View style={styles.container}>
    {/* Fixed screen title: Cart */}
    <View style={styles.titleContainer}>
      <TouchableOpacity style={styles.iconButton}
        onPress={() => {
          goBack()
        }}>
        <IconFeather name="chevron-left" size={25} color={'black'} />
      </TouchableOpacity>
      <Text style={styles.titleText}>Hồ sơ người bán</Text>
    </View>

    {/* Loading section */}
    {isLoading ? <View style={{
      flex: 1,
      justifyContent: 'center'
    }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View> :
      <View>
        {/* User profile */}
        <View style={{
          flexDirection: 'row',
          gap: 15,
          paddingHorizontal: 15,
          paddingVertical: 15,
          backgroundColor: colors.grey
        }}>
          <Image source={{ uri: userProfile.profilePicture }}
            style={{
              resizeMode: 'cover',
              width: 100,
              height: 100,
              borderRadius: 50
            }} />
          <View style={{ gap: 2 }}>
            <Text style={{
              color: 'black',
              fontFamily: fonts.MontserratBold,
              fontSize: fontSizes.h3
            }}>{userProfile.name}</Text>
            <Text style={{
              color: 'black',
              fontFamily: fonts.MontserratMedium,
              fontSize: fontSizes.h5
            }}>{userProfile.province}</Text>
          </View>
        </View>

        {/* Tab navigation */}
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: 15,
          marginVertical: 15,
          gap: 30
        }}>
          <TouchableOpacity style={{
            alignItems: 'center'
          }}
            onPress={() => setCurrentTab(1)}>
            <Text style={{
              color: currentTab == 1 ? 'black' : colors.darkGreyText,
              fontFamily: fonts.MontserratMedium,
              fontSize: fontSizes.h5
            }}>Đang bán</Text>
            {currentTab == 1 && <View style={{
              height: 1.5,
              backgroundColor: 'black',
              width: '80%',
              marginTop: 15
            }}></View>}
          </TouchableOpacity>

          <TouchableOpacity style={{
            alignItems: 'center'
          }}
            onPress={() => setCurrentTab(2)}>
            <Text style={{
              color: currentTab == 2 ? 'black' : colors.darkGreyText,
              fontFamily: fonts.MontserratMedium,
              fontSize: fontSizes.h5
            }}>Thêm</Text>
            {currentTab == 2 && <View style={{
              height: 1.5,
              backgroundColor: 'black',
              width: '80%',
              marginTop: 15
            }}></View>}
          </TouchableOpacity>
        </View>

        {/* Tab content */}
        {currentTab == 1 ? <View>
          {/* Title (type of list: for sale/auction) section */}
          {(Array.isArray(products) && products.length) ? <View>
            <View style={{
              paddingVertical: 10,
              paddingHorizontal: 15
            }}>
              <Text style={{
                color: 'black',
                fontFamily: fonts.MontserratBold,
                fontSize: fontSizes.h2
              }}>Tất cả sản phẩm</Text>
            </View>

            <View>
              <FlatList
                style={{
                  marginBottom: 50
                }}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                keyExtractor={item => item.id}
                data={products}
                renderItem={({ item, index }) => <ProductListingCard key={item.id} product={item}
                  index={index} onPress={() => {
                    navigate('ListingDetail', { product_id: item.id })
                  }} />}
                onEndReached={loadMoreItems}
                onEndReachedThreshold={0}
                ListFooterComponent={renderLoader}
              />
            </View>
          </View> : <View style={{
            flex: 1,
            alignItems: 'center',
            paddingTop: 150
          }}>
            <Image source={images.searchImage} style={{
              resizeMode: 'cover',
              width: 140,
              height: 140
            }} />
            <Text style={{
              fontSize: fontSizes.h4,
              fontFamily: fonts.MontserratMedium,
              color: 'black',
              textAlign: 'center',
              marginHorizontal: 35,
              marginTop: 10
            }}>Không thể tìm thấy sản phẩm nào. Bạn hãy thử tìm kiếm với từ khóa khác xem sao!</Text>
          </View>}
        </View> : <View>
          <View style={{
            paddingVertical: 10,
            paddingHorizontal: 20,
            gap: 10
          }}>
            <View style={{
              flexDirection: 'row'
            }}>
              <Text style={{
                fontSize: fontSizes.h4,
                fontFamily: fonts.MontserratMedium,
                color: colors.darkGreyText
              }}>Địa chỉ: </Text>
              <Text style={{
                fontSize: fontSizes.h4,
                fontFamily: fonts.MontserratBold,
                color: 'black'
              }}>{userProfile.district}, {userProfile.province}</Text>
            </View>

            <View style={{
              flexDirection: 'row'
            }}>
              <Text style={{
                fontSize: fontSizes.h4,
                fontFamily: fonts.MontserratMedium,
                color: colors.darkGreyText
              }}>Ngày gia nhập: </Text>
              <Text style={{
                fontSize: fontSizes.h4,
                fontFamily: fonts.MontserratBold,
                color: 'black'
              }}>{moment(userProfile.registeredAt).format('DD/MM/YYYY')}</Text>
            </View>
          </View>
        </View>}

      </View>
    }
  </View>
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
    alignItems: 'center'
  },
  titleText: {
    color: 'black',
    fontFamily: fonts.MontserratBold,
    fontSize: fontSizes.h1,
    alignSelf: 'center',
    marginLeft:5
  },
  titleButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  separator: {
    height: 1.5,
    backgroundColor: colors.darkGreyText,
    marginRight: 10
  }
});

export default Profile;