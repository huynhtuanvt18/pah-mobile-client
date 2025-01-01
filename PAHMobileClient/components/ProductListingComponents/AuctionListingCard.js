import React from 'react';
import {
    Text,
    View,
    Image,
    TouchableOpacity,
} from 'react-native';
import { colors, enumConstants, fontSizes, fonts } from '../../constants';
import TimeLeft from '../TimeLeft';
import { numberWithCommas } from '../../utilities/PriceFormat';
import moment from 'moment';
import { auctionStatusText } from '../../utilities/AuctionStatus';
function AuctionListingCard(props) {
    const { auction, onPress, index } = props;
    const { title, imageUrl = 'https://media.loveitopcdn.com/25808/thumb/img09357-copy.jpg',
        startingPrice, registrationEnd, status, startedAt, endedAt, currentPrice } = auction;

    return <View style={{
        paddingHorizontal: 15
    }}>
        {index != 0 && <View style={{
            height: 1.2,
            backgroundColor: colors.darkGrey,
            marginTop: 10,
            marginBottom: 15
        }}></View>}
        <TouchableOpacity style={{
            flexDirection: 'row'
        }}
            onPress={onPress}
        >
            <Image source={{ uri: imageUrl }}
                style={{
                    resizeMode: 'cover',
                    width: 140,
                    height: 140,
                    borderRadius: 5
                }} />
            <View style={{
                flex: 1,
                marginLeft: 15
            }}>
                <Text
                    numberOfLines={3}
                    ellipsizeMode='tail'
                    style={{
                        color: 'black',
                        fontFamily: fonts.MontserratMedium,
                        fontSize: fontSizes.h4,
                        marginBottom: 5
                    }}>{title}</Text>
                {status <= 4 && <View>
                    <Text
                        numberOfLines={2}
                        ellipsizeMode='tail'
                        style={{
                            color: colors.primary,
                            fontFamily: fonts.MontserratMedium,
                            fontSize: fontSizes.h4
                        }}>Giá khởi điểm</Text>
                    <Text
                        numberOfLines={2}
                        ellipsizeMode='tail'
                        style={{
                            color: colors.primary,
                            fontFamily: fonts.MontserratMedium,
                            fontSize: fontSizes.h3,
                            marginBottom: 5
                        }}>₫{numberWithCommas(startingPrice)}</Text>
                </View>}
                {(status == 5 && moment(endedAt).isAfter(moment())) && <View>
                    <Text
                        numberOfLines={2}
                        ellipsizeMode='tail'
                        style={{
                            color: colors.primary,
                            fontFamily: fonts.MontserratMedium,
                            fontSize: fontSizes.h4
                        }}>Giá hiện tại</Text>
                    <Text
                        numberOfLines={2}
                        ellipsizeMode='tail'
                        style={{
                            color: colors.primary,
                            fontFamily: fonts.MontserratMedium,
                            fontSize: fontSizes.h3,
                            marginBottom: 5
                        }}>₫{numberWithCommas(currentPrice)}</Text>
                </View>}
                {(status == 5 && moment(endedAt).isBefore(moment()))
                    && <View>
                        <Text
                            numberOfLines={2}
                            ellipsizeMode='tail'
                            style={{
                                color: colors.primary,
                                fontFamily: fonts.MontserratMedium,
                                fontSize: fontSizes.h4
                            }}>Giá cuối cùng</Text>
                        <Text
                            numberOfLines={2}
                            ellipsizeMode='tail'
                            style={{
                                color: colors.primary,
                                fontFamily: fonts.MontserratMedium,
                                fontSize: fontSizes.h3,
                                marginBottom: 5
                            }}>₫{numberWithCommas(currentPrice)}</Text>
                    </View>}

                {(status == enumConstants.auction.Ended)
                    && <View>
                        <Text
                            numberOfLines={2}
                            ellipsizeMode='tail'
                            style={{
                                color: colors.primary,
                                fontFamily: fonts.MontserratMedium,
                                fontSize: fontSizes.h4
                            }}>Giá cuối cùng</Text>
                        <Text
                            numberOfLines={2}
                            ellipsizeMode='tail'
                            style={{
                                color: colors.primary,
                                fontFamily: fonts.MontserratMedium,
                                fontSize: fontSizes.h3,
                                marginBottom: 5
                            }}>₫{numberWithCommas(currentPrice)}</Text>
                    </View>}

                {status < 4 && <Text style={{
                    color: colors.darkGreyText,
                    fontFamily: fonts.MontserratMedium,
                    fontSize: fontSizes.h6
                }}>{auctionStatusText(status)}</Text>}
                {(status == 4 && moment(registrationEnd).isAfter(moment())) && <TimeLeft prefixText={'Đóng đăng ký trong'} width={200} closedTime={registrationEnd} />}
                {(status == 4 && moment(registrationEnd).isBefore(moment())) && <TimeLeft prefixText={'Bắt đầu trong'} width={200} closedTime={startedAt} />}
                {(status == 5 && moment(endedAt).isAfter(moment())) && <TimeLeft prefixText={'Kết thúc trong'} width={200} closedTime={endedAt} />}
                {(status == 5 && moment(endedAt).isBefore(moment())) && <TimeLeft prefixText={'Đã kết thúc'} width={200} closedTime={endedAt} />}
                {status == enumConstants.auction.Ended && auction.isWon && <Text style={{
                    color: colors.darkGreyText,
                    fontFamily: fonts.MontserratMedium,
                    fontSize: fontSizes.h6
                }}>Bạn đã thắng cuộc đấu giá này</Text>}

            </View>
        </TouchableOpacity>
    </View>
}

export default AuctionListingCard;