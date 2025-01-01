import React, {useContext, useState} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  KeyboardAvoidingView,
} from 'react-native';
import {colors, fontSizes, fonts, enumConstants} from '../../constants';
import IconAntDesign from 'react-native-vector-icons/AntDesign';

function ProductPricing(props) {
  const {
    price,
    setPrice,
    type,
    setType,
    setPricingMode,
    auctionTitle,
    setAuctionTitle,
    auctionStep,
    setAuctionStep,
  } = props;
  const [enableAuction, setEnableAuction] = useState(type == enumConstants.productType.Auction ? true : false);
  const [enableBuy, setEnableBuy] = useState(type == enumConstants.productType.Auction ? false : true);

  return (
    <KeyboardAvoidingView style={styles.container}>
      {/*Fixed screen title */}
      <View style={styles.titleContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            setPricingMode(false);
          }}>
          <Text
            style={{
              color: colors.primary,
              fontFamily: fonts.MontserratMedium,
              fontSize: fontSizes.h3,
              alignSelf: 'center',
            }}>
            Hủy
          </Text>
        </TouchableOpacity>
        <Text style={styles.titleText}>Định giá</Text>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            alert('faq');
          }}>
          <IconAntDesign
            name="questioncircleo"
            size={25}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>
      {/* Pricing options */}
      <ScrollView>
        {/* Auction */}
        <View style={styles.sectionStyle}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text style={styles.titleSection}>Đấu giá</Text>
            <TouchableOpacity
              style={{
                marginRight: 20,
              }}>
              <Switch
                disabled={enableAuction == true}
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={
                  enableAuction ? colors.primary : colors.darkGreyText
                }
                onValueChange={() => {
                  setEnableAuction(true);
                  setEnableBuy(false);
                  setType(2);
                }}
                value={enableAuction}
              />
            </TouchableOpacity>
          </View>
          <Text
            style={{
              color: colors.darkGreyText,
              fontSize: fontSizes.h5,
              fontFamily: fonts.MontserratMedium,
            }}>
            Hãy đặt giá thầu và để người mua cạnh tranh cho sản phẩm của bạn
          </Text>
        </View>
        {/* Buy now */}
        <View style={styles.sectionStyle}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text style={styles.titleSection}>Mua ngay</Text>
            <TouchableOpacity
              style={{
                marginRight: 20,
              }}>
              <Switch
                disabled={enableBuy == true}
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={enableBuy ? colors.primary : colors.darkGreyText}
                onValueChange={() => {
                  setEnableAuction(false);
                  setEnableBuy(true);
                  setType(1);
                }}
                value={enableBuy}
              />
            </TouchableOpacity>
          </View>
          <Text
            style={{
              color: colors.darkGreyText,
              fontSize: fontSizes.h5,
              fontFamily: fonts.MontserratMedium,
            }}>
            Người mua có thể mua ngay với giá này
          </Text>
        </View>

        {/* Section */}
        <View>
          <Text style={styles.titleSection}>Thông tin thêm</Text>
          {type == 2 && (
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                alignItems: 'center'
              }}>
              <Text
                style={{
                  width: 120,
                  color: colors.black,
                  fontSize: fontSizes.h4,
                  fontFamily: fonts.MontserratMedium,
                }}>
                Tựa đề
              </Text>
              <TextInput
                value={auctionTitle}
                onChangeText={text => {
                  setAuctionTitle(text);
                }}
                placeholder="Nhập tại đây"
                style={{
                  width: 150,
                  borderColor: colors.black,
                  marginStart: 20,
                  color: colors.black,
                  fontSize: fontSizes.h4,
                  fontFamily: fonts.MontserratMedium,
                }}
              />
            </View>
          )}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Text
              style={{
                width: 120,
                color: colors.black,
                fontSize: fontSizes.h4,
                fontFamily: fonts.MontserratMedium,
              }}>
              {type == 1 ? 'Giá' : 'Giá khởi điểm'}
            </Text>
            <TextInput
              value={price}
              onChangeText={text => {
                setPrice(text);
              }}
              keyboardType="numeric"
              placeholder="Nhập tại đây"
              style={{
                width: 120,
                borderColor: colors.black,
                marginStart: 20,
                color: colors.black,
                fontSize: fontSizes.h4,
                fontFamily: fonts.MontserratMedium,
              }}
            />
            <Text
              style={{
                color: colors.black,
                fontSize: fontSizes.h4,
                fontFamily: fonts.MontserratMedium,
              }}>
              VNĐ
            </Text>
          </View>

          {type == 2 && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  width: 120,
                  color: colors.black,
                  fontSize: fontSizes.h4,
                  fontFamily: fonts.MontserratMedium,
                }}>
                Bước giá
              </Text>
              <TextInput
                value={auctionStep}
                onChangeText={text => {
                  setAuctionStep(text);
                }}
                keyboardType="numeric"
                placeholder="Nhập tại đây"
                style={{
                  width: 120,
                  borderColor: colors.black,
                  marginStart: 20,
                  color: colors.black,
                  fontSize: fontSizes.h4,
                  fontFamily: fonts.MontserratMedium,
                }}
              />
              <Text
                style={{
                  color: colors.black,
                  fontSize: fontSizes.h4,
                  fontFamily: fonts.MontserratMedium,
                }}>
                VNĐ
              </Text>
            </View>
          )}
        </View>

        {/* Accept button */}
        <View
          style={{
            marginTop: 10,
          }}>
          <TouchableOpacity
            onPress={() => {
              setPricingMode(false);
            }}
            style={{
              backgroundColor: colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginVertical: 15,
              padding: 10,
              borderRadius: 5,
            }}>
            <Text
              style={{
                color: 'white',
                fontFamily: fonts.MontserratMedium,
                fontSize: fontSizes.h3,
              }}>
              Chấp nhận
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 15,
  },
  iconButton: {
    padding: 12,
    borderRadius: 5,
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
  },
  titleButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  sectionStyle: {
    paddingBottom: 15,
  },
  titleSection: {
    marginTop: 10,
    color: colors.black,
    fontFamily: fonts.MontserratBold,
    fontSize: fontSizes.h3,
  },
  detailTextSection: {
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h5,
  },
  dropdown: {
    height: 50,
    borderColor: colors.black,
    borderBottomWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
  },
  placeholderStyle: {
    color: colors.darkGreyText,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h4,
  },
  selectedTextStyle: {
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h4,
  },
  inputSearchStyle: {
    color: colors.darkGreyText,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h4,
  },
  itemTextStyle: {
    color: colors.black,
    fontFamily: fonts.MontserratMedium,
    fontSize: fontSizes.h4,
  },
});
export default ProductPricing;
