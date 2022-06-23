export interface UserListParams {
  page?: number;
  perPage?: number;
  isAdmin?: boolean;
  query?: string;
  credit?: number;
}

export interface UserListResponse {
  users: UserDetailResponse[];
  total: number;
}

export interface UserDetailResponse {
  id: number;
  username: string;
  realname: string;
  phone: string;
  email: string;
  isAdmin: boolean;
  credit: number;
  lastUpdate: string | null;
}

export interface UserUpdateBody {
  username: string;
  realname: string;
  phone: string;
  email: string;
  isAdmin: boolean;
};

export interface UserUpdateResponse extends UserUpdateBody {
  id: number;
};

export interface UserDeleteResponse extends UserUpdateResponse {};

export interface UserSetAdminParams {
  username?: string;
}
