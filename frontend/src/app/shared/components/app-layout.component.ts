import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <div class="logo">JobReady</div>
        <nav class="nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="icon">📊</span> Dashboard
          </a>
          <a routerLink="/candidates" routerLinkActive="active" class="nav-item">
            <span class="icon">👥</span> Candidatos
          </a>
          <a routerLink="/positions" routerLinkActive="active" class="nav-item">
            <span class="icon">💼</span> Vacantes
          </a>
          <a routerLink="/applications" routerLinkActive="active" class="nav-item">
            <span class="icon">📋</span> Pipeline
          </a>
        </nav>
        <div class="sidebar-footer">
          <div class="user-info" *ngIf="auth.currentUser() as u">
            <div class="user-name">{{ u.name }}</div>
            <div class="user-role">{{ u.role === 'admin' ? 'Admin' : 'Reclutador' }}</div>
          </div>
          <button class="logout-btn" (click)="logout()">Cerrar sesión</button>
        </div>
      </aside>
      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; }
    .layout { display: flex; height: 100%; }
    .sidebar {
      width: 240px;
      background: #1e293b;
      color: white;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }
    .logo {
      padding: 20px;
      font-size: 22px;
      font-weight: 700;
      border-bottom: 1px solid #334155;
    }
    .nav { flex: 1; padding: 16px 0; }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      color: #94a3b8;
      text-decoration: none;
      transition: all .2s;
    }
    .nav-item:hover { color: white; background: #334155; }
    .nav-item.active { color: white; background: #3b82f6; }
    .icon { font-size: 18px; }
    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid #334155;
    }
    .user-info { margin-bottom: 12px; }
    .user-name { font-weight: 600; font-size: 14px; }
    .user-role { font-size: 12px; color: #94a3b8; }
    .logout-btn {
      width: 100%;
      padding: 8px;
      background: transparent;
      border: 1px solid #475569;
      color: #94a3b8;
      cursor: pointer;
      border-radius: 6px;
      transition: all .2s;
    }
    .logout-btn:hover { background: #334155; color: white; }
    .content { flex: 1; overflow: auto; background: #f8fafc; }
  `],
})
export class AppLayoutComponent {
  auth = inject(AuthService);

  logout(): void {
    this.auth.logout();
  }
}