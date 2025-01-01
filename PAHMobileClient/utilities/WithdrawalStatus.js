export const withdrawalStatusText = (withdrawalStatus) => {
    let result = 'Tất cả'
    switch (withdrawalStatus) {
        case 0:
            result = 'Tất cả'
            break;
        case 1:
            result = 'Đang chờ'
            break;
        case 2:
            result = 'Hoàn thành'
            break;
        case 3:
            result = 'Từ chối'
            break;
    }
    return result;
}