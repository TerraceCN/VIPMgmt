export interface LoginBody {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  info: {
    id: number;
    username: string;
    realname: string;
    phone: string;
    email: string;
    isAdmin: boolean;
  };
}

export interface RegisterBody {
  username: string;
  password: string;
  realname: string;
  phone: string;
  email: string;
}

export interface RegisterResponse extends LoginResponse {}

export interface sendPasswordResetEmailParams {
  email?: string;
}

export interface resetPasswordBody {
  token: string;
  password: string;
}
