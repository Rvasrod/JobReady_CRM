import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { AppLayoutComponent } from './shared/components/app-layout.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'candidates',
        loadComponent: () =>
          import('./features/candidates/candidates-list.component').then(
            (m) => m.CandidatesListComponent
          ),
      },
      {
        path: 'candidates/new',
        loadComponent: () =>
          import('./features/candidates/candidates-form.component').then(
            (m) => m.CandidatesFormComponent
          ),
      },
      {
        path: 'candidates/:id',
        loadComponent: () =>
          import('./features/candidates/candidates-form.component').then(
            (m) => m.CandidatesFormComponent
          ),
      },
      {
        path: 'positions',
        loadComponent: () =>
          import('./features/positions/positions-list.component').then(
            (m) => m.PositionsListComponent
          ),
      },
      {
        path: 'positions/new',
        loadComponent: () =>
          import('./features/positions/positions-form.component').then(
            (m) => m.PositionsFormComponent
          ),
      },
      {
        path: 'positions/:id',
        loadComponent: () =>
          import('./features/positions/positions-form.component').then(
            (m) => m.PositionsFormComponent
          ),
      },
      {
        path: 'applications',
        loadComponent: () =>
          import('./features/applications/applications-list.component').then(
            (m) => m.ApplicationsListComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];