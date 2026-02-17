export interface CustomerPublicProfile {
  idCustomer: number;
  userId: number;
  name: string;
  lastname: string;
  email?: string;
  profileImage: string | null;
  biography?: string;
  city?: string;
  rating: number;
  totalReviews: number;
  completedPetitions?: number;
}
