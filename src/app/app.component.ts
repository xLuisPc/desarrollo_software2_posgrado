import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SavedService } from './core/saved.service';
import { IconComponent } from './shared/icon.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, IconComponent],
  template: `
    <a class="skip-link" href="#main">Saltar al contenido</a>
    <aside class="sidebar">
      <a routerLink="/" class="brand" aria-label="Campus Norte, inicio"
        ><span class="brand-symbol">➤</span
        ><span
          >campus<span class="brand-second">norte<span class="brand-dot">.</span></span></span
        ></a
      >
      <div class="sidebar-caption">ENCUENTRA TU CAMINO</div>
      <nav aria-label="Navegación principal">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
          ><app-icon name="compass" />Explorar</a
        >
        <a routerLink="/favoritos" routerLinkActive="active"
          ><app-icon name="heart" />Mis universidades
          <span class="nav-count">{{ saved.count() }}</span></a
        >
        <a routerLink="/comparar" routerLinkActive="active"
          ><app-icon name="compare" />Comparar
          @if (saved.compared().length) {
            <span class="nav-count">{{ saved.compared().length }}</span>
          }
        </a>
      </nav>
      <div class="sidebar-note">
        <div class="note-orbit"><app-icon name="globe" /></div>
        <strong>Tu futuro no tiene fronteras.</strong>
        <p>Un nuevo lugar.<br />Mil posibilidades.</p>
        <a routerLink="/proyecto">Conoce Campus Norte <span>↗</span></a>
      </div>
      <a class="sidebar-about" routerLink="/proyecto" routerLinkActive="active"
        ><app-icon name="book" /> Acerca de Campus Norte</a
      >
      <div class="sidebar-footer">
        <span class="avatar">CN</span>
        <div>Hecho para explorar<small>Explora a tu ritmo · 2026</small></div>
      </div>
    </aside>
    <div class="workspace">
      <header class="topbar">
        <span>EXPLORA. DESCUBRE. DECIDE.</span
        ><a routerLink="/proyecto"
          ><span class="status-dot"></span> Universidades + Clima <app-icon name="info"
        /></a>
      </header>
      <main id="main" tabindex="-1"><router-outlet /></main>
      <footer class="main-footer">
        <span>Encuentra tu lugar en el mundo.</span
        ><span>Campus Norte © 2026 <span class="footer-star">✳</span></span>
      </footer>
    </div>
    @if (saved.notification()) {
      <div class="toast" role="status"><app-icon name="check" />{{ saved.notification() }}</div>
    }
  `,
})
export class AppComponent {
  saved = inject(SavedService);
}
