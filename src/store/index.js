import { configureStore } from '@reduxjs/toolkit';

import categoryReducer from './slices/categories';
import stockReducer from './slices/stocks';
import stockRequestReducer from './slices/stockRequests';
import provinceReducer from './slices/provinces';
import customerReducer from './slices/customers';
import userReducer from './slices/users';

const store = configureStore({
  reducer: {
    categories: categoryReducer,
    stocks: stockReducer,
    stockRequests: stockRequestReducer,
    provinces: provinceReducer,
    customers: customerReducer,
    users: userReducer,
  },
});

export default store;
