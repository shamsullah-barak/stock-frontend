import { createSlice } from '@reduxjs/toolkit';

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    categories: [],
  },
  reducers: {
    setCategories(state, { payload, type }) {
      state.categories = payload;
    },
    getCategories(state) {
      return state.categories;
    },
  },
});

export const categoryActions = categorySlice.actions;
export default categorySlice.reducer;
