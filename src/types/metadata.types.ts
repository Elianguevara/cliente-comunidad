// Archivo: src/types/metadata.types.ts

export interface City {
  idCity: number; // Asegúrate de que coincida con tu @Id en Java
  name: string;
}

export interface Profession {
  idProfession: number;
  name: string;
}

export interface TypePetition {
  idTypePetition: number;
  typePetitionName: string; 
}