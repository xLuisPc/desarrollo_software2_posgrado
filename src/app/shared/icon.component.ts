import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-icon',
  standalone: true,
  template: `<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.65"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path [attr.d]="paths[name] || paths['compass']" />
  </svg>`,
  styles: [
    ':host{display:inline-flex;width:20px;height:20px;flex-shrink:0;align-items:center}svg{width:100%;height:100%}',
  ],
})
export class IconComponent {
  @Input() name = 'compass';
  paths: Record<string, string> = {
    compass: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M16 8l-2.5 5.5L8 16l2.5-5.5Z',
    heart:
      'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
    compare: 'M8 4v16M16 4v16M4 8h8M12 16h8',
    search: 'M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15ZM16 16l5 5',
    pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0ZM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
    arrow: 'M4 12h16M14 6l6 6-6 6',
    external: 'M14 3h7v7M21 3 10 14M10 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-6',
    book: 'M12 5C8 2 4 3 2 4v16c3-2 7-2 10 0 3-2 7-2 10 0V4c-2-1-6-2-10 1ZM12 5v15',
    globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18Z',
    sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5',
    cloud: 'M6 18a4 4 0 1 1 1-8 6 6 0 0 1 11-2 5 5 0 1 1 1 10Z',
    rain: 'M6 15a4 4 0 1 1 1-8 6 6 0 0 1 11-2 5 5 0 0 1 1 10M8 18l-1 3M13 18l-1 3M18 18l-1 3',
    drop: 'M12 2S5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13Z',
    wind: 'M3 8h12a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h5a3 3 0 1 1-3 3',
    check: 'M5 12l4 4L19 6',
    close: 'M6 6l12 12M18 6 6 18',
    back: 'M20 12H4M10 6l-6 6 6 6',
    info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 11v6M12 7v.1',
    building: 'M3 21h18M5 21V8h14v13M3 8l9-5 9 5M9 11v2M15 11v2M9 16v2M15 16v2',
    grid: 'M3 3h7v7H3ZM14 3h7v7h-7ZM3 14h7v7H3ZM14 14h7v7h-7Z',
    list: 'M8 5h13M8 12h13M8 19h13M3 5h.1M3 12h.1M3 19h.1',
    download: 'M12 3v12M7 10l5 5 5-5M4 16v5h16v-5',
  };
}
