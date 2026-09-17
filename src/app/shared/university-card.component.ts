import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { University } from '../core/models';
import { SavedService } from '../core/saved.service';
import { IconComponent } from './icon.component';
@Component({
  selector: 'app-university-card',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <article class="university-card">
      <div class="card-top">
        <span
          class="university-mark"
          [class.mark-clay]="tone === 1"
          [class.mark-blue]="tone === 2"
          [class.mark-gold]="tone === 3"
          >{{ initials }}</span
        ><span class="country-tag"
          >{{ university.code }} <span>· {{ university.countryLabel }}</span></span
        ><button
          class="icon-button favorite-button"
          [class.is-saved]="saved.has(university.id)"
          (click)="saved.toggleFavorite(university)"
          [attr.aria-label]="
            (saved.has(university.id) ? 'Quitar de favoritos: ' : 'Guardar: ') + university.name
          "
          [attr.aria-pressed]="saved.has(university.id)"
        >
          <app-icon name="heart" />
        </button>
      </div>
      <h3>
        <a
          [routerLink]="['/universidad', university.id]"
          [queryParams]="{ pais: university.country }"
          >{{ university.name }}</a
        >
      </h3>
      <p class="card-location">
        <app-icon name="pin" />{{ university.city || university.state || 'Ciudad por elegir' }}
        @if (university.city) {
          <span title="Sede sugerida por el catálogo local, no por Hipolabs">· sede sugerida</span>
        }
      </p>
      <div class="domain">
        <app-icon name="globe" />{{ university.domain || 'Dominio no disponible' }}
      </div>
      <div class="card-bottom">
        <button
          class="compare-toggle"
          [class.selected]="saved.isCompared(university.id)"
          (click)="saved.toggleCompare(university)"
          [attr.aria-pressed]="saved.isCompared(university.id)"
        >
          <span class="checkbox">
            @if (saved.isCompared(university.id)) {
              <app-icon name="check" />
            }</span
          >Comparar</button
        ><a
          [routerLink]="['/universidad', university.id]"
          [queryParams]="{ pais: university.country }"
          class="detail-link"
          >Explorar <app-icon name="arrow"
        /></a>
      </div>
    </article>
  `,
})
export class UniversityCardComponent {
  @Input({ required: true }) university!: University;
  saved = inject(SavedService);
  get initials() {
    return this.university.name
      .split(' ')
      .filter(
        (w) => !['de', 'del', 'la', 'los', 'las', 'y', 'the', 'of', 'en'].includes(w.toLowerCase()),
      )
      .slice(0, 3)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }
  get tone() {
    return this.university.name.length % 4;
  }
}
