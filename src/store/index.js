import { configureStore } from '@reduxjs/toolkit';

import categoryReducer from './slices/categories';
import stockReducer from './slices/stocks';
import stockRequestReducer from './slices/stockRequests';
import provinceReducer from './slices/provinces';

const store = configureStore({
  reducer: {
    categories: categoryReducer,
    stocks: stockReducer,
    stockRequests: stockRequestReducer,
    provinces: provinceReducer,
  },
});

export default store;
