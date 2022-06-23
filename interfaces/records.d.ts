export interface UserRecordListParams {
  page?: number;
  perPage?: number;
}

export interface UserRecordListItem {
  id: number;
  operatorId: number;
  operatorName: string;
  createdAt: string;
  creditChange: number;
  description: string;
}

export interface UserRecordListResponse {
  total: number;
  records: UserRecordListItem[];
}

export interface UserRecordCreateBody {
  creditChange: number;
  description: string;
}

export interface UserRecordCreateResponse {
  id: number;
  creditChange: number;
  description: string;
  before: number;
  after: number;
}

export interface RecordListParams extends UserRecordListParams {
  query?: string;
}

export interface RecordListItem extends UserRecordListItem {
  userId: number;
  userName: string;
}

export interface RecordListResponse {
  total: number;
  records: RecordListItem[];
}

export interface RecordDeleteResponse extends UserRecordListItem {}
