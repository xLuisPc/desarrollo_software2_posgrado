import { Component, inject, signal, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, combineLatest, switchMap, map } from 'rxjs';
import { ApiService } from '../core/api.service';
import { SavedService } from '../core/saved.service';
import { Config, University } from '../core/models';
import { WeatherPanelComponent } from '../shared/weather-panel.component';
import { IconComponent } from '../shared/icon.component';
@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [RouterLink, WeatherPanelComponent, IconComponent],
  template: `
    <a
      class="back-link"
      routerLink="/"
      [queryParams]="{ pais: university()?.country || 'Colombia' }"
      ><app-icon name="back" /> Volver a explorar</a
    >
    @if (loading()) {
      <div class="empty-state" role="status">
        <span class="spinner"></span>
        <p>Preparando tu destino…</p>
      </div>
    } @else if (error()) {
      <div class="empty-state" role="alert">
        <h1>No encontramos este destino</h1>
        <p>{{ error() }}</p>
        <button class="button primary" (click)="load()">Reintentar</button>
      </div>
    } @else if (university(); as u) {
      <div class="detail-hero">
        <span class="eyebrow">TU PRÓXIMA GRAN HISTORIA</span>
        <h1>{{ u.name }}</h1>
        <p>
          <app-icon name="pin" /> {{ u.countryLabel }} <span>·</span>
          {{ u.city ? u.city + ' (sede sugerida)' : 'Elige una ciudad para tu visita' }}
        </p>
        <div class="detail-actions">
          <button class="button primary" (click)="saved.toggleFavorite(u)">
            <app-icon [name]="saved.has(u.id) ? 'check' : 'heart'" />{{
              saved.has(u.id) ? 'Guardada en favoritas' : 'Guardar universidad'
            }}</button
          ><button class="button secondary" (click)="saved.toggleCompare(u)">
            <app-icon name="compare" />{{
              saved.isCompared(u.id) ? 'Quitar de comparación' : 'Agregar a comparación'
            }}
          </button>
        </div>
      </div>
      <div class="detail-layout">
        <div>
          <section class="content-panel">
            <span class="eyebrow">CONOCE TU DESTINO</span>
            <h2>Una puerta a nuevas posibilidades.</h2>
            <p>
              Explora su oferta académica y confirma los detalles de admisión directamente con la
              universidad.
            </p>
            <dl class="university-facts">
              <div>
                <dt>País</dt>
                <dd>{{ u.countryLabel }}</dd>
              </div>
              <div>
                <dt>Dominio institucional</dt>
                <dd>{{ u.domain || 'No disponible' }}</dd>
              </div>
              <div>
                <dt>Provincia / estado reportado por la API</dt>
                <dd>{{ u.state || 'No reportado' }}</dd>
              </div>
              <div>
                <dt>Fuente del directorio</dt>
                <dd>
                  {{
                    source() === 'live'
                      ? 'Universities API · Hipo'
                      : 'Copia de respaldo · Hipo (12 sep. 2026)'
                  }}
                </dd>
              </div>
            </dl>
            @if (u.website) {
              <a [href]="u.website" target="_blank" rel="noopener noreferrer" class="button primary"
                >Ir al sitio de la universidad <app-icon name="external"
              /></a>
            }
          </section>
          <section class="content-panel visit-checklist">
            <span class="eyebrow">ANTES DE SALIR</span>
            <h2>Tu checklist de explorador</h2>
            <p>Unos pequeños pasos para aprovechar tu visita. Puedes marcarlos mientras planeas.</p>
            @for (item of checklist; track item) {
              <label
                ><input type="checkbox" /> <span>{{ item }}</span></label
              >
            }
          </section>
          <div class="info-banner">
            <app-icon name="info" />
            <p>
              Hipolabs no proporciona coordenadas ni ciudades. El clima corresponde a la ciudad que
              selecciones, con coordenadas de nuestro catálogo local, y no a la ubicación exacta del
              campus. Si es una institución con varias sedes, confirma cuál vas a visitar.
            </p>
          </div>
        </div>
        @if (config(); as c) {
          <app-weather-panel [cities]="c.cities" [country]="u.country" [initialCity]="u.cityId" />
        }
      </div>
    }
  `,
})
export class DetailComponent implements OnDestroy {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  saved = inject(SavedService);
  private sub?: Subscription;
  university = signal<University | null>(null);
  config = signal<Config | null>(null);
  source = signal('');
  loading = signal(true);
  error = signal('');
  checklist = [
    'Confirmar la sede y el horario de atención',
    'Revisar programas y requisitos de admisión',
    'Consultar el clima y preparar la ruta',
    'Llevar mis preguntas para la visita',
  ];
  constructor() {
    this.load();
  }
  load() {
    this.sub?.unsubscribe();
    this.loading.set(true);
    this.error.set('');
    this.sub = combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(
        switchMap(([params, query]) => {
          this.loading.set(true);
          return combineLatest([
            this.api.config(),
            this.api.universities(query.get('pais') || 'Colombia'),
          ]).pipe(map(([config, data]) => ({ config, data, id: params.get('id') })));
        }),
      )
      .subscribe({
        next: ({ config, data, id }) => {
          this.config.set(config);
          this.source.set(data.source);
          this.university.set(data.items.find((u) => u.id === id) || null);
          this.error.set(
            this.university()
              ? ''
              : 'La universidad no aparece en el catálogo actual. Vuelve al explorador y elige otra opción.',
          );
          this.loading.set(false);
        },
        error: (e) => {
          this.error.set(e.error?.message || 'No pudimos conectar con el servidor.');
          this.loading.set(false);
        },
      });
  }
  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
