import React, {useContext, useState, useEffect} from 'react';
import {Text, View, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, fontSizes, fonts, roles} from '../../constants';
import IconFeather from 'react-native-vector-icons/Feather';
import IconFoundation from 'react-native-vector-icons/Foundation';
import {
  Seller as SellerRepository,
  Wallet as WalletRepository,
} from '../../repositories';
import {AxiosContext} from '../../context/AxiosContext';
import {numberWithCommas} from '../../utilities/PriceFormat';

function SellerHomeView(props) {
  //// AXIOS AND NAVIGATION
  // Axios Context
  const axiosContext = useContext(AxiosContext);

  const {user} = props;
  // Navigation
  const {navigation, route} = props;

  // Function of navigate to/back
  const {navigate, goBack} = navigation;

  //// DATA
  const [sales, setSales] = useState(0);
  const [sellingProduct, setSellingProduct] = useState(0);
  const [processingOrders, setProcessingOrders] = useState(0);
  const [doneOrders, setDoneOrders] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalAuctions, setTotalAuctions] = useState(0);
  const [wallet, setWallet] = useState({
    availableBalance: 0,
    lockedBalance: 0,
  });

  //// FUNCTION
  // Function for fetching sales
  const getSellerDashboard = () => {
    const promiseDashboard = SellerRepository.getSalesOfThreeMonths(
      axiosContext,
    ).then(response => {
      setSales(response.totalSales);
      setSellingProduct(response.sellingProduct);
      setProcessingOrders(response.processingOrders);
      setDoneOrders(response.doneOrders);
      setTotalOrders(response.totalOrders);
      setTotalAuctions(response.totalAuctions);
    });

    const promiseWallet = WalletRepository.getWalletCurrentUser(
      axiosContext,
    ).then(response => {
      setWallet(response);
    });

    Promise.all([promiseDashboard, promiseWallet])
      .then(values => {})
      .catch(error => {
        console.log(error);
      });
  };
  // Use effect
  useEffect(() => {
    getSellerDashboard();
  }, []);

  return (
    <View>
      {/* total money */}
      <View style={styles.totalMoneyStyle}>
        <Text style={styles.totalTitleTextStyle}>Doanh thu</Text>
        <Text style={styles.totalTextStyle}>{`₫${numberWithCommas(
          sales,
        )}`}</Text>
        <Text style={styles.subtotalTextStyle}>Tổng 3 tháng</Text>
      </View>
      {/* selling status */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginTop: 20,
        }}>
        <View
          style={{
            alignItems: 'center',
            flex: 1,
          }}>
          <Text style={styles.statStyle}>{sellingProduct}</Text>
          <Text style={styles.statTitleStyle}>Sản phẩm</Text>
        </View>
        <View
          style={{
            alignItems: 'center',
            flex: 1,
          }}>
          <Text style={styles.statStyle}>{processingOrders}</Text>
          <Text style={styles.statTitleStyle}>Đơn đang xử lý</Text>
        </View>
        <View
          style={{
            alignItems: 'center',
            flex: 1,
          }}>
          <Text style={styles.statStyle}>{doneOrders}</Text>
          <Text style={styles.statTitleStyle}>Đơn hoàn thành</Text>
        </View>
      </View>
      {/* summary section */}
      <TouchableOpacity
        style={{
          backgroundColor: colors.darkGrey,
          flexDirection: 'row',
          alignItems: 'center',
          padding: 15,
          marginTop: 20,
          marginHorizontal: 10,
        }}>
        <IconFoundation name="info" size={30} color={colors.primary} />
        <View style={{marginLeft: 15}}>
          <Text
            style={{
              fontSize: fontSizes.h5,
              color: colors.black,
              fontFamily: fonts.MontserratBold,
            }}>
            Ví PAH
          </Text>
          <Text
            style={{
              fontSize: fontSizes.h5,
              color: colors.black,
              fontFamily: fonts.MontserratMedium,
            }}>
            Số dư khả dụng: {numberWithCommas(wallet.availableBalance)} VNĐ
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity 
      onPress={()=>{navigate('Profile',{user_id: user.id})}}
      style={styles.infoButtonStyle}>
        <View>
          <Text
            style={{
              fontSize: fontSizes.h3,
              color: colors.black,
              fontFamily: fonts.MontserratMedium,
            }}>
            Hồ sơ người bán
          </Text>
        </View>
        <IconFeather
          position="absolute"
          right={5}
          name="chevron-right"
          size={40}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          navigate('SellerProductListing', {seller_id: user.id});
        }}
        style={styles.infoButtonStyle}>
        <View>
          <Text
            style={{
              fontSize: fontSizes.h3,
              color: colors.black,
              fontFamily: fonts.MontserratMedium,
            }}>
            Sản phẩm đang bán ({sellingProduct})
          </Text>
        </View>
        <IconFeather
          position="absolute"
          right={5}
          name="chevron-right"
          size={40}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          navigate('SellerAuctionHistoryListing', {seller_id: user.id});
        }}
        style={styles.infoButtonStyle}>
        <View>
          <Text
            style={{
              fontSize: fontSizes.h3,
              color: colors.black,
              fontFamily: fonts.MontserratMedium,
            }}>
            Các cuộc đấu giá ({totalAuctions})
          </Text>
        </View>
        <IconFeather
          position="absolute"
          right={5}
          name="chevron-right"
          size={40}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          navigate('SellerOrderList');
        }}
        style={styles.infoButtonStyle}>
        <View>
          <Text
            style={{
              fontSize: fontSizes.h3,
              color: colors.black,
              fontFamily: fonts.MontserratMedium,
            }}>
            Đơn hàng ({totalOrders})
          </Text>
        </View>
        <IconFeather
          position="absolute"
          right={5}
          name="chevron-right"
          size={40}
        />
      </TouchableOpacity>
      {/* list item button */}
      <TouchableOpacity
        onPress={() => {
          navigate('ProductListing', {sellerId: user.id});
        }}
        style={styles.listItemButtonStyle}>
        <Text
          style={{
            fontSize: fontSizes.h4,
            color: 'white',
            fontFamily: fonts.MontserratBold,
          }}>
          Đăng bán sản phẩm
        </Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  iconButton: {
    backgroundColor: colors.grey,
    padding: 12,
    borderRadius: 5,
  },
  titleContainer: {
    height: 70,
    flexDirection: 'row',
    paddingLeft: 15,
    paddingRight: 10,
    justifyContent: 'space-between',
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
  separator: {
    height: 1.5,
    backgroundColor: colors.darkGreyText,
    marginRight: 10,
  },
  listItemButtonStyle: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    padding: 15,
    marginTop: 5,
    marginHorizontal: 10,
  },
  totalMoneyStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  totalTextStyle: {
    fontSize: fontSizes.h1 * 1.5,
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    marginBottom: 5,
  },
  totalTitleTextStyle: {
    fontSize: fontSizes.h1 * 1.2,
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    marginBottom: 5,
  },
  subtotalTextStyle: {
    fontSize: fontSizes.h6,
    color: colors.darkGreyText,
    fontFamily: fonts.MontserratMedium,
  },
  statStyle: {
    fontSize: fontSizes.h1 * 1.5,
    color: colors.primary,
    fontFamily: fonts.MontserratMedium,
  },
  statTitleStyle: {
    fontSize: fontSizes.h6,
    color: colors.darkGreyText,
    fontFamily: fonts.MontserratMedium,
  },
  infoButtonStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginTop: 5,
    marginHorizontal:10,
    backgroundColor: colors.grey
  },
});
export default SellerHomeView;
