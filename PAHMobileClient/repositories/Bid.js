async function getBidsByAuctionId(axiosContext, auction_id, status) {
    const bidPath = `/bid/auction/${auction_id}?status=${status}&PageSize=50`;
    try {
        let result = [];
        let responseData = await axiosContext.publicAxios.get(bidPath);
        responseData.data.data.forEach(function (item) {
            let myObject = {};
            myObject.id = item.id;
            myObject.auctionId = item.auctionId;
            myObject.bidderId = item.bidderId;
            myObject.bidAmount = item.bidAmount;
            myObject.bidDate = item.bidDate;
            myObject.status = item.status;
            myObject.bidder = item.bidder;
            result.push(myObject);
        })
        return result;
    } catch (error) {
        throw error;
    }
}

async function registerAuction(axiosContext, auction_id) {
    const bidPath = `/bid/auction/register/${auction_id}`;

    try {
        let responseData = await axiosContext.authAxios.post(bidPath);
        return responseData;
    } catch (error) {
        throw error;
    }
}

async function placeBid(axiosContext, bidRequest) {
    const bidPath = `/bid`;
    try {
        let responseData = await axiosContext.authAxios.post(bidPath, bidRequest);
        if (responseData.status != 200) {
            throw responseData.message;
        }
        let responseBid = responseData.data.data;
        
        return responseBid;
    } catch (error) {
        throw error;
    }
}

export default {
    getBidsByAuctionId,
    registerAuction,
    placeBid
}