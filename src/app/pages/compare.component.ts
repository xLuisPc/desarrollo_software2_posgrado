import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SavedService } from '../core/saved.service';
import { IconComponent } from '../shared/icon.component';
@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="page-intro">
      <div>
        <span class="eyebrow">DECIDE CON PERSPECTIVA</span>
        <h1>Tus opciones, lado a lado<span class="text-green">.</span></h1>
        <p>Compara hasta tres universidades y encuentra tu próximo paso.</p>
      </div>
      <a routerLink="/" class="button secondary">Agregar opciones <app-icon name="arrow" /></a>
    </div>
    @if (saved.compared().length) {
      <div class="comparison-top">
        <span>{{ saved.compared().length }} de 3 universidades seleccionadas</span
        ><button class="button secondary" (click)="exportComparison()">
          <app-icon name="download" /> Descargar comparación
        </button>
      </div>
      <div class="table-scroll">
        <table class="comparison-table">
          <thead>
            <tr>
              <th scope="col">Tu próximo destino</th>
              @for (u of saved.compared(); track u.id) {
                <th scope="col">
                  <span class="university-mark">{{ u.code }}</span>
                  <h3>{{ u.name }}</h3>
                  <button
                    class="text-button"
                    (click)="saved.toggleCompare(u)"
                    [attr.aria-label]="'Quitar de comparación: ' + u.name"
                  >
                    Quitar <app-icon name="close" />
                  </button>
                </th>
              }
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">País</th>
              @for (u of saved.compared(); track u.id) {
                <td>{{ u.countryLabel }}</td>
              }
            </tr>
            <tr>
              <th scope="row">Sede sugerida</th>
              @for (u of saved.compared(); track u.id) {
                <td>{{ u.city || 'Por elegir' }}</td>
              }
            </tr>
            <tr>
              <th scope="row">Dominio institucional</th>
              @for (u of saved.compared(); track u.id) {
                <td>{{ u.domain || 'No disponible' }}</td>
              }
            </tr>
            <tr>
              <th scope="row">Sitio web</th>
              @for (u of saved.compared(); track u.id) {
                <td>
                  @if (u.website) {
                    <a
                      [href]="u.website"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="detail-link"
                      >Visitar sitio <app-icon name="external"
                    /></a>
                  } @else {
                    No disponible
                  }
                </td>
              }
            </tr>
            <tr>
              <th scope="row">Tu colección</th>
              @for (u of saved.compared(); track u.id) {
                <td>
                  <button class="text-button" (click)="saved.toggleFavorite(u)">
                    <app-icon [name]="saved.has(u.id) ? 'check' : 'heart'" />{{
                      saved.has(u.id) ? 'Guardada' : 'Guardar favorita'
                    }}
                  </button>
                </td>
              }
            </tr>
            <tr>
              <th scope="row">Explora la ciudad</th>
              @for (u of saved.compared(); track u.id) {
                <td>
                  <a
                    [routerLink]="['/universidad', u.id]"
                    [queryParams]="{ pais: u.country }"
                    class="button primary"
                    >Ver clima y visita <app-icon name="arrow"
                  /></a>
                </td>
              }
            </tr>
          </tbody>
        </table>
      </div>
      <div class="info-banner">
        <app-icon name="info" />
        <p>
          Las ciudades son sugerencias locales. Consulta la sede exacta en el sitio institucional.
          Esta comparación no representa un ranking académico.
        </p>
      </div>
    } @else {
      <div class="empty-state large-empty">
        <div class="empty-emblem"><app-icon name="compare" /></div>
        <h2>Las buenas decisiones empiezan comparando.</h2>
        <p>
          Selecciona “Comparar” en las tarjetas de hasta tres universidades. Podrás revisar sus
          datos y descargar tu selección.
        </p>
        <a routerLink="/" class="button primary">Elegir universidades <app-icon name="arrow" /></a>
      </div>
    }
  `,
})
export class CompareComponent {
  saved = inject(SavedService);
  exportComparison() {
    const rows = [
      ['Universidad', 'País', 'Ciudad sugerida', 'Dominio', 'Sitio web'],
      ...this.saved
        .compared()
        .map((u) => [u.name, u.countryLabel, u.city || 'Por elegir', u.domain, u.website || '']),
    ];
    // Evita que un nombre recibido de la API se interprete como fórmula al abrir el CSV.
    const csv =
      '\uFEFF' +
      rows
        .map((row) =>
          row
            .map(
              (value) =>
                '"' +
                String(value)
                  .replace(/^[=+@\-\t\r]/, "'$&")
                  .replace(/"/g, '""') +
                '"',
            )
            .join(','),
        )
        .join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'campus-norte-comparacion.csv';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.saved.notify('Comparación descargada');
  }
}
