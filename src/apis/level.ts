import { axiosInstance } from '.';

import {
  LevelResponse
} from '../../interfaces/level';

export async function getLevelList(): Promise<LevelResponse> {
  const response = await axiosInstance.get('/level');
  return response.data;
}
