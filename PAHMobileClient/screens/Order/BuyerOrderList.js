import React, { useState, useContext, useEffect } from 'react';
import {
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colors, fontSizes, images, fonts, pageParameters, enumConstants } from '../../constants';
import IconFeather from 'react-native-vector-icons/Feather';
import IconFA5 from 'react-native-vector-icons/FontAwesome5';
import { AxiosContext } from '../../context/AxiosContext';
import { Order as OrderRepository } from '../../repositories';
import { orderStatusText } from '../../utilities/OrderStatus';
import { orderFilterStatusText } from '../../utilities/OrderFilterStatus';
import { numberWithCommas } from '../../utilities/PriceFormat';
import moment from 'moment';

function BuyerOrderList(props) {
  //// AXIOS AND NAVIGATION
  // Axios Context
  const axiosContext = useContext(AxiosContext);

  // Navigation
  const { navigation, route } = props;

  // Function of navigate to/back
  const { navigate, goBack } = navigation;

  //// DATA
  // Data for orders
  const [orders, setOrders] = useState([]);

  // Loading state data
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const isAllEmpty = () => !(Array.isArray(orders) && orders.length);

  // Order status filter
  const [orderStatus, setOrderStatus] = useState([
    [enumConstants.orderStatus.WaitingSellerConfirm],
    [enumConstants.orderStatus.ReadyForPickup],
    [enumConstants.orderStatus.Delivering],
    [enumConstants.orderStatus.Delivered, enumConstants.orderStatus.Done],
    [enumConstants.orderStatus.CancelApprovalPending],
    [enumConstants.orderStatus.CancelledByBuyer, enumConstants.orderStatus.CancelledBySeller]
  ]);
  const [currentOrderStatus, setCurrentOrderStatus] = useState([enumConstants.orderStatus.WaitingSellerConfirm]);
  const [currentPage, setCurrentPage] = useState(1);

  //// FUNCTIONS
  // Get all orders
  function getAllOrder() {
    setIsLoading(true);
    setCurrentPage(1);
    setHasNext(true);
    OrderRepository.getAllOrderCurrentBuyer(axiosContext, currentOrderStatus, 1)
      .then(response => {
        setOrders(response);
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
    getAllOrder();
  }, [currentOrderStatus]);

  // Scroll view refresh
  const onRefresh = () => {
    setRefreshing(true);
    getAllOrder();
    setRefreshing(false);
  };

  // Pagination
  const loadMoreItems = () => {
    if (hasNext) {
      OrderRepository.getAllOrderCurrentBuyer(axiosContext, currentOrderStatus, currentPage + 1)
        .then(response => {
          setOrders(orders => [...orders, ...response]);
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
        marginBottom: 0,
        paddingBottom: 50,
        paddingTop: 15
      }}>
        {hasNext && <ActivityIndicator size={'large'} color={colors.primary} />}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <View style={styles.titleContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              goBack();
            }}>
            <IconFeather name="chevron-left" size={25} color={'black'} />
          </TouchableOpacity>
          <Text style={styles.titleText}>Đơn hàng</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              navigate('Cart');
            }}>
            <IconFeather name="shopping-cart" size={20} color={'black'} />
          </TouchableOpacity>
        </View>

        {/* Filter section */}
        <View>
          <FlatList
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            data={orderStatus}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 15,
                    borderBottomWidth: currentOrderStatus.includes(item[0]) ? 2 : null,
                    borderBottomColor:
                      currentOrderStatus.includes(item[0]) ? colors.primary : null,
                  }}
                  onPress={() => {
                    setCurrentOrderStatus(item);
                  }}>
                  <Text
                    style={{
                      color:
                        currentOrderStatus.includes(item[0]) ? colors.primary : 'black',
                      fontFamily: fonts.MontserratMedium,
                      fontSize: fontSizes.h5,
                    }}>
                    {orderFilterStatusText(item)}
                  </Text>
                </TouchableOpacity>
              );
            }}
            keyExtractor={status => status}
          />
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
          <View style={{ flex: 1 }}>
            {isAllEmpty() ? (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingTop: 150,
                }}>
                <Image
                  source={images.cartImage}
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
                  Không thể tìm thấy đơn hàng nào.
                </Text>
                <TouchableOpacity onPress={() => getAllOrder()}>
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
            ) : (
              <View style={{ backgroundColor: colors.grey, flex: 1 }}>
                <View
                  style={{
                    paddingVertical: 5,
                  }}>
                  <FlatList
                    refreshControl={
                      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    keyExtractor={item => item.id}
                    data={orders}
                    renderItem={({ item }) => <TouchableOpacity
                      style={{
                        marginBottom: 5,
                        backgroundColor: 'white',
                        padding: 0,
                      }}
                      onPress={() => {
                        navigate('BuyerOrderDetail', { orderId: item.id });
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          paddingHorizontal: 15,
                          paddingTop: 15
                        }}>
                        <View
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginVertical: 5,
                            gap: 5
                          }}>
                          <IconFA5 name='store-alt' size={15} color='black' />
                          <Text style={styles.sellerNameText}>
                            {item.seller.name}
                          </Text>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginLeft: 'auto',
                            }}>
                            <Text style={styles.orderStatus}>
                              {orderStatusText(item.status)}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.itemSection}>
                        <View style={styles.itemImageZone}>
                          <Image
                            width={80}
                            height={80}
                            borderRadius={10}
                            source={{ uri: item.orderItems[0].imageUrl }}
                          />
                        </View>
                        <View style={styles.itemDetailSection}>
                          <Text numberOfLines={1} style={styles.itemTitleText}>
                            Đơn hàng #{item.id}
                          </Text>
                          <View
                            style={{
                              alignItems: 'center',
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginBottom: 10
                            }}>
                            <Text style={styles.itemDescriptionText}>
                              {item.orderItems[0].productName}
                            </Text>
                            <Text style={styles.itemQuantityText}>
                              x{item.orderItems[0].quantity}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.itemMoneyText}>
                              đ {numberWithCommas(item.orderItems[0].price)}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.orderFooter}>
                        <View
                          style={{
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                          <Text style={styles.orderTotalMoneyText}>
                            {item.orderItems.length} sản phẩm
                          </Text>
                          <Text style={styles.orderTotalMoneyText}>
                            Tổng thanh toán:
                            <Text style={styles.itemMoneyText}> đ {numberWithCommas(item.totalAmount + item.shippingCost)}</Text>
                          </Text>
                        </View>
                      </View>
                      <View style={styles.orderFooter}>
                        <Text style={styles.orderDateText}>Ngày đặt: {moment(item.orderDate).format('DD/MM/YYYY')}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          paddingTop: 10,
                          paddingHorizontal: 15,
                          paddingBottom: 15
                        }}>
                        {[5, 2, 3].includes(item.status) && (
                          <TouchableOpacity
                            disabled={true}
                            style={[styles.orderDetailButton, {
                              backgroundColor: colors.grey
                            }]}>
                            <Text style={[styles.orderDetailText, {
                              color: colors.greyText
                            }]}>Đang xử lý</Text>
                          </TouchableOpacity>
                        )}

                        {[4, 10, 11, 12, 6].includes(item.status) && (
                          <TouchableOpacity style={[styles.orderDetailButton, {
                            backgroundColor: colors.primary
                          }]}
                            onPress={() => {
                              navigate('BuyerOrderDetail', { orderId: item.id });
                            }}>
                            <Text style={[styles.orderDetailText, {
                              color: 'white'
                            }]}>Chi tiết</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </TouchableOpacity>}
                    onEndReached={loadMoreItems}
                    onEndReachedThreshold={0}
                    ListFooterComponent={renderLoader}
                  />
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
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
  addButton: {
    marginLeft: 'auto',
    padding: 12,
    borderRadius: 5,
    backgroundColor: colors.grey,
  },
  titleContainer: {
    height: 70,
    flexDirection: 'row',
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  titleText: {
    color: 'black',
    fontFamily: fonts.MontserratBold,
    fontSize: fontSizes.h1,
    alignSelf: 'center',
    marginLeft: 5
  },
  emptyText: {
    color: colors.greyText,
    fontSize: fontSizes.h4,
    textAlign: 'center',
    fontFamily: fonts.MontserratMedium,
    marginVertical: 30,
  },
  orderDetailButton: {
    width: '38%',
    height: 40,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderDetailText: {
    fontSize: fontSizes.h4,
    fontFamily: fonts.MontserratMedium,
  },
  buyAgainButton: {
    width: '48%',
    height: 40,
    borderRadius: 5,
    borderColor: colors.primary,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyAgainText: {
    color: colors.primary,
    fontSize: fontSizes.h3,
    fontFamily: fonts.MontserratMedium,
  },
  orderImageZone: {
    flex: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  orderStatusText: {
    color: colors.primary,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h5,
  },
  orderTitleText: {
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h4,
  },
  orderMoneyText: {
    color: colors.black,
    fontFamily: fonts.MontserratBold,
    fontSize: fontSizes.h4,
  },
  orderDateText: {
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h5,
  },
  orderShippingText: {
    color: colors.greyText,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h5,
  },
  orderFeedbackText: {
    color: colors.greyText,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h5,
  },
  orderItemCountText: {
    color: colors.greyText,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h5,
  },
  itemSection: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: colors.grey,
    paddingHorizontal: 15
  },
  itemImageZone: {
    flex: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  itemDetailSection: {
    flex: 80,
    paddingVertical: 15,
    paddingStart: 10,
  },
  itemTitleText: {
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h4,
    marginBottom: 10
  },
  itemDescriptionText: {
    color: colors.greyText,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h5,

  },
  itemQuantityText: {
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h4,
  },
  itemMoneyText: {
    marginLeft: 'auto',
    color: colors.primary,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h4,
  },
  sellerNameText: {
    color: colors.black,
    fontFamily: fonts.MontserratBold,
    fontSize: fontSizes.h3,
  },
  orderStatus: {
    marginRight: 5,
    color: colors.primary,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h5,
  },
  orderFooter: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
    paddingHorizontal: 15
  },
  orderTotalMoneyText: {
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h5,
  },
});
export default BuyerOrderList;
