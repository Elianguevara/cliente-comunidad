// src/types/user.types.ts
export interface UserProfile {
  id: number;
  providerId?: number; // <--- NUEVO
  customerId?: number; // <--- NUEVO
  name: string;
  lastname: string;
  email: string;
  role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
  profileImage?: string;
  
  phone?: string;
  description?: string;
  profession?: string;
  address?: string;

  stats: {
    label: string;
    value: string;
  }[];
}