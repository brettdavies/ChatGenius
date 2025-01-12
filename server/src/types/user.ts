export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  name: string;
  picture?: string;
}

export interface UpdateUserData {
  name?: string;
  picture?: string;
} 