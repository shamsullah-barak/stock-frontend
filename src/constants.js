const backendApiUrl = 'https://stock-backend-l9bt.onrender.com/api';

const routes = {
  AUTH: 'auth',
  USER: 'users',
  STOCK: 'stocks',
  STOCK_REQUEST: 'stock-requests',
  PROVINCE: 'provinces',
  ORDER: 'orders',
  TRANSACTION: 'transactions',
};

const methods = {
  GET: 'get',
  POST: 'add',
  PUT: 'update',
  DELETE: 'delete',
};

const apiUrl = (route, id = '') => `${backendApiUrl}/${route}${id && `/${id}`}`;

module.exports = { routes, methods, apiUrl, backendApiUrl };
