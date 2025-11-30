import { createSlice } from '@reduxjs/toolkit';

const stockRequestSlice = createSlice({
  name: 'stockRequests',
  initialState: {
    requests: [],
    loading: false,
    error: null,
  },
  reducers: {
    setRequests(state, { payload }) {
      state.requests = payload;
    },
    addRequest(state, { payload }) {
      state.requests.push(payload);
    },
    updateRequest(state, { payload }) {
      const index = state.requests.findIndex((request) => request.id === payload.id);
      if (index !== -1) {
        state.requests[index] = payload;
      }
    },
    removeRequest(state, { payload }) {
      state.requests = state.requests.filter((request) => request.id !== payload);
    },
    setLoading(state, { payload }) {
      state.loading = payload;
    },
    setError(state, { payload }) {
      state.error = payload;
    },
  },
});

export const stockRequestActions = stockRequestSlice.actions;
export default stockRequestSlice.reducer;

