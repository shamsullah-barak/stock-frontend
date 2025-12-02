import { createSlice } from '@reduxjs/toolkit';

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    sentOrders: [],
    receivedOrders: [],
    loading: false,
    error: null,
  },
  reducers: {
    setOrders(state, { payload }) {
      state.orders = payload;
    },
    setSentOrders(state, { payload }) {
      state.sentOrders = payload;
    },
    setReceivedOrders(state, { payload }) {
      state.receivedOrders = payload;
    },
    addOrder(state, { payload }) {
      if (payload) {
        state.orders.push(payload);
        // If it's a sent order (has sender_user_id matching current user), add to sentOrders
        state.sentOrders.push(payload);
      }
    },
    updateOrder(state, { payload }) {
      const index = state.orders.findIndex((order) => order.id === payload.id);
      if (index !== -1) {
        state.orders[index] = payload;
      }
      // Also update in sent/received arrays if present
      const sentIndex = state.sentOrders.findIndex((order) => order.id === payload.id);
      if (sentIndex !== -1) {
        state.sentOrders[sentIndex] = payload;
      }
      const receivedIndex = state.receivedOrders.findIndex((order) => order.id === payload.id);
      if (receivedIndex !== -1) {
        state.receivedOrders[receivedIndex] = payload;
      }
    },
    removeOrder(state, { payload }) {
      state.orders = state.orders.filter((order) => order.id !== payload);
      state.sentOrders = state.sentOrders.filter((order) => order.id !== payload);
      state.receivedOrders = state.receivedOrders.filter((order) => order.id !== payload);
    },
    setLoading(state, { payload }) {
      state.loading = payload;
    },
    setError(state, { payload }) {
      state.error = payload;
    },
  },
});

export const orderActions = orderSlice.actions;
export default orderSlice.reducer;

