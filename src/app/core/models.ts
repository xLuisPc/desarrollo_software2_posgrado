export interface University {
  id: string;
  name: string;
  country: string;
  countryLabel: string;
  code: string;
  domain: string;
  website: string | null;
  state: string | null;
  city: string | null;
  cityId: string | null;
}
export interface City {
  id: string;
  name: string;
  country: string;
  code: string;
  lat: number;
  lon: number;
}
export interface Config {
  weatherDemo: boolean;
  universitiesDemo: boolean;
  countries: { name: string; label: string; code: string }[];
  cities: City[];
}
export interface UniversityResponse {
  items: University[];
  source: 'live' | 'snapshot';
  message: string;
  snapshotDate: string | null;
}
export interface ForecastDay {
  date: string;
  min: number;
  max: number;
  rain: number;
  description: string;
  icon: string;
  slots: number;
}
export interface Weather {
  source: 'live' | 'demo';
  city: City;
  observedAt: string | null;
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    wind: number;
    description: string;
    icon: string;
  };
  forecast: ForecastDay[];
}
