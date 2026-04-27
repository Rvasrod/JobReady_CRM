import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'companies',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/companies/companies-list.component').then(
        (m) => m.CompaniesListComponent
      ),
  },
  {
    path: 'companies/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/companies/companies-form.component').then(
        (m) => m.CompaniesFormComponent
      ),
  },
  {
    path: 'companies/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/companies/companies-form.component').then(
        (m) => m.CompaniesFormComponent
      ),
  },
  { path: '**', redirectTo: 'dashboard' },
];
