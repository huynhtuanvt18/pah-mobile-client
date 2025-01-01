// Condition number to text
export const paymentMethodText = (paymentMethod) => {
    let result = 'Ví PAH'
    switch (paymentMethod) {
        case 1:
            result = 'Ví PAH'
            break;
        case 2:
            result = 'Zalopay'
            break;
    }
    return result;
}