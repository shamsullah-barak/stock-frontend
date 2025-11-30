import axios from 'axios';
import { apiUrl, routes } from '../../constants';
import { categoryActions } from './categories';
import { stockActions } from './stocks';
import { stockRequestActions } from './stockRequests';
import { provinceActions } from './provinces';

export const fetchCategories = () => {
  return async (dispatch, getState) => {
    try {
      const response = await axios.get(apiUrl(routes.CATEGORY), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = response.data.map((item) => {
        return {
          ...item,
          path: `/category/${item.id}`,
        };
      });
      dispatch(categoryActions.setCategories(data));
    } catch (error) {
      console.log(error);
    }
  };
};

// Stock Actions
export const fetchCustomerStocks = (customerId, provinceId, token) => {
  return async (dispatch, getState) => {
    try {
      dispatch(stockActions.setLoading(true));
      const response = await axios.get(apiUrl(routes.STOCK), {
        params: { customerId, provinceId },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(stockActions.setStocks(response.data.results || response.data));
      dispatch(stockActions.setLoading(false));
    } catch (error) {
      dispatch(stockActions.setError(error.message));
      dispatch(stockActions.setLoading(false));
      throw error;
    }
  };
};

export const createStockRequest = (requestData, token) => {
  return async (dispatch, getState) => {
    try {
      const response = await axios.post(apiUrl(routes.STOCK_REQUEST), requestData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(stockRequestActions.addRequest(response.data));
      return response.data;
    } catch (error) {
      throw error;
    }
  };
};

export const fetchStockRequests = (provinceId, status = 'pending', token) => {
  return async (dispatch, getState) => {
    try {
      dispatch(stockRequestActions.setLoading(true));
      const params = { provinceId };
      if (status) {
        params.status = status;
      }
      const response = await axios.get(apiUrl(routes.STOCK_REQUEST), {
        params,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(stockRequestActions.setRequests(response.data.results || response.data));
      dispatch(stockRequestActions.setLoading(false));
    } catch (error) {
      dispatch(stockRequestActions.setError(error.message));
      dispatch(stockRequestActions.setLoading(false));
      throw error;
    }
  };
};

export const updateStockRequest = (requestId, status, token) => {
  return async (dispatch, getState) => {
    try {
      const response = await axios.patch(
        apiUrl(routes.STOCK_REQUEST, requestId),
        { status },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(stockRequestActions.updateRequest(response.data));
      return response.data;
    } catch (error) {
      throw error;
    }
  };
};

// Province Actions
export const fetchProvinces = (token) => {
  return async (dispatch, getState) => {
    try {
      dispatch(provinceActions.setLoading(true));
      const response = await axios.get(apiUrl(routes.PROVINCE), {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(provinceActions.setProvinces(response.data.results || response.data));
      dispatch(provinceActions.setLoading(false));
    } catch (error) {
      dispatch(provinceActions.setError(error.message));
      dispatch(provinceActions.setLoading(false));
      throw error;
    }
  };
};

export const createProvince = (provinceData, token) => {
  return async (dispatch, getState) => {
    try {
      const response = await axios.post(apiUrl(routes.PROVINCE), provinceData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(provinceActions.addProvince(response.data));
      return response.data;
    } catch (error) {
      throw error;
    }
  };
};

export const updateProvince = (provinceId, provinceData, token) => {
  return async (dispatch, getState) => {
    try {
      const response = await axios.patch(apiUrl(routes.PROVINCE, provinceId), provinceData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(provinceActions.updateProvince(response.data));
      return response.data;
    } catch (error) {
      throw error;
    }
  };
};

export const deleteProvince = (provinceId, token) => {
  return async (dispatch, getState) => {
    try {
      await axios.delete(apiUrl(routes.PROVINCE, provinceId), {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(provinceActions.removeProvince(provinceId));
    } catch (error) {
      throw error;
    }
  };
};
