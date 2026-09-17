import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/explore.component').then((m) => m.ExploreComponent),
    title: 'Explorar · Campus Norte',
  },
  {
    path: 'favoritos',
    loadComponent: () => import('./pages/saved.component').then((m) => m.SavedComponent),
    title: 'Mis universidades · Campus Norte',
  },
  {
    path: 'comparar',
    loadComponent: () => import('./pages/compare.component').then((m) => m.CompareComponent),
    title: 'Comparar · Campus Norte',
  },
  {
    path: 'universidad/:id',
    loadComponent: () => import('./pages/detail.component').then((m) => m.DetailComponent),
    title: 'Planea tu visita · Campus Norte',
  },
  {
    path: 'proyecto',
    loadComponent: () => import('./pages/about.component').then((m) => m.AboutComponent),
    title: 'Acerca de Campus Norte',
  },
  { path: '**', redirectTo: '' },
];
