import { createSlice } from '@reduxjs/toolkit';

const stockSlice = createSlice({
  name: 'stocks',
  initialState: {
    stocks: [],
    loading: false,
    error: null,
  },
  reducers: {
    setStocks(state, { payload }) {
      state.stocks = payload;
    },
    addStock(state, { payload }) {
      state.stocks.push(payload);
    },
    updateStock(state, { payload }) {
      const index = state.stocks.findIndex((stock) => stock.id === payload.id);
      if (index !== -1) {
        state.stocks[index] = payload;
      }
    },
    removeStock(state, { payload }) {
      state.stocks = state.stocks.filter((stock) => stock.id !== payload);
    },
    setLoading(state, { payload }) {
      state.loading = payload;
    },
    setError(state, { payload }) {
      state.error = payload;
    },
  },
});

export const stockActions = stockSlice.actions;
export default stockSlice.reducer;

