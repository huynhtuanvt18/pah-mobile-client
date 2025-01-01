import { pageParameters } from "../constants";

async function getAllOrderCurrentBuyer(axiosContext, status, pageNumber = 1) {
  let statusString = "";
  status.forEach(item => {
    statusString = statusString.concat(`Status=${item}&`)
  })
  const orderPath = `/buyer/order?${statusString}PageSize=${pageParameters.DEFAULT_PAGE_SIZE}&PageNumber=${pageNumber}`;
  try {
    let result = [];
    let responseData = await axiosContext.authAxios.get(orderPath);
    responseData.data.data.forEach(function (responseOrder) {
      let order = {};
      order.id = responseOrder.id;
      order.buyerId = responseOrder.buyerId;
      order.sellerId = responseOrder.sellerId;
      order.recipientName = responseOrder.recipientName;
      order.recipientPhone = responseOrder.recipientPhone;
      order.recipientAddress = responseOrder.recipientAddress;
      order.orderDate = responseOrder.orderDate;
      order.totalAmount = responseOrder.totalAmount;
      order.shippingCost = responseOrder.shippingCost;
      order.status = responseOrder.status;
      order.seller = responseOrder.seller;
      order.orderItems = responseOrder.orderItems || [];
      order.orderShippingCode = responseOrder.orderShippingCode;

      result.push(order);
    });

    return result;
  } catch (error) {
    throw error;
  }
}

async function getAllOrderCurrentSeller(axiosContext, status, pageNumber = 1) {
  let statusString = "";
  status.forEach(item => {
    statusString = statusString.concat(`Status=${item}&`)
  })
  const orderPath = `/seller/order?${statusString}PageSize=${pageParameters.DEFAULT_PAGE_SIZE}&PageNumber=${pageNumber}`;
  try {
    let result = [];
    let responseData = await axiosContext.authAxios.get(orderPath);
    responseData.data.data.forEach(function (responseOrder) {
      let order = {};
      order.id = responseOrder.id;
      order.buyerId = responseOrder.buyerId;
      order.sellerId = responseOrder.sellerId;
      order.recipientName = responseOrder.recipientName;
      order.recipientPhone = responseOrder.recipientPhone;
      order.recipientAddress = responseOrder.recipientAddress;
      order.orderDate = responseOrder.orderDate;
      order.totalAmount = responseOrder.totalAmount;
      order.shippingCost = responseOrder.shippingCost;
      order.status = responseOrder.status;
      order.seller = responseOrder.seller;
      order.orderItems = responseOrder.orderItems || [];
      order.orderShippingCode = responseOrder.orderShippingCode;

      result.push(order);
    });

    return result;
  } catch (error) {
    throw error;
  }
}

async function getOrderDetail(axiosContext, id) {
  const orderPath = `/order/${id}`;
  try {
    let responseData = await axiosContext.authAxios.get(orderPath);
    if (responseData.status != 200) {
      throw responseData.message;
    }
    let responseOrder = responseData.data.data;
    let order = {};

    order.id = responseOrder.id;
    order.buyerId = responseOrder.buyerId;
    order.sellerId = responseOrder.sellerId;
    order.recipientName = responseOrder.recipientName;
    order.recipientPhone = responseOrder.recipientPhone;
    order.recipientAddress = responseOrder.recipientAddress;
    order.orderDate = responseOrder.orderDate;
    order.totalAmount = responseOrder.totalAmount;
    order.shippingCost = responseOrder.shippingCost;
    order.status = responseOrder.status;
    order.seller = responseOrder.seller;
    order.orderItems = responseOrder.orderItems || [];
    order.orderShippingCode = responseOrder.orderShippingCode;
    order.orderCancellation=responseOrder.orderCancellation

    return order;
  } catch (error) {
    throw error;
  }
}

async function checkout(axiosContext, cartInfo) {
  const orderPath = `/buyer/checkout`;
  try {
    let responseData = await axiosContext.authAxios.post(orderPath, cartInfo);
    if (responseData.status != 200) {
      throw responseData.message;
    }
    let response = responseData.data.data;

    return response;
  } catch (error) {
    throw error;
  }
}

async function sellerConfirm(axiosContext, orderId, confirmInfo) {
  const orderPath = `/seller/order/${orderId}`;
  try {
    let responseData = await axiosContext.authAxios.post(orderPath, confirmInfo);
    if (responseData.status != 200) {
      throw responseData.message;
    }
    let response = responseData.data.data;

    return response;
  } catch (error) {
    throw error;
  }
}

async function defaultShippingOrder(axiosContext, orderId) {
  const orderPath = `/seller/order/deliver/${orderId}`;
  try {
    let responseData = await axiosContext.authAxios.post(orderPath);
    if (responseData.status != 200) {
      throw responseData.message;
    }
    let response = responseData.data.data;

    return response;
  } catch (error) {
    throw error;
  }
}

async function orderComplete(axiosContext, orderId) {
  const orderPath = `/buyer/order/done/${orderId}`;
  try {
    let responseData = await axiosContext.authAxios.post(orderPath);
    if (responseData.status != 200) {
      throw responseData.message;
    }
    let response = responseData.data.data;

    return response;
  } catch (error) {
    throw error;
  }
}

async function orderCancelRequest(axiosContext, orderId) {
  const orderPath = `/buyer/order/cancelrequest/${orderId}`;
  try {
    let responseData = await axiosContext.authAxios.post(orderPath);
    if (responseData.status != 200) {
      throw responseData.message;
    }
    let response = responseData.data.data;

    return response;
  } catch (error) {
    throw error;
  }
}

async function orderApproveCancelRequest(axiosContext, orderId) {
  const orderPath = `/seller/order/cancelrequest/${orderId}`;
  try {
    let responseData = await axiosContext.authAxios.post(orderPath);
    if (responseData.status != 200) {
      throw responseData.message;
    }
    let response = responseData.data.data;

    return response;
  } catch (error) {
    throw error;
  }
}

export default {
  getAllOrderCurrentBuyer,
  getAllOrderCurrentSeller,
  getOrderDetail,
  checkout,
  sellerConfirm,
  defaultShippingOrder,
  orderComplete,
  orderCancelRequest,
  orderApproveCancelRequest,
};
