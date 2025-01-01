// Condition number to text
export const auctionStatusText = (auctionStatus) => {
    let result = 'Đã kết thúc'
    switch (auctionStatus) {
        case 0:
            result = 'Chờ duyệt'
            break;
        case 1:
            result = 'Chờ giao việc'
            break;
        case 2:
            result = 'Đang cập nhật'
            break;
        case 3:
            result = 'Bị từ chối'
            break;
        case 4:
            result = 'Sắp diễn ra'
            break;
        case 5:
            result = 'Đang diễn ra'
            break;
        case 6:
            result = 'Đã kết thúc'
            break;
        case 7:
            result = 'Đã kết thúc không giá thầu'
            break;
        case -1:
            result = 'All'
            break;
    }
    return result;
}