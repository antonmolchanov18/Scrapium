// src/api/auth.ts
import axiosInstance from './axiosInstance';

export const register = async (username: string, password: string) => {
  console.log(username, password);
  
  try {
    const response = await axiosInstance.post('/register', {
      username,
      password,
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error('Register error response:', error.response.data);
    } else if (error.request) {
      console.error('Register error request:', error.request);
    } else {
      console.error('Register error message:', error.message);
    }
    throw error;
  }
};

export const login = async (username: string, password: string) => {
  try {
    const response = await axiosInstance.post('/login', {
      username,
      password,
    });
    return response.data.token; // Припускаємо, що сервер повертає токен
  } catch (error) {
    throw error;
  }
};
