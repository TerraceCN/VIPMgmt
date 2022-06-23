import { axiosInstance } from '.';

import {
  UserListParams,
  UserListResponse,
  UserDetailResponse,
  UserUpdateBody,
  UserUpdateResponse,
  UserDeleteResponse,
  UserSetAdminParams,
} from '../../interfaces/users';

export async function getUserList(params: UserListParams): Promise<UserListResponse> {
  const response = await axiosInstance.get('/users', { params });
  return response.data;
}

export async function getUserDetail(id: number): Promise<UserDetailResponse> {
  const response = await axiosInstance.get(`/users/${id}`);
  return response.data;
}

export async function updateUser(id: number, body: UserUpdateBody): Promise<UserUpdateResponse> {
  const response = await axiosInstance.put(`/users/${id}`, body);
  return response.data;
}

export async function deleteUser(id: number): Promise<UserDeleteResponse> {
  const response = await axiosInstance.delete(`/users/${id}`);
  return response.data;
}

export async function setUserAdmin(params: UserSetAdminParams): Promise<void> {
  await axiosInstance.get('/users/setAdmin', { params });
}

export async function cancelUserAdmin(id: number): Promise<void> {
  await axiosInstance.get(`/users/${id}/cancelAdmin`);
}
