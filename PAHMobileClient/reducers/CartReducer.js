import { createSlice } from "@reduxjs/toolkit";

export const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        cart: [],
    },
    reducers: {
        addToCart: (state, action) => {
            const itemInCart = state.cart.find((item) => item.id == action.payload.id);
            if (itemInCart && itemInCart.amount < 5) {
                //itemInCart.amount++;
            } else {
                state.cart.push({ ...action.payload, amount: 1 })
            }
        },
        removeFromCart: (state, action) => {
            const removeFromCart = state.cart.filter((item) => item.id != action.payload.id);
            state.cart = removeFromCart;
        },
        changeQuantity: (state, action) => {
            const itemInCart = state.cart.find((item) => item.id == action.payload.id);
            if (itemInCart) {
                itemInCart.amount = action.payload.amount;
            }
        },
        emptyCart: (state, action) => {
            state.cart = [];
        }
    }
})

export const {addToCart, removeFromCart, changeQuantity, emptyCart} = cartSlice.actions;

export default cartSlice.reducer;