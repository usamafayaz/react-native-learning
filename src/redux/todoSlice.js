import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';

export const fetchTodos = createAsyncThunk(
  'fetchTodo',
  async (_, {rejectWithValue}) => {
    try {
      const response = await fetch(
        'https://jsonplaceholder.typicode.com/todos',
      );

      if (!response.ok) {
        // Manually reject the promise if response is not successful
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // rejectWithValue sends a custom error message to rejected case
      return rejectWithValue(error.message);
    }
  },
);

const todoSlice = createSlice({
  name: 'todo',
  initialState: {
    isLoading: false,
    data: [],
    error: '',
  },
  extraReducers: builder => {
    builder.addCase(fetchTodos.fulfilled, (state, action) => {
      state.isLoading = false;
      console.log('hey,', action.payload);

      state.data = action.payload;
    });

    builder.addCase(fetchTodos.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(fetchTodos.rejected, (state, action) => {
      console.log('Error Occurred:', action.payload);
      state.isLoading = false;
      state.error = action.payload || 'Something went wrong!';
    });
  },
});

export default todoSlice.reducer;
