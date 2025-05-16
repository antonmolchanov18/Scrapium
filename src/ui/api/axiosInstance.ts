import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://7e3f-159-224-217-28.ngrok-free.app/',
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
