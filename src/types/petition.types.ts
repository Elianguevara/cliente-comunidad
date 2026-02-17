// 1. Interfaz para lo que RECIBES del Backend (GET)
export interface PetitionResponse {
  idPetition: number;
  description: string;
  typePetitionName: string; 
  professionName: string;   
  stateName: string;        
  dateSince: string;        
  dateUntil: string;
  customerId?: number;
  customerName: string;
  customerImage?: string | null;
  cityName: string;
  // --- NUEVO CAMPO ---
  imageUrl?: string | null; // Puede venir nula si el cliente no subió foto
}

// 2. Interfaz para lo que ENVÍAS al Backend (POST/PUT)
export interface PetitionRequest {
  description: string;
  idTypePetition: number;
  idProfession: number;
  idCity: number;
  dateUntil: string; 
  // --- NUEVO CAMPO ---
  imageUrl?: string; // Es opcional (?)
}
