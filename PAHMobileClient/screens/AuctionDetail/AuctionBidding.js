import React, { useContext, useState, useEffect } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { AxiosContext } from '../../context/AxiosContext';
import { SignalRContext } from '../../context/SignalRContext';
import { colors, fontSizes, fonts, images } from '../../constants';
import IconFeather from 'react-native-vector-icons/Feather';
import IconAntDesign from 'react-native-vector-icons/AntDesign';
import { SliderBox } from 'react-native-image-slider-box';
import { ListingDetailInfoText } from '../../components';
import CountDown from 'react-native-countdown-fixed';
import { numberWithCommas } from '../../utilities/PriceFormat';
import { differenceInSeconds } from 'date-fns';
import {
  Auction as AuctionRepository,
  Bid as BidRepository,
} from '../../repositories';
import Toast from 'react-native-toast-message';
import moment from 'moment';

function AuctionBidding(props) {
  // Get auction_id from routes
  const { auction_id } = props.route.params;

  // Auth Context
  const authContext = useContext(AuthContext);
  const axiosContext = useContext(AxiosContext);
  const signalRContext = useContext(SignalRContext);

  // Navigation
  const { navigation, route } = props;

  // Function of navigate to/back
  const { navigate, goBack } = navigation;

  // Data
  const [auction, setAuction] = useState({});
  const [bidHistory, setBidHistory] = useState([]);
  const [bidAmount, setBidAmount] = useState(0);
  const minBidAmount = () => auction.currentPrice + auction.step;
  const isAllEmpty = () => !(Array.isArray(bidHistory) && bidHistory.length);

  // Countdown id
  const [seed, setSeed] = useState(1);
  const reset = () => {
    setSeed(Math.random());
  }

  // validating
  const validationBidAmount = () =>
    parseInt(bidAmount) >= auction.currentPrice + auction.step;

  const validateTime = () => moment(auction.endedAt).isAfter(moment());

  const validateAll = () => validationBidAmount() && validateTime();

  const duration = () => differenceInSeconds(
    new Date(auction.endedAt),
    new Date(),
  );

  // Data for loading and refreshing
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  //increment/decrement bid amount
  const bidIncrement = () => {
    setBidAmount(bidAmount + auction.step);
  };
  const bidDecrement = () => {
    setBidAmount(bidAmount - auction.step);
  };

  ////FUNCTION
  function getAuctionDetail() {
    const promiseAuctionDetail = AuctionRepository.getAuctionDetail(
      axiosContext,
      auction_id,
    ).then(response => {
      setAuction(response);
      reset();
    });

    const promiseBidHistory = BidRepository.getBidsByAuctionId(
      axiosContext,
      auction_id,
      1
    ).then(response => {
      setBidHistory(response);
    });

    Promise.all([promiseAuctionDetail, promiseBidHistory])
      .then(values => {
        setIsLoading(false);
      })
      .catch(error => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    setIsLoading(true);
    getAuctionDetail();

    // On receive new bid
    signalRContext?.connection?.on("ReceiveNewBid", function (userName, auctionTitle) {
      getAuctionDetail();
    });

    // On auction End
    signalRContext?.connection?.on("ReceiveAuctionEnd", function (auctionTitle) {
      goBack();
    });
  }, []);

  useEffect(() => {
    setBidAmount(auction.currentPrice + auction.step);
  }, [auction]);

  // Place bid function
  function placeBid() {
    BidRepository.placeBid(axiosContext, {
      auctionId: auction_id,
      bidAmount: bidAmount
    })
      .then(response => {
        signalRContext?.connection?.invoke("PlaceBidSuccess", auction_id).catch(function (err) {
          return console.error(err.toString());
        });
      })
      .catch(error => {
        console.log(error);
        if (error.response) {
          Toast.show({
            type: 'error',
            text1: `${error.response.data.Message}`,
            position: 'bottom',
            autoHide: true,
            visibilityTime: 2000
          });
        }
      })
  }

  // Scroll view refresh
  const onRefresh = () => {
    setRefreshing(true);
    getAuctionDetail();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Fixed screen title: Cart */}
      <View style={styles.titleContainer}>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={styles.backButton}
            onPress={() => {
              goBack()
            }}>
            <IconFeather name="chevron-left" size={25} color={'black'} />
          </TouchableOpacity>
          <Text style={styles.titleText}>Đấu giá trực tiếp</Text>
        </View>
        <View style={styles.titleButtonContainer}>
          <TouchableOpacity style={styles.iconButton}
            onPress={() => {
              navigate('Wallet')
            }}>
            <IconAntDesign name='wallet' size={18} color={'black'} />
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
        <View style={{ flex: 1 }}>
          {auction.title ? (
            <ScrollView
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }>
              {/* Information section */}
              <View>
                <SliderBox
                  images={auction.imageUrls}
                  sliderBoxHeight={400}
                  dotColor={colors.primary}
                  inactiveDotColor="#90A4AE"
                />
                <Text style={styles.auctionTitleText}>{auction.title}</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    paddingLeft: 15,
                    paddingRight: 20
                  }}>
                  <View>
                    <Text style={{
                      fontFamily: fonts.MontserratMedium,
                      color: 'black',
                      fontSize: fontSizes.h3,
                      marginBottom: 10
                    }}>Kết thúc trong</Text>
                    <CountDown
                      key={seed}
                      size={15}
                      until={duration()}
                      // onFinish={() => {
                      //   alert('Cuộc đấu giá đã kết thúc');
                      //   goBack();
                      // }}
                      digitStyle={{ borderWidth: 2, borderColor: colors.primary }}
                      timeLabels={{ m: null, s: null }}
                      separatorStyle={{ color: colors.primary }}
                      showSeparator
                    />
                  </View>
                  <View>
                    <Text style={{
                      fontFamily: fonts.MontserratMedium,
                      color: 'black',
                      fontSize: fontSizes.h3,
                      marginBottom: 10
                    }}>Giá cao nhất</Text>
                    <Text style={styles.auctionHighestBidText}>
                      ₫{numberWithCommas(auction.currentPrice)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Bidding History */}
              <View style={{ paddingHorizontal: 15, marginTop: 15 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Text style={styles.auctionHistoryTitle}>
                    Lịch sử đấu giá
                  </Text>
                </View>
                {isAllEmpty() ? (
                  <View style={styles.auctionBidderDetail}>
                    <Text style={styles.biddingHistoryNote}>
                      Chưa có người đặt giá
                    </Text>
                  </View>
                ) : (
                  <View>
                    {bidHistory.map((bid, index) => (
                      <View style={[styles.auctionBidderDetail, {
                        backgroundColor: index == 0 ? colors.darkGrey : colors.grey,
                      }]} key={bid.id}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}>
                          <Image
                            resizeMode="cover"
                            height={50}
                            width={50}
                            borderRadius={5}
                            source={{
                              uri: bid.bidder.profilePicture,
                            }}
                          />
                          <View>
                            <Text style={styles.auctionBidderName}>
                              {bid.bidder.name}
                            </Text>
                            <Text style={{
                              marginStart: 10,
                              color: colors.greyText,
                              fontFamily: fonts.MontserratMedium,
                              fontSize: fontSizes.h6,
                            }}>
                              {bid.bidder.email}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.auctionBidderMoney}>
                          ₫{numberWithCommas(bid.bidAmount)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
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
              <TouchableOpacity onPress={() => getAutionDetail()}>
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
          {/* Bidding section */}
          <View
            style={{
              paddingVertical: 5,
              borderWidth: 2,
              borderRadius: 5,
              marginHorizontal: 15,
              marginTop: 10,
              borderColor: colors.primary,
            }}>
            <Text
              style={{
                fontFamily: fonts.MontserratBold,
                fontSize: fontSizes.h4,
                color: colors.greyText,
                alignSelf: 'center',
              }}>
              Số tiền đặt của bạn
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 0,
                justifyContent: 'space-evenly',
              }}>
              <TouchableOpacity onPress={bidDecrement}
                disabled={!validationBidAmount()}>
                <IconAntDesign
                  name="minussquare"
                  size={30}
                  color={colors.primary}
                />
              </TouchableOpacity>
              <Text
                style={{
                  fontFamily: fonts.MontserratMedium,
                  fontSize: fontSizes.h2,
                  color: 'black',
                }}>
                ₫{numberWithCommas(bidAmount)}
              </Text>
              <TouchableOpacity onPress={bidIncrement}>
                <IconAntDesign
                  name="plussquare"
                  size={30}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
            {!validateAll() && (
              <Text
                style={{
                  fontFamily: fonts.MontserratMedium,
                  fontSize: fontSizes.h6,
                  color: 'red',
                  alignSelf: 'center',
                }}>
                Số tiền đặt tối thiểu là ₫{numberWithCommas(minBidAmount())}
              </Text>
            )}
          </View>

          {/* Bid buttons */}
          <View
            style={{
              paddingHorizontal: 15,
              marginBottom: 20,
              marginTop: 20,
              justifyContent: 'flex-end',
            }}>
            <TouchableOpacity
              disabled={!validateAll()}
              style={{
                borderRadius: 5,
                backgroundColor: validateAll()
                  ? colors.primary
                  : colors.darkGrey,
                paddingVertical: 10,
              }}
              onPress={() => placeBid()}>
              <Text
                style={{
                  fontSize: fontSizes.h3,
                  fontFamily: fonts.MontserratBold,
                  color: validateAll() ? 'white' : colors.greyText,
                  textAlign: 'center',
                }}>
                Đấu giá
              </Text>
            </TouchableOpacity>
          </View>
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
  backButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: colors.grey
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
    alignItems: 'center',
    justifyContent: 'space-between'
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
    gap: 8,
  },
  separator: {
    height: 1.5,
    backgroundColor: colors.darkGreyText,
    marginRight: 10,
  },
  descriptionText: {
    color: 'black',
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h3,
    alignSelf: 'center',
  },
  itemImageZone: {
    marginTop: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageStyle: {
    resizeMode: 'contain',
    height: 140,
    width: '100%',
  },
  auctionTitleText: {
    color: colors.black,
    fontFamily: fonts.MontserratBold,
    fontSize: fontSizes.h3,
    marginVertical: 10,
    marginHorizontal: 15,
    paddingVertical: 5,
  },
  auctionDetailText: {
    color: colors.greyText,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h5,
    paddingVertical: 1,
  },
  auctionHighestBidText: {
    color: colors.primary,
    fontFamily: fonts.MontserratBold,
    fontSize: fontSizes.h3,
  },
  auctionHistoryTitle: {
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h2,
  },
  auctionHistoryButtonText: {
    color: colors.primary,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h5,
  },
  auctionBidderDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 5,
    padding: 5,
    marginTop: 7,
  },
  auctionBidderName: {
    marginStart: 10,
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h5,
  },
  auctionBidderMoney: {
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h5,
    marginEnd: 5
  },
  biddingHistoryNote: {
    marginStart: 10,
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h4,
  },
});

export default AuctionBidding;
