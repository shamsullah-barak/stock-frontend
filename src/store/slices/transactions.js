import { createSlice } from '@reduxjs/toolkit';

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: {
    transactions: [],
    balance: {
      balance: 0,
      calculatedBalance: 0,
      customer: null,
    },
    loading: false,
    error: null,
  },
  reducers: {
    setTransactions(state, { payload }) {
      state.transactions = payload;
    },
    addTransaction(state, { payload }) {
      state.transactions.unshift(payload);
    },
    setBalance(state, { payload }) {
      state.balance = payload;
    },
    updateBalance(state, { payload }) {
      state.balance.balance = payload;
    },
    setLoading(state, { payload }) {
      state.loading = payload;
    },
    setError(state, { payload }) {
      state.error = payload;
    },
  },
});

export const transactionActions = transactionSlice.actions;
export default transactionSlice.reducer;

