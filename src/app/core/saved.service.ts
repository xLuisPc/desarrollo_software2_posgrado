import { Injectable, computed, signal } from '@angular/core';
import { University } from './models';
@Injectable({ providedIn: 'root' })
export class SavedService {
  readonly favorites = signal<University[]>(this.read('campus-favorites'));
  readonly compared = signal<University[]>(this.read('campus-compared').slice(0, 3));
  readonly count = computed(() => this.favorites().length);
  readonly notification = signal('');
  private timer?: ReturnType<typeof setTimeout>;
  private read(key: string): University[] {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value)
        ? value
            .filter(
              (u): u is University =>
                !!u &&
                typeof u.id === 'string' &&
                typeof u.name === 'string' &&
                typeof u.country === 'string' &&
                typeof u.domain === 'string',
            )
            .map((u) => ({ ...u, website: this.safeUrl(u.website) }))
        : [];
    } catch {
      return [];
    }
  }
  private safeUrl(value: unknown): string | null {
    try {
      const url = new URL(String(value));
      return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
    } catch {
      return null;
    }
  }
  has(id: string) {
    return this.favorites().some((u) => u.id === id);
  }
  isCompared(id: string) {
    return this.compared().some((u) => u.id === id);
  }
  toggleFavorite(university: University) {
    const removing = this.has(university.id);
    this.favorites.update((list) =>
      removing ? list.filter((u) => u.id !== university.id) : [...list, university],
    );
    this.persist(
      'campus-favorites',
      this.favorites(),
      removing ? 'Universidad eliminada de tus favoritas' : 'Universidad guardada en tus favoritas',
    );
  }
  toggleCompare(university: University) {
    if (!this.isCompared(university.id) && this.compared().length >= 3) {
      this.notify('Puedes comparar hasta 3 universidades. Quita una para agregar otra.');
      return;
    }
    this.compared.update((list) =>
      this.isCompared(university.id)
        ? list.filter((u) => u.id !== university.id)
        : [...list, university],
    );
    this.persist('campus-compared', this.compared(), 'Comparación actualizada');
  }
  private persist(key: string, value: University[], message: string) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notify(message);
    } catch {
      this.notify(
        'Cambio guardado solo durante esta sesión: el navegador no permite almacenamiento local.',
      );
    }
  }
  notify(message: string) {
    clearTimeout(this.timer);
    this.notification.set(message);
    this.timer = setTimeout(() => this.notification.set(''), 4500);
  }
}
