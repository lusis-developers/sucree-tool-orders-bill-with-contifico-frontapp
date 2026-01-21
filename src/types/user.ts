export interface User {
  _id: string
  name: string
  email: string
  role: 'admin' | 'sales' | 'production'
  createdAt?: string
  updatedAt?: string
}

export interface LoginResponse {
  token: string
  user: User
}
