import React, {useContext, useState, useEffect} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import {AuthContext} from '../../context/AuthContext';
import {AxiosContext} from '../../context/AxiosContext';
import {SignalRContext} from '../../context/SignalRContext';
import {colors, fontSizes, images, fonts} from '../../constants';
import {transactionTypeText} from '../../utilities/TransactionType';
import {paymentMethodText} from '../../utilities/PaymentMethod';
import {numberWithCommas} from '../../utilities/PriceFormat';
import IconFeather from 'react-native-vector-icons/Feather';
import {Transaction as TransactionRepository} from '../../repositories';
import {useIsFocused} from '@react-navigation/native';
import moment from 'moment';

function TransactionDetail(props) {
  const {transaction_id} = props.route.params;
  //// AUTH AND NAVIGATION
  const axiosContext = useContext(AxiosContext);

  // Navigation
  const {navigation, route} = props;

  // On focus
  const isFocused = useIsFocused();

  // Function of navigate to/back
  const {navigate, goBack} = navigation;

  // Loading and refreshing state
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data for auctions and filters
  const [transaction, setTransaction] = useState({});

  //// FUNCTION AND USE EFFECT
  // Initialize data for categories, materials and auctions on screen start
  function getTransaction() {
    setIsLoading(true);
    TransactionRepository.getTransactionById(axiosContext, transaction_id)
      .then(response => {
        setTransaction(response);
        setIsLoading(false);
      })
      .catch(error => {
        setIsLoading(false);
      });
  }
  useEffect(() => {
    getTransaction();
  }, [isFocused]);

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
        <Text style={styles.titleText} numberOfLines={1} ellipsizeMode="tail">
          Thông tin giao dịch
        </Text>
      </View>
      {/* Loading section */}
      {isLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
          }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View
          style={{
            borderRadius: 5,
            marginHorizontal: 15,
            paddingHorizontal: 15,
            paddingVertical: 10,
            backgroundColor: 'white',
            elevation: 5,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Image
              source={
                transaction.type == 1
                  ? images.depositImage
                  : transaction.type == 2
                  ? images.withdrawImage
                  : transaction.type == 3
                  ? images.paymentImage
                  : images.refundImage
              }
              style={{
                resizeMode: 'contain',
                height: 50,
                flex: 15,
                marginEnd: 10,
              }}
            />
            <View
              style={{
                flex: 85,
              }}>
              <Text
                numberOfLines={2}
                ellipsizeMode="tail"
                style={{
                  color: colors.greyText,
                  fontFamily: fonts.MontserratMedium,
                  fontSize: fontSizes.h4,
                  marginBottom: 5,
                }}>
                {transaction.description}
              </Text>
              <Text
                style={{
                  color: colors.black,
                  fontFamily: fonts.MontserratMedium,
                  fontSize: fontSizes.h2,
                  marginBottom: 5,
                  alignContent:'center'
                }}>
                {transaction.type == 1 || transaction.type == 4 ? (
                  <IconFeather name="plus" size={20} />
                ) : (
                  <IconFeather name="minus" size={20} />
                )}
                <Text>{numberWithCommas(transaction.amount)} ₫</Text>
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text style={styles.leftText}>Trạng thái</Text>
            <Text
              style={{
                backgroundColor: 'lightgreen',
                color: 'green',
                fontFamily: fonts.MontserratMedium,
                fontSize: fontSizes.h6,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 20,
              }}>
              Hoàn thành
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text style={styles.leftText}>Ngày tạo</Text>
            <Text style={styles.rightText}>
              {moment(transaction.date).format('DD-MM-YYYY HH:mm a')}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text style={styles.leftText}>Loại giao dịch</Text>
            <Text style={styles.rightText}>
              {transactionTypeText(transaction.type)}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text style={styles.leftText}>Phương thức thanh toán</Text>
            <Text style={styles.rightText}>
              {paymentMethodText(transaction.paymentMethod)}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text style={styles.leftText}>Mã giao dịch</Text>
            <Text style={styles.rightText}>#{transaction.id}</Text>
          </View>
        </View>
      )}
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
    backgroundColor: colors.grey
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
    flex: 1,
    marginLeft: 5,
  },
  leftText: {
    marginTop: 10,
    color: colors.greyText,
    fontFamily: fonts.MontserratRegular,
    fontSize: fontSizes.h5,
  },
  rightText: {
    marginTop: 10,
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h5,
  },
});
export default TransactionDetail;
