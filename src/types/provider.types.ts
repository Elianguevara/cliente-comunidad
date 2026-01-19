// src/types/provider.types.ts

export interface ProviderProfileRequest {
  idProfession: number;
  description?: string; // Es opcional en Java (no tiene @NotNull)
  cityIds: number[];    // List<Integer> en Java es number[] en TS
}