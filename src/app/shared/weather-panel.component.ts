import { Component, Input, OnChanges, OnDestroy, inject, signal, computed } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService } from '../core/api.service';
import { City, Weather } from '../core/models';
import { IconComponent } from './icon.component';
@Component({
  selector: 'app-weather-panel',
  standalone: true,
  imports: [FormsModule, IconComponent, DecimalPipe, DatePipe],
  template: `
    <section class="weather-panel" aria-label="Clima de tu destino">
      <div class="section-eyebrow"><app-icon name="sun" /> EL CLIMA TE ACOMPAÑA</div>
      <h2>Prepara tu próxima visita.</h2>
      <label class="field-label" for="weather-city">Ciudad de visita</label
      ><select id="weather-city" [ngModel]="selectedCity" (ngModelChange)="changeCity($event)">
        @for (city of availableCities; track city.id) {
          <option [value]="city.id">{{ city.name }}</option>
        }
      </select>
      @if (loading()) {
        <div class="weather-loading" role="status">
          <span class="spinner"></span>Consultando el clima…
        </div>
      } @else if (error()) {
        <div class="weather-error" role="alert">
          <app-icon name="cloud" />
          <p>{{ error() }}</p>
          <button class="button secondary" (click)="load()">Reintentar</button>
        </div>
      } @else if (weather(); as w) {
        <div class="weather-source">
          <span class="status-dot" [class.demo-dot]="w.source === 'demo'"></span
          >{{ w.source === 'demo' ? 'Clima de demostración' : 'Datos de OpenWeather' }}
        </div>
        <div class="current-weather">
          <div>
            <span class="temperature">{{ w.current.temp }}<sup>°</sup></span
            ><span class="celsius">C</span>
            <p>{{ w.current.description }}</p>
          </div>
          <div class="weather-art"><app-icon [name]="weatherIcon(w.current.icon)" /></div>
        </div>
        <p class="feels-like">Sensación térmica de {{ w.current.feelsLike }} °C</p>
        <div class="weather-metrics">
          <div>
            <app-icon name="drop" /><span>{{ w.current.humidity }}%<small>Humedad</small></span>
          </div>
          <div>
            <app-icon name="wind" /><span
              >{{ w.current.wind * 3.6 | number: '1.0-0' }} km/h<small>Viento</small></span
            >
          </div>
        </div>
        <div class="forecast-heading"><strong>Próximos días</strong><span>mín / máx</span></div>
        <div class="forecast-list">
          @for (day of w.forecast; track day.date) {
            <div class="forecast-row">
              <span>{{ dayLabel(day.date) }}</span
              ><app-icon [name]="weatherIcon(day.icon)" /><small
                aria-label="Probabilidad de precipitación"
                >{{ day.rain }}%</small
              ><span
                ><span class="muted">{{ day.min }}°</span> / {{ day.max }}°</span
              >
            </div>
          }
        </div>
        @if (bestDay(); as day) {
          <div class="visit-tip">
            <app-icon name="compass" />
            <div>
              <strong>Un buen día para explorar</strong>
              <p>
                {{ dayLabel(day.date) }}: {{ day.rain }}% de probabilidad de lluvia entre los
                intervalos disponibles.
              </p>
            </div>
          </div>
        }
        <p class="weather-footnote">
          @if (w.source === 'demo') {
            Ejemplo ilustrativo del 14 al 18 sep. 2026. No es un pronóstico real.
          } @else {
            Actualizado {{ w.observedAt | date: 'shortTime' }} · OpenWeather. Rangos calculados de
            intervalos de 3 h; el primer y último día pueden ser parciales.
          }
        </p>
      }
    </section>
  `,
})
export class WeatherPanelComponent implements OnChanges, OnDestroy {
  @Input() cities: City[] = [];
  @Input() country = 'Colombia';
  @Input() initialCity: string | null = null;
  private api = inject(ApiService);
  private request?: Subscription;
  selectedCity = '';
  weather = signal<Weather | null>(null);
  loading = signal(false);
  error = signal('');
  bestDay = computed(() =>
    this.weather()?.forecast.reduce<Weather['forecast'][number] | null>(
      (best, day) => (!best || day.rain < best.rain ? day : best),
      null,
    ),
  );
  get availableCities() {
    return this.cities.filter((c) => c.country === this.country);
  }
  ngOnChanges() {
    this.selectedCity =
      this.availableCities.find((c) => c.id === this.initialCity)?.id ||
      this.availableCities[0]?.id ||
      '';
    this.load();
  }
  changeCity(id: string) {
    this.selectedCity = id;
    this.load();
  }
  load() {
    this.request?.unsubscribe();
    this.weather.set(null);
    this.error.set('');
    if (!this.selectedCity) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.request = this.api.weather(this.selectedCity).subscribe({
      next: (w) => {
        this.weather.set(w);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(
          e.error?.message ||
            'El servidor no está disponible. Ejecuta npm start e inténtalo de nuevo.',
        );
        this.loading.set(false);
      },
    });
  }
  dayLabel(date: string) {
    return new Intl.DateTimeFormat('es-CO', { weekday: 'short', day: 'numeric', timeZone: 'UTC' })
      .format(new Date(date + 'T12:00:00Z'))
      .replace('.', '');
  }
  weatherIcon(icon: string) {
    return ['09', '10', '11'].includes(icon.slice(0, 2))
      ? 'rain'
      : icon.startsWith('01') || icon.startsWith('02')
        ? 'sun'
        : 'cloud';
  }
  ngOnDestroy() {
    this.request?.unsubscribe();
  }
}
