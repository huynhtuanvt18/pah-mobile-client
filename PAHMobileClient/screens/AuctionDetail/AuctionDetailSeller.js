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
import {
    ListingDetailInfoText
} from '../../components';
import {
    Auction as AuctionRepository
} from '../../repositories';
import { conditionText } from '../../utilities/Condition';
import moment from 'moment';
import { numberWithCommas } from '../../utilities/PriceFormat';
import CountDown from 'react-native-countdown-fixed';
import { differenceInSeconds } from 'date-fns';

function AuctionDetailSeller(props) {
    //// AUTH AND NAVIGATION
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

    //// DATA
    // Data for auction detail
    const [auction, setAuction] = useState({
        seller: {},
        imageUrls: [],
        product: {}
    });

    // Data for loading and refreshing
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Data for validating register duration and bidding duration
    const isRegisterDuration = () => moment(auction.registrationStart).isBefore(moment()) &&
        moment(auction.registrationEnd).isAfter(moment());

    const isBiddingDuration = () => moment(auction.startedAt).isBefore(moment()) &&
        moment(auction.endedAt).isAfter(moment());

    // Countdown data
    const durationTillRegistration = differenceInSeconds(
        new Date(auction.registrationStart),
        new Date(),
    );
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
                setIsLoading(false);
            })
            .catch(error => {
                setIsLoading(false);
            });
    }

    useEffect(() => {
        getAutionDetail();
        // On auction start
        signalRContext?.connection?.on("ReceiveAuctionOpen", function (auctionTitle) {
            getAutionDetail();
        });
        // On auction End
        signalRContext?.connection?.on("ReceiveAuctionEnd", function (auctionTitle) {
            getAutionDetail();
        });
    }, []);

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
                    {auction.status <= 4 && <Text style={styles.pricePrimary}>
                        Giá khởi điểm: ₫{numberWithCommas(auction.startingPrice)}
                    </Text>}
                    {(auction.status == 5 && moment(auction.endedAt).isAfter(moment())) && <Text style={styles.pricePrimary}>
                        Giá hiện tại: ₫{numberWithCommas(auction.currentPrice)}
                    </Text>}
                    {(auction.status == 5 && moment(auction.endedAt).isBefore(moment())) && <Text style={styles.pricePrimary}>
                        Giá cuối cùng: ₫{numberWithCommas(auction.currentPrice)}
                    </Text>}
                    {auction.status == enumConstants.auction.Ended && <Text style={styles.pricePrimary}>
                        Giá cuối cùng: ₫{numberWithCommas(auction.currentPrice)}
                    </Text>}
                </View>

                {/* Countdown and button section */}
                <View>
                    {/* Auction is being verified*/}
                    {[0, 1, 2].includes(auction.status) && <View style={{
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
                            }}>Đang chờ duyệt</Text>
                            <Text style={{
                                fontFamily: fonts.MontserratMedium,
                                color: colors.darkGreyText,
                                fontSize: fontSizes.h4,
                                marginTop: 10
                            }}>Cuộc đấu giá của bạn đang được duyệt. Nếu được duyệt thành công, nhân viên đấu giá sẽ giúp cập nhật thông tin
                                về cuộc đấu giá cho bạn.</Text>
                        </View>
                    </View>}

                    {/* Auction is rejected*/}
                    {auction.status == 3 && <View style={{
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
                            }}>Bị từ chối</Text>
                            <Text style={{
                                fontFamily: fonts.MontserratMedium,
                                color: colors.darkGreyText,
                                fontSize: fontSizes.h4,
                                marginTop: 10
                            }}>Cuộc đấu giá của bạn đã bị từ chối. Hãy kiểm tra lại thông tin sản phẩm của bạn và tạo một cuốc đấu
                                giá mới</Text>
                        </View>
                    </View>}

                    {/* During registration, before registration start*/}
                    {(auction.status == 4 && moment(auction.registrationStart).isAfter(moment())) && <View style={{
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
                            }}>Mở đăng ký trong</Text>
                            <CountDown
                                size={18}
                                until={durationTillRegistration}
                                onFinish={() => alert('Bắt đầu đăng ký')}
                                digitStyle={{ borderWidth: 2, borderColor: colors.primary }}
                                timeLabels={{ m: null, s: null }}
                                separatorStyle={{ color: colors.primary }}
                                showSeparator
                            />
                        </View>
                    </View>}

                    {/* During registration, valid time */}
                    {(auction.status == 4 && isRegisterDuration()) && <View style={{
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
                                onFinish={() => alert('Đóng thời gian đăng ký')}
                                digitStyle={{ borderWidth: 2, borderColor: colors.primary }}
                                timeLabels={{ m: null, s: null }}
                                separatorStyle={{ color: colors.primary }}
                                showSeparator
                            />
                        </View>
                    </View>}

                    {/* During registration, after registration end, before start bidding */}
                    {(auction.status == 4 && moment(auction.registrationEnd).isBefore(moment())) && <View style={{
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
                                onFinish={() => alert('Bắt đầu đấu giá')}
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
                                onFinish={() => alert('Kết thúc đấu giá')}
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
                {[4, 5, 6, 7].includes(auction.status) && <View style={{
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
                </View>}

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
                    marginVertical: 20,
                    marginBottom: 100
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

export default AuctionDetailSeller;