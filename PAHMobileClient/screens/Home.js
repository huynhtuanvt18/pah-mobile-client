import React, { useState, useContext, useEffect, useCallback } from 'react';
import {
    Text,
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { colors, fontSizes, images, fonts } from '../constants';
import IconFeather from 'react-native-vector-icons/Feather';
import IconSLI from 'react-native-vector-icons/SimpleLineIcons';
import { AuthContext } from '../context/AuthContext';
import { AxiosContext } from '../context/AxiosContext';
import {
    HomeItemCard,
    HomeCategoryCard,
    HomeAuctionCard
} from '../components';
import {
    Category as CategoryRepository,
    Product as ProductRepository,
    Auction as AuctionRepository
} from '../repositories';
import { unsubscribe } from '../utilities/PushNotificationHelper';

function Home(props) {
    //// AUTH AND NAVIGATION
    // Auth Context
    const authContext = useContext(AuthContext);
    const axiosContext = useContext(AxiosContext);

    // Navigation
    const { navigation, route } = props;

    // Function of navigate to/back
    const { navigate, goBack } = navigation;

    //// DATA
    // Data for popular products, ongoing auction and categories
    const [popularProducts, setPopularProducts] = useState([]);
    const [ongoingAuctions, setOngoingAuctions] = useState([]);
    const [categories, setCategories] = useState([]);

    // Loading state data
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const isAllEmpty = () => !(Array.isArray(categories) && categories.length) &&
        !(Array.isArray(popularProducts) && popularProducts.length) &&
        !(Array.isArray(ongoingAuctions) && ongoingAuctions.length);

    //// FUNCTIONS
    // Init data function
    function initializeDataHome() {
        setIsLoading(true);

        // Get Categories
        const promiseCategory = CategoryRepository.getCategoriesHome(axiosContext)
            .then(response => {
                setCategories(response);
            });

        // Get Products
        const promiseProduct = ProductRepository.getProductsHome(axiosContext)
            .then(response => {
                setPopularProducts(response.productList);
            });

        // Get Auctions
        const promiseAuction = AuctionRepository.getAuctionsHome(axiosContext)
            .then(response => {
                setOngoingAuctions(response.auctionList);
            });

        Promise.all([promiseCategory, promiseProduct, promiseAuction])
            .then((values) => {
                setIsLoading(false);
            })
            .catch(error => {
                setIsLoading(false);
            });
    }
    useEffect(() => {
        initializeDataHome();
    }, []);

    // Refresh
    const onRefresh = () => {
        setRefreshing(true);
        initializeDataHome();
        setRefreshing(false);
    };

    return <View style={styles.container}>
        {/* Fixed homepage title: logo and cart and search icon */}
        <View style={styles.titleContainer}>
            <Image source={images.logoImage}
                style={styles.logoImage} />
            <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8
            }}>
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
            </View>
        </View>

        {/* Scroll view */}
        <ScrollView refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
            {/*  Search bar section */}
            <View style={{
                marginVertical: 15,
                paddingHorizontal: 15
            }}>
                <View style={{
                    height: 50,
                    backgroundColor: colors.grey,
                    borderRadius: 5,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 15
                }}>
                    <TouchableOpacity style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        flex: 1
                    }}
                        onPress={() => {
                            navigate('Search')
                        }}>
                        <IconFeather name='search'
                            size={20} color={'black'}
                        />
                        <Text style={{
                            fontFamily: fonts.MontserratMedium,
                            color: 'black',
                            marginLeft: 15
                        }}
                        >Tìm kiếm sản phẩm...</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        navigate('Search')
                        unsubscribe("weather")
                        unsubscribe("AUCTION_1")
                        unsubscribe("AUCTION_2")
                        unsubscribe("AUCTION_3")
                        unsubscribe("AUCTION_4")
                        unsubscribe("AUCTION_5")
                        unsubscribe("AUCTION_6")
                        unsubscribe("AUCTION_7")
                        unsubscribe("AUCTION_8")
                        unsubscribe("AUCTION_9")
                        unsubscribe("AUCTION_10")
                        unsubscribe("USER_1")
                        unsubscribe("USER_2")
                        unsubscribe("USER_3")
                        unsubscribe("USER_4")
                        unsubscribe("USER_5")
                        unsubscribe("USER_6")
                        unsubscribe("USER_7")
                        unsubscribe("USER_29")
                        unsubscribe("USER_35")
                        unsubscribe("USER_36")
                    }}>
                        <View style={{
                            width: 20, height: 20
                        }}></View>
                    </TouchableOpacity>
                </View>
            </View>
            {/* Loading section */}
            {isLoading ? <View style={{
                flex: 1,
                justifyContent: 'center'
            }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View> : <View>
                {isAllEmpty() ? <View style={{
                    flex: 1,
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
                    }}>Không thể tìm thấy sản phẩm nào.</Text>
                    <TouchableOpacity onPress={() => initializeDataHome()}>
                        <Text style={{
                            fontSize: fontSizes.h5,
                            fontFamily: fonts.MontserratMedium,
                            color: colors.primary,
                            textAlign: 'center',
                            marginHorizontal: 35,
                            marginTop: 20
                        }}>Tải lại</Text>
                    </TouchableOpacity>
                </View> : <View>
                    {/*  Optional section: sign in or register */}
                    {!authContext?.authState?.authenticated ? <View style={{
                        height: 150,
                        paddingTop: 10,
                        paddingHorizontal: 25,
                        marginVertical: 10
                    }}>
                        <Text style={{
                            color: 'black',
                            fontSize: fontSizes.h3,
                            textAlign: 'center',
                            fontFamily: fonts.MontserratMedium
                        }}>Hãy đăng nhập để trải nghiệm tối đa nền tảng của chúng tôi</Text>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: 20,
                            gap: 10
                        }}>
                            <TouchableOpacity style={styles.loginButton}
                                onPress={() => {
                                    navigate('Register')
                                }}>
                                <Text style={styles.loginText}>Đăng ký</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.loginButton}
                                onPress={() => {
                                    navigate('Login')
                                }}>
                                <Text style={styles.loginText}>Đăng nhập</Text>
                            </TouchableOpacity>
                        </View>
                    </View> : <View></View>}

                    <View style={{ marginTop: 10 }}>
                        {/*  Categories section */}
                        <View style={{
                            flex: 1,
                            marginBottom: 30
                        }}>
                            <View style={styles.headerLayout}>
                                <Text style={styles.headerText}>Khám phá các danh mục</Text>
                            </View>
                            {(Array.isArray(categories) && categories.length) ? <FlatList
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                data={categories}
                                renderItem={({ item, index }) => {
                                    return <HomeCategoryCard item={item} index={index}
                                        onPress={() => navigate('Listing', { categoryParam: item.id })} />
                                }}
                                keyExtractor={eachCategory => eachCategory.id}
                            /> : <View>
                                <Text style={styles.emptyText}>Không có danh mục để hiển thị</Text>
                            </View>}
                        </View>

                        {/*  Popular products section */}
                        <View style={{
                            marginBottom: 30
                        }}>
                            <View style={styles.headerLayout}>
                                <Text style={styles.headerText}>Sản phẩm mới nhất</Text>
                                <TouchableOpacity onPress={() => navigate('Listing', { categoryParam: 0 })}>
                                    <Text style={styles.headerSubText}>Xem tất cả</Text>
                                </TouchableOpacity>
                            </View>
                            {(Array.isArray(popularProducts) && popularProducts.length) ? <FlatList
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                data={popularProducts}
                                renderItem={({ item, index }) => {
                                    return <HomeItemCard item={item} index={index}
                                        onPress={() => navigate('ListingDetail', { product_id: item.id })} />
                                }}
                                keyExtractor={eachProduct => eachProduct.id}
                            /> : <View>
                                <Text style={styles.emptyText}>Không có sản phẩm để hiển thị</Text>
                            </View>}
                        </View>

                        {/*  Ongoing auctions section */}
                        <View style={{
                            marginBottom: 20
                        }}>
                            <View style={styles.headerLayout}>
                                <Text style={styles.headerText}>Cuộc đấu giá sắp diễn ra</Text>
                                <TouchableOpacity onPress={() => navigate('AuctionListing')}>
                                    <Text style={styles.headerSubText}>Xem tất cả</Text>
                                </TouchableOpacity>
                            </View>
                            {(Array.isArray(ongoingAuctions) && ongoingAuctions.length) ? <FlatList
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                data={ongoingAuctions}
                                renderItem={({ item, index }) => {
                                    return <HomeAuctionCard item={item} index={index}
                                        onPress={() => navigate('AuctionDetail', { auction_id: item.id })} />
                                }}
                                keyExtractor={eachAuction => eachAuction.id}
                            /> : <View>
                                <Text style={styles.emptyText}>Không có cuộc đấu giá để hiển thị</Text>
                            </View>}
                        </View>
                    </View>
                </View>}
            </View>}
        </ScrollView>
    </View>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    iconButton: {
        padding: 12,
        borderRadius: 5,
        backgroundColor: colors.grey
    },
    loginButton: {
        borderWidth: 1.2,
        borderColor: colors.primary,
        borderRadius: 5,
        paddingVertical: 15,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    loginText: {
        fontSize: fontSizes.h3,
        fontFamily: fonts.MontserratMedium,
        color: colors.primary
    },
    titleContainer: {
        height: 70,
        flexDirection: 'row',
        paddingLeft: 15,
        paddingRight: 10,
        justifyContent: 'space-between'
    },
    logoImage: {
        resizeMode: 'cover',
        height: 25,
        width: 68,
        alignSelf: 'center'
    },
    headerLayout: {
        paddingHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15
    },
    headerText: {
        color: 'black',
        fontSize: fontSizes.h2,
        fontFamily: fonts.MontserratBold
    },
    headerSubText: {
        color: colors.secondary,
        fontSize: fontSizes.h5,
        fontFamily: fonts.MontserratRegular,
        textDecorationLine: 'underline',
        marginLeft:5
    },
    emptyText: {
        color: colors.greyText,
        fontSize: fontSizes.h4,
        textAlign: 'center',
        fontFamily: fonts.MontserratMedium,
        marginVertical: 30
    }
});

export default Home;