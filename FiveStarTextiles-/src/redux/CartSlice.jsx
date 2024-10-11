import { createSlice } from '@reduxjs/toolkit'
const initialState = JSON.parse(localStorage.getItem('cart')) ?? [];

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart(state, action) {
            state.push(action.payload)
        },
        deleteFromCart(state, action) {
            return state.filter(item => item.id != action.payload.id);
        },
        updateQuantity: (state, action) => {
            const { id, quantity } = action.payload;
            const itemToUpdate = state.find(item => item.id === id);
            if (itemToUpdate) {
                itemToUpdate.quantity = quantity;
            }
        }
    }
})

export const { addToCart, deleteFromCart, updateQuantity } = cartSlice.actions

export default cartSlice.reducer;