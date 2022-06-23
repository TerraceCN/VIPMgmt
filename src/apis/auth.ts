import { axiosInstance } from '.';

import {
  LoginBody,
  LoginResponse,
  RegisterBody,
  RegisterResponse,
  sendPasswordResetEmailParams,
  resetPasswordBody,
} from '../../interfaces/auth';

export async function login(body: LoginBody): Promise<LoginResponse> {
  const response = await axiosInstance.post('/auth/login', body);
  return response.data;
}

export async function register(body: RegisterBody): Promise<RegisterResponse> {
  const response = await axiosInstance.post('/auth/register', body);
  return response.data;
}

export async function sendPasswordResetEmail(params: sendPasswordResetEmailParams): Promise<void> {
  await axiosInstance.get('/auth/sendPasswordResetEmail', { params });
}

export async function resetPassword(body: resetPasswordBody): Promise<void> {
  await axiosInstance.post('/auth/resetPassword', body);
}
