import axios from 'axios';
import Cookies from 'js-cookie';

export const axiosInstance = axios.create({
  baseURL: '/api',
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof config.headers === 'undefined') {
      config.headers = {};
    }
    config.headers['Authorization'] = 'Bearer ' + Cookies.get('token');
    return config;
  },
  (error) => { return Promise.reject(error); }
);

export function getErrorReason(error: any): string {
  if (error.response) {
    return error.response.data.reason;
  } else if (error.request) {
    return 'No response from server';
  } else {
    return error.message;
  }
}