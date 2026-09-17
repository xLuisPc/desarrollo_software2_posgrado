import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../shared/icon.component';
@Component({
  selector: 'app-about',
  standalone: true,
  imports: [IconComponent, RouterLink],
  template: `
    <div class="page-intro">
      <div>
        <span class="eyebrow">CURIOSIDAD CON PROPÓSITO</span>
        <h1>Un norte para tu próximo paso<span class="text-green">.</span></h1>
        <p>Conecta con universidades, descubre ciudades y encuentra nuevas posibilidades.</p>
      </div>
    </div>
    <section class="about-lead">
      <span class="about-star">✳</span>
      <div>
        <h2>Elegir universidad va más allá de un nombre.</h2>
        <p>
          Campus Norte reúne un directorio de universidades y el clima de las ciudades para ayudarte
          a explorar, comparar y preparar una visita.
        </p>
      </div>
    </section>
    <div class="about-grid">
      <section class="content-panel">
        <app-icon name="building" />
        <h2>Universities API</h2>
        <p>
          Consultamos el directorio público de Hipo para obtener nombre, país, dominios y páginas
          institucionales. Si el servicio falla, mostramos una copia identificada del catálogo.
        </p>
        <a
          href="https://github.com/Hipo/university-domains-list"
          target="_blank"
          rel="noopener noreferrer"
          class="detail-link"
          >Conocer la fuente <app-icon name="external"
        /></a>
      </section>
      <section class="content-panel">
        <app-icon name="sun" />
        <h2>OpenWeather</h2>
        <p>
          Consultamos el clima actual y el pronóstico de 5 días en intervalos de 3 horas, en grados
          Celsius y con descripciones en español.
        </p>
        <a
          href="https://openweathermap.org/api"
          target="_blank"
          rel="noopener noreferrer"
          class="detail-link"
          >Ver documentación <app-icon name="external"
        /></a>
      </section>
    </div>
    <section class="content-panel">
      <span class="eyebrow">TU PRÓXIMO PASO</span>
      <h2>De la curiosidad a tu próxima visita.</h2>
      <p>
        Busca universidades por país, guarda las que te interesen y compara hasta tres opciones.
        Cuando encuentres un destino, consulta el clima de la ciudad y prepara tu visita.
      </p>
      <a routerLink="/" class="button primary">
        Explorar universidades <app-icon name="arrow" />
      </a>
    </section>
    <div class="about-grid">
      <section class="content-panel">
        <span class="eyebrow">TUS OPCIONES, A MANO</span>
        <h2>Guarda lo que te inspire.</h2>
        <p>
          Crea tu colección de universidades favoritas y vuelve a ella cuando quieras. Tus favoritas
          se guardan en este navegador para que puedas continuar explorando.
        </p>
        <a routerLink="/favoritos" class="detail-link">
          Ver mis universidades <app-icon name="arrow" />
        </a>
      </section>
      <section class="content-panel">
        <span class="eyebrow">CONOCE TU DESTINO</span>
        <h2>Cada universidad, nuevas posibilidades.</h2>
        <p>
          Encuentra sus datos de contacto en la web institucional y consulta allí los programas,
          costos y requisitos de admisión. Confirma también la sede que deseas visitar.
        </p>
        <p>
          El directorio te ayuda a descubrir opciones; la información académica actualizada la
          encontrarás directamente en cada universidad.
        </p>
      </section>
    </div>
  `,
})
export class AboutComponent {}
