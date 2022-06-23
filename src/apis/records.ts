import { axiosInstance } from '.';

import {
  UserRecordListParams,
  UserRecordListResponse,
  RecordListParams,
  RecordListResponse,
  UserRecordCreateBody,
  UserRecordCreateResponse,
  RecordDeleteResponse,
} from '../../interfaces/records';

export async function getUserRecordList(
  userId: number,
  params: UserRecordListParams
): Promise<UserRecordListResponse> {
  const response = await axiosInstance.get(`/users/${userId}/records`, { params });
  return response.data;
}

export async function getRecordList(
  params: RecordListParams
): Promise<RecordListResponse> {
  const response = await axiosInstance.get('/records', { params });
  return response.data;
}

export async function createUserRecord(
  userId: number,
  body: UserRecordCreateBody
): Promise<UserRecordCreateResponse> {
  const response = await axiosInstance.post(`/users/${userId}/records`, body);
  return response.data;
}

export async function deleteRecord(
  userId: number,
): Promise<RecordDeleteResponse> {
  const response = await axiosInstance.delete(`/records/${userId}`);
  return response.data;
}