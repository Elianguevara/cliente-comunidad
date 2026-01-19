export interface UserProfile {
  id: number;
  name: string;
  lastname: string;
  email: string;
  role: 'CUSTOMER' | 'PROVIDER';
  phone?: string;       // Opcional
  location?: string;    // Opcional
  avatarUrl?: string;
  
  // Estadísticas (Diferentes según rol)
  stats: {
    label: string;
    value: string | number;
  }[];
}