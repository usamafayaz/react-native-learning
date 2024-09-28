import {createSlice} from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
  },
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.items.find(
        item => item.id === action.payload.id,
      );
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({...action.payload, quantity: 1});
      }
      // console.log('Current Cart:', state);
    },

    removeFromCart: (state, action) => {
      const existingItem = state.items.find(
        item => item.id === action.payload.id,
      );
      if (existingItem) {
        if (existingItem.quantity > 1) {
          existingItem.quantity -= 1;
          /* When we update existingItem.quantity, Redux Toolkit uses Immer to track changes. It lets us write 
          code that looks like it's directly mutating the state, but behind the scenes, it creates a new copy 
          of the state with our changes, ensuring immutability. No need to manually reassign the state. */
        } else {
          state.items = state.items.filter(
            item => item.id !== action.payload.id,
          );
        }
      }
    },
  },
});

export const {addToCart, removeFromCart} = cartSlice.actions;
export default cartSlice.reducer;
