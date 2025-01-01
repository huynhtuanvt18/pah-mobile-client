export default {
    auction: {
        Unavailable: -1,
        Pending: 0,
        Unassigned: 1,
        Assigned: 2,
        Rejected: 3,
        RegistrationOpen: 4,
        Opened: 5,
        Ended: 6,
        EndedWithoutBids: 7,
    },
    role: {
        Buyer: 1,
        Seller: 2,
        Administrator: 3,
        Manager: 4,
        Staff: 5
    },
    orderStatus: {
        Pending: 1,
        ReadyForPickup: 2,
        Delivering: 3,
        Delivered: 4,
        Done: 6,
        CancelApprovalPending: 10,
        CancelledBySeller: 12,
        CancelledByBuyer: 11,
        WaitingSellerConfirm: 5
    },
    productType: {
        ForSale: 1,
        Auction: 2,
    },
    addressType: {
        Delivery: 1,
        Pickup: 2
    },
    condition: {
        Mint: 1,
        NearMint: 2,
        VeryFine: 3,
        Good: 4,
        Poor: 5,
    },
    sellerStatus: {
        Pending: 1,
        Available: 2,
        Unavailable: 0,
    },
    bidStatus: {
        Active: 1,
        Retracted: 2,
        Register: 3,
        Refund: 4
    },
    paymentType: {
        Wallet: 1,
        Zalopay: 2
    }
}