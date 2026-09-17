import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config, UniversityResponse, Weather } from './models';
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  config() {
    return this.http.get<Config>('/api/config');
  }
  universities(country: string) {
    return this.http.get<UniversityResponse>('/api/universities', { params: { country } });
  }
  weather(city: string) {
    return this.http.get<Weather>('/api/weather', { params: { city } });
  }
}
