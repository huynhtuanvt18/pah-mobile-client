import React, { useContext, useState, useEffect } from 'react';
import {
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { AxiosContext } from '../../context/AxiosContext';
import { colors, fontSizes, fonts } from '../../constants';
import IconFeather from 'react-native-vector-icons/Feather';
import { ListingDetailFeedback } from '../../components';
import { Feedback as FeedbackRepository } from '../../repositories';

function ListingFeedback(props) {

    //// AUTH AND NAVIGATION
    // Auth Context
    const authContext = useContext(AuthContext);
    const axiosContext = useContext(AxiosContext);

    // Navigation
    const { navigation, route } = props;

    // Function of navigate to/back
    const { navigate, goBack } = navigation;

    //// Data
    // Get product_id from routes
    const { product_id } = props.route.params;

    // Data for loading and refreshing
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Feedback list
    const [feedbacks, setFeedbacks] = useState([])

    //// FUNCTION
    function getFeedbacks() {
        setIsLoading(true);
        FeedbackRepository.getFeedbacksByProductId(axiosContext, product_id)
            .then(response => {
                setFeedbacks(response);
                setIsLoading(false);
            })
            .catch(error => {
                console.log(error);
                setIsLoading(false);
            })
    }

    useEffect(() => {
        getFeedbacks()
    }, []);

    // Scroll view refresh
    const onRefresh = () => {
        setRefreshing(true);
        getFeedbacks();
        setRefreshing(false);
    };

    return <View style={styles.container}>
        {/* Fixed screen title: Cart */}
        <View style={styles.titleContainer}>
            <TouchableOpacity style={styles.iconButton}
                onPress={() => {
                    goBack()
                }}>
                <IconFeather name="chevron-left" size={25} color={'black'} />
            </TouchableOpacity>
            <Text style={styles.titleText}>Tất cả phản hồi</Text>
        </View>
        {isLoading ? <View style={{
            flex: 1,
            justifyContent: 'center'
        }}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View> : <ScrollView style={{
            paddingHorizontal: 15
        }} refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
            <View style={{ marginTop: 5 }}>
                {(Array.isArray(feedbacks) && feedbacks.length) ? <View>
                    {feedbacks.map((feedback, index) =>
                        <ListingDetailFeedback feedback={feedback}
                            key={feedback.id}
                            index={index}
                            length={feedbacks.length - 1} />)}
                </View> : <View>
                    <Text style={styles.emptyText}>Không có phản hồi về sản phẩm này</Text>
                </View>}
            </View>
        </ScrollView>}
    </View>
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
        alignItems: 'center'
    },
    titleText: {
        color: 'black',
        fontFamily: fonts.MontserratBold,
        fontSize: fontSizes.h1,
        alignSelf: 'center',
        marginLeft:5,
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
    emptyText: {
        color: colors.greyText,
        fontSize: fontSizes.h4,
        textAlign: 'center',
        fontFamily: fonts.MontserratMedium,
        marginVertical: 30
    }
});

export default ListingFeedback;