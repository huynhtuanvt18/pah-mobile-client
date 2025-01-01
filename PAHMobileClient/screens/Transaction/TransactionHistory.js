import React, { useContext, useState, useEffect } from 'react';
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
import { AuthContext } from '../../context/AuthContext';
import { AxiosContext } from '../../context/AxiosContext';
import { SignalRContext } from '../../context/SignalRContext';
import { colors, fontSizes, images, fonts, pageParameters } from '../../constants';
import { transactionTypeText } from '../../utilities/TransactionType';
import IconFeather from 'react-native-vector-icons/Feather';
import { Transaction as TransactionRepository } from '../../repositories';
import { useIsFocused } from '@react-navigation/native';
import { TransactionListingCard } from '../../components';

function TransactionHistory(props) {
  //// AUTH AND NAVIGATION
  // Auth Context
  const authContext = useContext(AuthContext);
  const axiosContext = useContext(AxiosContext);
  const signalRContext = useContext(SignalRContext);

  // Navigation
  const { navigation, route } = props;

  // On focus
  const isFocused = useIsFocused();

  // Function of navigate to/back
  const { navigate, goBack } = navigation;

  // Loading and refreshing state
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasNext, setHasNext] = useState(true);

  // Data for auctions and filters
  const [transactions, setTransactions] = useState([]);
  // Auction status filter
  const [transactionType, setTransactionType] = useState([0, 1, 2, 3, 4]);
  const [currentTransactionType, setCurrentTransactionType] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  //// FUNCTION AND USE EFFECT

  // Initialize data for categories, materials and auctions on screen start
  function getAllTransactions() {
    setIsLoading(true);
    setCurrentPage(1);
    setHasNext(true);
    TransactionRepository.getTransactionsByCurrentUser(
      axiosContext,
      currentTransactionType,
      1
    )
      .then(response => {
        setTransactions(response);
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
    getAllTransactions();
  }, [currentTransactionType, isFocused]);
  // Scroll view refresh
  const onRefresh = () => {
    setRefreshing(true);
    getAllTransactions();
    setRefreshing(false);
  };

  // Pagination
  const loadMoreItems = () => {
    if (hasNext) {
      TransactionRepository.getTransactionsByCurrentUser(
        axiosContext,
        currentTransactionType,
        currentPage + 1
      )
        .then(response => {
          setTransactions(transactions => [...transactions, ...response]);
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
          Lịch sử giao dịch
        </Text>
      </View>

      {/* Filter section */}
      <View>
        <FlatList
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          data={transactionType}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 15,
                  borderBottomWidth: item == currentTransactionType ? 2 : null,
                  borderBottomColor:
                    item == currentTransactionType ? colors.primary : null,
                }}
                onPress={() => {
                  setCurrentTransactionType(item);
                }}>
                <Text
                  style={{
                    color:
                      item == currentTransactionType ? colors.primary : 'black',
                    fontFamily: fonts.MontserratMedium,
                    fontSize: fontSizes.h5,
                  }}>
                  {transactionTypeText(item)}
                </Text>
              </TouchableOpacity>
            );
          }}
          keyExtractor={status => status}
        />
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
        <View>
          {Array.isArray(transactions) && transactions.length ? (
            <View style={{ marginTop: 20 }}>
              <View
                style={{
                  marginBottom: 15,
                }}>
                <FlatList
                  style={{
                    marginBottom: 50
                  }}
                  refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                  }
                  keyExtractor={item => item.id}
                  data={transactions}
                  renderItem={({ item, index }) => <TransactionListingCard
                    key={item.id}
                    transaction={item}
                    index={index}
                    onPress={() => {
                      navigate('TransactionDetail', { transaction_id: item.id });
                    }}
                  />}
                  onEndReached={loadMoreItems}
                  onEndReachedThreshold={0}
                  ListFooterComponent={renderLoader}
                />
              </View>
            </View>
          ) : (
            <View
              style={{
                alignItems: 'center',
                paddingTop: 150,
              }}>
              <Image
                source={images.searchImage}
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
                Bạn không có giao dịch nào
              </Text>
            </View>
          )}
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
  titleButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  separator: {
    height: 1.2,
    backgroundColor: colors.darkGrey,
  },
  filterTitle: {
    fontSize: fontSizes.h4,
    fontFamily: fonts.MontserratMedium,
    color: 'black',
    marginLeft: 15,
    marginBottom: 15,
  },
  filterPillsContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    paddingLeft: 5,
  },
  filterPill: {
    backgroundColor: colors.grey,
    paddingHorizontal: 15,
    height: 35,
    marginHorizontal: 4,
    marginBottom: 8,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: 'center',
  },
  filterPillText: {
    fontSize: fontSizes.h5,
    color: 'black',
  },
  priceContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceInput: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    width: 120,
    paddingBottom: 0,
    fontSize: fontSizes.h4,
    fontFamily: fonts.MontserratMedium,
    color: 'black',
  },
  priceLabel: {
    fontSize: fontSizes.h6,
    fontFamily: fonts.MontserratMedium,
    color: 'black',
    marginTop: 5,
  },
  primaryButton: {
    borderWidth: 1.2,
    borderColor: colors.primary,
    borderRadius: 5,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    marginHorizontal: 15,
    marginVertical: 10,
  },
  primaryButtonText: {
    fontSize: fontSizes.h4,
    fontFamily: fonts.MontserratBold,
    color: 'white',
    textAlign: 'center',
  },
  sortModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  sortModalTitle: {
    color: 'black',
    fontSize: fontSizes.h3,
    fontFamily: fonts.MontserratBold,
    marginLeft: 20,
    marginVertical: 20,
  },
  sortModalOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  radioButtonOuter: {
    height: 20,
    width: 20,
    borderWidth: 2,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    height: 10,
    width: 10,
    borderRadius: 30,
  },
  radioText: {
    color: 'black',
    fontSize: fontSizes.h3,
    fontFamily: fonts.MontserratMedium,
  },
  filterNumber: {
    position: 'absolute',
    top: 0,
    right: 1,
    borderRadius: 20,
    fontFamily: fonts.MontserratMedium,
    color: 'white',
    fontSize: fontSizes.h6 / 1.5,
    backgroundColor: 'red',
    paddingHorizontal: 3,
  },
});
export default TransactionHistory;
