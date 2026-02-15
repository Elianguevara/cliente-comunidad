export interface ProviderPublicProfile {
  idProvider: number;
  userId: number;
  name: string;
  lastname: string;
  email: string; // Opcional, dependiendo de la privacidad
  profileImage: string | null;
  biography?: string;
  professions: string[]; // Ej: ["Plomero", "Electricista"]
  cities: string[];      // Ej: ["Mendoza Capital", "Godoy Cruz"]
  rating: number;        // Promedio
  totalReviews: number;  // Cantidad de reseñas
}