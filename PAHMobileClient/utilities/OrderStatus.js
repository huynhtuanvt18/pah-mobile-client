// Condition number to text
export const orderStatusText = (orderStatus) => {
    let result = 'Chờ thanh toán'
    switch (orderStatus) {
        case 2:
            result = 'Chờ lấy hàng'
            break;
        case 3:
            result = 'Đang vận chuyển'
            break;
        case 4:
            result = 'Đã vận chuyển'
            break;
        case 5:
            result = 'Chờ xác nhận'
            break;
        case 6:
            result = 'Hoàn thành'
            break;
        case 10:
            result = 'Chờ hủy'
            break;
        case 11:
            result = 'Người mua hủy'
            break;
        case 12:
            result = 'Người bán hủy'
            break;
    }
    return result;
}