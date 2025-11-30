const backendApiUrl = 'http://localhost:5000/api';

const routes = {
  BACKUP: 'backup',
  AUTH: 'auth',
  USER: 'users',
  STOCK: 'stocks',
  STOCK_REQUEST: 'stock-requests',
  PROVINCE: 'provinces',
};

const methods = {
  GET: 'get',
  POST: 'add',
  PUT: 'update',
  DELETE: 'delete',
};

const apiUrl = (route, id = '') => `${backendApiUrl}/${route}${id && `/${id}`}`;

module.exports = { routes, methods, apiUrl };
