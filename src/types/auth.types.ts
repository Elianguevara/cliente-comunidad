// Basado en tu AuthenticationRequest.java
export interface LoginRequest {
  email: string;
  password: string;
}

// Basado en tu RegisterRequest.java
export interface RegisterRequest {
  name: string;
  lastname: string;
  email: string;
  password: string;
  role: 'CUSTOMER' | 'PROVIDER'; // Limitamos los roles a lo que tu Java espera
}

// Basado en tu AuthenticationResponse.java
export interface AuthResponse {
  token: string;
  role: 'CUSTOMER' | 'PROVIDER'; // <--- Nuevo campo
  name: string; 
  email: string;
}