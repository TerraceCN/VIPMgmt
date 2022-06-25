export interface StaticRecordParams {
  from?: string;
  to?: string;
}

export interface StaticRecordResponse {
  labels: string[];
  sum: {
    positive: number[];
    negative: number[];
  };
  count: {
    positive: number[];
    negative: number[];
  };
}
