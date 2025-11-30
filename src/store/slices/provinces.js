import { createSlice } from '@reduxjs/toolkit';

const provinceSlice = createSlice({
  name: 'provinces',
  initialState: {
    provinces: [],
    loading: false,
    error: null,
  },
  reducers: {
    setProvinces(state, { payload }) {
      state.provinces = payload;
    },
    addProvince(state, { payload }) {
      state.provinces.push(payload);
    },
    updateProvince(state, { payload }) {
      const index = state.provinces.findIndex((province) => province.id === payload.id || province._id === payload._id);
      if (index !== -1) {
        state.provinces[index] = payload;
      }
    },
    removeProvince(state, { payload }) {
      state.provinces = state.provinces.filter((province) => (province.id || province._id) !== payload);
    },
    setLoading(state, { payload }) {
      state.loading = payload;
    },
    setError(state, { payload }) {
      state.error = payload;
    },
  },
});

export const provinceActions = provinceSlice.actions;
export default provinceSlice.reducer;

