// Add your TypeScript types/interfaces here as needed during the challenge

export interface ApiResponse {
  message: string;
}
export interface CityOption {
  cityName: string;
  latitude: number;
  longitude: number;
}

export interface Alert {
  cityName: string;
  alertSeverity: string;
  alertMessage: string;
}
