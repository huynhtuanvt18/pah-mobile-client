async function getFeedbacksByProductId(axiosContext, product_id) {
    const feedbackPath = `/feedback/product?productId=${product_id}&PageSize=50`;

    try {
        let result = [];
        let responseData = await axiosContext.publicAxios.get(feedbackPath);
        responseData.data.data.forEach(function (item) {
            let myObject = {};
            myObject.id = item.id;
            myObject.productId = item.productId;
            myObject.buyerId = item.buyerId;
            myObject.ratings = item.ratings;
            myObject.buyerFeedback = item.buyerFeedback;
            myObject.status = item.status;
            myObject.timestamp = item.timestamp;
            myObject.buyerName = item.buyerName;
            myObject.response = item.response;
            result.push(myObject);
        })

        return result;
    } catch (error) {
        throw error;
    }
}

async function createFeedback(axiosContext, feedback) {
    const feedbackPath = `/feedback`;

    try {
        let responseData = await axiosContext.authAxios.post(feedbackPath, feedback);
        if (responseData.status != 200) {
            throw responseData.message;
        }
        let responseAddress = responseData.data.data;
        return responseAddress;
    } catch (error) {
        throw error;
    }
}

export default {
    getFeedbacksByProductId,
    createFeedback
}