import React, { useContext, useState, useEffect } from 'react';
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { AxiosContext } from '../../context/AxiosContext';
import { SignalRContext } from '../../context/SignalRContext';
import { colors, enumConstants, fontSizes, fonts, images } from '../../constants';
import IconFeather from 'react-native-vector-icons/Feather';
import { SliderBox } from "react-native-image-slider-box";
import Modal from 'react-native-modal';
import {
    ListingDetailInfoText
} from '../../components';
import {
    Auction as AuctionRepository,
    Shipping as ShippingRepository,
    Address as AddressRepository,
    Bid as BidRepository,
    Wallet as WalletRepository
} from '../../repositories';
import { conditionText } from '../../utilities/Condition';
import moment from 'moment';
import { numberWithCommas } from '../../utilities/PriceFormat';
import CountDown from 'react-native-countdown-fixed';
import { differenceInSeconds } from 'date-fns';
import Toast from 'react-native-toast-message';
import { useIsFocused } from '@react-navigation/native';
import { subscribe } from '../../utilities/PushNotificationHelper';

function AuctionDetail(props) {
    //// AUTH AND NAVIGATION
    // Get auction_id from routes
    const { auction_id } = props.route.params;

    // Auth Context
    const authContext = useContext(AuthContext);
    const axiosContext = useContext(AxiosContext);
    const signalRContext = useContext(SignalRContext);

    // On focus
    const isFocused = useIsFocused();
    // Navigation
    const { navigation, route } = props;

    // Function of navigate to/back
    const { navigate, goBack } = navigation;

    //// DATA
    // Data for auction detail
    const [auction, setAuction] = useState({
        seller: {},
        imageUrls: [],
        product: {},
        winner: {
            profilePicture: images.defaultAvatar
        },
        productId: 0
    });

    // Calculate data for shipping price
    const [userAddress, setUserAddress] = useState({});
    const [shippingPrice, setShippingPrice] = useState(0);

    // Modal data
    const [shippingModalVisible, setShippingModalVisible] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);

    // Data for loading and refreshing
    const [isLoading, setIsLoading] = useState(true);
    const [isRegisterLoading, setIsRegisterLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [userRegistered, setUserRegistered] = useState(false);
    const [userWon, setUserWon] = useState(false);

    // Data for validating register duration and bidding duration
    const isRegisterDuration = () => moment(auction.registrationStart).isBefore(moment()) &&
        moment(auction.registrationEnd).isAfter(moment());

    const isBiddingDuration = () => moment(auction.startedAt).isBefore(moment()) &&
        moment(auction.endedAt).isAfter(moment());

    // Countdown data
    const durationRegistration = differenceInSeconds(
        new Date(auction.registrationEnd),
        new Date(),
    );

    const durationTillStart = differenceInSeconds(
        new Date(auction.startedAt),
        new Date(),
    );

    const durationTillEnd = differenceInSeconds(
        new Date(auction.endedAt),
        new Date(),
    );

    //// FUNCTION
    // Get auction detail from current auction id
    function getAutionDetail() {
        setIsLoading(true);
        AuctionRepository.getAuctionDetail(axiosContext, auction_id)
            .then(response => {
                setAuction(response);
            })
            .catch(error => {
                setIsLoading(false);
            });
    }

    useEffect(() => {
        const calcShip = async () => {
            const promiseAddress = await AddressRepository.getAdrressCurrentUser(axiosContext)
                .then(response => {
                    setUserAddress(response);
                    // Shipping cost calculate
                    getShippingCost(response, auction);
                })
                .catch(error => {
                    setIsLoading(false);
                });
            const promiseCheckRegistration = await AuctionRepository.checkRegistration(axiosContext, auction_id)
                .then(response => {
                    setUserRegistered(response);
                });

            const promiseCheckWinner = await AuctionRepository.checkWinner(axiosContext, auction_id)
                .then(response => {
                    setUserWon(response);
                })
                .catch(err => {
                    console.log(err);
                });

            Promise.all([promiseAddress, promiseCheckRegistration, promiseCheckWinner])
                .then((values) => {
                    setIsLoading(false);
                })
                .catch(error => {
                    setIsLoading(false);
                });
        }

        if (authContext?.authState?.authenticated) {
            calcShip();
        } else {
            setIsLoading(false);
        }

    }, [auction])

    async function getShippingCost(responseAddress, responseAuction) {
        if (responseAuction.product.weight) {
            await ShippingRepository.calculateShippingCost({
                service_type_id: 2,
                from_district_id: responseAuction.seller.districtId,
                from_ward_code: responseAuction.seller.wardCode,
                to_district_id: responseAddress.districtId,
                to_ward_code: responseAddress.wardCode,
                weight: responseAuction.product.weight
            })
                .then(responseShip => {
                    setShippingPrice(responseShip.total);
                    setIsLoading(false);
                })
                .catch(error => {
                    console.log(error.response.data)
                    setIsLoading(false);
                })
        }
    }

    useEffect(() => {
        getAutionDetail();
    }, [isFocused]);

    useEffect(() => {
        // On auction start
        signalRContext?.connection?.on("ReceiveAuctionOpen", function (auctionTitle) {
            getAutionDetail();
        });
        // On auction End
        signalRContext?.connection?.on("ReceiveAuctionEnd", function (auctionTitle) {
            getAutionDetail();
        });
    }, []);

    // Register to join auction
    async function registerAuction() {
        setIsRegisterLoading(true);
        WalletRepository.getWalletCurrentUser(axiosContext)
            .then(responseWallet => {
                if (responseWallet.availableBalance > auction.entryFee + auction.startingPrice) {
                    BidRepository.registerAuction(axiosContext, auction_id)
                        .then(response => {
                            setUserRegistered(true);
                            setConfirmModalVisible(false);
                            setIsRegisterLoading(false);
                            Toast.show({
                                type: 'success',
                                text1: 'Bạn đã đăng ký tham gia đấu giá thành công!',
                                position: 'bottom',
                                autoHide: true,
                                visibilityTime: 2000
                            });
                            signalRContext.connection?.invoke("JoinGroup", `AUCTION_${auction_id}`).catch(function (err) {
                                return console.error(err.toString());
                            });
                            subscribe(`AUCTION_${auction_id}`);
                        })
                        .catch(err => {
                            setIsRegisterLoading(false);
                            setConfirmModalVisible(false);
                            if (err.response) {
                                Toast.show({
                                    type: 'error',
                                    text1: `${err.response.data.Message}`,
                                    position: 'bottom',
                                    autoHide: true,
                                    visibilityTime: 2000
                                });
                            }
                        })
                } else {
                    setIsRegisterLoading(false);
                    setConfirmModalVisible(false);
                    Toast.show({
                        type: 'error',
                        text1: 'Số dư trong tài khoản không đủ',
                        position: 'bottom',
                        autoHide: true,
                        visibilityTime: 2000
                    });
                }
            })
            .catch(err => {
                console.log(err)
                setIsRegisterLoading(false);
            })

    }

    // Scroll view refresh
    const onRefresh = () => {
        setRefreshing(true);
        getAutionDetail();
        setRefreshing(false);
    };

    return <View style={styles.container}>
        {/* Fixed screen title: Auction detail */}
        <View style={styles.titleContainer}>
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity style={styles.backButton}
                    onPress={() => {
                        goBack()
                    }}>
                    <IconFeather name="chevron-left" size={25} color={'black'} />
                </TouchableOpacity>
                <Text style={styles.titleText}>Đấu giá</Text>
            </View>
            <View style={styles.titleButtonContainer}>
                <TouchableOpacity style={styles.iconButton}
                    onPress={() => {
                        navigate('Search')
                    }}>
                    <IconFeather name='search' size={18} color={'black'} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}
                    onPress={() => {
                        navigate('Cart')
                    }}>
                    <IconFeather name='shopping-cart' size={18} color={'black'} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}
                    onPress={() => {
                        // Handling more
                    }}>
                    <IconFeather name='more-vertical' size={18} color={'black'} />
                </TouchableOpacity>
            </View>
        </View>

        {isLoading ? <View style={{
            flex: 1,
            justifyContent: 'center'
        }}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View> : <View>
            {auction.title ? <ScrollView refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
                {/* Images slider */}
                <SliderBox images={auction.imageUrls}
                    sliderBoxHeight={400}
                    dotColor={colors.primary}
                    inactiveDotColor='#90A4AE' />

                {/* Auction name */}
                <Text style={styles.productName}>{auction.title}</Text>

                {/* Pricing section */}
                <View style={styles.priceContainer}>
                    {auction.status == enumConstants.auction.RegistrationOpen && <Text style={styles.pricePrimary}>
                        Giá khởi điểm: ₫{numberWithCommas(auction.startingPrice)}
                    </Text>}
                    {(auction.status == enumConstants.auction.Opened && moment(auction.endedAt).isAfter(moment())) && <Text style={styles.pricePrimary}>
                        Giá hiện tại: ₫{numberWithCommas(auction.currentPrice)}
                    </Text>}
                    {(auction.status == enumConstants.auction.Opened && moment(auction.endedAt).isBefore(moment())) && <Text style={styles.pricePrimary}>
                        Giá cuối cùng: ₫{numberWithCommas(auction.currentPrice)}
                    </Text>}
                    {auction.status == enumConstants.auction.Ended && <Text style={styles.pricePrimary}>
                        Giá cuối cùng: ₫{numberWithCommas(auction.currentPrice)}
                    </Text>}
                    {!authContext?.authState?.authenticated ? <Text
                        style={styles.priceSecondary}
                    >Đăng nhập để xem cước phí vận chuyển</Text> : <View>
                        {shippingPrice != 0 && userAddress != '' ? <View>
                            <Text style={styles.priceSecondary}
                            >₫{numberWithCommas(shippingPrice)} cước vận chuyển</Text>
                        </View> : <Text style={styles.priceSecondary}
                        >Thêm địa chỉ mặc định để xem phí vận chuyển</Text>}
                    </View>}
                </View>

                {/* Countdown and button section */}
                <View>
                    {/* During registration, valid time */}
                    {(auction.status == enumConstants.auction.RegistrationOpen && isRegisterDuration()) && <View style={{
                        paddingHorizontal: 15,
                        gap: 10,
                        marginBottom: 10,
                    }}>
                        <View style={{ alignItems: 'baseline', gap: 10, marginBottom: 15 }}>
                            <Text style={{
                                fontFamily: fonts.MontserratMedium,
                                color: 'black',
                                fontSize: fontSizes.h3,
                                marginTop: 15
                            }}>Thời gian đăng ký còn</Text>
                            <CountDown
                                size={18}
                                until={durationRegistration}
                                onFinish={() => getAutionDetail()}
                                digitStyle={{ borderWidth: 2, borderColor: colors.primary }}
                                timeLabels={{ m: null, s: null }}
                                separatorStyle={{ color: colors.primary }}
                                showSeparator
                            />
                        </View>

                        {userRegistered ? <View style={styles.secondaryButton}>
                            <Text style={styles.secondaryButtonText}>Bạn đã tham gia cuộc đấu giá này</Text>
                        </View> : <TouchableOpacity style={styles.primaryButton}
                            disabled={!isRegisterDuration()}
                            onPress={() => {
                                if (authContext?.authState?.authenticated) {
                                    setConfirmModalVisible(!confirmModalVisible);
                                }
                                else {
                                    navigate('Login')
                                }
                            }}>
                            <Text style={styles.primaryButtonText}>Đăng ký đấu giá</Text>
                        </TouchableOpacity>}
                    </View>}

                    {/* During registration, invalid time */}
                    {(auction.status == enumConstants.auction.RegistrationOpen && !isRegisterDuration()) && <View style={{
                        paddingHorizontal: 15,
                        gap: 10,
                        marginBottom: 10,
                    }}>
                        <View style={{ alignItems: 'baseline', gap: 10 }}>
                            <Text style={{
                                fontFamily: fonts.MontserratMedium,
                                color: 'black',
                                fontSize: fontSizes.h3,
                                marginTop: 15
                            }}>Bắt đầu trong</Text>
                            <CountDown
                                size={18}
                                until={durationTillStart}
                                digitStyle={{ borderWidth: 2, borderColor: colors.primary }}
                                timeLabels={{ m: null, s: null }}
                                separatorStyle={{ color: colors.primary }}
                                showSeparator
                            />
                        </View>
                    </View>}

                    {/* During bidding, valid time */}
                    {(auction.status == enumConstants.auction.Opened) && <View style={{
                        paddingHorizontal: 15,
                        gap: 10,
                        marginBottom: 10,
                    }}>
                        <View style={{ alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
                            <Text style={{
                                fontFamily: fonts.MontserratMedium,
                                color: 'black',
                                fontSize: fontSizes.h3,
                                marginTop: 15
                            }}>Kết thúc trong</Text>
                            <CountDown
                                size={18}
                                until={durationTillEnd}
                                digitStyle={{ borderWidth: 2, borderColor: colors.primary }}
                                timeLabels={{ m: null, s: null }}
                                separatorStyle={{ color: colors.primary }}
                                showSeparator
                            />
                        </View>
                        <TouchableOpacity style={styles.primaryButton}
                            disabled={!isBiddingDuration()}
                            onPress={() => {
                                navigate('AuctionBidding', {
                                    auction_id: auction.id,
                                    currentPrice: auction.currentPrice,
                                    step: auction.step,
                                })
                            }}>
                            <Text style={styles.primaryButtonText}>Vào phòng đấu giá</Text>
                        </TouchableOpacity>
                    </View>}

                    {/* Auction is ended */}
                    {auction.status == enumConstants.auction.Ended && <View style={{
                        paddingHorizontal: 15,
                        gap: 10,
                        marginBottom: 10,
                    }}>
                        {userWon ? <>
                            <View style={{ alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
                                <Text style={{
                                    fontFamily: fonts.MontserratMedium,
                                    color: 'black',
                                    fontSize: fontSizes.h3,
                                    marginTop: 15
                                }}>Bạn là người thắng cuộc đấu giá này</Text>
                            </View>
                            <TouchableOpacity style={styles.primaryButton}
                                onPress={() => {
                                    navigate('CheckoutNow', {
                                        product_id: auction.productId,
                                        isAuction: true,
                                        currentPrice: auction.currentPrice,
                                        auction_id: auction_id
                                    })
                                }}>
                                <Text style={styles.primaryButtonText}>Chọn địa chỉ nhận hàng</Text>
                            </TouchableOpacity>
                        </> : <>
                            <View style={{}}>
                                <Text style={{
                                    fontFamily: fonts.MontserratMedium,
                                    color: 'black',
                                    fontSize: fontSizes.h3,
                                    marginTop: 15
                                }}>Người thắng cuộc</Text>
                            </View>
                            <View style={{
                                flexDirection: 'row',
                                gap: 10,
                                backgroundColor: colors.grey,
                                padding: 10,
                                borderRadius: 5
                            }}>
                                <Image source={{ uri: auction.winner.profilePicture }}
                                    style={{
                                        resizeMode: 'cover',
                                        width: 80,
                                        height: 80,
                                        borderRadius: 50
                                    }} />
                                <View>
                                    <Text style={{
                                        fontFamily: fonts.MontserratMedium,
                                        color: 'black',
                                        fontSize: fontSizes.h4,
                                    }}>{auction.winner.name}</Text>
                                    <Text style={{
                                        fontFamily: fonts.MontserratMedium,
                                        color: colors.darkGreyText,
                                        fontSize: fontSizes.h4,
                                    }}>{auction.winner.email}</Text>
                                </View>
                            </View>
                        </>}
                        <TouchableOpacity onPress={() => navigate('BiddingHistory', { auction_id: auction_id })}>
                            <Text style={{
                                fontFamily: fonts.MontserratMedium,
                                color: colors.primary,
                                fontSize: fontSizes.h5
                            }}>Xem lịch sử đấu giá</Text>
                        </TouchableOpacity>
                    </View>}
                </View>

                {/* Bidding section */}
                <View style={{
                    paddingHorizontal: 15,
                    gap: 10,
                    marginVertical: 20
                }}>
                    <Text style={styles.sectionTitle}>Thông tin đấu giá</Text>
                    <View style={{
                        marginTop: 5,
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        <View style={{ gap: 10, flex: 1 }}>
                            <ListingDetailInfoText label='Bắt đầu đấu giá' text={moment(auction.startedAt).format('DD/MM/YYYY HH:mm')} />
                            <ListingDetailInfoText label='Kết thúc đấu giá' text={moment(auction.endedAt).format('DD/MM/YYYY, HH:mm')} />
                        </View>
                    </View>
                </View>

                {/* Item information section */}
                <View style={{
                    paddingHorizontal: 15,
                    gap: 10,
                    marginVertical: 20
                }}>
                    <Text style={styles.sectionTitle}>Thông tin sản phẩm</Text>
                    <View style={{ gap: 10, marginTop: 5 }}>
                        <ListingDetailInfoText label='Bao gồm' text={auction.product.packageContent} />
                        <ListingDetailInfoText label='Tình trạng' text={conditionText(auction.product.condition)} />
                        <ListingDetailInfoText label='Danh mục' text={auction.product.categoryName} />
                        <ListingDetailInfoText label='Chất liệu' text={auction.product.materialName} />
                        <ListingDetailInfoText label='Xuất xứ' text={auction.product.origin} />
                        <ListingDetailInfoText label='Kích thước' text={auction.product.dimension + ' cm'} />
                        <ListingDetailInfoText label='Khối lượng' text={auction.product.weight + ' g'} />
                        <ListingDetailInfoText label='Đóng gói' text={auction.product.packageMethod} />
                    </View>
                </View>

                {/* Item description section */}
                <View style={{
                    paddingHorizontal: 15,
                    gap: 10,
                    marginVertical: 20
                }}>
                    <Text style={styles.sectionTitle}>Thông tin thêm từ người bán</Text>
                    <TouchableOpacity style={{
                        marginTop: 5,
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}
                        onPress={() => navigate('AuctionDescription', { description: auction.product.description })}>
                        <View style={{
                            flex: 1,
                            gap: 10
                        }}>
                            <Text
                                numberOfLines={3}
                                ellipsizeMode='tail'
                                style={styles.descriptionText}
                            >{auction.product.description}</Text>
                            <Text style={styles.descriptionLink}
                            >Xem đầy đủ thông tin thêm</Text>
                        </View>
                        <IconFeather name='chevron-right' size={30} color='black' />
                    </TouchableOpacity>
                </View>

                {/* Shipping information section */}
                <View style={{
                    paddingHorizontal: 15,
                    gap: 10,
                    marginVertical: 20
                }}>
                    <Text style={styles.sectionTitle}>Vận chuyển và thanh toán</Text>
                    <TouchableOpacity style={{
                        marginTop: 5,
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}
                        onPress={() => setShippingModalVisible(!shippingModalVisible)}>
                        <View style={{ gap: 10, flex: 1 }}>
                            <ListingDetailInfoText label='Giao hàng'
                                text={'Từ ' + `${auction.seller.ward}, ${auction.seller.district}, ${auction.seller.province}`}
                                secondText='Thông qua Giao hàng nhanh' />
                            <ListingDetailInfoText label='Thanh toán' text='Ví PAH'
                                secondText='Người tham gia cần có đủ số dư khả dụng trong ví PAH trước khi tham gia đấu giá' />
                        </View>
                        <IconFeather name='chevron-right' size={30} color='black' />
                    </TouchableOpacity>
                </View>

                {/* Bottom seller section */}
                <View style={{
                    paddingHorizontal: 15,
                    gap: 10,
                    marginTop: 20,
                    marginBottom: 100,
                }}>
                    <Text style={styles.sectionTitle}>Về người bán</Text>
                    <View style={{ gap: 10, marginTop: 5 }}>
                        <TouchableOpacity onPress={() => navigate('Profile', { user_id: auction.seller.id })}>
                            <View style={{
                                flexDirection: 'row',
                                gap: 15
                            }}>
                                <Image source={{ uri: auction.seller.profilePicture }}
                                    style={styles.bottomSellerImage} />
                                <View style={{ gap: 2 }}>
                                    <Text style={styles.bottomSellerPrimary}>{auction.seller.name}</Text>
                                    <Text style={styles.bottomSellerSecondary}>{auction.seller.province}</Text>
                                </View>
                            </View>
                            <View style={{
                                flexDirection: 'row',
                                marginVertical: 15,
                                gap: 10
                            }}>
                                <IconFeather name='calendar' size={20} color='black' />
                                <Text style={styles.descriptionText}>Tham gia ngày {moment(auction.seller.registeredAt).format('DD/MM/YYYY')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView> : <View style={{
                alignItems: 'center',
                paddingTop: 150
            }}>
                <Image source={images.warningImage} style={{
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
                }}>Không thể tìm thấy thông tin sản phẩm này.</Text>
                <TouchableOpacity onPress={() => getAutionDetail()}>
                    <Text style={{
                        fontSize: fontSizes.h5,
                        fontFamily: fonts.MontserratMedium,
                        color: colors.primary,
                        textAlign: 'center',
                        marginHorizontal: 35,
                        marginTop: 20
                    }}>Tải lại</Text>
                </TouchableOpacity>
            </View>}
        </View>}

        {/* Shipping modal */}
        <Modal
            animationIn="slideInUp"
            animationOut="slideOutDown"
            isVisible={shippingModalVisible}
            onRequestClose={() => {
                setShippingModalVisible(!shippingModalVisible);
            }}
            style={{ margin: 0 }}>
            <View style={{
                flex: 1
            }}>
                <TouchableOpacity style={{ flex: 1 }}
                    onPress={() => {
                        setShippingModalVisible(!shippingModalVisible);
                    }}></TouchableOpacity>
                <View style={styles.modalContainer}>
                    {/* Shipping modal title */}
                    <Text style={styles.modalTitle}>Giao hàng và thanh toán</Text>

                    {/* Shipping information */}
                    <View style={{
                        gap: 10,
                        marginHorizontal: 20,
                        marginBottom: 30
                    }}>
                        <ListingDetailInfoText label='Giao từ' text={`${auction.seller.ward}, ${auction.seller.district}, ${auction.seller.province}`} />
                        <ListingDetailInfoText label='Giao đến' text={userAddress.province ?
                            `${userAddress.ward}, ${userAddress.district}, ${userAddress.province}` :
                            'Cài đặt địa chỉ mặc định để thấy cước vận chuyển'} />
                        <ListingDetailInfoText label='Thanh toán' text='Ví PAH'
                            secondText='Người tham gia cần có đủ số dư khả dụng trong ví PAH trước khi tham gia đấu giá' />
                    </View>
                </View>
            </View>
        </Modal>

        {/* Confirm modal */}
        <Modal
            animationIn="slideInUp"
            animationOut="slideOutDown"
            isVisible={confirmModalVisible}
            onRequestClose={() => {
                setConfirmModalVisible(!confirmModalVisible)
            }}
            style={{ margin: 0 }}>
            <View
                style={{
                    flex: 1,
                    backgroundColor: 'white',
                }}>
                {/* Title */}
                <View style={{
                    height: 70,
                    flexDirection: 'row',
                    paddingLeft: 5,
                    paddingRight: 10,
                    alignItems: 'center'
                }}>
                    <TouchableOpacity
                        style={{
                            padding: 12,
                            borderRadius: 5,
                        }}
                        onPress={() => {
                            setConfirmModalVisible(!confirmModalVisible)
                        }}>
                        <IconFeather name="x" size={30} color={'black'} />
                    </TouchableOpacity>
                    <Text style={styles.titleText}>Xác nhận tham gia</Text>
                </View>

                {/* Bidding information */}
                <View
                    style={{
                        gap: 10,
                        marginHorizontal: 20,
                        marginBottom: 30,
                    }}>
                    <ListingDetailInfoText label="Phí tham gia" text={auction.entryFee && `₫${numberWithCommas(auction.entryFee)}`} />
                    <ListingDetailInfoText
                        label="Số dư bị khóa"
                        text={auction.startingPrice && `₫${numberWithCommas(auction.startingPrice)}`}
                        secondText='Bạn cần có đủ số dư khả dụng trong tài khoản để tham gia đấu giá'
                    />
                </View>

                {/* Confirm buttons */}
                <View
                    style={{
                        paddingHorizontal: 20,
                        gap: 10,
                        marginBottom: 20,
                        flex: 1,
                        justifyContent: 'flex-end',
                    }}>
                    <Text
                        style={{
                            fontSize: fontSizes.h5,
                            fontFamily: fonts.MontserratMedium,
                            color: 'black',
                        }}>
                        Khi bạn xác nhận tham gia đấu giá, điều đó có nghĩa là bạn cam kết
                        mua mặt hàng này nếu bạn là người thắng cuộc. Điều đó cũng có
                        nghĩa là bạn đã đọc và đồng ý với Điều khoản của PAH.
                    </Text>
                    <TouchableOpacity
                        disabled={isRegisterLoading}
                        style={{
                            borderRadius: 5,
                            backgroundColor: isRegisterLoading ? colors.grey : colors.primary,
                            paddingVertical: 10,
                        }}
                        onPress={() => registerAuction()}>
                        <Text
                            style={{
                                fontSize: fontSizes.h3,
                                fontFamily: fonts.MontserratBold,
                                color: isRegisterLoading ? colors.greyText : 'white',
                                textAlign: 'center',
                            }}>
                            Xác nhận tham gia
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    </View>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    backButton: {
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
        marginLeft: 5
    },
    titleButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8
    },
    separator: {
        height: 1,
        backgroundColor: colors.darkGrey,
        marginRight: 10
    },
    iconButton: {
        backgroundColor: colors.grey,
        padding: 12,
        borderRadius: 5
    },
    primaryButton: {
        borderRadius: 5,
        backgroundColor: colors.primary,
        paddingVertical: 10
    },
    primaryButtonText: {
        fontSize: fontSizes.h3,
        fontFamily: fonts.MontserratBold,
        color: 'white',
        textAlign: 'center'
    },
    secondaryButton: {
        margin: 1.2,
        borderWidth: 1.2,
        borderColor: colors.primary,
        borderRadius: 5,
        paddingVertical: 15,
    },
    secondaryButtonText: {
        fontSize: fontSizes.h3,
        fontFamily: fonts.MontserratMedium,
        color: colors.primary,
        textAlign: 'center'
    },
    emptyText: {
        color: colors.greyText,
        fontSize: fontSizes.h4,
        textAlign: 'center',
        fontFamily: fonts.MontserratMedium,
        marginVertical: 30
    },
    productName: {
        color: 'black',
        fontFamily: fonts.MontserratBold,
        fontSize: fontSizes.h2,
        marginHorizontal: 15,
        marginVertical: 10
    },
    topSellerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        gap: 15,
        marginVertical: 10
    },
    topSellerImage: {
        resizeMode: 'cover',
        width: 50,
        height: 50,
        borderRadius: 50
    },
    topSellerName: {
        color: 'black',
        fontFamily: fonts.MontserratMedium,
        fontSize: fontSizes.h5
    },
    topSellerInformation: {
        color: colors.darkGreyText,
        fontFamily: fonts.MontserratMedium,
        fontSize: fontSizes.h5
    },
    priceContainer: {
        paddingHorizontal: 15,
        gap: 5,
        marginVertical: 10,
        alignItems: 'baseline'
    },
    pricePrimary: {
        color: 'black',
        fontFamily: fonts.MontserratBold,
        fontSize: fontSizes.h1
    },
    priceSecondary: {
        color: colors.darkGreyText,
        fontFamily: fonts.MontserratMedium,
        fontSize: fontSizes.h4
    },
    sectionTitle: {
        color: 'black',
        fontFamily: fonts.MontserratBold,
        fontSize: fontSizes.h2
    },
    descriptionText: {
        color: 'black',
        fontFamily: fonts.MontserratMedium,
        fontSize: fontSizes.h4
    },
    descriptionLink: {
        color: 'black',
        fontFamily: fonts.MontserratMedium,
        fontSize: fontSizes.h4,
        textDecorationLine: 'underline'
    },
    bottomSellerImage: {
        resizeMode: 'cover',
        width: 80,
        height: 80,
        borderRadius: 50
    },
    bottomSellerPrimary: {
        color: 'black',
        fontFamily: fonts.MontserratMedium,
        fontSize: fontSizes.h5
    },
    bottomSellerSecondary: {
        color: colors.darkGreyText,
        fontFamily: fonts.MontserratMedium,
        fontSize: fontSizes.h5
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25
    },
    modalTitle: {
        color: 'black',
        fontSize: fontSizes.h3,
        fontFamily: fonts.MontserratBold,
        marginLeft: 20,
        marginVertical: 20
    }
});

export default AuctionDetail;