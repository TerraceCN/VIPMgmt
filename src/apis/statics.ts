import { axiosInstance } from '.';

import {
  StaticRecordParams,
  StaticRecordResponse,
} from '../../interfaces/statics';

export async function getStaticRecords(
  params: StaticRecordParams
): Promise<StaticRecordResponse> {
  const response = await axiosInstance.get('/statics/records', { params });
  return response.data;
}
