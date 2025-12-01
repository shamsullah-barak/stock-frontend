import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {
    setUsers(state, { payload }) {
      state.users = payload;
    },
    addUser(state, { payload }) {
      state.users.push(payload);
    },
    updateUser(state, { payload }) {
      const index = state.users.findIndex((user) => user.id === payload.id || user._id === payload._id);
      if (index !== -1) {
        state.users[index] = payload;
      }
    },
    removeUser(state, { payload }) {
      state.users = state.users.filter((user) => (user.id || user._id) !== payload);
    },
    setLoading(state, { payload }) {
      state.loading = payload;
    },
    setError(state, { payload }) {
      state.error = payload;
    },
  },
});

export const userActions = userSlice.actions;
export default userSlice.reducer;
