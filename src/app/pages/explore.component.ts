import { Component, OnDestroy, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../core/api.service';
import { Config, UniversityResponse } from '../core/models';
import { IconComponent } from '../shared/icon.component';
import { UniversityCardComponent } from '../shared/university-card.component';
import { WeatherPanelComponent } from '../shared/weather-panel.component';
@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [FormsModule, IconComponent, UniversityCardComponent, WeatherPanelComponent],
  templateUrl: './explore.component.html',
})
export class ExploreComponent implements OnDestroy {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private subscriptions = new Subscription();
  private searchRequest?: Subscription;
  config = signal<Config | null>(null);
  response = signal<UniversityResponse | null>(null);
  loading = signal(true);
  error = signal('');
  country = signal('Colombia');
  query = signal('');
  sort = signal('name');
  city = signal('');
  page = signal(1);
  layout = signal('grid');
  readonly pageSize = 8;
  filtered = computed(() => {
    const term = this.clean(this.query());
    const rows = (this.response()?.items || []).filter(
      (u) =>
        (!term || this.clean(u.name + ' ' + u.domain).includes(term)) &&
        (!this.city() || u.cityId === this.city()),
    );
    return [...rows].sort((a, b) =>
      this.sort() === 'city'
        ? (a.city || 'ZZZ').localeCompare(b.city || 'ZZZ', 'es')
        : a.name.localeCompare(b.name, 'es'),
    );
  });
  visible = computed(() =>
    this.filtered().slice((this.page() - 1) * this.pageSize, this.page() * this.pageSize),
  );
  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));
  availableCities = computed(
    () => this.config()?.cities.filter((c) => c.country === this.country()) || [],
  );
  selectedCityName = computed(
    () => this.availableCities().find((c) => c.id === this.city())?.name || '',
  );
  constructor() {
    this.loadConfig();
    this.subscriptions.add(
      this.route.queryParamMap.subscribe((params) => {
        this.country.set(params.get('pais') || 'Colombia');
        this.query.set(params.get('q') || '');
        this.city.set(params.get('ciudad') || '');
        this.page.set(1);
        this.load();
      }),
    );
  }
  loadConfig() {
    this.subscriptions.add(
      this.api.config().subscribe({
        next: (c) => this.config.set(c),
        error: () => {
          this.error.set('No pudimos conectar con el servidor. Inicia el proyecto con npm start.');
          this.loading.set(false);
        },
      }),
    );
  }
  load() {
    this.searchRequest?.unsubscribe();
    this.loading.set(true);
    this.error.set('');
    this.response.set(null);
    this.searchRequest = this.api.universities(this.country()).subscribe({
      next: (data) => {
        this.response.set(data);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(
          e.error?.message ||
            'No pudimos cargar las universidades. Verifica que el servidor esté encendido.',
        );
        this.loading.set(false);
      },
    });
  }
  retry() {
    if (!this.config()) this.loadConfig();
    this.load();
  }
  changeCountry(value: string) {
    this.router.navigate([], { queryParams: { pais: value } });
  }
  search() {
    this.router.navigate([], {
      queryParams: { pais: this.country(), q: this.query() || null, ciudad: this.city() || null },
    });
  }
  changeQuery(value: string) {
    this.query.set(value);
    this.page.set(1);
  }
  changeCity(value: string) {
    this.city.set(value);
    this.page.set(1);
    this.search();
  }
  reset() {
    this.query.set('');
    this.city.set('');
    this.search();
  }
  changePage(delta: number) {
    this.page.update((p) => Math.max(1, Math.min(this.totalPages(), p + delta)));
    document
      .getElementById('results-heading')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  clean(text: string) {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.searchRequest?.unsubscribe();
  }
}
