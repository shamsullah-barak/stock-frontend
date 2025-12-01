import { createSlice } from '@reduxjs/toolkit';

const customerSlice = createSlice({
  name: 'customers',
  initialState: {
    customers: [],
    loading: false,
    error: null,
  },
  reducers: {
    setCustomers(state, { payload }) {
      state.customers = payload;
    },
    addCustomer(state, { payload }) {
      state.customers.push(payload);
    },
    updateCustomer(state, { payload }) {
      const index = state.customers.findIndex((customer) => customer.id === payload.id || customer._id === payload._id);
      if (index !== -1) {
        state.customers[index] = payload;
      }
    },
    removeCustomer(state, { payload }) {
      state.customers = state.customers.filter((customer) => (customer.id || customer._id) !== payload);
    },
    setLoading(state, { payload }) {
      state.loading = payload;
    },
    setError(state, { payload }) {
      state.error = payload;
    },
  },
});

export const customerActions = customerSlice.actions;
export default customerSlice.reducer;
