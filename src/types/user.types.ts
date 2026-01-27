export interface UserProfile {
  id: number;
  name: string;
  lastname: string;
  email: string;
  role: string;
  phone?: string;       // Ahora vendrá real del backend
  description?: string; // Nuevo campo
  profession?: string;  // Nuevo campo
  profileImage?: string; 
  stats: {
    label: string;
    value: string;
  }[];
}