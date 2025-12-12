import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD
  ? 'https://backend-the-candils.vercel.app/api'
  : 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor untuk menyisipkan token ke setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface User {
  userId: number;
  username: string;
  namaLengkap: string;
  role: string;
  password?: string; // Optional for create/update
}

export const getAllUsers = () => {
  return api.get<User[]>('/users');
};

export const createUser = (user: Omit<User, 'userId'>) => {
  return api.post('/users', user);
};

export const updateUser = (id: number, user: Partial<User>) => {
  return api.put(`/users/${id}`, user);
};

export const deleteUser = (id: number) => {
  return api.delete(`/users/${id}`);
};
