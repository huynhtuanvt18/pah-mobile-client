// Condition number to text
export const conditionText = (conditionNumber) => {
    let result = 'Mới tinh'
    switch (conditionNumber) {
        case 2:
            result = 'Mới'
            break;
        case 3:
            result = 'Đã qua sử dụng'
            break;
        case 4:
            result = 'Cũ'
            break;
        case 5:
            result = 'Cổ'
            break;
    }
    return result;
}