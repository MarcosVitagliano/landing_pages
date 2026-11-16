import { Routes } from '@angular/router';
import { HomePage } from './pages/home.page';

export const routes: Routes = [
  { path: '', component: HomePage, title: 'Aura Estética | Clínica de estética' },
  {
    // Carregada sob demanda (lazy loading): só baixa o código ao abrir um artigo.
    path: 'blog/:slug',
    loadComponent: () => import('./pages/post.page').then((m) => m.PostPage),
  },
  { path: '**', redirectTo: '' },
];
