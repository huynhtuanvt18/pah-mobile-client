import React, { useContext, useState, useEffect } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    TextInput,
    ActivityIndicator,
    RefreshControl,
    FlatList
} from 'react-native';
import Modal from 'react-native-modal';
import { AuthContext } from '../context/AuthContext';
import { AxiosContext } from '../context/AxiosContext';
import { colors, fontSizes, images, fonts, pageParameters } from '../constants';
import IconFeather from 'react-native-vector-icons/Feather';
import {
    ProductListingCard
} from '../components';
import {
    Category as CategoryRepository,
    Material as MaterialRepository,
    Product as ProductRepository
} from '../repositories';

function Listing(props) {
    //// AUTH AND NAVIGATION
    // Auth Context
    const authContext = useContext(AuthContext);
    const axiosContext = useContext(AxiosContext);

    // Navigation
    const { navigation, route } = props;

    // Function of navigate to/back
    const { navigate, goBack } = navigation;

    //// DATA
    // Data for screen title and search
    const [screenTitle, setScreenTitle] = useState('Tất cả sản phẩm');
    const [searchTextFilter, setSearchTextFilter] = useState('');
    const isDefault = screenTitle === 'Tất cả sản phẩm';

    // Modal data
    const [filterModalVisible, setFilterModalVisible] = useState(false);

    // Loading and refreshing state
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [hasNext, setHasNext] = useState(true);

    // Data for products and filters
    const [products, setProducts] = useState([]);
    const [productCount, setProductCount] = useState(0);
    const [sortOrders, setSortOrders] = useState([
        {
            id: 0,
            name: 'Từ mới đến cũ'
        },
        {
            id: 1,
            name: 'Từ cũ đến mới'
        },
        {
            id: 2,
            name: 'Giá tăng dần'
        },
        {
            id: 3,
            name: 'Giá giảm dần'
        }
    ]);
    const [currentSortOrder, setCurrentSortOrder] = useState(0);
    const [selectedSortOrder, setSelectedSortOrder] = useState(0);
    const [categories, setCategories] = useState([]);
    const [currentCategory, setCurrentCategory] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState(0);
    const [materials, setMaterials] = useState([]);
    const [currentMaterial, setCurrentMaterial] = useState(0);
    const [selectedMaterial, setSelectedMaterial] = useState(0);
    const [currentPriceMin, setCurrentPriceMin] = useState('');
    const [selectedPriceMin, setSelectedPriceMin] = useState('');
    const [currentPriceMax, setCurrentPriceMax] = useState('');
    const [selectedPriceMax, setSelectedPriceMax] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Data for filter count
    const filterCount = () => {
        let count = 0;
        if (selectedSortOrder !== 0) count++;
        if (selectedCategory !== 0) count++;
        if (selectedMaterial !== 0) count++;
        if (selectedPriceMin !== '') count++;
        if (selectedPriceMax !== '') count++;
        return count;
    }

    //// FUNCTION AND USEEFFECT
    // Set filter default state
    function setFilterDefault() {
        // Set default state
        setSelectedCategory(0);
        setSelectedSortOrder(0);
        setSelectedMaterial(0);
        setSelectedPriceMin('');
        setSelectedPriceMax('');
        setCurrentCategory(0);
        setCurrentSortOrder(0);
        setCurrentMaterial(0);
        setCurrentPriceMin('');
        setCurrentPriceMax('');
        setCurrentPage(1);
        setHasNext(true);
    }

    // Get search param on screen focus
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (route.params) {
                const { searchText = "" } = route.params;
                const { categoryParam = 0 } = route.params;
                
                setSearchTextFilter(searchText);
                setScreenTitle(searchText != '' ? searchText : 'Tất cả sản phẩm');
                setFilterDefault();
                setCurrentCategory(categoryParam);
                setSelectedCategory(categoryParam);
                // Get Products
                setIsLoading(true);
                ProductRepository.getProducts(axiosContext,
                    {
                        nameSearch: searchText, materialId: 0,
                        categoryId: categoryParam, orderBy: 0,
                        priceMin: '', priceMax: ''
                    })
                    .then(response => {
                        setProducts(response.productList);
                        if (response.productList.length < pageParameters.DEFAULT_PAGE_SIZE) {
                            setHasNext(false)
                        }
                        setProductCount(response.count);
                        setIsLoading(false);
                    }).catch(error => {
                        setIsLoading(false);
                    });
            }
        });
        return unsubscribe;
    }, [route]);

    // Initialize data for categories, materials and products on screen start
    function initializeDataListing() {
        setIsLoading(true);
        setCurrentPage(1);
        // Get Categories
        const promiseCategory = CategoryRepository.getCategories(axiosContext)
            .then(response => {
                const categoriesArray = [{
                    id: 0,
                    name: 'Tất cả'
                }].concat(response)
                setCategories(categoriesArray);
            });

        // Get Materials
        const promiseMaterial = MaterialRepository.getMaterials(axiosContext)
            .then(response => {
                const materialsArray = [{
                    id: 0,
                    name: 'Tất cả'
                }].concat(response)
                setMaterials(materialsArray);
            });

        // Get Products
        const promiseProduct = ProductRepository.getProducts(axiosContext,
            {
                nameSearch: searchTextFilter, materialId: selectedMaterial,
                categoryId: selectedCategory, orderBy: selectedSortOrder,
                priceMin: selectedPriceMin, priceMax: selectedPriceMax
            })
            .then(response => {
                setProducts(response.productList);
                if (response.productList.length < pageParameters.DEFAULT_PAGE_SIZE) {
                    setHasNext(false)
                }
                setProductCount(response.count);
            });

        Promise.all([promiseCategory, promiseProduct, promiseMaterial])
            .then((values) => {
                setIsLoading(false);
            })
            .catch(error => {
                setIsLoading(false);
            });
    }

    useEffect(() => {
        initializeDataListing();
    }, []);

    useEffect(() => {
        setFilterDefault();
        // Get Products
        setIsLoading(true);
        ProductRepository.getProducts(axiosContext,
            {
                nameSearch: searchTextFilter, materialId: 0,
                categoryId: 0, orderBy: 0,
                priceMin: '', priceMax: ''
            })
            .then(response => {
                setProducts(response.productList);
                if (response.productList.length < pageParameters.DEFAULT_PAGE_SIZE) {
                    setHasNext(false)
                }
                setProductCount(response.count);
                setIsLoading(false);
            }).catch(error => {
                setIsLoading(false);
            });
    }, [searchTextFilter]);

    // Close filter modal
    function closeFilterModal() {
        setFilterModalVisible(!filterModalVisible);
        setSelectedCategory(currentCategory);
        setSelectedSortOrder(currentSortOrder);
        setSelectedMaterial(currentMaterial);
        setSelectedPriceMin(currentPriceMin);
        setSelectedPriceMax(currentPriceMax);
    }

    // Filter submit function
    function filter() {
        setCurrentCategory(selectedCategory);
        setCurrentSortOrder(selectedSortOrder);
        setCurrentMaterial(selectedMaterial);
        setCurrentPriceMin(selectedPriceMin);
        setCurrentPriceMax(selectedPriceMax);
        setCurrentPage(1);
        // Get Products
        setIsLoading(true);
        ProductRepository.getProducts(axiosContext,
            {
                nameSearch: searchTextFilter, materialId: selectedMaterial,
                categoryId: selectedCategory, orderBy: selectedSortOrder,
                priceMin: selectedPriceMin, priceMax: selectedPriceMax
            })
            .then(response => {
                setProducts(response.productList);
                if (response.productList.length < pageParameters.DEFAULT_PAGE_SIZE) {
                    setHasNext(false)
                }
                setProductCount(response.count);
                setIsLoading(false);
                setFilterModalVisible(!filterModalVisible);
            }).catch(error => {
                setIsLoading(false);
                setFilterModalVisible(!filterModalVisible);
            });
    }

    // Reset filter function
    function resetFilter() {
        setFilterDefault();
        // Get Products
        setIsLoading(true);
        ProductRepository.getProducts(axiosContext,
            {
                nameSearch: searchTextFilter, materialId: 0,
                categoryId: 0, orderBy: 0,
                priceMin: '', priceMax: ''
            })
            .then(response => {
                setProducts(response.productList);
                if (response.productList.length < pageParameters.DEFAULT_PAGE_SIZE) {
                    setHasNext(false)
                }
                setProductCount(response.count);
                setIsLoading(false);
                setFilterModalVisible(!filterModalVisible);
            }).catch(error => {
                setIsLoading(false);
                setFilterModalVisible(!filterModalVisible);
            });
    }

    // Get filtered products function
    function filteredProducts() {
        setIsLoading(true);
        setCurrentPage(1);
        setHasNext(true);
        ProductRepository.getProducts(axiosContext,
            {
                nameSearch: searchTextFilter, materialId: selectedMaterial,
                categoryId: selectedCategory, orderBy: selectedSortOrder,
                priceMin: selectedPriceMin, priceMax: selectedPriceMax
            })
            .then(response => {
                setProducts(response.productList);
                if (response.productList.length < pageParameters.DEFAULT_PAGE_SIZE) {
                    setHasNext(false)
                }
                setProductCount(response.count);
                setIsLoading(false);
            }).catch(error => {
                setIsLoading(false);
            });
    }

    // Scroll view refresh
    const onRefresh = () => {
        setRefreshing(true);
        filteredProducts();
        setRefreshing(false);
    };

    // Pagination
    const loadMoreItems = () => {
        if (hasNext) {
            ProductRepository.getProducts(axiosContext,
                {
                    nameSearch: searchTextFilter, materialId: selectedMaterial,
                    categoryId: selectedCategory, orderBy: selectedSortOrder,
                    priceMin: selectedPriceMin, priceMax: selectedPriceMax,
                    pageNumber: currentPage + 1
                })
                .then(response => {
                    setProducts(products => [...products, ...response.productList]);
                    if (response.productList.length < pageParameters.DEFAULT_PAGE_SIZE) {
                        setHasNext(false)
                    }
                    setProductCount(response.count);
                }).catch(error => { });
            setCurrentPage(currentPage + 1);
        }
    }

    // Pagination loader
    const renderLoader = () => {
        return (
            <View style={{
                alignItems: 'center',
                marginBottom: 100,
                paddingBottom: 50,
                paddingTop: 15
            }}>
                {hasNext && <ActivityIndicator size={'large'} color={colors.primary} />}
            </View>
        )
    }

    return <View style={styles.container}>
        {/* Fixed screen title: logo and cart and search icon */}
        <View style={styles.titleContainer}>
            {!isDefault && <TouchableOpacity style={{
                marginRight: 10,
                borderRadius: 50
            }}
                onPress={() => {
                    setScreenTitle('Tất cả sản phẩm');
                    setSearchTextFilter('');
                    navigation.setParams({ searchText: '' })
                }}>
                <IconFeather name='x' size={30} color={'black'} />
            </TouchableOpacity>}
            <Text style={styles.titleText}
                numberOfLines={1}
                ellipsizeMode='tail'
            >{screenTitle}</Text>
            <View style={styles.titleButtonContainer}>
                <TouchableOpacity style={styles.iconButton}
                    onPress={() => {
                        navigate('Search', { searchText: searchTextFilter })
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

        {/* Loading section */}
        {isLoading ? <View style={{
            flex: 1,
            justifyContent: 'center'
        }}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View> : <View>
            {/* Title (type of list: for sale/auction) section */}
            <View style={{
                paddingVertical: 10,
                paddingHorizontal: 15,
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 20
            }}>
                <Text style={{
                    color: 'black',
                    fontFamily: fonts.MontserratMedium,
                    fontSize: fontSizes.h2
                }}>Sản phẩm đăng bán ({productCount})</Text>
                <TouchableOpacity style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5
                }}
                    onPress={() => {
                        setFilterModalVisible(!filterModalVisible)
                    }}>
                    <Text style={{
                        color: colors.primary,
                        fontFamily: fonts.MontserratBold,
                        fontSize: fontSizes.h5,
                    }}>Bộ lọc</Text>
                    <IconFeather name='filter' size={16} color={colors.primary} />
                    {filterCount() != 0 && <Text style={styles.filterNumber}>{filterCount()}</Text>}
                </TouchableOpacity>
            </View>
            {(Array.isArray(products) && products.length) ? <View>
                <View>
                    <FlatList
                        style={{
                            marginBottom: 50
                        }}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        keyExtractor={item => item.id}
                        data={products}
                        renderItem={({ item, index }) => <ProductListingCard key={item.id} product={item}
                            index={index} onPress={() => {
                                navigate('ListingDetail', { product_id: item.id })
                            }} />}
                        onEndReached={loadMoreItems}
                        onEndReachedThreshold={0}
                        ListFooterComponent={renderLoader}
                    />
                </View>
            </View> : <View style={{
                alignItems: 'center',
                paddingTop: 150
            }}>
                <Image source={images.searchImage} style={{
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
                }}>Không thể tìm thấy sản phẩm nào</Text>
                <TouchableOpacity
                    onPress={() => filteredProducts()}>
                    <Text style={{
                        fontSize: fontSizes.h4,
                        fontFamily: fonts.MontserratMedium,
                        color: colors.primary,
                        textAlign: 'center',
                        marginHorizontal: 35,
                        marginTop: 10
                    }}>Tải lại</Text>
                </TouchableOpacity>
            </View>}
        </View>}

        {/* Filter Modal */}
        <Modal
            animationIn="slideInRight"
            animationOut="slideOutRight"
            isVisible={filterModalVisible}
            onRequestClose={() => {
                closeFilterModal()
            }}
            style={{ margin: 0 }}>
            <View style={{
                flex: 1,
                flexDirection: 'row'
            }}>
                <TouchableOpacity style={{
                    width: '20%'
                }}
                    onPress={() => {
                        closeFilterModal()
                    }}></TouchableOpacity>
                <View style={{
                    backgroundColor: 'white',
                    flex: 1
                }}>
                    {/* Filter title */}
                    <View style={{
                        height: 70,
                        flexDirection: 'row',
                        paddingLeft: 15,
                        paddingRight: 10,
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <TouchableOpacity style={{
                            marginRight: 10,
                            borderRadius: 5
                        }}
                            onPress={() => {
                                closeFilterModal()
                            }}>
                            <IconFeather name='x' size={25} color={'black'} />
                        </TouchableOpacity>
                        <Text style={{
                            color: 'black',
                            fontFamily: fonts.MontserratBold,
                            fontSize: fontSizes.h1
                        }}
                        >Bộ lọc</Text>
                        <TouchableOpacity onPress={() => resetFilter()}>
                            <Text style={{
                                color: colors.primary,
                                fontFamily: fonts.MontserratBold,
                                fontSize: fontSizes.h4
                            }}
                                numberOfLines={1}
                                ellipsizeMode='tail'
                            >Đặt lại</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Filter menu */}
                    <View style={styles.separator}></View>
                    <ScrollView>
                        <View style={{
                            paddingVertical: 15
                        }}>
                            <Text style={styles.filterTitle}>Sắp xếp</Text>
                            <View style={styles.filterPillsContainer}>
                                {sortOrders.map(item =>
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[{
                                            borderColor: item.id == selectedSortOrder ? 'black' : colors.darkGrey,
                                        }, styles.filterPill]}
                                        onPress={() => {
                                            setSelectedSortOrder(item.id);
                                        }}>
                                        <Text style={[{
                                            fontFamily: item.id == selectedSortOrder ? fonts.MontserratBold : fonts.MontserratMedium,
                                        }, styles.filterPillText]}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                        <View style={styles.separator}></View>
                        <View style={{
                            paddingVertical: 15
                        }}>
                            <Text style={styles.filterTitle}>Danh mục</Text>
                            <View style={styles.filterPillsContainer}>
                                {categories.map(item =>
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[{
                                            borderColor: item.id == selectedCategory ? 'black' : colors.darkGrey,
                                        }, styles.filterPill]}
                                        onPress={() => {
                                            setSelectedCategory(item.id);
                                        }}>
                                        <Text style={[{
                                            fontFamily: item.id == selectedCategory ? fonts.MontserratBold : fonts.MontserratMedium
                                        }, styles.filterPillText]}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                        <View style={styles.separator}></View>
                        <View style={{
                            paddingVertical: 15
                        }}>
                            <Text style={styles.filterTitle}>Chất liệu</Text>
                            <View style={styles.filterPillsContainer}>
                                {materials.map(item =>
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[{
                                            borderColor: item.id == selectedMaterial ? 'black' : colors.darkGrey
                                        }, styles.filterPill]}
                                        onPress={() => {
                                            setSelectedMaterial(item.id);
                                        }}>
                                        <Text style={[{
                                            fontFamily: item.id == selectedMaterial ? fonts.MontserratBold : fonts.MontserratMedium
                                        }, styles.filterPillText]}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                        <View style={styles.separator}></View>
                        <View style={{
                            paddingVertical: 15
                        }}>
                            <Text style={styles.filterTitle}>Giá thành (VNĐ)</Text>
                            <View style={styles.priceContainer}>
                                <View>
                                    <TextInput style={styles.priceInput} value={selectedPriceMin}
                                        keyboardType='number-pad'
                                        onChangeText={(text) => setSelectedPriceMin(text)} />
                                    <Text style={styles.priceLabel}>Thấp nhất</Text>
                                </View>
                                <View style={{
                                    height: 1.2,
                                    width: 10,
                                    backgroundColor: 'black',
                                }}></View>
                                <View>
                                    <TextInput style={styles.priceInput} value={selectedPriceMax}
                                        keyboardType='number-pad'
                                        onChangeText={(text) => setSelectedPriceMax(text)} />
                                    <Text style={styles.priceLabel}>Cao nhất</Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Show result button */}
                    <View style={styles.separator}></View>
                    <TouchableOpacity style={[styles.primaryButton, {
                        backgroundColor: isLoading ? colors.grey : colors.primary,
                    }]}
                        disabled={isLoading}
                        onPress={() => filter()}>
                        <Text style={[styles.primaryButtonText, {
                            color: isLoading ? colors.darkGreyText : 'white',
                        }]}>Hiện kết quả</Text>
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
    iconButton: {
        padding: 12,
        borderRadius: 5,
        backgroundColor: colors.grey
    },
    titleContainer: {
        height: 70,
        flexDirection: 'row',
        paddingLeft: 15,
        paddingRight: 10,
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    titleText: {
        color: 'black',
        fontFamily: fonts.MontserratBold,
        fontSize: fontSizes.h1,
        alignSelf: 'center',
        flex: 1,
        marginRight: 10,
        marginLeft:5
    },
    titleButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8
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
        marginBottom: 15
    },
    filterPillsContainer: {
        flexWrap: 'wrap',
        flexDirection: 'row',
        paddingLeft: 5
    },
    filterPill: {
        backgroundColor: colors.grey,
        paddingHorizontal: 15,
        height: 35,
        marginHorizontal: 4,
        marginBottom: 8,
        borderRadius: 25,
        borderWidth: 1,
        justifyContent: 'center'
    },
    filterPillText: {
        fontSize: fontSizes.h5,
        color: 'black'
    },
    priceContainer: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        gap: 10,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    priceInput: {
        borderBottomWidth: 1,
        borderBottomColor: 'black',
        width: 120,
        paddingBottom: 0,
        fontSize: fontSizes.h3,
        fontFamily: fonts.MontserratMedium,
        color: 'black'
    },
    priceLabel: {
        fontSize: fontSizes.h6,
        fontFamily: fonts.MontserratMedium,
        color: 'black',
        marginTop: 5
    },
    primaryButton: {
        borderRadius: 5,
        paddingVertical: 10,
        marginHorizontal: 15,
        marginVertical: 10
    },
    primaryButtonText: {
        fontSize: fontSizes.h4,
        fontFamily: fonts.MontserratBold,
        textAlign: 'center'
    },
    sortModal: {
        backgroundColor: 'white',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25
    },
    sortModalTitle: {
        color: 'black',
        fontSize: fontSizes.h3,
        fontFamily: fonts.MontserratBold,
        marginLeft: 20,
        marginVertical: 20
    },
    sortModalOptionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 30,
        marginVertical: 20,
        paddingHorizontal: 10
    },
    radioButtonOuter: {
        height: 20,
        width: 20,
        borderWidth: 2,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center'
    },
    radioButtonInner: {
        height: 10,
        width: 10,
        borderRadius: 30
    },
    radioText: {
        color: 'black',
        fontSize: fontSizes.h3,
        fontFamily: fonts.MontserratMedium
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
        paddingHorizontal: 3
    }
});


export default Listing;