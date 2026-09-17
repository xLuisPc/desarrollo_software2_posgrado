import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SavedService } from '../core/saved.service';
import { UniversityCardComponent } from '../shared/university-card.component';
import { IconComponent } from '../shared/icon.component';
@Component({
  selector: 'app-saved',
  standalone: true,
  imports: [RouterLink, UniversityCardComponent, IconComponent],
  template: `
    <div class="page-intro">
      <div>
        <span class="eyebrow">LUGARES QUE TE INSPIRAN</span>
        <h1>Mis universidades<span class="text-green">.</span></h1>
        <p>Tu colección de posibilidades. Guardada en este navegador.</p>
      </div>
      <a routerLink="/" class="button secondary">Seguir explorando <app-icon name="arrow" /></a>
    </div>
    @if (saved.count()) {
      <div class="saved-heading">
        <strong
          >{{ saved.count() }}
          {{ saved.count() === 1 ? 'universidad guardada' : 'universidades guardadas' }}</strong
        ><a routerLink="/comparar" class="detail-link"
          >Comparar opciones <app-icon name="compare"
        /></a>
      </div>
      <div class="cards-grid saved-grid">
        @for (u of saved.favorites(); track u.id) {
          <app-university-card [university]="u" />
        }
      </div>
    } @else {
      <div class="empty-state large-empty">
        <div class="empty-emblem"><app-icon name="heart" /></div>
        <span class="eyebrow">DALE UN LUGAR A TUS IDEAS</span>
        <h2>Tu próximo destino merece un favorito.</h2>
        <p>
          Guarda las universidades que te llamen la atención con el corazón de cada tarjeta. Las
          encontrarás aquí cuando vuelvas.
        </p>
        <a routerLink="/" class="button primary"
          >Descubrir universidades <app-icon name="arrow"
        /></a>
      </div>
    }
  `,
})
export class SavedComponent {
  saved = inject(SavedService);
}
