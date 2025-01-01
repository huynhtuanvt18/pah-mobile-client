// Condition number to text
export const transactionTypeText = (transactionType) => {
    let result = 'Tất cả'
    switch (transactionType) {
        case 0:
            result = 'Tất cả'
            break;
        case 1:
            result = 'Nạp tiền'
            break;
        case 2:
            result = 'Rút tiền'
            break;
        case 3:
            result = 'Thanh toán'
            break;
        case 4:
            result = 'Hoàn trả'
            break;
    }
    return result;
}