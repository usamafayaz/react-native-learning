import {configureStore} from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import todoReducer from './todoSlice';

const store = configureStore({
  reducer: {
    cart: cartReducer,
    todo: todoReducer,
  },
});

export default store;
