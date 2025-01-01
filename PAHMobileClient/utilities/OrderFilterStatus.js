import { enumConstants } from "../constants";

// Condition number to text
export const orderFilterStatusText = (orderStatus) => {
    let result = 'Chờ thanh toán'
    switch (true) {
        case orderStatus.includes(enumConstants.orderStatus.WaitingSellerConfirm):
            result = 'Chờ xác nhận'
            break;
        case orderStatus.includes(enumConstants.orderStatus.ReadyForPickup):
            result = 'Chờ lấy hàng'
            break;
        case orderStatus.includes(enumConstants.orderStatus.Delivering):
            result = 'Đang vận chuyển'
            break;
        case orderStatus.includes(enumConstants.orderStatus.Delivered):
            result = 'Hoàn thành'
            break;
        case orderStatus.includes(enumConstants.orderStatus.CancelApprovalPending):
            result = 'Chờ hủy'
            break;
        case orderStatus.includes(enumConstants.orderStatus.CancelledByBuyer):
            result = 'Đã hủy'
            break;
    }
    return result;
}