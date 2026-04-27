import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary">
      <span>JobReady CRM</span>
      <span class="spacer"></span>
      <a mat-button routerLink="/dashboard" routerLinkActive="active-link">Dashboard</a>
      <a mat-button routerLink="/companies" routerLinkActive="active-link">Companies</a>
      <span class="user" *ngIf="auth.currentUser() as u">{{ u.name }}</span>
      <button mat-button (click)="logout()">Salir</button>
    </mat-toolbar>
  `,
  styles: [`
    .spacer { flex: 1; }
    .user { margin-right: 12px; font-size: 14px; opacity: .85; }
    .active-link { background: rgba(255,255,255,.15); }
  `],
})
export class AppToolbarComponent {
  private router = inject(Router);
  auth = inject(AuthService);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
