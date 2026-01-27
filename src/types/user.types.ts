// En src/types/user.types.ts
export interface UserProfile {
  id: number;
  name: string;
  lastname: string;
  email: string;
  role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN'; // Ajustado a lo que envía Java
  profileImage?: string;
  
  // Campos específicos (pueden venir null desde Java)
  phone?: string;
  description?: string;
  profession?: string;
  address?: string;

  // Estadísticas
  stats: {
    label: string;
    value: string;
  }[];
}